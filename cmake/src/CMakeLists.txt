# Anclient.cmake source, pure header files

cmake_minimum_required(VERSION 3.30)
# project(anclient LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(anclient INTERFACE
    io/odysz_anc/clients.h
    io/odysz_anc/semantier.h
    # io/odysz/jprotocol.h
    # io/odysz/json.h
)

add_library(anclient::anclient ALIAS anclient)

# 1. Register the Header Set
target_sources(anclient INTERFACE
    FILE_SET HEADERS
    BASE_DIRS ${CMAKE_CURRENT_SOURCE_DIR}
    FILES
        io/odysz_anc/anson.h
        # io/odysz/jprotocol.h
        # io/odysz/json.h
)

target_include_directories(anson INTERFACE
    ${CMAKE_CURRENT_SOURCE_DIR}
    $<INSTALL_INTERFACE:include>
)

target_link_libraries(anson INTERFACE
    EnTT::EnTT
    nlohmann_json::nlohmann_json
    anson
)


# clangd helper, see also .clangd/index
if(ANCLIENT_BUILD_TESTS)
    # set(ANSON_BUILD_TESTS ON) not working
    add_executable(anclient_clangd_helper dev/ping.cpp)
    target_link_libraries(anclient_clangd_helper PRIVATE anson)
endif()
