cmake_minimum_required(VERSION 3.30)

# Use CMakePresets.json for vcpkg configuration
# Build with: cmake --preset default
# Or: cmake --preset vs2022

# tree structure:
# my/github/vcpkg
# my/github/anclient/examples/example.qml
#
# in my/github/vcpkg
# ./vcpkg install entt:x64-windows --x-install-root="../anclient/examples/example.qml/vcpkg_packages"

# set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/vcpkg_packages" CACHE PATH "vcpkg install dir")
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")

project(anclient.qml VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Core Qml)
qt_standard_project_setup(REQUIRES 6.8)

include(FetchContent)

FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(json)

# try to auto-locate EnTT installed by vcpkg
message(STATUS "=========================================== CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

# # my/github/vcpkg/...
# # set(CMAKE_TOOLCHAIN_FILE "../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "Vcpkg toolchain file")

# # if(NOT DEFINED EnTT_DIR)
#   set(_vcpkg_root "${CMAKE_CURRENT_SOURCE_DIR}/vcpkg_packages/")
#   set(_triplet "x64-windows") # or use VCPKG_TARGET_TRIPLET if provided
#   set(_entt_path "${_vcpkg_root}/${_triplet}/share/entt")
#   set(_nlohmanjson_path "${_vcpkg_root}/${_triplet}/share/nlohmann_json")

#   message(STATUS "=========================================== _ent_path(EnTTConfig.cmake) = ${_entt_path}")
#   # if(EXISTS "${_entt_path}/EnTTConfig.cmake")
#     # set(EnTT_DIR "${_entt_path}" CACHE PATH "Path to EnTTConfig.cmake" FORCE)
#     # set(nlohmann_json_DIR "${_nlohmanjson_path}" CACHE PATH "Path to nlohmann_jsonConfig.cmake" FORCE)
#     message(STATUS "=========================================== _nlohmanjson_path = ${_nlohmanjson_path}")
#     # list(APPEND CMAKE_PREFIX_PATH "${_entt_path}")
#     message(STATUS "Set EnTT_DIR=${EnTT_DIR}")
#   # endif()
# # endif()

find_package(EnTT CONFIG REQUIRED)

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
if(CMAKE_PROJECT_NAME STREQUAL PROJECT_NAME)
    enable_testing()
    add_subdirectory(tests)
endif()

# To deploy
# cmake --preset default
# cmake --build --preset default
# cp build/src/anclient.exe deploy/
# cd deploy
# windeployqt.exe --qmldir ..\src\qml anclient.exe
