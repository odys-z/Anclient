#include <gtest/gtest.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/gen/doctier.hpp>

#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include <QTimer>
#include <QThread>  // Added for thread checks
#include <qml_cpp.h>
#include <wsclients.h>
#include <QProcess>

#include "gen/test_settings.hpp"

anson::AstMap asts;
anson::JsonOpt opts{&asts};

using namespace anson;
namespace fs = std::filesystem;

JProtocol wsprotocol{"ipc"};
OnMsg onmsg = [](AnsonMsg<AnsonResp> r) { return false; };

class Ipclient : public ::testing::Test {
    static QMLTestSettings qmlsettings;
protected:
    // static ix::WebSocket webSocket;
    // static ix::SocketTLSOptions tlsOptions;
    static WSClient wsclient;
    static QProcess wsAgentProc;

    void SetUp() override {

    }


    /**
     * @brief Resolves the tilde (~) prefix in file paths across different platforms.
     * On Windows, it expands '~' to the USERPROFILE directory.
     * On Unix/Linux/macOS, it expands '~' to the HOME directory.
     */
    static u8string resolveHomePath(const std::string& inputPath) {
        if (inputPath.empty() || inputPath[0] != '~') {
            return fs::path(inputPath).u8string();
        }

        std::string homeDir;

        #ifdef _WIN32
        // Windows conditional compilation
        char* userProfile = std::getenv("USERPROFILE");
        if (userProfile) {
            homeDir = userProfile;
        }
        #else
        // Linux / macOS conditional compilation
        char* home = std::getenv("HOME");
        if (home) {
            homeDir = home;
        }
        #endif

        if (homeDir.empty()) {
            return fs::path(inputPath).u8string();
        }

        size_t offset = (inputPath.size() > 1 && (inputPath[1] == '/' || inputPath[1] == '\\')) ? 2 : 1;

        return (fs::path(homeDir) / inputPath.substr(offset)).u8string();
    }

    static void start_agent() {
        // filesystem::path path2prj{"."};
        // filesystem::path agent_jar  = path2prj / qmlsettings.wsagent_jar;
        // filesystem::path agent_json = path2prj / qmlsettings.wsagent_settings;

        // qDebug() << "=== start_agent({" << agent_json.c_str() << agent_jar.c_str() << "===";

        // QProcess myProcess = QProcess();
        // const QString program{qmlsettings.java_path.c_str()}; // = "java";
        // QStringList arguments;
        // arguments << "-jar";

        // Gemini: On windows, QStringList (and QString) internally stores everything as UTF-16.
        // arguments << QString::fromUtf8(agent_jar.u8string().c_str());
        // arguments << QString::fromUtf8(agent_json.u8string().c_str());

        // QString cmd{};
        // for (const QString& value : std::as_const(arguments)) {
        //     cmd += " " + value;
        // }
        // qDebug() << cmd;
        // qDebug() << program << arguments;


        const u8string java = resolveHomePath(qmlsettings.java_path);
        QString qjava = QString::fromUtf8(java.c_str());

        QStringList arguments;
        arguments << "-jar" <<
            qmlsettings.wsagent_jar.c_str() <<
            qmlsettings.wsagent_settings.c_str();

        QObject::connect(&wsAgentProc, &QProcess::readyReadStandardOutput, [&]() {
            qDebug() << "Java Output:" << wsAgentProc.readAllStandardOutput().trimmed();
        });

        // Also helpful to catch errors
        QObject::connect(&wsAgentProc, &QProcess::readyReadStandardError, [&]() {
            qDebug() << "Java Error:" << wsAgentProc.readAllStandardError().trimmed();
        });

        // wsAgentProc.start(program, arguments);
        qDebug() << qjava << arguments;
        wsAgentProc.start(qjava, arguments);

        if (!wsAgentProc.waitForStarted()) {
            qDebug() << "Failed to start Java process!";
        }
        else
            qDebug() << "JAVA PID:" << wsAgentProc.processId();

        string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
        qDebug() << "Opening WS:" << wsjserv.c_str();
        // wsclient.setup(wsjserv, {"ipc"}, onmsg);
        wsclient.connect();

        anlog(qmlsettings.synode_settings);

        // Wait for connection
        // and?
    }

    static void SetUpTestSuite() {
        register_jserv(asts, opts);
        register_semantier(asts, "");
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);

        //
        Anson::from_file("settings/test-02-settings.json", qmlsettings);
        ASSERT_EQ("/sys/qmltest", qmlsettings.sysuri);
        ASSERT_EQ("/syn/qmltest", qmlsettings.synuri);
        ASSERT_TRUE(std::regex_search(qmlsettings.wsagent_jar, std::regex{"ipc-agent-[0-9.]+.jar"}));

        anlog(std::format("Starting IPC Agent: {}", qmlsettings.wsagent_jar));
        start_agent();

        //
        ix::initNetSystem();
        wsclient.connect();
    }

    static void TearDownTestSuite() {
        // anlog("Tearing down ipc-agent ...");
        wsclient.disconnect();
        ix::uninitNetSystem();
        stop_agent();
    }

    static void stop_agent() {
        if (wsAgentProc.state() == QProcess::NotRunning) {
            return;
        }

        qDebug() << "Stopping Java Agent...";
        wsAgentProc.terminate();

        const QString stop_cmd {std::format("{} -cp {} io.oz.anclient.ipcagent.StopAgent",
                                qmlsettings.java_path, qmlsettings.wsagent_jar).c_str()};
        qDebug() << stop_cmd;


        QStringList arguments;
        arguments << "-cp" <<
            qmlsettings.wsagent_jar.c_str() << "io.oz.anclient.ipcagent.StopAgent";

        const u8string java = resolveHomePath(qmlsettings.java_path);
        QString qjava = QString::fromUtf8(java.c_str());
        QProcess stopProc;
        stopProc.start(qjava, arguments);

        if (!wsAgentProc.waitForFinished(5000)) {
            qDebug() << "Java Agent did not exit gracefully. Forcing kill...";
            wsAgentProc.kill();
            wsAgentProc.waitForFinished();
        }

        qDebug() << "Java Agent stopped successfully.";
    }

    void TearDown() override {
    }
};

QMLTestSettings Ipclient::qmlsettings;
WSClient        Ipclient::wsclient{{"127.0.0.1:8700", wsprotocol}, onmsg};
QProcess        Ipclient::wsAgentProc;

TEST_F(Ipclient, PING_Proxy) {
    EchoReq echo{EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy) from Qt C++";
    AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

    // std::string receivedRawMsg;

    wsclient.asynSend(echomsg);

    // AnsonResp resp;
    // Anson::from_json(receivedRawMsg, resp);
    wsclient.block_poll();

    AnsonMsg<AnsonResp> resp = wsclient.pop();

    ASSERT_EQ(echo.echo, resp.Body().m);
    qDebug() << "✅ Ping response parsed successfully";
}
