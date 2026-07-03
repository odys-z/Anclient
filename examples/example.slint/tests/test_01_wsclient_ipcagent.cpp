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
#include "../app/src/gen/app_settings.hpp"

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

class Ipclient : public ::testing::Test {
    static QMLAppSettings qmlsettings;
protected:
    static WSClient wsclient;
    
#ifdef _WIN32
    static HANDLE piProcessHandle;
#else
    static pid_t agentPid;
#endif

    void SetUp() override {}

    static void start_agent() {
        const u8string java = resolveHomePath(qmlsettings.java_path);
        std::string java_cmd = std::string(java.begin(), java.end());

        // Construct the full command execution string
        std::string cmd = std::format("\"{}\" -jar \"{}\" \"{}\"", 
                                      java_cmd, 
                                      qmlsettings.wsagent_jar, 
                                      qmlsettings.wsagent_settings);

        std::cout << "Launching Command: " << cmd << std::endl;

#ifdef _WIN32
        STARTUPINFOA si = { sizeof(STARTUPINFOA) };
        PROCESS_INFORMATION pi = { 0 };
        if (CreateProcessA(NULL, const_cast<char*>(cmd.c_str()), NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi)) {
            piProcessHandle = pi.hProcess;
            CloseHandle(pi.hThread);
            std::cout << "JAVA PID (Windows): " << pi.dwProcessId << std::endl;
        } else {
            std::cerr << "Failed to start Java process! Error: " << GetLastError() << std::endl;
        }
#else
        agentPid = fork();
        if (agentPid == 0) {
            // Child process: Redirect output if needed, then execute
            execl(java_cmd.c_str(), java_cmd.c_str(), "-jar", 
                  qmlsettings.wsagent_jar.c_str(), 
                  qmlsettings.wsagent_settings.c_str(), (char*)NULL);
            // If execl fails:
            std::cerr << "Failed to execute Java process!" << std::endl;
            exit(1);
        } else if (agentPid < 0) {
            std::cerr << "Failed to fork process!" << std::endl;
        } else {
            std::cout << "JAVA PID (POSIX): " << agentPid << std::endl;
        }
#endif

        // Allow the background process a brief moment to spin up before connecting
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        std::string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
        std::cout << "Opening WS: " << wsjserv << std::endl;
        wsclient.connect();

        anlog(qmlsettings.synode_settings);
    }

    static void SetUpTestSuite() {
        register_jserv(asts, opts);
        register_semantier(asts, "");
        register_doctier(asts, "ast");
        register_iport<WSPort>(asts, "ast/wsport.ast.json");
        register_qmltestsettingsAst(asts);
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);

        wsclient.setup({"127.0.0.1:8700"}, "ipc", onmsg);

        Anson::from_file("settings/test-01-settings.json", qmlsettings);
        ASSERT_EQ("/sys/qmltest", qmlsettings.sysuri);
        ASSERT_EQ("/syn/qmltest", qmlsettings.synuri);
        ASSERT_TRUE(std::regex_search(qmlsettings.wsagent_jar, std::regex{"ws-agent-[0-9.]+.jar"}));

        anlog(std::format("Starting IPC Agent: {}", qmlsettings.wsagent_jar));
        start_agent();

        ix::initNetSystem();
        wsclient.connect();
    }

    static void TearDownTestSuite() {
        wsclient.disconnect();
        ix::uninitNetSystem();
        stop_agent();
    }

    static void stop_agent() {
        std::cout << "Stopping Java Agent..." << std::endl;

#ifdef _WIN32
        if (piProcessHandle != NULL) {
            TerminateProcess(piProcessHandle, 0);
            CloseHandle(piProcessHandle);
            piProcessHandle = NULL;
        }
#else
        if (agentPid > 0) {
            kill(agentPid, SIGTERM); // Graceful shutdown signal
            
            // Wait brief moment for graceful exit, otherwise force kill
            int status;
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            if (waitpid(agentPid, &status, WNOHANG) == 0) {
                kill(agentPid, SIGKILL);
                waitpid(agentPid, &status, 0);
            }
            agentPid = -1;
        }
#endif

        // Run the explicit StopAgent utility class if required by the design
        const std::string stop_cmd = std::format("\"{}\" -cp \"{}\" io.oz.anclient.ipcagent.StopAgent",
                                                qmlsettings.java_path, qmlsettings.wsagent_jar);
        std::cout << "Executing Stop Hook: " << stop_cmd << std::endl;
        std::system(stop_cmd.c_str());

        std::cout << "Java Agent stopped successfully." << std::endl;
    }

    void TearDown() override {}
};

QMLAppSettings Ipclient::qmlsettings;
WSClient        Ipclient::wsclient{{"127.0.0.1:8700", {"ipc"}}, onmsg};

#ifdef _WIN32
HANDLE Ipclient::piProcessHandle = NULL;
#else
pid_t  Ipclient::agentPid = -1;
#endif

TEST_F(Ipclient, Echo) {
    EchoReq echo{EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy) from C++";
    AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

    wsclient.asynSend(echomsg);
    wsclient.block_poll();

    AnsonMsg<AnsonResp> resp;
    try {
        resp = wsclient.pop_envelope<AnsonResp>();
        FAIL() << "expecting session open ...";
    } catch(SemanticException& e) {
        wsclient.asynSend(echomsg);
        if (wsclient.block_poll(3000) == 0)
            FAIL() << "expecting echos ...";
    }

    resp = wsclient.pop_envelope<AnsonResp>();
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

    wsclient.asynSend(msg);

    AnsonMsg<DocsResp> resp;
    bool has_envl = wsclient.block_poll();
    int c = 0;
    while (has_envl) {
        try {
            resp = wsclient.pop_envelope<DocsResp>();
            has_envl = wsclient.block_poll(500);
            c++;
        } catch(SemanticException& e) {
            FAIL() << "expecting upload task replies ...";
        }
    }
    ASSERT_EQ(pthpage.clientPaths.size() * 2 + 1, c);
}