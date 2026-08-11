#pragma once

#include <entt/meta/factory.hpp>
#include <entt/meta/meta.hpp>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/module/rs.h>



namespace anson {

class WSPort : public anson::Port {
public:
    inline static const std::string _type_ = "io.oz.anclient.ipcagent.WSPort";

    inline static const string doclient = "doclient.ws";
    inline static const string configIPC = "config.ws";
    inline static const string echo = "echo.ws";
    inline static const string ping = "ping.ws";
    inline static const string docstier = "docs.ws";

    WSPort(const JsonOpt* ctx) : Port(ctx, "_sentinel_") {
        Anclass(_type_);
    }

    WSPort(const JsonOpt* ctx, const string& enumval) : Port(ctx, enumval) {
        Anclass(_type_);
    }
};


}
