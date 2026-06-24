#include <QJSValue>
#include "qdoclientier.h"
#include "gen/app_settings.hpp"

bool AppConstants::check_jsvalue(QJSValue v) {
    if (v.isUndefined()) {
        qDebug() << "CPP: paths is Undefined";
        return false;
    }
    if (v.isNull()) {
        qDebug() << "CPP: paths is Null";
        return false;
    }
    if (!v.isObject()) {
        // This will tell you if it's a string, number, etc.
        qDebug() << "CPP: paths is not an object. It is a:" << v.toString();
        return false;
    }
    return true;
}

bool QDoclientier::load_settings() {
    Anson::from_file("settings/app-settings.json", qmlsettings);
    return true;
}

bool QDoclientier::stopIPC() {
    if (wsAgentProc.state() == QProcess::NotRunning) {
        return false;
    }

    anlog("Stopping Java Agent...");

    const QString stop_cmd {std::format("{} -cp {} io.oz.anclient.ipcagent.StopAgent",
                qmlsettings.java_path, qmlsettings.wsagent_jar).c_str()};
    anlog(stop_cmd.toStdString());

    QStringList arguments;
    arguments << "-cp" <<
        qmlsettings.wsagent_jar.c_str() << "io.oz.anclient.ipcagent.StopAgent";

    const u8string java = resolveHomePath(qmlsettings.java_path);
    QString qjava = QString::fromUtf8(java.c_str());
    QProcess stopProc;
    stopProc.start(qjava, arguments);

    wsAgentProc.terminate();

    if (!wsAgentProc.waitForFinished(5000)) {
        qDebug() << "Java Agent did not exit gracefully. Forcing kill...";
        wsAgentProc.kill();
        wsAgentProc.waitForFinished();
    }

    qDebug() << "Java Agent stopped successfully.";
    return true;
}

bool QDoclientier::startIPC() {
    if (wsAgentProc.state() == QProcess::Running)
        stopIPC();

    const u8string java = resolveHomePath(qmlsettings.java_path);
    QString qjava = QString::fromUtf8(java.c_str());

    QStringList arguments;
    arguments << "-jar"
              << qmlsettings.wsagent_jar.c_str()
              << qmlsettings.wsagent_settings.c_str();

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

    // string wsjserv = std::format("ws://{}:{}/ipc", qmlsettings.wshost, qmlsettings.wsport);
    // qDebug() << "Opening WS:" << wsjserv.c_str();
    // wsclient.connect();
    // anlog(qmlsettings.synode_settings);
    return true;
}
