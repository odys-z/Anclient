#include <gtest/gtest.h>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include "jsample.h"


void register_jsample() {
    using namespace entt::literals;

    // Register Anson Base
    entt::meta_factory<anson::SampleSettings>()
        .type("SampleSettings"_hs)
        .ctor<>()
        // .ctor<const std::string&>()
        .base<anson::Anson>()
        .data<&anson::SampleSettings::conn>("conn"_hs, "conn")
        .data<&anson::SampleSettings::port>("port"_hs, "port")
        .data<&anson::SampleSettings::vol_name>("vol_name"_hs, "vol_name")
        .data<&anson::SampleSettings::volume>("volume"_hs, "volume")
        .data<&anson::SampleSettings::rootkey>("rootkey"_hs, "rootkey")
        ;
}

/**
 * cp ../../anclient.jserv/src/test/res/WEB-INF/settings.json .
 *
 * <pre>{"type": "io.odysz.jsample.SampleSettings",
 *	"conn": "sys-sqlite",
 *	"vol_name": "VOLUME_HOME",
 *	"volume": "../volume",
 *	"port": 8080
 * }</pre>
 */
TEST(ANSON, Hello) {
    // deserialize settings.json
    using namespace  anson;
    register_meta();
    register_jsample();

    anson::SampleSettings sets;
    EnTTSaxParser handler(sets);

    string json_file
        = R"("{"type": "io.odysz.jsample.SampleSettings", )"
          R"("conn": "sys-sqlite", )"
          R"("vol_name": "VOLUME_HOME", )"
          R"("volume": "../volume", )"
          R"("port": 8080 )"
          R"(})";

    bool result = nlohmann::json::sax_parse(json_file, &handler);

    if (!result) FAIL() << "Parsing settings failed";

    ASSERT_EQ("sys-sqlite", sets.conn);
    ASSERT_EQ(8080, sets.port);
}
