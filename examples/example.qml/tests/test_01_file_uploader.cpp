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
    static std::unique_ptr<QWebSocket> socket; // Changed to pointer
    static std::unique_ptr<QCoreApplication> app;
    static std::unique_ptr<QEventLoop> loop; // Make pointer for consistency

    // Before EACH TEST_F
    void SetUp() override {
        if (app) {
            // clean other tests
            QCoreApplication::processEvents();
        }
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

        QObject::connect(socket.get(), &QWebSocket::connected, [&]() {
            qDebug() << "Connected to Jetty!";
            // socket.sendTextMessage("Hello from Qt C++");
            // ping(socket, hello);
        });

        QObject::connect(socket.get(), &QWebSocket::textMessageReceived, [](const QString &msg) {
            qDebug() << "[Qt Client] Server replied:";
            qDebug() << msg;


            // QRegularExpression enveloprefix(R"(^\{\"type\":)");

            if (msg == "bye") {
                socket->close();
                // QCoreApplication::quit();
                loop->quit();
            }
            // else if (msg.contains(enveloprefix)) {
            else if (LangExt::isenvelope(msg.toStdString())) {
                AnsonMsg<AnsonResp> resp;
                Anson::from_json(msg.toStdString(), resp);
                // msgHandler(resp);
            }
            else {
                qDebug() << "Message is not an envelope.";
            }
        });

        // QString jarPath = QString::fromStdString(settings.doctier_jar);
        // if (!jarPath.isEmpty()) {
        //     myProcess.start("java", QStringList() << "-jar" << jarPath);
        // }

        QTimer::singleShot(1000 * 8, loop.get(), &QEventLoop::quit);
    }

    // Runs once before the FIRST test in this file
    static void SetUpTestSuite() {
        register_jserv(asts, opts);
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);

        int argc = 0;
        static char arg0[] = "album_tests.t01";
        char* argv[] = {arg0, nullptr};
        app = std::make_unique<QCoreApplication>(argc, argv);
        socket = std::make_unique<QWebSocket>();
        loop = std::make_unique<QEventLoop>();

        start_agent();
        QCoreApplication::processEvents();
    }

    static void TearDownTestSuite() {
        socket.get()->close();

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
        if (socket) {
            socket.get()->close();
        }
        QCoreApplication::processEvents(QEventLoop::AllEvents, 100);
    }

    template <typename R>
    static void sendReq(AnsonMsg<R>& req) {
        qDebug() << "[sent-req].body" << req.Body().toBlock().c_str();
        qDebug() << "[sent-req].port url" << req.port.url();

        string reqs = req.toBlock();
        socket.get()->sendTextMessage(reqs.c_str());
    }
};
std::unique_ptr<QCoreApplication> Ipcproxy::app = nullptr;
std::unique_ptr<QEventLoop> Ipcproxy::loop;
std::unique_ptr<QWebSocket> Ipcproxy::socket;

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

    string wsjserv = std::format("ws://{}:{}/ipc", settings.wshost, settings.wsport);
    anlog(wsjserv);
    socket.get()->open(QUrl(wsjserv.c_str()));
}

TEST_F(Ipcproxy, PING_Proxy) {
    EchoReq echo {EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy)... ";
    // qDebug() << "[Qt Clinet Ping].body" << req.toBlock().c_str();
    AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

    bool receivedResponse = false;
    std::string receivedRawMsg = "";

    auto conn = QObject::connect(socket.get(), &QWebSocket::textMessageReceived, loop.get(),
            [&](const QString &msg) {
                receivedRawMsg = msg.toStdString();
                qDebug() << msg;
                qDebug() << "is envelope: " << LangExt::isenvelope(receivedRawMsg);

                if (LangExt::isenvelope(receivedRawMsg)) {
                    receivedResponse = true;
                    qDebug() << "Quiting ...";
                    loop->quit(); // Break out of loop.exec()
                }
            });

    // 5-second failure safeguard
    // QTimer::singleShot(1000 * 8, &loop, &QEventLoop::quit);

    Ipcproxy::sendReq(echomsg);

    // Block here until loop.quit() occurs
    loop->exec();

    // Disconnect loop handler to keep subsequent tests clean
    QObject::disconnect(conn);

    // Assertions
    ASSERT_TRUE(receivedResponse) << "WebSocket request timed out after ... seconds.";

    if (receivedResponse) {
        AnsonResp resp;
        Anson::from_json(receivedRawMsg, resp);
    }
    // Add your custom logic checks here:
    // EXPECT_EQ(resp.status(), "OK");
}

// TEST_F(Ipcproxy, PING_Synode) { }
