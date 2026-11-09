cmake_minimum_required(VERSION 3.30)

set(VCPKG_MANIFEST_MODE OFF CACHE BOOL "" FORCE)
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_INSTALLED_DIR "${CMAKE_SOURCE_DIR}/../../../vcpkg/installed" CACHE PATH "vcpkg install dir")

# set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
# set(VCPKG_HOST_TRIPLET "x64-mingw-dynamic" CACHE STRING "")
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

project(album VERSION 0.1.2 LANGUAGES CXX)

set(CMAKE_TOOLCHAIN_FILE_openssl "${CMAKE_SOURCE_DIR}/../../../vcpkg/scripts/buildsystems/vcpkg.cmake")
message(STATUS "=========================================== CMAKE_TOOLCHAIN_FILE ${CMAKE_TOOLCHAIN_FILE_openssl}")
find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

# vcpkg install ixwebsocket[core,openssl]:x64-mingw-dynamic
# ./vcpkg install "ixwebsocket[core,openssl]:x64-linux"
find_package(ixwebsocket REQUIRED)

include(FetchContent)

# anson.cmake and anclient.cmake follow their branch: both are fetched again on every CMake run.
# With CMP0168 NEW (cmake_minimum_required 3.30), FetchContent never re-fetches a branch once
# populated, so these two are declared with CMP0168 OLD (sub-build, whose update step always runs).
# The policy is captured by FetchContent_Declare(), not by FetchContent_MakeAvailable().
# Other dependencies (Slint, webview) keep NEW and are not updated once downloaded.
# Offline: configure with -DFETCHCONTENT_FULLY_DISCONNECTED=ON.
set(FETCHCONTENT_UPDATES_DISCONNECTED_ANSON.CMAKE    OFF CACHE BOOL "Always update anson.cmake"    FORCE)
set(FETCHCONTENT_UPDATES_DISCONNECTED_ANCLIENT.CMAKE OFF CACHE BOOL "Always update anclient.cmake" FORCE)

cmake_policy(PUSH)
cmake_policy(SET CMP0168 OLD)

# cache cpr in vcpkg
# cd ~/github/vcpkg && ./vcpkg install "curl[ssl]:x64-linux"
set(CPR_USE_SYSTEM_CURL ON CACHE BOOL "" FORCE)

FetchContent_Declare(
  anson.cmake
  GIT_REPOSITORY https://github.com/odys-z/anson.cmake.git
  GIT_TAG        portfolio-0.8
)

FetchContent_Declare(
  anclient.cmake
  GIT_REPOSITORY https://github.com/odys-z/Anclient.cmake.git
  GIT_TAG        portfolio-0.8
)
cmake_policy(POP)

set(ANSON_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anson.cmake)

set(ANCLIENT_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(anclient.cmake)

if(MINGW OR CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-finput-charset=UTF-8 -fexec-charset=UTF-8)
endif()

if(WIN32)
    add_compile_definitions(WIN32_LEAN_AND_MEAN _AMD64_)
endif()

# ===========================================================================
# Local source trees: avoid re-downloading big dependencies from GitHub.
#
# use_local_source(<name> <default-dir> <probe-file>)
#   If <default-dir>/<probe-file> exists, FetchContent uses that folder and
#   skips the download. That works through CMake's built-in override variable
#   FETCHCONTENT_SOURCE_DIR_<NAME>, where <NAME> is the FetchContent name in
#   upper case. Otherwise the GitHub declaration below is used as a fallback.
#
#   The path can be overridden at configure time (or in Qt Creator's CMake
#   settings) with -D<NAME>_LOCAL_DIR=/abs/path, e.g. -DSLINT_LOCAL_DIR=...
#
#   All local trees are unzipped next to this file (examples/example.slint/).
#   GitHub's "Source code (zip)" unpacks into <repo>-<version>/; if you get a
#   nested <repo>-<version>/<repo>-<version>/, point at the inner folder.
# ===========================================================================
function(use_local_source name dir probe)
    string(TOUPPER "${name}" UC)
    set(${UC}_LOCAL_DIR "${dir}" CACHE PATH "Local source tree for ${name}")
    if(EXISTS "${${UC}_LOCAL_DIR}/${probe}")
        message(STATUS "Using local ${name}: ${${UC}_LOCAL_DIR}")
        set(FETCHCONTENT_SOURCE_DIR_${UC} "${${UC}_LOCAL_DIR}" CACHE PATH "" FORCE)
    else()
        message(WARNING "Local ${name} not found at ${${UC}_LOCAL_DIR}/${probe}; fetching from GitHub")
        # Drop a stale override left in the cache by an earlier configure.
        unset(FETCHCONTENT_SOURCE_DIR_${UC} CACHE)
    endif()
endfunction()

# ---------------------------------------------------------------------------
# Slint
#   Download: https://github.com/slint-ui/slint/releases/tag/v1.18.1
#             Assets -> "Source code (zip)" or "Source code (tar.gz)"
#             (NOT slint-viewer / slint-lsp / Slint-cpp-* SDK packages)
#   Unzip to: examples/example.slint/slint-1.18.1/   (must contain api/cpp/)
#   Upgrade:  download the new tag, then change BOTH the folder name here and
#             GIT_TAG below, so the fallback builds the same version.
# ---------------------------------------------------------------------------
use_local_source(Slint "${CMAKE_CURRENT_SOURCE_DIR}/slint-1.18.1" "api/cpp/CMakeLists.txt")

FetchContent_Declare(
    Slint
    GIT_REPOSITORY https://github.com/slint-ui/slint.git
    GIT_TAG        v1.18.1      # pinned tag: no update check on reconfigure
    GIT_SHALLOW    TRUE         # latest commit only, no history
    SOURCE_SUBDIR  api/cpp
)
FetchContent_MakeAvailable(Slint)

get_filename_component(SURREALISM_UI_DIR
    "${CMAKE_CURRENT_SOURCE_DIR}/../surrealism-0.5.3"
    ABSOLUTE
)

# ---------------------------------------------------------------------------
# webview
#   Download: https://github.com/webview/webview/releases/tag/0.12.0
#             Assets -> "Source code (zip)"
#   Unzip to: examples/example.slint/webview-0.12.0/  (CMakeLists.txt at top)
#   app/CMakeLists.txt uses ${webview_SOURCE_DIR}; it points here automatically.
# ---------------------------------------------------------------------------
use_local_source(webview "${CMAKE_CURRENT_SOURCE_DIR}/webview-0.12.0" "CMakeLists.txt")

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG        0.12.0
    GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(webview)

add_subdirectory(app)

# ---------------------------------------------------------------------------
# GoogleTest (declared in tests/CMakeLists.txt; overridden here because the
# override is a cache variable, visible to every subdirectory)
#   Download: https://github.com/google/googletest/releases
#             pick the tag tests/CMakeLists.txt uses, e.g. v1.17.0
#             Assets -> "Source code (zip)"
#   Unzip to: examples/example.slint/googletest-1.17.0/
#   The first argument must equal the name in tests/CMakeLists.txt's
#   FetchContent_Declare(<name> ...), usually "googletest".
# ---------------------------------------------------------------------------
use_local_source(googletest "${CMAKE_CURRENT_SOURCE_DIR}/googletest-1.17.0" "CMakeLists.txt")

add_subdirectory(tests)
