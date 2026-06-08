cmake_minimum_required(VERSION 3.30)

project(album_qml VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Quick)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(appalbum_qml
    main.cpp
)

qt_add_qml_module(appalbum_qml
    URI portfolio_qml
    QML_FILES
        Main.qml
)

# Qt for iOS sets MACOSX_BUNDLE_GUI_IDENTIFIER automatically since Qt 6.1.
set_target_properties(appalbum_qml PROPERTIES
#    MACOSX_BUNDLE_GUI_IDENTIFIER com.example.appalbum_qml
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

target_link_libraries(appalbum_qml
    PRIVATE
    Qt6::Quick
)

include(GNUInstallDirs)
install(TARGETS appalbum_qml
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
