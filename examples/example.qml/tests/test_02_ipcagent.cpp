#include <gtest/gtest.h>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include "jsample.h"

#include <QString>
#include <QDebug>
#include <QProcess>

// #include <io/odysz/anson.h>


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

}
