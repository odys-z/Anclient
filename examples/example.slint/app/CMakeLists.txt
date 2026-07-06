project(album_gui LANGUAGES CXX)

get_filename_component(SURREALISM_UI_DIR 
    "${CMAKE_CURRENT_SOURCE_DIR}/../surrealism-0.5.3" 
    ABSOLUTE
)
message(STATUS "=========================================== app: CMAKE_CURRENT_SOURCE_DIR = ${CMAKE_CURRENT_SOURCE_DIR}")

# add_library(${PROJECT_NAME} STATIC
#     src/doctier.cpp
#     src/wsclients.h
#     src/wsclients.cpp
#     src/gen/app_settings.hpp   # header-only
# )

add_executable(album_gui
    src/main.cpp
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

target_include_directories(${PROJECT_NAME} PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${webview_SOURCE_DIR}
)

target_link_libraries(${PROJECT_NAME} PUBLIC
    OpenSSL::Crypto
    Boost::url
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    ixwebsocket::ixwebsocket
    anson
    anclient
    Slint::Slint
    webview::core
)

# Slint UI
slint_target_sources(${PROJECT_NAME}
    ui/app-window.slint
    LIBRARY_PATHS "surrealism=${SURREALISM_UI_DIR}"
)



# if (WIN32)
#     add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
#         COMMAND ${CMAKE_COMMAND} -E copy
#             $<TARGET_FILE:${PROJECT_NAME}>
#             $<TARGET_FILE_DIR:${PROJECT_NAME}> COMMAND_EXPAND_LISTS)
# endif()

if (WIN32)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            -t $<TARGET_FILE_DIR:${PROJECT_NAME}>
            $<TARGET_RUNTIME_DLLS:${PROJECT_NAME}>
        COMMAND_EXPAND_LISTS
    )
endif()