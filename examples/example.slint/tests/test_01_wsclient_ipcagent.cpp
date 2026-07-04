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

        // Asynchronous Launch
        std::string cmd = std::format("\"{}\" -jar \"{}\" \"{}\"", 
                                      java_cmd, 
                                      qmlsettings.wsagent_jar, 
                                      qmlsettings.wsagent_settings);

        std::cout << "Launching Command: " << cmd << std::endl;

    #ifdef _WIN32
        STARTUPINFOA si = { sizeof(STARTUPINFOA) };
        PROCESS_INFORMATION pi = { 0, 0, 0, 0 };
        if (CreateProcessA(NULL, const_cast<char*>(cmd.c_str()), NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi)) {
            piProcessHandle = pi.hProcess;
            CloseHandle(pi.hThread); // Release resources, not stop thread.
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

        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        // std::string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
        // std::cout << "Opening WS: " << wsjserv << std::endl;
        // wsclient.connect();

        anlog(std::format("Synode Settings: {}", qmlsettings.synode_settings));
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
        string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
        wsclient.setup(wsjserv, {"ipc"}, onmsg);
        wsclient.connect();
    }

    static void TearDownTestSuite() {
        wsclient.disconnect();
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        cout.flush();

        ix::uninitNetSystem();
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        cout.flush();

        stop_agent();
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        cout << "Tearing down TestSuite Ipclient Done." << std::endl;
        cout.flush();
    }

    static void stop_agent() {
        std::cout << "Stopping Java Agent gracefully..." << std::endl;

        // 1. VS Code bash is not happy with "c:/..."
        // u8string java = resolveHomePath(qmlsettings.java_path);
        // std:string java_cmd = std::string(java.begin(), java.end());
        // const std::string stop_cmd = std::format("\"{}\" -cp \"{}\" io.oz.anclient.ipcagent.StopAgent",
        //                                         java_cmd,
        //                                         // qmlsettings.java_path,
        //                                         qmlsettings.wsagent_jar);

        fs::path java_path = fs::path(reinterpret_cast<const char*>(resolveHomePath(qmlsettings.java_path).c_str()));
        fs::path jar_path = fs::path(reinterpret_cast<const char*>(qmlsettings.wsagent_jar.c_str()));

        java_path.make_preferred();
        jar_path.make_preferred();

        // TODO test in linux
        const std::string stop_cmd = std::format(
            "cmd.exe /c \"{} -cp {} io.oz.anclient.ipcagent.StopAgent\"",
            java_path.string(), jar_path.string());

        std::cout << "Executing Stop Hook: " << stop_cmd << std::endl;
        std::system(stop_cmd.c_str());

        // Give the Java agent a brief window to process the command and exit naturally
        std::this_thread::sleep_for(std::chrono::milliseconds(500));

    #ifdef _WIN32
        // if (piProcessHandle != NULL) {
        //     // Check if it's still alive. If it didn't exit gracefully, force close it.
        //     DWORD exitCode;
        //     if (GetExitCodeProcess(piProcessHandle, &exitCode) && exitCode == STILL_ACTIVE) {
        //         std::cout << "Agent didn't exit gracefully. Forcing termination..." << std::endl;
        //         TerminateProcess(piProcessHandle, 0);
        //     }
            
        //     // CRITICAL: Always close the handle to prevent OS leaks!
        //     CloseHandle(piProcessHandle);
        //     piProcessHandle = NULL;
        // }
        if (piProcessHandle != NULL) {
            // Wait up to 2000 milliseconds for the Java process to exit on its own
            DWORD waitResult = WaitForSingleObject(piProcessHandle, 2000);

            if (waitResult == WAIT_TIMEOUT) {
                // The 2 seconds expired and it's STILL running. Force it closed.
                std::cout << "Agent didn't exit gracefully within timeout. Forcing termination..." << std::endl;
                TerminateProcess(piProcessHandle, 0);
            } else {
                std::cout << "Agent exited gracefully on its own." << std::endl;
            }
            
            // Clean up the kernel handle safely
            CloseHandle(piProcessHandle);
            piProcessHandle = NULL;
        }
    #else
        if (agentPid > 0) {
            int status;
            // WNOHANG checks if the process has already exited without blocking
            if (waitpid(agentPid, &status, WNOHANG) == 0) {
                std::cout << "Agent didn't exit gracefully. Sending SIGKILL..." << std::endl;
                kill(agentPid, SIGKILL);
                waitpid(agentPid, &status, 0); // Reap the zombie process
            }
            agentPid = -1;
        }
    #endif

        std::cout << "Java Agent stopped successfully." << std::endl;
        std::cout.flush();
    }

    void TearDown() override {}
};

QMLAppSettings Ipclient::qmlsettings;
/**
 * TODO:
 * static WSClient* wsclient;
 * wsclient = new WSClient({"127.0.0.1:8700", {"ipc"}}, onmsg);
 * 
 * // In your TearDownTestSuite:
 * wsclient->disconnect();
 * delete wsclient; // <--- Explicitly destroy it BEFORE uninitNetSystem
 * wsclient = nullptr;
 * ix::uninitNetSystem();
 */
WSClient       Ipclient::wsclient{{"127.0.0.1:8700", {"ipc"}}, onmsg};

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
    // try {
        resp = wsclient.pop_envelope<AnsonResp>();
        ASSERT_EQ(MsgCode::Code::_sentinel_, resp.code) << "expecting session open ...";
        anlog("✅ Echo Opening message verified");
    // } catch(SemanticException& e) {
        wsclient.asynSend(echomsg);
        if (!wsclient.block_poll(3000))
            FAIL() << "expecting echos ...";
    // }

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