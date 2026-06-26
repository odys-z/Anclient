#include <QJSValue>
#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
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
    try {
        Anson::from_file("settings/app-settings.json", qmlsettings);
    } catch (AnsonException e) {
        anerror(e.what());
        return false;
    }
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

  //QObject::connect(&wsAgentProc, &QProcess::readyReadStandardOutput, [&]() {
    QObject::connect(&wsAgentProc, &QProcess::readyReadStandardOutput, this, [this]() {
        qDebug() << "Java Output:" << wsAgentProc.readAllStandardOutput().trimmed();
    });

    // Also helpful to catch errors
  //QObject::connect(&wsAgentProc, &QProcess::readyReadStandardError, [&]() {
    QObject::connect(&wsAgentProc, &QProcess::readyReadStandardError, this, [this]() {
        qDebug() << "Java Error:" << wsAgentProc.readAllStandardError().trimmed();
    });

    qDebug() << qjava << arguments;
    wsAgentProc.start(qjava, arguments);

    if (!wsAgentProc.waitForStarted()) {
        qDebug() << "Failed to start Java process!";
    }
    else
        qDebug() << "JAVA PID:" << wsAgentProc.processId();

    return true;
}

Q_INVOKABLE void QDoclientier::reconnect_ipc() {
    if (!load_settings()) {
        anerror("Failed to load settings.");
        return;
    }
    if (!wsclient) {
        if (wsAgentProc.state() != QProcess::Running) {
            startIPC();
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        }

        // connect
        anlog("Re-connect IPC Agent...");
        onmsg = [this]() -> void {
            if (wsclient->block_poll(200) > 0) {
                AnsonMsg<DocsResp> rep = wsclient->pop_envelope<DocsResp>();
                if (rep.code == MsgCode::Code::ok)
                    for (const auto& kv : rep.Body().syncingPage.clientPaths) {
                    optional<string> s = LangExt::var_str(kv.second[0]);
                    emit this->fileStatusChanged(QString::fromStdString(kv.first),
                     QString::fromStdString(s ? s.value() : ""));
                }

                else if (rep.code == MsgCode::Code::_sentinel_) {
                    // show be the ws connection reports
                    // anlog("Show be the ws connection report ...");
                }
                else if (!rep.body.empty()) {
                    anlog(std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, map2str(rep.Body().syncingPage.clientPaths)));
                    emit this->fileStatusChanged(
                        QString::fromStdString(rep.Body().m),
                        QString::fromStdString(map2str(rep.Body().syncingPage.clientPaths)));
                }
                else
                    anlog("on DocsResp: emptyp response body.");
            }
        };

        WSClient* wsclient = new WSClient{JServUrl{qmlsettings.wshost, qmlsettings.wsport, {"ipc"}}, onmsg};
        try {
            wsclient->connect();
            this->wsclient.reset(wsclient);
        }
        catch (...) {
            delete wsclient;
        throw;
        }
    }

    while (wsclient && wsclient->ipconn_state() == WSClient::Connecting
        || wsclient && wsclient->ipconn_state() == WSClient::Closing)
        std::this_thread::sleep_for(250ms);

    if (wsclient && wsclient->ipconn_state() == WSClient::Open) {
        anlog("IPC Agent connection is opened.");
        return;
    }
    if (wsclient && wsclient->ipconn_state() == WSClient::Closed) {
        wsclient->connect();
    }
}

Q_INVOKABLE void QDoclientier::push_files(QJSValue paths) {
    if (!AppConstants::check_jsvalue(paths)) return;

    QJSValueIterator it(paths);
    while (it.next()) {
        qDebug() << "cpp handling: " << it.name();
        // Debug Notes: This is makes SHE
        // this->syncing_paths[it.name().toStdString()] = {ShareFlag::pushing, _device.toStdString(), "now()"};

        std::string stdPath = it.name().toUtf8().constData();
        std::string stdDevice = _device.toUtf8().constData();
        LangExt::VarType flag = ShareFlag::pushing;
        LangExt::VarType dev = stdDevice;
        LangExt::VarType time = "now()";

        std::vector<LangExt::VarType> row = {flag, dev, time};
        this->syncing_paths[stdPath] = row;
    }

    PathsPage syncingpage;
    syncingpage.clientPaths = syncing_paths;
    if (!wsclient)
        reconnect_ipc();

    wsclient->on_msg(onmsg)
        ->place_tasks(syncingpage);
}



