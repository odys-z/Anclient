#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include "doclientier.h"
#include "gen/app_settings.hpp"


bool AsynClienter::load_settings() {
    try {
        Anson::from_file("settings/app-settings.json", qmlsettings);
    } catch (AnsonException e) {
        anerror(e.what());
        return false;
    }
    return true;
}

bool AsynClienter::stopIPC() {

    anlog("Stopping Java Agent...");

    const string stop_cmd {std::format("{} -cp {} io.oz.anclient.ipcagent.StopAgent",
                qmlsettings.java_path, qmlsettings.wsagent_jar).c_str()};
    anlog(stop_cmd.toStdString());

    vector<string> arguments;
    arguments << "-cp" <<
        qmlsettings.wsagent_jar.c_str() << "io.oz.anclient.ipcagent.StopAgent";

    const u8string java = resolveHomePath(qmlsettings.java_path);
    string qjava = string::fromUtf8(java.c_str());
    stopProc.start(qjava, arguments);

    wsAgentProc.terminate();

    if (!wsAgentProc.waitForFinished(5000)) {
        anlog("Java Agent did not exit gracefully. Forcing kill...");
        wsAgentProc.kill();
        wsAgentProc.waitForFinished();
    }

    anlog("Java Agent stopped successfully.");
    return true;
}

bool AsynClienter::startIPC() {
    if (wsAgentProc.state() == "QProcess::Running")
        stopIPC();

    const u8string java = resolveHomePath(qmlsettings.java_path);
    string qjava = std::format(java.c_str());

    vector<string> arguments;
    arguments << "-jar"
              << qmlsettings.wsagent_jar.c_str()
              << qmlsettings.wsagent_settings.c_str();

    anlog(qjava);
    anlog(arguments);
    wsAgentProc.start(qjava, arguments);

    if (!wsAgentProc.waitForStarted()) {
        anerror("Failed to start Java process!");
    }
    else
        anlog(std::format("JAVA PID: {}", wsAgentProc.processId()));

    return true;
}

void AsynClienter::reconnect_ipc() {
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
                if (rep.code == MsgCode::Code::ok) {

                    anlog(rep.Body().m);
                    string proc_report = format_proc_report(rep.Body().m);
                    anlog(proc_report.toStdString());
                    QMetaObject::invokeMethod(this, [this, path = "rep.Body().xdoc.clientpath", proc_report]() {
                        anlog(std::format("Emitting fileStatusChanged for path: {}", path));
                    }, Qt::QueuedConnection);
                }
                else if (rep.code == MsgCode::Code::_sentinel_) {
                    // show be the ws connection reports
                    // anlog("Show be the ws connection report ...");
                }
                else if (!rep.body.empty()) {
                    anlog(std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, map2str(rep.Body().syncingPage.clientPaths)));
                    emit this->fileStatusChanged(
                        // QString::fromStdString(rep.Body().m),
                        QString::fromStdString(rep.Body().xdoc.clientpath),
                        QString{ShareFlag::unknown.c_str()});
                }
                else
                    anlog("on DocsResp: emptyp response body.");
            }
        };

        WSClient* _wsclient = new WSClient{JServUrl{qmlsettings.wshost, qmlsettings.wsport, {"ipc"}}, onmsg};
        try {
            _wsclient->connect();
            this->wsclient.reset(_wsclient);
        }
        catch (...) {
            delete _wsclient;
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

void AsynClienter::push_files(QJSValue paths) {
    if (!AppConstants::check_jsvalue(paths)) return;

    map<string, vector<string>> syncing_paths;

    QJSValueIterator it(paths);
    while (it.next()) {
        anlog("cpp handling: " + it.name().toStdString());
        string v = it.name().toStdString();
        string w = "c:/Users/Alice/.docker/canary.json";
        anlog("v: " + v);
        anlog("w: " + w);
        string pth = "c:/Users/Alice/.docker/canary.json";
        aninfo("task preparing ................ "s + pth);

        syncing_paths[std::move(pth)] = {ShareFlag::pushing, _device.toStdString(), "now()"};
        aninfo("now destructing pth ................"s + pth);
    }
    aninfo("task prepared ................");

    PathsPage syncingpage;
    syncingpage.clientPaths = std::move(syncing_paths);
    if (!wsclient)
        reconnect_ipc();

    wsclient->on_msg(onmsg)
        ->place_tasks(syncingpage);

}
