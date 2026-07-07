cmake_minimum_required(VERSION 3.30)

set(VCPKG_MANIFEST_MODE OFF CACHE BOOL "" FORCE)
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/../../../vcpkg/installed" CACHE PATH "vcpkg install dir")
set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
set(VCPKG_HOST_TRIPLET "x64-mingw-dynamic" CACHE STRING "")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS ON)

project(album VERSION 1.0 LANGUAGES CXX)

set(CMAKE_TOOLCHAIN_FILE_openssl "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake")
message(STATUS "=========================================== CMAKE_TOOLCHAIN_FILE ${CMAKE_TOOLCHAIN_FILE_openssl}")
find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

# vcpkage install ixwebsocket[core,openssl]:x64-mingw-dynamic
find_package(ixwebsocket REQUIRED)

include(FetchContent)

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

if(MINGW OR CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-finput-charset=UTF-8 -fexec-charset=UTF-8)
endif()

if(WIN32)
    add_compile_definitions(WIN32_LEAN_AND_MEAN _AMD64_)
endif()

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

add_subdirectory(app)
add_subdirectory(tests)
