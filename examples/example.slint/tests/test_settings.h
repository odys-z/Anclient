#pragma once

#include <io/odysz/anson.h>

namespace anson {

class TestSettings : public Anson {
    inline static const string _type_ = "io.odysz.anclient.TestSetttings";

public:
    string type;

    string agent_jar;
    string agent_json;
    string ipc_path;
    string qtclient;
    int ipc_port;
    SessionInf ipc_session;

    string wsUri() {
        return format("ws://127.0.0.1:{0:d}/{1:s}", ipc_port, ipc_path);
    }

    filesystem::path agentJar(string prefix) {
        filesystem::path p0 = prefix;
        return p0 / this->agent_jar;
    }

    filesystem::path agentJson(string prefix) {
        filesystem::path p0 = prefix;
        return p0 / this->agent_json;
    }

    static void load(TestSettings& settings, string path) {

    }
};


}
