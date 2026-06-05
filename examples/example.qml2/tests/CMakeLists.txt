# target_link_libraries(tst_core_logic PRIVATE Qt6::Test CoreLogic)

add_executable(album_tests 
    t01_portfolio.cpp
    )

target_link_libraries(album_tests PRIVATE
    # OpenSSL::Crypto
    # EnTT::EnTT
    # nlohmann_json::nlohmann_json
    # Qt6::Core
    # Qt6::Qml
    # Qt6::Test
    # anson
    # anclient
    gtest_main
)