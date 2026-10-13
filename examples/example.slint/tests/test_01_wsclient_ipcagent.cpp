#include <gtest/gtest.h>
#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>

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
#include "../app/src/gen/app_settings.hpp"
#include "../app/src/ipcagent_manager.h"
#include "test_common.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <sys/types.h>
#include <signal.h>
#endif

/**
 * Default settings for local debugging. CI overrides it with env ALBUM_TEST_SETTINGS, e.g. the
 * released desktop's settings/app-settings.json pointed at a test hub (semantic-jserv
 * .github/workflows/synodes-linux-closed-test.yml).
 */
string settings_json = env_str("ALBUM_TEST_SETTINGS", "settings/desktop-settings.gitignore.json");
anson::AstMap asts;
anson::JsonOpt opts{&asts};

using namespace anson;
namespace fs = std::filesystem;

OnMsg onmsg = []() { return false; };

static JavaAgentController* agentController = nullptr;

class Ipclient : public ::testing::Test {
protected:
    static DesktopSettings settings;
    static WSClient* wsclient;
    /** Set by SetUpTestSuite(); tests fail fast instead of hanging on a dead agent. */
    static bool agent_ready;
    static string setup_error;

    void SetUp() override {
        if (!agent_ready)
            FAIL() << "IPC agent is not ready: " << setup_error;
    }

    static bool start_agent() {
        if (!fs::exists(settings_json)) {
            setup_error = "settings file not found: " + settings_json;
            return false;
        }
        Anson::from_file(settings_json, settings, &opts);
        agentController = new JavaAgentController(settings);

        if (!agentController->start_agent(settings_json)) {
            setup_error = "failed to launch the Java IPC agent process.";
            return false;
        }
        anlog(std::format("Synode Volume: {}", settings.synode_vol));
        return true;
    }

    /**
     * Replaces the fixed sleeps: a cold JVM on a CI runner can take several seconds
     * before the agent binds wsport. Retry the websocket until it is Open.
     */
    static bool connect_with_retry(int timeout_ms) {
        auto deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeout_ms);
        while (std::chrono::steady_clock::now() < deadline) {
            wsclient->connect();
            for (int i = 0; i < 10; i++) {
                if (wsclient->ipconn_state() == WSClient::Open)
                    return true;
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
            }
            wsclient->disconnect();
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
        }
        return false;
    }

    static void SetUpTestSuite() {
        register_jserv(&opts);
        register_semantier(&opts, "ast");
        register_doctier(&opts, "ast");
        register_iport<WSPort_test>(&opts, "ast/wsport.ast.json");
        register_anclient_cmake(&opts, "ast"); // AnclientSettings: device, admin, domain_token, sysuri, ... (as slingleton.h)
        register_desktopsettingsAst(&opts);

        ix::initNetSystem();

        if (!start_agent()) return;

        string wsjserv = std::format("ws://{}:{}/ipc", settings.wshost, settings.wsport);
        wsclient = new WSClient({wsjserv, JProtocol{"ipc", &opts}}, settings, onmsg);

        int wait_ms = env_int("ALBUM_AGENT_WAIT_MS", 30000);
        agent_ready = connect_with_retry(wait_ms);
        if (!agent_ready)
            setup_error = std::format("{} not reachable in {} ms, see log/ipc_agent_java.log", wsjserv, wait_ms);
    }

    static void TearDownTestSuite() {
        if (wsclient) {
            std::cout << "[DEBUG] Disconnecting..." << std::endl;
            wsclient->disconnect();

            std::cout << "[DEBUG] Deleting wsclient..." << std::endl;
            delete wsclient;
            wsclient = nullptr;
        }

        std::cout << "[DEBUG] Stopping agent..." << std::endl;
        stop_agent();
        
        asts.clear();

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

DesktopSettings Ipclient::settings;
WSClient*       Ipclient::wsclient = nullptr;
bool            Ipclient::agent_ready = false;
string          Ipclient::setup_error;

TEST_F(Ipclient, Echo) {
    /*
     * The agent's first message on a new connection. SetUpTestSuite() waits until the socket is
     * open, so it is already queued: pop it before sending anything. (An echo sent before it
     * would get a reply nobody pops, and the next test would count it.)
     */
    if (!wsclient->block_poll(3000))
        FAIL() << "expecting session open ...";

    AnsonMsg<AnsonResp> resp = wsclient->pop_envelope<AnsonResp>();
    ASSERT_EQ(MsgCode::Code::_sentinel_, resp.code) << "expecting session open ...";
    anlog("✅ Echo Opening message verified");

    EchoReq echo{EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy) from C++";
    AnsonMsg<EchoReq> echomsg(Port(&opts, Port::echo), echo);
    echomsg.code = MsgCode::Code::ok;
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
    AnsonMsg<DocsReq> msg(Port{&opts, WSPort_test::ping}, uploadreq);
    msg.code = MsgCode::Code::ext; // Should it be a good idea to change name of sentinel to null?

    wsclient->asynSend(msg);

    AnsonMsg<DocsResp> resp{&opts};
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

TEST_F(Ipclient, DocTask_upload) {
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
    AnsonMsg<DocsReq> msg(Port{&opts, Port::docstier}, uploadreq);
    msg.code = MsgCode::Code::ok;

    wsclient->asynSend(msg);

    AnsonMsg<DocsResp> resp{&opts};
    bool has_envl = wsclient->block_poll();
    while (has_envl) {
        try {
            resp = wsclient->pop_envelope<DocsResp>();
            Port exp_port{&opts, Port::docstier};
            ASSERT_EQ((resp.port.valof()), (exp_port.valof()));
            has_envl = wsclient->block_poll(500);
        } catch(SemanticException& e) {
            FAIL() << "expecting upload task replies ...";
        }
    }
}

/**
 * End-to-end: desktop -> IPC agent -> synode (home) -> synode (peer).
 *
 * Skipped unless SYNODE_E2E_PEER_VOL is set, so local runs behave as before.
 * env:
 *   SYNODE_E2E_PEER_VOL  volume of the synode that must receive the file by synchronization (required)
 *   SYNODE_E2E_HOME_VOL  volume of the synode the desktop pushes to (optional, checked first)
 *   SYNODE_E2E_TIMEOUT   seconds, default 180
 *
 * The oracle is file content (size + SHA-256) found anywhere under a volume, so it doesn't
 * depend on how a synode names or arranges stored files. The pushed file carries a unique
 * trailer, so a copy left by a previous run can't make the test pass.
 */
TEST_F(Ipclient, E2E_PushSync) {
    string peer_vol = env_str("SYNODE_E2E_PEER_VOL", "");
    if (peer_vol.empty())
        GTEST_SKIP() << "SYNODE_E2E_PEER_VOL is not set.";
    string home_vol = env_str("SYNODE_E2E_HOME_VOL", "");
    int timeout_s = env_int("SYNODE_E2E_TIMEOUT", 180);

    fs::path pushfile = make_unique_push_file("res/182x121.png");
    string digest = sha256_file(pushfile);
    auto fsize = fs::file_size(pushfile);
    anlog(std::format("[E2E] pushing {} ({} bytes, sha256 {})", pushfile.generic_string(), fsize, digest));

    DocsReq req{"h_photos", {}};
    req.a = DocsReq::A::requestSyn;
    req.docTabl = "h_photos";
    req.device = Device{settings.device, settings.synode_id, settings.device};

    PathsPage page{settings.device, 0, 1};
    page.clientPaths = {{pushfile.generic_string(), {}}};
    req.syncingPage = page;

    AnsonMsg<DocsReq> msg(Port{&opts, Port::docstier}, req);
    msg.code = MsgCode::Code::ok;
    wsclient->asynSend(msg);

    // 1. agent replies: any non-ok code is a failure; stop when the agent goes quiet.
    auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(timeout_s);
    int replies = 0;
    while (std::chrono::steady_clock::now() < deadline && wsclient->block_poll(15000)) {
        AnsonMsg<DocsResp> resp{&opts};
        try {
            resp = wsclient->pop_envelope<DocsResp>();
        } catch (SemanticException& e) {
            anwarn(std::format("[E2E] ignoring reply: {}", e.what()));
            continue;
        }
        if (resp.code == MsgCode::Code::_sentinel_)
            continue; // "session openned", left over when Echo is filtered out
        replies++;
        string m = resp.body_size() > 0 ? resp.Body().m : "";
        ASSERT_EQ(MsgCode::Code::ok, resp.code) << "agent reported: " << m;
        ASSERT_NE(string("No files has been pushed."), m);
    }
    ASSERT_GT(replies, 0) << "no reply from the IPC agent for requestSyn.";

    // 2. the file landed on the home synode, then 3. was synchronized to the peer.
    if (!home_vol.empty())
        ASSERT_TRUE(wait_for_content(home_vol, fsize, digest, deadline))
            << "pushed file not found in home synode volume " << home_vol;

    ASSERT_TRUE(wait_for_content(peer_vol, fsize, digest, deadline))
        << "pushed file not synchronized to peer volume " << peer_vol
        << " within " << timeout_s << " s";
    anlog("✅ [E2E] file synchronized to peer synode");
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
}
