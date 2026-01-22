cmake_minimum_required(VERSION 3.23)
project(anclient VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Require RTTR (No hardcoded paths!)
# Users must set -DCMAKE_PREFIX_PATH="C:/path/to/rttr/install"
find_package(RTTR REQUIRED)
# find_package(nlohmann_json REQUIRED)

# 2. Add the library
add_subdirectory(src)


include(FetchContent)

FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(json)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
FetchContent_MakeAvailable(googletest)

# 3. Add tests (only if this is the main project)
if(CMAKE_PROJECT_NAME STREQUAL PROJECT_NAME)
    enable_testing()
    add_subdirectory(tests)
endif()
