project(album_tests VERSION 1.0 LANGUAGES CXX)

include(FetchContent)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
FetchContent_MakeAvailable(googletest)

include(GoogleTest)

find_package(Qt6 REQUIRED COMPONENTS Core Qml Test)
find_package(Qt6 REQUIRED COMPONENTS)

add_executable(
    ${PROJECT_NAME}
    jsample.h
    ../app/qml_cpp.cpp
    ../app/qml_cpp.h
    ../app/doctier.cpp
    ../app/wsclients.h
    ../app/wsclients.cpp

    # cd test
    # py -m semantier_gen ast/gen-settings.json ast
    gen/test_settings.hpp
    # test_01_hello_ixwebsocket.cpp
    test_02_wsclient_ipcagent.cpp
    # test_03_synode_client.cpp
)

# target_link_libraries(album_tests PRIVATE Qt6::WebSockets)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/../ast"
        "$<TARGET_FILE_DIR:album_tests>/ast"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/settings"
        "$<TARGET_FILE_DIR:album_tests>/settings"

    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/res"
        "$<TARGET_FILE_DIR:album_tests>/res"

    COMMENT "Copying JSON settings to build directory"
)

target_include_directories(${PROJECT_NAME} PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../app"
)

target_link_options(${PROJECT_NAME} PRIVATE
    -static-libgcc
    -static-libstdc++
    -static
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    OpenSSL::Crypto
    Boost::url
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    ixwebsocket::ixwebsocket
    Qt6::Core
    Qt6::Qml
    Qt6::Test
    anson
    anclient
    gtest_main
)

# qt_generate_deploy_app_script(
#     TARGET ${PROJECT_NAME}
#     OUTPUT_SCRIPT deploy_script
# )

message(STATUS "=========================================== QT_BIN_DIR = ${QT_BIN_DIR}")

set(test_env ${CMAKE_COMMAND} -E env
    "PATH=${QT_BIN_DIR};$ENV{PATH}"
)

# gtest_discover_tests(album_tests)
gtest_discover_tests(${PROJECT_NAME}
    DISCOVERY_MODE PRE_TEST
)

add_compile_definitions(ANSON_VERBOSE=4)
