include(FetchContent)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
)
FetchContent_MakeAvailable(googletest)

include(GoogleTest)

find_package(Qt6 REQUIRED COMPONENTS Core Qml Test)

add_executable(
    album_tests
    jsample.h
    ../app/qml_cpp.cpp
    ../app/qml_cpp.h
    ../app/doctier.cpp
    # ../app/semantier.cpp
    # ../app/semantier.h
    ../app/dev/ping.cpp

    # cd test
    # py -m semantier_gen ast/gen-settings.json ast
    gen/test_settings.hpp
    test_01_file_uploader.cpp
)

target_include_directories(album_tests PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../app"
)

# add_custom_command(TARGET album_tests POST_BUILD
#     COMMAND ${CMAKE_COMMAND} -E copy_if_different
#             "${PROJECT_SOURCE_DIR}/../../../java/eclipse-workspace/anclient.jserv/src/test/res/WEB-INF/settings.json"
#             $<TARGET_FILE_DIR:album_tests>
# )

add_library(anson.cmake INTERFACE)

if (MSVC)
target_compile_options(album_tests PRIVATE /utf-8)
endif()


target_link_libraries(album_tests PRIVATE
    OpenSSL::Crypto
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    Qt6::Core
    Qt6::Qml
    Qt6::Test
    anson
    anclient
    gtest_main
)

qt_generate_deploy_app_script(
    TARGET album_tests
    OUTPUT_SCRIPT deploy_script
)

get_target_property(_qmake_executable Qt6::Core LOCATION)
get_filename_component(QT_BIN_DIR "${_qmake_executable}" DIRECTORY)

message(STATUS "=========================================== QT_BIN_DIR = ${QT_BIN_DIR}")

# if(WIN32)
#     add_custom_command(TARGET album_tests POST_BUILD
#         COMMAND ${CMAKE_COMMAND} -E env PATH=${QT_BIN_DIR}
#                 windeployqt --debug "$<TARGET_FILE:album_tests>"
#         COMMENT "Running windeployqt to copy dependencies..."
#     )
# endif()

set(test_env ${CMAKE_COMMAND} -E env
    "PATH=${QT_BIN_DIR};$ENV{PATH}"
)

set_target_properties(album_tests PROPERTIES
    TEST_LAUNCHER "${test_env}"
)

# gtest_discover_tests(album_tests)
gtest_discover_tests(album_tests
    DISCOVERY_MODE PRE_TEST
)
