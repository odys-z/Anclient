cmake_minimum_required(VERSION 3.23)
project(anclient VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)


set(RTTR_BUILD_UNIT_TESTS OFF CACHE BOOL "" FORCE)
set(RTTR_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(RTTR_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(RTTR_BUILD_INSTALLER OFF CACHE BOOL "" FORCE)
set(CMAKE_COMPILER_IS_MSVC 1)
set(RTTR_BUILD_UNIT_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_UNIT_TESTS OFF CACHE BOOL "" FORCE)

add_compile_options(/WX-)

# 1. Require RTTR (No hardcoded paths!)
# Users must set -DCMAKE_PREFIX_PATH="C:/path/to/rttr/install"
# find_package(RTTR REQUIRED)
find_package(RTTR CONFIG REQUIRED Core)

include(FetchContent)

FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(json)

FetchContent_Declare(
  anson
  GIT_REPOSITORY https://github.com/odys-z/antson.git
  SOURCE_SUBDIR  antson.cmake
  GIT_TAG        master # cmake-0.0.1 # 2026-01-24
)
set(ANSON_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anson)

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
# cp build/src/anclient.exe deploy/
# cd deploy
# windeployqt.exe --qmldir ..\src\qml anclient.exe
