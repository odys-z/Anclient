#include <gtest/gtest.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/gen/doctier.hpp>

#include <QtWebSockets/QtWebSockets>
#include <QTimer>
#include <QThread>  // Added for thread checks

#include "gen/test_settings.hpp"

anson::AstMap asts;
anson::JsonOpt opts{&asts};
anson::QMLTestSettings settings;

using namespace anson;

class Ipcproxy : public ::testing::Test {
protected:
    static std::unique_ptr<QCoreApplication> app;
    static std::unique_ptr<QWebSocket> socket;
    static std::unique_ptr<QEventLoop> loop;

    void SetUp() override {
        QCoreApplication::processEvents();  // Ensure clean state
    }

    static void start_agent() {
        // Connection for connected signal
        QObject::connect(socket.get(), &QWebSocket::connected, []() {
            qDebug() << "✅ Connected to Jetty WebSocket!";
        });

        // Main message handler - keep one persistent handler
        static QMetaObject::Connection msgConn;  // Static to manage lifetime
        if (msgConn) QObject::disconnect(msgConn);

        msgConn = QObject::connect(socket.get(), &QWebSocket::textMessageReceived,
            [](const QString &msg) {
                qDebug() << "[Qt Client] Server replied:" << msg;

                if (msg == "bye") {
                    if (socket) socket->close();
                    if (loop) loop->quit();
                    return;
                }

                if (LangExt::isenvelope(msg.toStdString())) {
                    try {
                        AnsonMsg<AnsonResp> resp;
                        Anson::from_json(msg.toStdString(), resp);
                        qDebug() << "✅ Parsed Anson envelope";
                    } catch (const std::exception& e) {
                        qWarning() << "JSON parse error:" << e.what();
                    }
                } else {
                   qDebug() << "Message is not an envelope.";
               }
            });
    }

    static void SetUpTestSuite() {
        static int argc = 1;
        static char arg0[] = "ipcproxy_test";
        static char* argv[] = {arg0, nullptr};
        app = std::make_unique<QCoreApplication>(argc, argv);

        socket = std::make_unique<QWebSocket>();
        loop = std::make_unique<QEventLoop>();

        // Ensure everything runs on the same thread
        Q_ASSERT(QThread::currentThread() == app->thread());

        start_agent();
        QCoreApplication::processEvents();

        register_jserv(asts, opts);
        register_doctier(asts, "ast");
        register_qmltestsettingsAst(asts);
    }

    static void TearDownTestSuite() {
        if (socket) socket->close();
        QCoreApplication::processEvents();
        socket.reset();
        loop.reset();
        app.reset();
    }

    void TearDown() override {
        if (socket) socket->close();
        QCoreApplication::processEvents(QEventLoop::AllEvents, 200);
    }

    template <typename R>
    static void sendReq(AnsonMsg<R>& req) {
        qDebug() << "[sent-req] body:" << req.Body().toBlock().c_str();
        qDebug() << "[sent-req] port/url:" << req.port.url();
        socket->sendTextMessage(QString::fromStdString(req.toBlock()));
    }
};

std::unique_ptr<QCoreApplication> Ipcproxy::app = nullptr;
std::unique_ptr<QEventLoop> Ipcproxy::loop = nullptr;
std::unique_ptr<QWebSocket> Ipcproxy::socket = nullptr;

TEST_F(Ipcproxy, Config) {
    bool result = Anson::from_file("settings/test-settings.json", settings);
    ASSERT_TRUE(result) << "Failed to load test-settings.json";

    ASSERT_EQ("/sys/qmltest", settings.sysuri);
    ASSERT_EQ("/syn/qmltest", settings.synuri);
    ASSERT_TRUE(std::regex_search(settings.doctier_jar, std::regex{"doctier-[0-9.]+.jar"}));

    andebug(settings.synode_settings);
    anwarn("Ensure IPC Agent + Synode (Jetty) are running!");

    string wsjserv = std::format("ws://{}:{}/ipc", settings.wshost, settings.wsport);
    qDebug() << "Opening WS:" << wsjserv.c_str();
    socket->open(QUrl(QString::fromStdString(wsjserv)));

    // Wait for connection
    QTimer timer;
    timer.setSingleShot(true);
    QEventLoop connectLoop;
    QObject::connect(socket.get(), &QWebSocket::connected, &connectLoop, &QEventLoop::quit);
    QObject::connect(&timer, &QTimer::timeout, &connectLoop, &QEventLoop::quit);
    timer.start(5000);
    connectLoop.exec();

    ASSERT_TRUE(socket->isValid() || socket->state() == QAbstractSocket::ConnectedState)
        << "Failed to connect to WebSocket server";
}

TEST_F(Ipcproxy, PING_Proxy) {
    EchoReq echo{EchoReq::A::echo};
    echo.echo = "TEST_F(Ipcproxy, PING_Proxy) from Qt C++";
    AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

    bool receivedResponse = false;
    std::string receivedRawMsg;

    // Temporary scoped connection for this test
    auto conn = QObject::connect(socket.get(), &QWebSocket::textMessageReceived,
        [&](const QString &msg) {
            receivedRawMsg = msg.toStdString();
            qDebug() << "Ping response raw:" << msg;

            if (LangExt::isenvelope(receivedRawMsg)) {
                receivedResponse = true;
                loop->quit();
            }
    });

    sendReq(echomsg);

    // Timeout safeguard
    QTimer::singleShot(8000, loop.get(), &QEventLoop::quit);

    loop->exec();
    QObject::disconnect(conn);

    ASSERT_TRUE(receivedResponse) << "No response received from proxy (timeout or connection issue)";

    if (receivedResponse) {
        try {
            AnsonResp resp;
            Anson::from_json(receivedRawMsg, resp);
            // TODO: Add EXPECT_EQ checks on resp.status() etc.
            qDebug() << "✅ Ping response parsed successfully";
        } catch (...) {
            ADD_FAILURE() << "Failed to parse response JSON";
        }
    }
}
