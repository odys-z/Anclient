add_library(Portfolio_core STATIC
    doclientier.cpp
)

# Link your internal core dependencies
target_link_libraries(Portfolio_core PRIVATE 
    Qt6::Core
    OpenSSL::SSL       # Provides SSL support
    OpenSSL::Crypto    # Provides AES, SHA, etc.
    anson              # Target name defined by anson.cmake
    anclient           # Target name defined by Anclient.cmake
)

# Expose headers to anyone linking against Portfolio_core (like the tests)
target_include_directories(Portfolio_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})