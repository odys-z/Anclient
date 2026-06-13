#include <gtest/gtest.h>
#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include <qDebug>
#include <qml_cpp.h>
#include <QJsvalue>
#include <io/odysz/jprotocol.h>
#include <io/odysz/semantier.h>
#include <io/odysz/gen/doctier.hpp>
#include "gen/test_settings.hpp"

using namespace anson;
static anson::AstMap asts;
static anson::JsonOpt opts{&asts};

TEST(SYNODE_CLIENT, Query) {
    register_jserv(asts, opts);
    register_semantier(asts, "");
    register_doctier(asts, "ast");
    register_qmltestsettingsAst(asts);
    ix::initNetSystem();

    QDoclientier doctier;
    doctier.setDevice("SYNODE_CLIENT.Query");

    ASSERT_FALSE(doctier.connections()[0]);
    ASSERT_FALSE(doctier.connections()[1]);

    QJSValue paths;
    QMLTestSettings settings;
    JProtocol syn_protocol;
    syn_protocol.setup("jserv_album");
    JServUrl jserv{"http:://127.0.0.1", syn_protocol};
    doctier.login_synode(jserv, "ody", "123456");

    // ASSERT_TRUE(doctier.connections()[0]) << "ipc-agent connection";
    ASSERT_TRUE(doctier.connections()[1]) << "synode connection";

    ix::uninitNetSystem();
}
