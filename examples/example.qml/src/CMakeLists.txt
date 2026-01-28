# Copyright (C) 2023 The Qt Company Ltd.
# SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause

cmake_minimum_required(VERSION 3.30)
project(anclient VERSION 1.0 LANGUAGES CXX)

if (ANDROID OR IOS)
    message(FATAL_ERROR "Platform is not supported")
    return()
endif ()

find_package(Qt6 REQUIRED COMPONENTS Core Gui Quick QuickControls2 Svg Widgets)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(${PROJECT_NAME}
    main.cpp
    qml/FileListView.qml
    filelistview.h
    clients.cpp
    clients.h
    semantier.cpp
    semantier.h
)

set_source_files_properties(qml/Colors.qml
    PROPERTIES
    QT_QML_SINGLETON_TYPE TRUE
)

qt_add_qml_module(anclient
    URI FilesystModule
    QML_FILES
        "Main.qml"
        "qml/About.qml"
        "qml/Colors.qml"
        "qml/Editor.qml"
        "qml/FilesysView.qml"
        "qml/MyMenu.qml"
        "qml/MyMenuBar.qml"
        "qml/Sidebar.qml"
        "qml/ResizeButton.qml"
        "qml/WindowDragHandler.qml"

        "qml/FileListView.qml"    #
    RESOURCES
        "icons/folder_closed.svg"
        "icons/folder_open.svg"
        "icons/generic_file.svg"
        "icons/globe.svg"
        "icons/info_sign.svg"
        "icons/light_bulb.svg"
        "icons/read.svg"
        "icons/resize.svg"
        "icons/qt_logo.svg"
        "icons/app_icon.svg"
    SOURCES
        filesysmodel.cpp
        filesysmodel.h
        linenumbermodel.cpp
        linenumbermodel.h

        filelistview.h	#
)

target_link_libraries(anclient
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Quick
        Qt6::QuickControls2
        Qt6::Svg
        Qt6::Widgets

        RTTR::Core
        nlohmann_json::nlohmann_json
        anson
)

set_target_properties(anclient
    PROPERTIES
    WIN32_EXECUTABLE TRUE
)

# if (MSVC)
#     # 1. Force relaxed mode
#     # target_compile_options(anclient PRIVATE /permissive)

#     # 2. Disable specific warnings that RTTR 0.9.6 triggers in modern MSVC
#     target_compile_options(anclient PRIVATE /wd4003 /wd4005)

#     # 3. If the error persists, explicitly remove the strict flag from this target
#     get_target_property(CURRENT_FLAGS anclient COMPILE_OPTIONS)
#     if(CURRENT_FLAGS)
#         list(REMOVE_ITEM CURRENT_FLAGS "/permissive-")
#         set_target_properties(anclient PROPERTIES COMPILE_OPTIONS "${CURRENT_FLAGS}")
#     endif()

#     # RTTR 0.9.6 needs the legacy preprocessor behavior in some MSVC versions
#     # add_compile_options(/Zc:preprocessor-)
#     # Or ensure it's not using the new lambda processor which breaks old RTTR
#     # add_compile_options(/Zc:lambda-)

#     target_compile_options(anclient PRIVATE
#             /permissive-  # Relaxed mode
#             /Zc:lambda-   # Disable modern lambda processor (Fixes C3878)
#             /Zc:preprocessor- # Use legacy preprocessor (Fixes C3878)
#         )
# endif()

# Instead of global 'set', use target-specific properties
# set_target_properties(anclient PROPERTIES
#     CXX_STANDARD 17
#     CXX_STANDARD_REQUIRED ON
#     CXX_EXTENSIONS OFF
# )

if (APPLE)
    set_target_properties(anclient PROPERTIES
        OUTPUT_NAME "File System Explorer"
        MACOSX_BUNDLE TRUE
        MACOSX_BUNDLE_BUNDLE_NAME "File System Explorer"
        MACOSX_BUNDLE_COPYRIGHT "Copyright (C) The Qt Company Ltd. and other contributors."
        MACOSX_BUNDLE_GUI_IDENTIFIER "io.qt.examples.fsexplorer"
        MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
        MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    )
endif()

install(TARGETS anclient
    BUNDLE  DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

qt_generate_deploy_qml_app_script(
    TARGET anclient
    OUTPUT_SCRIPT deploy_script
    MACOS_BUNDLE_POST_BUILD
    NO_UNSUPPORTED_PLATFORM_ERROR
    DEPLOY_USER_QML_MODULES_ON_UNSUPPORTED_PLATFORM
)
install(SCRIPT ${deploy_script})
