cmake_minimum_required(VERSION 3.30)

set(ENV{CC} "gcc")
set(ENV{CXX} "g++")

set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/../../../vcpkg/installed" CACHE PATH "vcpkg install dir")
set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
set(VCPKG_HOST_TRIPLET "x64-mingw-dynamic" CACHE STRING "")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS ON)

project(portfolio_desktop VERSION 1.0 LANGUAGES CXX)

find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

include(FetchContent)

FetchContent_Declare(
    anson.cmake
    GIT_REPOSITORY https://github.com/odys-z/anson.cmake.git
    GIT_TAG        main
)

FetchContent_Declare(
    anclient.cmake
    GIT_REPOSITORY https://github.com/odys-z/Anclient.cmake.git
    GIT_TAG        main
)

FetchContent_MakeAvailable(anson.cmake anclient.cmake)

find_package(Qt6 REQUIRED COMPONENTS Core Quick Test)

enable_testing()

add_subdirectory(src)
add_subdirectory(app)
add_subdirectory(tests)
