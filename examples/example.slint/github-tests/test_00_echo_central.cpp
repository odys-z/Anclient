/**
 * Session-less echo to the registry central, with anson.cmake + Anclient.cmake as example.slint
 * uses them (without Slint).
 *
 * Env:
 *   CENTRAL_URL   default http://127.0.0.1:1991/regist-central
 *   CENTRAL_ECHO  the message, default "revial_tests echo"
 *
 * Run by semantic-jserv .github/workflows/version-revival-7days.yml after it starts the central.
 */
#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#endif

#include <gtest/gtest.h>
#include <cstdlib>
#include <format>
#include <string>

#include <io/odysz/jprotocol.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/clients.h>
#include <io/odysz/gen/anclient_settings.hpp>

using namespace std;
using namespace anson;

static string env_or(const char* name, const string& def) {
    const char* v = std::getenv(name);
    return v && *v ? string(v) : def;
}

TEST(Revival, EchoCentral) {
    const string url = env_or("CENTRAL_URL", "http://127.0.0.1:1991/regist-central");
    const string msg = env_or("CENTRAL_ECHO", "revial_tests echo");

    AstMap asts;
    JsonOpt opts{&asts};
    register_jserv(&opts);
    register_anclient_cmake(&opts, "ast/");

    string error;
    OnError errctx = [&error](MsgCode c, const string& e, const vector<string>&) {
        error = e;
        anerror(std::format("Error code {}, error: {}", MsgCode::to_string(c.valeur), e));
    };

    JServUrl jserv{url, &opts};
    ASSERT_EQ("regist-central", jserv.jprotocol.protocolpath) << url;

    Clients::if_verbose = true;
    AnsonResp resp = Clients::pingLess(jserv, "album/github-tests", msg, errctx);

    ASSERT_TRUE(error.empty()) << "echo to " << url << " failed: " << error;
    ASSERT_EQ(msg, resp.m);
}
