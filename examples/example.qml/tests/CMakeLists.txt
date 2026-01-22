include(GoogleTest)

add_executable(
    anclient_tests
    test_01_hello_anson.cpp
)

add_custom_command(TARGET anclient_tests POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    # "C:/Users/Alice/github/rttr-0.9.6/install/bin/rttr_core.dll"
    "C:/Users/Alice/github/rttr-0.9.6/install/bin/rttr_core_d.dll"
    $<TARGET_FILE_DIR:anclient_tests>
)

target_link_libraries(anclient_tests PRIVATE 
    RTTR::Core
    nlohmann_json::nlohmann_json
    gtest_main
)

gtest_discover_tests(anclient_tests)
