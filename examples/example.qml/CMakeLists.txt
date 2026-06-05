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

project(album.qml VERSION 1.0.0 LANGUAGES CXX)

# see ping.cpp
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(WIN32)
    if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
        add_compile_options(-Wa,-mbig-obj)
    elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
        add_compile_options(-Xclang -mbig-obj)
    endif()
endif()

find_package(OpenSSL REQUIRED)
find_package(boost_url CONFIG REQUIRED)
find_package(EnTT CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(Qt6 REQUIRED COMPONENTS Core Qml)

qt_standard_project_setup(REQUIRES 6.8)

include(FetchContent)

# FetchContent_Declare(
#     json
#     URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
#     DOWNLOAD_EXTRACT_TIMESTAMP TRUE
# )
# FetchContent_MakeAvailable(json)

# try to auto-locate EnTT installed by vcpkg
message(STATUS "=========================================== CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

# ./vcpkg install entt:x64-windows --x-install-root="../anclient/examples/example.qml/vcpkg_packages"
# find_package(EnTT CONFIG REQUIRED)

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

# target_link_libraries(anclient INTERFACE EnTT::EnTT anson)

# FetchContent_Declare(
#   googletest
#   GIT_REPOSITORY https://github.com/google/googletest.git
#   GIT_TAG        v1.15.2
# )
# FetchContent_MakeAvailable(googletest)

# add_compile_options(/utf-8)
# add_compile_options("$<$<CXX_COMPILER_ID:MSVC>:/utf-8>")

# add_subdirectory(src)
add_subdirectory(app)

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
