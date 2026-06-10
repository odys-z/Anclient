#include <gtest/gtest.h>
#include <QtWebSockets/QtWebSockets>
#include <QTimer>
#include <QCoreApplication>
#include <QEventLoop>
#include <memory>

class Ipcproxy : public ::testing::Test {
protected:
    static std::unique_ptr<QCoreApplication> app;
    static std::unique_ptr<QWebSocket> socket;
    static std::unique_ptr<QEventLoop> loop;

    static void SetUpTestSuite() {
        // 1. Initialize QCoreApplication FIRST before anything else touches memory
        static int qt_argc = 1;
        static char arg0[] = "ipcproxy_test";
        static char* qt_argv[] = {arg0, nullptr};
        app = std::make_unique<QCoreApplication>(qt_argc, qt_argv);

        // 2. Initialize the Qt network objects
        socket = std::make_unique<QWebSocket>();
        loop = std::make_unique<QEventLoop>();

        // 3. Connect basic connection logs
        QObject::connect(socket.get(), &QWebSocket::connected, []() {
            qDebug() << "========================================";
            qDebug() << "✅ SUCCESS: Connected to WebSocket server!";
            qDebug() << "========================================";
            if (loop) loop->quit(); // Break out of loop.exec() when connected
        });

        QObject::connect(socket.get(), &QWebSocket::disconnected, []() {
            qDebug() << "❌ Disconnected from WebSocket server.";
        });

        QObject::connect(socket.get(), &QWebSocket::errorOccurred, [](QAbstractSocket::SocketError error) {
            qDebug() << "❌ Socket Error occurred:" << error;
            if (loop) loop->quit();
        });
    }

    static void TearDownTestSuite() {
        if (socket) {
            socket->close();
        }
        QCoreApplication::processEvents();
        
        socket.reset();
        loop.reset();
        app.reset();
    }
};

// Define the static pointers
std::unique_ptr<QCoreApplication> Ipcproxy::app = nullptr;
std::unique_ptr<QEventLoop> Ipcproxy::loop = nullptr;
std::unique_ptr<QWebSocket> Ipcproxy::socket = nullptr;

TEST_F(Ipcproxy, PureConnectionTest) {
    // Hardcode the local loopback server address directly 
    // (Adjust "127.0.0.1" or "8700" if your Jetty server runs elsewhere)
    QUrl serverUrl("ws://127.0.0.1:8700/ipc");
    qDebug() << "Attempting connection to:" << serverUrl.toString();

    // Open the connection
    socket->open(serverUrl);

    // Setup an 8-second absolute timeout safeguard so the test doesn't hang forever
    QTimer::singleShot(8000, loop.get(), [&]() {
        qDebug() << "⏱️ Test timed out waiting for connection.";
        loop->quit();
    });

    // Block here synchronously, processing network events until loop->quit() is called
    loop->exec();

    // Final Assertions to report back to GoogleTest
    bool isConnected = (socket->state() == QAbstractSocket::ConnectedState);
    EXPECT_TRUE(isConnected) << "Failed to establish clean connection to: " << serverUrl.toString().toStdString();
}
