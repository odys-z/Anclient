project(album_gui LANGUAGES CXX)

get_filename_component(SURREALISM_UI_DIR
    "${CMAKE_CURRENT_SOURCE_DIR}/../surrealism-0.5.3"
    ABSOLUTE
)
message(STATUS "=========================================== app: CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

add_executable(${PROJECT_NAME}
    src/main.cpp
    src/helper.h
    src/slingleton.cpp
    src/slingleton.h
    src/gen/app_settings.hpp
    src/gen/wsport.hpp
    src/doctier.cpp
    src/wsclients.h
    src/wsclients.cpp
    src/doclientier.cpp
    src/doclientier.h
    src/file-explorer.h
    src/webview-ext.h
)

# ---------------------------------------------------------------------------
# All build output (exe + dlls + assets) lands in <build>/dist, and the exe
# is expected to be launched from within that folder.
# ---------------------------------------------------------------------------
set(ALBUM_DIST_DIR "${CMAKE_BINARY_DIR}/dist")

set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${ALBUM_DIST_DIR}"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG   "${ALBUM_DIST_DIR}"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${ALBUM_DIST_DIR}"
)

target_include_directories(${PROJECT_NAME} PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${webview_SOURCE_DIR}
)

# share slint uis for tests
add_library(album_slint_obj OBJECT)

slint_target_sources(album_slint_obj
    ui/app-window.slint
    LIBRARY_PATHS "surrealism=${SURREALISM_UI_DIR}"
)
# slint_target_sources(${PROJECT_NAME}
#     ui/app-window.slint
#     LIBRARY_PATHS "surrealism=${SURREALISM_UI_DIR}"
# )
target_link_libraries(album_slint_obj PUBLIC Slint::Slint)

target_link_libraries(${PROJECT_NAME} PUBLIC
    OpenSSL::Crypto
    Boost::url
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    ixwebsocket::ixwebsocket
    webview::core
    anson
    anclient
    Slint::Slint
    album_slint_obj
)

add_compile_definitions(ANSON_VERBOSE=4)

# ---------------------------------------------------------------------------
# Copy every DLL CMake can trace (vcpkg dynamic deps, Slint, etc.)
# ---------------------------------------------------------------------------
if (WIN32)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E make_directory "${ALBUM_DIST_DIR}"
        COMMAND ${CMAKE_COMMAND} -E copy
            -t "${ALBUM_DIST_DIR}"
            $<TARGET_RUNTIME_DLLS:${PROJECT_NAME}>
        COMMAND_EXPAND_LISTS
    )
endif()

# ---------------------------------------------------------------------------
# Catch DLLs that TARGET_RUNTIME_DLLS misses on MinGW: the compiler runtime
# and (on Windows) the WebView2 loader.
# ---------------------------------------------------------------------------
if (WIN32 AND MINGW)
    find_file(ALBUM_LIBGCC_DLL       NAMES libgcc_s_seh-1.dll libgcc_s_dw2-1.dll)
    find_file(ALBUM_LIBSTDCPP_DLL    NAMES libstdc++-6.dll)
    find_file(ALBUM_LIBWINPTHREAD_DLL NAMES libwinpthread-1.dll)

    foreach(_dll IN ITEMS ALBUM_LIBGCC_DLL ALBUM_LIBSTDCPP_DLL ALBUM_LIBWINPTHREAD_DLL)
        if(${_dll})
            add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
                COMMAND ${CMAKE_COMMAND} -E copy_if_different
                    "${${_dll}}" "${ALBUM_DIST_DIR}"
            )
        else()
            message(WARNING "album_gui: could not locate ${_dll} — copy it into dist/ manually if the exe fails to start")
        endif()
    endforeach()
endif()

if (WIN32)
    find_file(ALBUM_WEBVIEW2_LOADER_DLL
        NAMES WebView2Loader.dll
        PATHS "${webview_BINARY_DIR}" "${webview_SOURCE_DIR}"
        PATH_SUFFIXES "" "lib" "bin"
    )
    if (ALBUM_WEBVIEW2_LOADER_DLL)
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
                "${ALBUM_WEBVIEW2_LOADER_DLL}" "${ALBUM_DIST_DIR}"
        )
    else()
        message(WARNING "album_gui: WebView2Loader.dll not found automatically — locate it under the webview fetch content dirs and add a copy_if_different for it")
    endif()

    # WebView2Loader.dll only bootstraps the WebView2 *Runtime*, which must
    # still be installed on the target machine (it ships with modern
    # Windows, but isn't something you can copy into dist/).
endif()

# ---------------------------------------------------------------------------
# App assets -> dist/
# ---------------------------------------------------------------------------
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_SOURCE_DIR}/ast"
        "${ALBUM_DIST_DIR}/ast"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_SOURCE_DIR}/app/settings"   # or move settings to root
        "${ALBUM_DIST_DIR}/settings"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_SOURCE_DIR}/tests/res"
        "${ALBUM_DIST_DIR}/res"
)
