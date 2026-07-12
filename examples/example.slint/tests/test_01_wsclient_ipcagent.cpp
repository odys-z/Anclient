#include <gtest/gtest.h>
#include <iostream>
#include <string>
#include <vector>
#include <regex>
#include <filesystem>
#include <thread>
#include <chrono>
#include <cstdlib>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/semantier.hpp>
#include <io/odysz/semantic/tier/docs.h>

#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include "../app/src/wsclients.h"
#include "../app/src/gen/wsport.hpp"
#include "../app/src/doclientier.h"
#include "../app/src/gen/app_settings.hpp"
#include "../app/src/ipcagent_manager.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <sys/types.h>
#include <signal.h>
#endif

anson::AstMap asts;
anson::JsonOpt opts{&asts};

using namespace anson;
namespace fs = std::filesystem;

OnMsg onmsg = []() { return false; };

static JavaAgentController* agentController = nullptr;

class Ipclient : public ::testing::Test {
    static QMLAppSettings qmlsettings;
protected:
    static WSClient* wsclient;
 
    void SetUp() override {}

    static void start_agent() {
        const string java = resolveHomePath(qmlsettings.java_path);
        agentController = new JavaAgentController(java, qmlsettings.wsagent_jar);
        if (!agentController->start_agent(qmlsettings.wsagent_settings)) {
            FAIL() << "Failed to initialize IPC Java Agent process context.";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        anlog(std::format("Synode Volume: {}", qmlsettings.synode_vol));
    }

    static void SetUpTestSuite() {
        register_jserv(asts, opts);
        register_semantier(asts, "");
        register_doctier(asts, "ast");
        register_iport<WSPort>(asts, "ast/wsport.ast.json");
        register_qmlappsettingsAst(asts);

        Anson::from_file("settings/test-01-settings.json", qmlsettings);
        ASSERT_EQ("/sys/qmltest", qmlsettings.sysuri);
        ASSERT_EQ("/syn/qmltest", qmlsettings.synuri);
        ASSERT_TRUE(std::regex_search(qmlsettings.wsagent_jar, std::regex{"ws-agent-[0-9.]+.jar"}));

        anlog(std::format("Starting IPC Agent: {}", qmlsettings.wsagent_jar));
        start_agent();

        ix::initNetSystem();
        string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
        wsclient = new WSClient({wsjserv, {"ipc"}}, onmsg);
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
        wsclient->connect();
    }

    static void TearDownTestSuite() {
        std::cout << "[DEBUG] Disconnecting..." << std::endl;
        wsclient->disconnect();
        
        std::cout << "[DEBUG] Deleting wsclient..." << std::endl;
        delete wsclient;
        wsclient = nullptr; 

        std::cout << "[DEBUG] Stopping agent..." << std::endl;
        stop_agent();
        
        asts.clear();
        qmlsettings = QMLAppSettings();

        std::cout << "Teardown[*]" << std::endl;

        std::cout << "\n\n";
        std::cout.flush(); 
        std::cerr.flush();
    }

    static void stop_agent() {
        std::cout << "Stopping Java Agent gracefully..." << std::endl;

        if (agentController) {
            agentController->stop_agent();
            delete agentController;
            agentController = nullptr;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
        std::cout << "Java Agent stopped." << std::endl;
    }

    void TearDown() override {}
};

QMLAppSettings Ipclient::qmlsettings;
WSClient*      Ipclient::wsclient;

TEST_F(Ipclient, Echo) {
    EchoReq echo{EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy) from C++";
    AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

    wsclient->asynSend(echomsg);
    wsclient->block_poll();

    AnsonMsg<AnsonResp> resp = wsclient->pop_envelope<AnsonResp>();
    ASSERT_EQ(MsgCode::Code::_sentinel_, resp.code) << "expecting session open ...";
    anlog("✅ Echo Opening message verified");
    wsclient->asynSend(echomsg);
    if (!wsclient->block_poll(3000))
        FAIL() << "expecting echos ...";

    resp = wsclient->pop_envelope<AnsonResp>();
    ASSERT_EQ(echo.echo, resp.Body().m);
    std::cout << "✅ Ping response parsed successfully" << std::endl;
}

TEST_F(Ipclient, PING_Place_Task) {
    DocsReq uploadreq{"h_photos", {}};
    uploadreq.a = DocsReq::A::requestSyn;

    std::map<std::string, std::vector<LangExt::VarType>> clientPaths {
        {"path/a", {ShareFlag::pushing}}, {"path/b", {}}, {"path/c", {}},
        {"path/d", {}}, {"path/e", {}}, {"path/f", {}} 
    };

    PathsPage pthpage;
    pthpage.clientPaths = clientPaths;
    uploadreq.syncingPage = {pthpage};
    uploadreq.syncingPage.end = clientPaths.size();
    uploadreq.syncingPage.start = 0;
    AnsonMsg<DocsReq> msg(WSPort{WSPort::ping}, uploadreq);

    wsclient->asynSend(msg);

    AnsonMsg<DocsResp> resp;
    bool has_envl = wsclient->block_poll();
    int c = 0;
    while (has_envl) {
        try {
            resp = wsclient->pop_envelope<DocsResp>();
            has_envl = wsclient->block_poll(500);
            c++;
        } catch(SemanticException& e) {
            FAIL() << "expecting upload task replies ...";
        }
    }
    ASSERT_EQ(pthpage.clientPaths.size() * 2 + 1, c);
}

/**
 * Override the main function for ensure gtest outputs.
 */
int main(int argc, char** argv) {
    std::cout.setf(std::ios::unitbuf);
    std::cerr.setf(std::ios::unitbuf);
    setvbuf(stdout, nullptr, _IONBF, 0);
    setvbuf(stderr, nullptr, _IONBF, 0);
    setvbuf(stdin,  nullptr, _IONBF, 0);

    ::testing::InitGoogleTest(&argc, argv);

    cout << "---------------- ------------------------------------- ----------------" << std::endl;
    int c = RUN_ALL_TESTS();
    cout << "---------------- Tearing down TestSuite Ipclient Done. ----------------" << std::endl;

    return c;
    // _exit(c);
}
