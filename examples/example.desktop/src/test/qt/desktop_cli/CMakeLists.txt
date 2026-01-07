cmake_minimum_required(VERSION 3.16)

project(desktop_cli LANGUAGES CXX)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Core)

# sudo apt install qt6-websockets-dev
# Windows: Maintenance Tool, "Add or remove components," Qt 6.8.x, check Qt WebSockets
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Core WebSockets)

add_executable(desktop_cli
  main.cpp
)
target_link_libraries(
    desktop_cli Qt${QT_VERSION_MAJOR}::Core
    Qt6::WebSockets
)

include(GNUInstallDirs)
install(TARGETS desktop_cli
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
