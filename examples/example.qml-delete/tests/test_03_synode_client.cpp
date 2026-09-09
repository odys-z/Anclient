#include <gtest/gtest.h>
#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include <qDebug>
#include <qml_cpp.h>
#include <QJsvalue>
#include <io/odysz/jprotocol.h>
#include <io/odysz/semantier.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/anclient_settings.hpp>
#include "gen/test_settings.hpp"

/**
 * @brief getTestPushFile
 * @return If src is "report.txt", copy to "report_2026-06-14_01-04-51.txt" and return the name.
 */
fs::path getTestPushFile(const string& src) {
    fs::path sourcePath{src};
    auto now = std::chrono::system_clock::now();

    std::string timestamp = std::format("{:%Y-%m-%d_%H-%M-%S}", now);

    fs::path extension = sourcePath.extension();
    fs::path stem = sourcePath.stem();
    fs::path parentDir = sourcePath.parent_path();

    std::string newFileName = stem.string() + "_" + timestamp + extension.string();
    fs::path target_path = parentDir / newFileName;

    fs::copy_file(sourcePath, target_path, fs::copy_options::skip_existing);

    return target_path;
}
using namespace anson;
static anson::AstMap asts;
static anson::JsonOpt opts{&asts};

TEST(SYNODE_CLIENT, Query) {
    register_jserv(asts, opts);
    register_semantier(asts, "");
    register_doctier(asts, "ast");
    register_anclientsettingsAst(asts);
    register_qmltestsettingsAst(asts);
    ix::initNetSystem();

    QDoclientier doctier;
    doctier.setDevice("SYNODE_CLIENT.Query");

    ASSERT_FALSE(doctier.connections()[0]);
    ASSERT_FALSE(doctier.connections()[1]);

    QMLTestSettings test_settings;
    Anson::from_file("settings/test-settings.json", test_settings);

    AnclientSettings client_settings;
    Anson::from_file(test_settings.synode_settings, client_settings);

    JProtocol syn_protocol;
    syn_protocol.setup(client_settings.protocolpath);
    JServUrl jserv{client_settings.jserv, syn_protocol};
    doctier.login_synode(jserv, client_settings.admin, client_settings.domain_token);

    // ASSERT_TRUE(doctier.connections()[0]) << "ipc-agent connection";
    ASSERT_TRUE(doctier.connections()[1]) << "synode connection";

    JProtocol ipc_protocol;
    ipc_protocol.setup("ipc");
    JServUrl wserv{"http://127.0.0.1:8700", ipc_protocol};

    map<string, vector<string>>paths;

    fs::path pushingPath = getTestPushFile("res/182x121.png");

    // std::string pthstr(pushingPath.u8string().begin(), pushingPath.u8string().end());
    string pthstr = pushingPath.string();
    vector<string> shareflags{};
    paths[pthstr] = shareflags;
    doctier.wsclient->push_files(paths,  QDoclientier::onprogress);

    ix::uninitNetSystem();
}
