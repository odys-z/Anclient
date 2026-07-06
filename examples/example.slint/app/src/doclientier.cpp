#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include <io/odysz/utils.h>
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

bool AsynClienter::stop_ipcagent() {

    aninfo("Stopping IPC Agent...");
    agentController.stop_agent();

    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    aninfo("IPC Agent stopped.");
    return true;
}

bool AsynClienter::start_ipcagent() {
    const string java = resolveHomePath(appsettings.java_path);
    agentController = JavaAgentController(java, appsettings.wsagent_jar);
    if (!agentController.start_agent(appsettings.wsagent_settings)) {
        anerror("Failed to initialize IPC Java Agent process context.");
        throw AnsonException("Failed to initialize IPC Java Agent process context.");
    }

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    anlog(std::format("Synode Settings: {}", qmlsettings.synode_settings));
    return true;
}

void AsynClienter::reconnect_ipc() {
    if (!load_settings()) {
        anerror("Failed to load settings.");
        return;
    }
    if (!wsclient) {
        anlog("Re-connect IPC Agent...");
        onmsg = [this]() -> void {
            if (wsclient->block_poll(200) > 0) {
                AnsonMsg<DocsResp> rep = wsclient->pop_envelope<DocsResp>();
                if (rep.code == MsgCode::Code::ok) {

                    anlog(rep.Body().m);
                    string proc_report = format_proc_report(rep.Body().m);
                    anlog(proc_report);

                    slint::invoke_from_event_loop([this, proc_report]() {
                        if (auto handle = window_weak.lock()) {
                            (*handle)->set_syncing_status(proc_report.c_str());
                        }
                    });
                }
                else if (rep.code == MsgCode::Code::_sentinel_) {
                    // show be the ws connection reports
                    // anlog("Show be the ws connection report ...");
                }
                else if (!rep.body.empty()) {
                    string clientpath_state = map2str(rep.Body().syncingPage.clientPaths);
                    anlog(std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, clientpath_state));
                    slint::invoke_from_event_loop([this, clientpath_state]() {
                        if (auto handle = window_weak.lock()) {
                            (*handle)->set_syncing_status(clientpath_state.c_str());
                        }
                    });
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

void AsynClienter::push_files(const map<string, vector<LangExt::VarType>>& paths) {
    // if (!AppConstants::check_jsvalue(paths)) return;

    // map<string, vector<string>> syncing_paths;

    // iterator<map<string, vector<LangExt::VarType>>, string> it(paths);
    // while (it.next()) {
    //     anlog("cpp handling: "s + it.name().toStdString());
    //     string v = it.name().toStdString();
    //     string w = "c:/Users/Alice/.docker/canary.json";
    //     anlog("v: " + v);
    //     anlog("w: " + w);
    //     string pth = "c:/Users/Alice/.docker/canary.json";
    //     aninfo("task preparing ................ "s + pth);

    //     syncing_paths[std::move(pth)] = {ShareFlag::pushing, _device.toStdString(), "now()"};
    //     aninfo("now destructing pth ................"s + pth);
    // }
    // aninfo("task prepared ................");

    // PathsPage syncingpage;
    // syncingpage.clientPaths = std::move(syncing_paths);
    // if (!wsclient)
    //     reconnect_ipc();

    // wsclient->on_msg(onmsg)
    //     ->place_tasks(syncingpage);

}
