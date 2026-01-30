include(GoogleTest)

add_executable(
    anclient_tests
    test_01_hello_anson.cpp
)

# include_directories(${CMAKE_CURRENT_SOURCE_DIR})

target_include_directories(anclient_tests PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../src"
)

target_sources(anclient_tests PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../src/clients.cpp"
)

add_custom_command(TARGET anclient_tests POST_BUILD
    # COMMAND ${CMAKE_COMMAND} -E copy_if_different
    # # rttr-0.9.6/install/bin/rttr_core.dll or rttr-0.9.6/install/bin/rttr_core_d.dll
    # "${RTTR_DIR}/../bin/$<$<CONFIG:Debug>:rttr_core_d.dll>$<$<NOT:$<CONFIG:Debug>>:rttr_core.dll>"
    # $<TARGET_FILE_DIR:anclient_tests>

    COMMAND ${CMAKE_COMMAND} -E copy_if_different
            "${PROJECT_SOURCE_DIR}/../..//java/eclipse-workspace/anclient.jserv/src/test/res/WEB-INF/settings.json"
            $<TARGET_FILE_DIR:anclient_tests>
)

add_library(anson.cmake INTERFACE)

target_link_libraries(anclient_tests PRIVATE 
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    anson
    gtest_main
)

gtest_discover_tests(anclient_tests)
