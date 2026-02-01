include(GoogleTest)

find_package(Qt6 REQUIRED COMPONENTS Core Qml Test)

add_executable(
    album_tests
    test_01_hello_anson.cpp
    jsample.h
    ../src/qml_cpp.cpp
    ../src/qml_cpp.h
    ../src/clients.cpp
    ../src/clients.h
    ../src/semantier.cpp
    ../src/semantier.h
)

# include_directories(${CMAKE_CURRENT_SOURCE_DIR})

target_include_directories(album_tests PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../src"
)


# target_sources(album_tests PRIVATE
#     "${CMAKE_CURRENT_SOURCE_DIR}/../src/clients.cpp"
# )
# set_tests_properties(album_tests PROPERTIES ENVIRONMENT
#     "PATH=${QT_INSTALL_BIN};$ENV{PATH}"
# )

add_custom_command(TARGET album_tests POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
            "${PROJECT_SOURCE_DIR}/../..//java/eclipse-workspace/anclient.jserv/src/test/res/WEB-INF/settings.json"
            $<TARGET_FILE_DIR:album_tests>
)

add_library(anson.cmake INTERFACE)

if (MSVC)
target_compile_options(album_tests PRIVATE /utf-8)
endif()


target_link_libraries(album_tests PRIVATE
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    Qt6::Core
    Qt6::Qml
    Qt6::Test
    anson
    gtest_main
)

qt_generate_deploy_app_script(
    TARGET album_tests
    OUTPUT_SCRIPT deploy_script
)
# install(SCRIPT ${deploy_script})
get_target_property(_qmake_executable Qt6::Core LOCATION)
get_filename_component(QT_BIN_DIR "${_qmake_executable}" DIRECTORY)

message(STATUS "=========================================== QT_BIN_DIR = ${QT_BIN_DIR}")

if(WIN32)
    add_custom_command(TARGET album_tests POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E env PATH=${QT_BIN_DIR}
                windeployqt --debug "$<TARGET_FILE:album_tests>"
        COMMENT "Running windeployqt to copy dependencies..."
    )
endif()

gtest_discover_tests(album_tests)
