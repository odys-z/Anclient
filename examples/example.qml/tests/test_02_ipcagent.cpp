#include <gtest/gtest.h>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include "jsample.h"

#include <QString>
#include <QDebug>
#include <QProcess>
#include <QtWebSockets/QtWebSockets>

// #include <io/odysz/anson.h>
using namespace anson;

void start_agent(QProcess& myProcess, anson::TestSettings& settings) {
    string path2prj = ".";
    filesystem::path agent_jar = settings.agentJar(path2prj);
    filesystem::path agent_json = settings.agentJson(path2prj);

    qDebug() << "=== start_agent({" << agent_json.c_str() << agent_jar.c_str() << "===";

    // QProcess myProcess = QProcess();
    const QString program = "java";
    QStringList arguments;
    arguments << "-jar";

    // Gemini: On windows, QStringList (and QString) internally stores everything as UTF-16.
    arguments << QString::fromUtf8(agent_jar.u8string().c_str());
    arguments << QString::fromUtf8(agent_json.u8string().c_str());

    QString cmd = "java";
    for (const QString& value : std::as_const(arguments)) {
        cmd += " " + value;
    }
    qDebug() << cmd;

    QObject::connect(&myProcess, &QProcess::readyReadStandardOutput, [&]() {
        qDebug() << "Java Output:" << myProcess.readAllStandardOutput().trimmed();
    });

    // Also helpful to catch errors
    QObject::connect(&myProcess, &QProcess::readyReadStandardError, [&]() {
        qDebug() << "Java Error:" << myProcess.readAllStandardError().trimmed();
    });

    myProcess.start(program, arguments);

    if (!myProcess.waitForStarted()) {
        qDebug() << "Failed to start Java process!";
    }
    else
        qDebug() << "JAVA PID:" << myProcess.processId();
}

void close_agent(QProcess& myProcess, anson::TestSettings& settings) {

}

#include <io/oz/anclient/socketier.h>

void ping(QWebSocket& skt, const string& msg) {
    WSEchoReq req {WSEchoReq::A::echo};
    req.echo = msg;

    qDebug() << "[Qt Clinet Ping].body" << req.toBlock().c_str();

    AnsonMsg<WSEchoReq> anmsg(Port(Port::echo), req);
    // anmsg.body.push_back(req);
    string reqs = anmsg.toBlock<AnsonMsg<WSEchoReq>>();
    qDebug() << "[Qt Clinet Ping]" << reqs.c_str();
    skt.sendTextMessage(reqs.c_str());
}


void send_msg(char* argv[], TestSettings* settings) {
    QWebSocket socket;
    string hello = "";

    QObject::connect(&socket, &QWebSocket::connected, [&]() {
        qDebug() << "Connected to Jetty!";
        // socket.sendTextMessage("Hello from Qt C++");
        ping(socket, hello);
    });


    QObject::connect(&socket, &QWebSocket::textMessageReceived, [&socket](const QString &msg) {
        qDebug() << "[Qt Client] Server replied:";
        qDebug() << msg;

        AnsonResp resp;
        Anson::from_json(resp, msg.toStdString());

        if (msg == "bye") {
            socket.close();
            QCoreApplication::quit();
        }
    });

    QObject::connect(&socket, &QWebSocket::binaryMessageReceived, &a, [](const QByteArray &message) {
        qDebug() << "[Qt Client] Full stream received. Total size:" << message.size();
    });

    // Match the Java servlet path /ws/
    // socket.open(QUrl("ws://localhost:8080/ws/"));
    QString wsurl = QString::fromStdString(settings->wsUri());
    qDebug() << wsurl;
    socket.open(QUrl(wsurl));

    this_thread::sleep_for(chrono::seconds(10));

    // socket.sendTextMessage(argv[3]);
    // socket.sendTextMessage(argv[4]);
    ping(socket, argv[3]);
    ping(socket, argv[4]);
}

TEST(IPCAGENT, MANAGE) {
    using namespace anson;

    int sport =0;
    ASSERT_EQ(8080, sport);

    QProcess proc_agent = QProcess();
    TestSettings settings;
    TestSettings::load(settings, "");

    start_agent(proc_agent, settings);

    qDebug() << "Stopping Java Process ...";
    this_thread::sleep_for(chrono::seconds(3));

    close_agent(proc_agent, settings);
}
