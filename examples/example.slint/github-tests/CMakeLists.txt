# Test clients of example.slint without Slint, webview or SurrealismUI, for GitHub Actions
# (semantic-jserv .github/workflows/version-revival-7days.yml, synodes-linux-closed-test.yml).
#
#   revial_tests     anson.cmake + Anclient.cmake build, echo to the registry central
#   doclient_tests   the desktop's ws client + ipc agent tests (../tests/test_01_wsclient_ipcagent.cpp)
#
# Build (Linux, GCC >= 14 for std::chrono::parse):
#   CC=gcc-14 CXX=g++-14 cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
#   cmake --build build --target revial_tests doclient_tests
#
# vcpkg is expected at ../../../../vcpkg (beside the Anclient folder, as ../CMakeLists.txt does),
# unless CMAKE_TOOLCHAIN_FILE is given.

cmake_minimum_required(VERSION 3.30)

set(VCPKG_ROOT_GUESS "${CMAKE_CURRENT_SOURCE_DIR}/../../../../vcpkg")
if(NOT DEFINED CMAKE_TOOLCHAIN_FILE AND EXISTS "${VCPKG_ROOT_GUESS}/scripts/buildsystems/vcpkg.cmake")
    set(VCPKG_MANIFEST_MODE OFF CACHE BOOL "" FORCE)
    set(CMAKE_TOOLCHAIN_FILE "${VCPKG_ROOT_GUESS}/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
    set(VCPKG_INSTALLED_DIR "${VCPKG_ROOT_GUESS}/installed" CACHE PATH "vcpkg install dir")
endif()

if(NOT DEFINED VCPKG_TARGET_TRIPLET)
    if(WIN32)
        set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
    elseif(APPLE)
        set(VCPKG_TARGET_TRIPLET "x64-osx" CACHE STRING "")
    else()
        set(VCPKG_TARGET_TRIPLET "x64-linux" CACHE STRING "")
    endif()
endif()
if(NOT DEFINED VCPKG_HOST_TRIPLET)
    set(VCPKG_HOST_TRIPLET "${VCPKG_TARGET_TRIPLET}" CACHE STRING "")
endif()

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS ON)

project(album_github_tests LANGUAGES CXX)

find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(ixwebsocket REQUIRED)

include(FetchContent)

set(ANCLIENT_GIT_TAG "portfolio-0.8" CACHE STRING "Tag of anson.cmake and Anclient.cmake")

FetchContent_Declare(
  anson.cmake
  GIT_REPOSITORY https://github.com/odys-z/anson.cmake.git
  GIT_TAG        ${ANCLIENT_GIT_TAG}
)
set(ANSON_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anson.cmake)

FetchContent_Declare(
  anclient.cmake
  GIT_REPOSITORY https://github.com/odys-z/Anclient.cmake.git
  GIT_TAG        ${ANCLIENT_GIT_TAG}
)
set(ANCLIENT_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anclient.cmake)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

if(MINGW OR CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-finput-charset=UTF-8 -fexec-charset=UTF-8)
endif()
if(WIN32)
    add_compile_definitions(WIN32_LEAN_AND_MEAN _AMD64_)
endif()
add_compile_definitions(ANSON_VERBOSE=4)

set(ALBUM_DIR "${CMAKE_CURRENT_SOURCE_DIR}/..")

set(ANCLIENT_LIBS
    OpenSSL::Crypto
    Boost::url
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    ixwebsocket::ixwebsocket
    anson
    anclient
)

# ---- revial_tests: the libraries build, and the central answers an echo ----
add_executable(revial_tests
    test_00_echo_central.cpp
)
target_link_libraries(revial_tests PRIVATE ${ANCLIENT_LIBS} gtest_main)

# ---- doclient_tests: ws client + ipc agent (push to a synode) ----
add_executable(doclient_tests
    ${ALBUM_DIR}/app/src/wsclients.h
    ${ALBUM_DIR}/app/src/wsclients.cpp
    ${ALBUM_DIR}/app/src/doctier.cpp
    ${ALBUM_DIR}/tests/test_01_wsclient_ipcagent.cpp   # has its own main()
    ${ALBUM_DIR}/tests/test_common.h
    ${ALBUM_DIR}/tests/test_settings.h
)
target_link_libraries(doclient_tests PRIVATE ${ANCLIENT_LIBS} gtest)
target_include_directories(doclient_tests PRIVATE ${ALBUM_DIR}/app/src)

# resources beside the binaries: ast/, settings/, res/ (both targets share one output folder)
add_custom_target(copy_github_test_resources
    COMMAND ${CMAKE_COMMAND} -E copy_directory "${ALBUM_DIR}/ast"            "${CMAKE_CURRENT_BINARY_DIR}/ast"
    COMMAND ${CMAKE_COMMAND} -E copy_directory "${ALBUM_DIR}/tests/settings" "${CMAKE_CURRENT_BINARY_DIR}/settings"
    COMMAND ${CMAKE_COMMAND} -E copy_directory "${ALBUM_DIR}/tests/res"      "${CMAKE_CURRENT_BINARY_DIR}/res"
    COMMENT "Syncing resources to the github-tests build directory"
)
add_dependencies(revial_tests   copy_github_test_resources)
add_dependencies(doclient_tests copy_github_test_resources)

if(WIN32)
    foreach(t revial_tests doclient_tests)
        add_custom_command(TARGET ${t} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
                $<TARGET_RUNTIME_DLLS:${t}> "$<TARGET_FILE_DIR:${t}>"
            COMMAND_EXPAND_LISTS
        )
    endforeach()
endif()
