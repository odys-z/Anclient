#include <gtest/gtest.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/gen/doctier.hpp>

#include <QtWebSockets/QtWebSockets>

#include "gen/test_settings.hpp"

anson::AstMap asts;
anson::JsonOpt opts{&asts};
anson::QMLTestSettings settings;

using namespace anson;

class Ipcproxy : public ::testing::Test {
protected:
    static QWebSocket socket;
    // static std::unique_ptr<QProcess> proc_agent;// = QProcess();
    static std::unique_ptr<QCoreApplication> app;

    // This runs automatically before EACH TEST_F
    void SetUp() override {
    }

    static void start_agent() {
        // proc_agent = std::make_unique<QProcess>();
        // QProcess& myProcess = *proc_agent.get();

        // QObject::connect(&myProcess, &QProcess::readyReadStandardOutput, [&]() {
        //     qDebug() << "Java Output:" << myProcess.readAllStandardOutput().trimmed();
        // });

        // QObject::connect(&myProcess, &QProcess::readyReadStandardError, [&]() {
        //     qDebug() << "Java Error:" << myProcess.readAllStandardError().trimmed();
        // });

        QObject::connect(&socket, &QWebSocket::connected, [&]() {
            qDebug() << "Connected to Jetty!";
            // socket.sendTextMessage("Hello from Qt C++");
            // ping(socket, hello);
        });

        QObject::connect(&socket, &QWebSocket::textMessageReceived, [](const QString &msg) {
            qDebug() << "[Qt Client] Server replied:";
            qDebug() << msg;

            AnsonResp resp;
            Anson::from_json(msg.toStdString(), resp);

            if (msg == "bye") {
                socket.close();
                QCoreApplication::quit();
            }
        });

        // QString jarPath = QString::fromStdString(settings.doctier_jar);
        // if (!jarPath.isEmpty()) {
        //     myProcess.start("java", QStringList() << "-jar" << jarPath);
        // }
    }

    // Runs once before the FIRST test in this file
    static void SetUpTestSuite() {
        register_jserv(asts, opts);
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);

        int argc = 0;
        char* argv[] = {nullptr};
        app = std::make_unique<QCoreApplication>(argc, argv);

        start_agent();

        // socket.open(QUrl("ws://localhost:8700"));

        // Give the socket a moment to establish connection
        QCoreApplication::processEvents();
    }

    static void TearDownTestSuite() {
        socket.close();

        // Kill the background java process
        // if (proc_agent && proc_agent->state() != QProcess::NotRunning) {
        //     proc_agent->terminate();
        //     if(!proc_agent->waitForFinished(2000)) {
        //         proc_agent->kill();
        //     }
        // }

        QCoreApplication::processEvents();
        app.reset();
    }

    void TearDown() override {
        QCoreApplication::processEvents(QEventLoop::AllEvents, 100);
    }

    template <typename R>
    static void sendReq(AnsonMsg<R>& req) {

        qDebug() << "[Qt Clinet Ping].body" << req.toBlock().c_str();

        // AnsonMsg<EchoReq> anmsg(Port(Port::echo), req);

        string reqs = req.toBlock();
        qDebug() << "[Qt Clinet Ping]" << reqs.c_str();
        socket.sendTextMessage(reqs.c_str());
    }
};

// std::unique_ptr<QProcess> Ipcproxy::proc_agent = nullptr;
std::unique_ptr<QCoreApplication> Ipcproxy::app = nullptr;
QWebSocket Ipcproxy::socket;

/**
 */
TEST_F(Ipcproxy, Config) {
    using namespace  anson;

    bool result = Anson::from_file("settings/test-settings.json", settings);
    ASSERT_TRUE(result);

    ASSERT_EQ("/sys/qmltest", settings.sysuri);
    ASSERT_EQ("/syn/qmltest", settings.synuri);
    ASSERT_TRUE(std::regex_search(settings.doctier_jar, std::regex{"doctier-[0-9.]+.jar"}));
    ;
    andebug(settings.synode_settings);

    anwarn("You started the IPC Agent and the Synode?");

    string wsjserv = std::format("ws://localhost:{}", settings.wsport);
    socket.open(QUrl(wsjserv.c_str()));
}

TEST_F(Ipcproxy, PING_Proxy) {
    EchoReq req {EchoReq::A::echo};
    req.echo = "TEST_F(Ipcproxy, PING_Proxy)... ";
    // qDebug() << "[Qt Clinet Ping].body" << req.toBlock().c_str();
    AnsonMsg<EchoReq> anmsg(Port(Port::echo), req);

    QEventLoop loop;
    bool receivedResponse = false;
    std::string receivedRawMsg = "";

    auto conn = QObject::connect(&Ipcproxy::socket, &QWebSocket::textMessageReceived, &loop,
            [&](const QString &msg) {
                receivedRawMsg = msg.toStdString();
                receivedResponse = true;
                loop.quit(); // Break out of loop.exec()
            });

    // 5-second failure safeguard
    QTimer::singleShot(5000, &loop, &QEventLoop::quit);

    Ipcproxy::sendReq(anmsg);

    // Block here until loop.quit() occurs
    loop.exec();

    // Disconnect loop handler to keep subsequent tests clean
    QObject::disconnect(conn);

    // Assertions
    ASSERT_TRUE(receivedResponse) << "WebSocket request timed out after 5 seconds.";

    AnsonResp resp;
    Anson::from_json(receivedRawMsg, resp);
    // Add your custom logic checks here:
    // EXPECT_EQ(resp.status(), "OK");
}

// TEST_F(Ipcproxy, PING_Synode) { }
