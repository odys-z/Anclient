#include <QCoreApplication>
#include <QProcess>
#include <QDebug>
#include <QDir>
#include <QTimer>
#include <QtWebSockets/QWebSocket>
#include <thread>

#include <glaze/glaze.hpp>
#include "io/odysz/anson.hpp"
#include "io/oz/anclient/ipcagent.hpp"

#define NL "\n"

using namespace std;

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);
    QTimer::singleShot(5000, &a, &QCoreApplication::quit);

    qDebug() << "IPC Client:\n" ;

    for (auto arg : span(argv, argc))
        qDebug() << arg; // << NL ;

    // ... inside a function or slot
    qDebug() << "Desktop-cli current directory:" << QDir::currentPath();

    auto ptr = Anson::fromPath<TestSettings>(argv[2]);
    TestSettings* settings = ptr.get();

    string path2prj = "../../../../../../";
    filesystem::path agent_jar = settings->agentJar(path2prj);
    filesystem::path agent_json = settings->agentJson(path2prj);
    qDebug() << "test setting type" << settings->type.c_str();
    qDebug() << "agent jar" << agent_jar.c_str();
    qDebug() << "agent settings" << agent_json.c_str();
    qDebug() << "port" << settings->ipc_port;
    qDebug() << "session token" << settings->ipc_session.ssid.c_str();


    if (string_view(argv[1]) != "junit-desktop") {
        qDebug() << "== Stand Alone Desktop" << argv[1] << "===";

        QProcess myProcess = QProcess();
        const QString program = "java";
        QStringList arguments;
        arguments << "-jar";
        // arguments << "ipc-agent.jar"; // Replace with the actual path to your JAR file
        arguments << agent_jar.c_str();
        arguments << agent_json.c_str();

        QString cmd = "java";
        for (const QString& value : std::as_const(arguments)) {
            cmd += " " + value;
        }
        qDebug() << cmd;

        // Connect signals to slots for monitoring the process (optional but recommended)
        // connect(myProcess, SIGNAL(started()), this, SLOT(processStarted()));
        // connect(myProcess, SIGNAL(finished(int, QProcess::ExitStatus)), this, SLOT(processExited(int,QProcess::ExitStatus)));
        // connect(myProcess, SIGNAL(readyReadStandardOutput()), this, SLOT(processReadyRead()));
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

        qDebug() << "Stopping Java Process ...";
        this_thread::sleep_for(chrono::seconds(3));
    }
    else qDebug() << "desktop-cli in junit-desktop mode...";


    // Set up code that uses the Qt event loop here.
    // Call a.quit() or a.exit() to quit the application.
    // A not very useful example would be including
    // #include <QTimer>
    // near the top of the file and calling
    // QTimer::singleShot(5000, &a, &QCoreApplication::quit);
    // which quits the application after 5 seconds.

    // If you do not need a running Qt event loop, remove the call
    // to a.exec() or use the Non-Qt Plain C++ Application template.

    QWebSocket socket;
    QObject::connect(&socket, &QWebSocket::connected, [&]() {
        qDebug() << "Connected to Jetty!";
        socket.sendTextMessage("Hello from Qt C++");
    });

    QObject::connect(&socket, &QWebSocket::textMessageReceived, [&socket](const QString &msg) {
        qDebug() << "Server replied:" << msg;

        if (msg == "bye") {
            socket.close();
            QCoreApplication::quit();
        }
    });

    // Match the Java servlet path /ws/
    // socket.open(QUrl("ws://localhost:8080/ws/"));
    QString wsurl = QString::fromStdString(settings->wsUri());
    qDebug() << wsurl;
    socket.open(QUrl(wsurl));
    socket.sendTextMessage(argv[3]);
    socket.sendTextMessage(argv[4]);

    return a.exec();
}
