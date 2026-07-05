cmake_minimum_required(VERSION 3.30)

set(VCPKG_MANIFEST_MODE OFF CACHE BOOL "" FORCE)
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/../../../../vcpkg/installed" CACHE PATH "vcpkg install dir")
set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
set(VCPKG_HOST_TRIPLET "x64-mingw-dynamic" CACHE STRING "")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS ON)

project(album_tests VERSION 1.0 LANGUAGES CXX)

set(CMAKE_TOOLCHAIN_FILE_openssl "${CMAKE_SOURCE_DIR}/../../../../vcpkg/scripts/buildsystems/vcpkg.cmake")
message(STATUS "=========================================== CMAKE_TOOLCHAIN_FILE ${CMAKE_TOOLCHAIN_FILE_openssl}")
find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

# vcpkage install ixwebsocket[core,openssl]:x64-mingw-dynamic
find_package(ixwebsocket REQUIRED)

include(FetchContent)

# try to auto-locate EnTT installed by vcpkg
message(STATUS "=========================================== CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

FetchContent_Declare(
  anson.cmake
  GIT_REPOSITORY https://github.com/odys-z/anson.cmake.git
  GIT_TAG        main
)

set(ANSON_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anson.cmake)

FetchContent_Declare(
  anclient.cmake
  GIT_REPOSITORY https://github.com/odys-z/Anclient.cmake.git
  GIT_TAG        main
)

set(ANCLIENT_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anclient.cmake)

# add_compile_options(/utf-8)
# add_compile_options("$<$<CXX_COMPILER_ID:MSVC>:/utf-8>")
if(MINGW OR CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-finput-charset=UTF-8 -fexec-charset=UTF-8)
endif()

if(WIN32)
    add_compile_definitions(WIN32_LEAN_AND_MEAN _AMD64_)
endif()

# find_package(Slint REQUIRED)
include(FetchContent)
FetchContent_Declare(
    Slint
    GIT_REPOSITORY https://github.com/slint-ui/slint.git
    GIT_TAG release/1
    SOURCE_SUBDIR api/cpp
)
FetchContent_MakeAvailable(Slint)

get_filename_component(SURREALISM_UI_DIR 
    "${CMAKE_CURRENT_SOURCE_DIR}/../surrealism-0.5.3" 
    ABSOLUTE
)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG 0.12.0
    )
FetchContent_MakeAvailable(webview)

add_executable(
    ${PROJECT_NAME}
    test_settings.h
    # ../app/qdoclientier.cpp
    # ../app/qdoclientier.h
    ../app/src/doctier.cpp
    ../app/src/wsclients.h
    ../app/src/wsclients.cpp

    # cd test
    # py -m semantier_gen ast/gen-settings.json ast
    ../app/src/gen/app_settings.hpp

    # The Hello IXWebSocket requires stand alone ws-agent: test_01_hello_ixwebsocket.cpp
    test_01_wsclient_ipcagent.cpp
    test_common.h
)

message(STATUS "=========================================== CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")
message(STATUS "=========================================== SURREALISM_UI_DIR = ${SURREALISM_UI_DIR}")
message(STATUS "=========================================== webview_SOURCE_DIR = ${webview_SOURCE_DIR}")

target_include_directories(${PROJECT_NAME} PRIVATE 
    ${webview_SOURCE_DIR}
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    webview::core # V0.12.0 Not webview::webview or webview.
    Slint::Slint
)

slint_target_sources(${PROJECT_NAME}
    ../app/ui/app-window.slint
    LIBRARY_PATHS "surrealism=${SURREALISM_UI_DIR}"
)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
FetchContent_MakeAvailable(googletest)

include(GoogleTest)

# On Windows, copy the Slint DLL next to the application binary so that it's found.
if (WIN32)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            $<TARGET_RUNTIME_DLLS:${PROJECT_NAME}>
            $<TARGET_FILE_DIR:${PROJECT_NAME}> COMMAND_EXPAND_LISTS)
endif()

# target_link_libraries(album_tests PRIVATE Qt6::WebSockets)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/../ast"
        "$<TARGET_FILE_DIR:album_tests>/ast"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/settings"
        "$<TARGET_FILE_DIR:album_tests>/settings"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/res"
        "$<TARGET_FILE_DIR:album_tests>/res"

    COMMENT "Copying JSON settings to build directory"
)

target_include_directories(${PROJECT_NAME} PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../app"
)

target_link_options(${PROJECT_NAME} PRIVATE
    -static-libgcc
    -static-libstdc++
    -static
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    OpenSSL::Crypto
    Boost::url
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    ixwebsocket::ixwebsocket
    anson
    anclient
    gtest_main
)

# gtest_discover_tests(album_tests)
gtest_discover_tests(${PROJECT_NAME}
    DISCOVERY_MODE PRE_TEST
)

add_compile_definitions(ANSON_VERBOSE=4)
