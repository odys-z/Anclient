cmake_minimum_required(VERSION 3.30)

set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/vcpkg_packages" CACHE PATH "vcpkg install dir")

project(anclient.cmake LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Generate compile_commands.json for clangd/IDE integration (single-config only)
# we have network problem
# This will save time for each clean build.
# [try] Comment this out for the first time as the network condition is complicate in China, by the GFW.
if(NOT CMAKE_CONFIGURATION_TYPES)
  set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
endif()
# qt creator -DQT_CREATOR_SKIP_VCPKG_SETUP:BOOL=ON
# set(VCPKG_USE_SYSTEM_BINARIES ON)
# set(X_VCPKG_ASSET_SOURCES "clear")

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

message(STATUS "=========================================== CMAKE_TOOLCHAIN_FILE = ${CMAKE_TOOLCHAIN_FILE}")
message(STATUS "=========================================== CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

# ./vcpkg install entt:x64-windows --x-install-root="../anclient/cmake/vcpkg_packages"
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

include(FetchContent)

FetchContent_Declare(
  anson.cmake
  GIT_REPOSITORY https://github.com/odys-z/antson.git
  SOURCE_SUBDIR  antson.cmake
  GIT_TAG        master # cmake-0.0.1 # 2026-01-30
)

set(ANSON_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anson.cmake)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
FetchContent_MakeAvailable(googletest)

add_subdirectory(src)

# 3. Add tests (only if this is the main project)
option(ANCLIENT_BUILD_TESTS "Build tests for Anclient.cmake" ON)
if (ANCLIENT_BUILD_TESTS)
  enable_testing()
  add_subdirectory(tests)
endif()
