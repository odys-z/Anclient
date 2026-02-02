# Copyright (C) 2023 The Qt Company Ltd.
# SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause

cmake_minimum_required(VERSION 3.30)
project(album VERSION 1.0 LANGUAGES CXX)

if (ANDROID OR IOS)
    message(FATAL_ERROR "Platform is not supported")
    return()
endif ()

find_package(Qt6 REQUIRED COMPONENTS Core Gui Quick QuickControls2 Svg Widgets)

qt_standard_project_setup(REQUIRES 6.8)

# Add the app build directory (where FilesystModule is generated) to the QML import path
list(APPEND QML_IMPORT_PATH "${CMAKE_BINARY_DIR}/app")
set(QML_IMPORT_PATH ${QML_IMPORT_PATH} CACHE STRING "Qt Creator QML Import Paths" FORCE)

qt_add_executable(${PROJECT_NAME}
    main.cpp
)

set_source_files_properties(qml/Colors.qml
    PROPERTIES
    QT_QML_SINGLETON_TYPE TRUE
)

qt_add_qml_module(${PROJECT_NAME}
    URI FilesystModule
    VERSION 1.0
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
        "icons/album.svg"
    SOURCES
        qml_cpp.h
        qml_cpp.cpp
        filesysmodel.cpp
        filesysmodel.h
        linenumbermodel.cpp
        linenumbermodel.h
        filelistview.h	#
)

target_link_libraries(${PROJECT_NAME}
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Quick
        Qt6::QuickControls2
        Qt6::Svg
        Qt6::Widgets

        EnTT::EnTT
        nlohmann_json::nlohmann_json
        anson
)

set_target_properties(${PROJECT_NAME}
    PROPERTIES
    WIN32_EXECUTABLE TRUE
)

if (MSVC)
target_compile_options(album PRIVATE /utf-8)
endif()

if (APPLE)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        OUTPUT_NAME "File System Explorer"
        MACOSX_BUNDLE TRUE
        MACOSX_BUNDLE_BUNDLE_NAME "File System Explorer"
        MACOSX_BUNDLE_COPYRIGHT "Copyright (C) The Qt Company Ltd. and other contributors."
        MACOSX_BUNDLE_GUI_IDENTIFIER "io.qt.examples.fsexplorer"
        MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
        MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    )
endif()

# clangd helper, see also .clangd/index
# set(ANSON_BUILD_TESTS ON) not working
add_executable(album_clangd_helper dev/ping.cpp)
target_link_libraries(album_clangd_helper PRIVATE anclient)


install(TARGETS ${PROJECT_NAME}
    BUNDLE  DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

qt_generate_deploy_qml_app_script(
    TARGET ${PROJECT_NAME}
    OUTPUT_SCRIPT deploy_script
    MACOS_BUNDLE_POST_BUILD
    NO_UNSUPPORTED_PLATFORM_ERROR
    DEPLOY_USER_QML_MODULES_ON_UNSUPPORTED_PLATFORM
)
install(SCRIPT ${deploy_script})
