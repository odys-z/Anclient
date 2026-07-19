#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include <io/odysz/utils.h>
#include "slingleton.h"
#include "doclientier.h"
#include "gen/app_settings.hpp"

bool AsynClienter::load_settings(const string& settings_json) {
    try {
        this->settings_json = settings_json;
        Anson::from_file(settings_json, appsettings);
    } catch (AnsonException e) {
        anerror(e.what());
        return false;
    }
    return true;
}

void AsynClienter::reconnect_ipc() {
    if (!load_settings(settings_json)) {
        anerror("Failed to load settings.");
        return;
    }
    if (!wsclient || wsclient->ipconn_state() == WSClient::Closed) {
        anlog("Re-connect IPC Agent...");
        // onmsg = [this]() -> void {
        //     if (wsclient->block_poll(200)) {
        //         AnsonMsg<DocsResp> rep = wsclient->pop_envelope<DocsResp>();
        //         if (rep.code == MsgCode::Code::ok) {

        //             anlog(rep.Body().m);
        //             string proc_report = format_proc_report(rep.Body());
        //             anlog(proc_report);

        //             slint::SharedString slint_text(proc_report);
        //             slint::invoke_from_event_loop([this, slint_text]() {
        //                 if (auto handle = window_weak.lock()) {
        //                     anlog("[onmsg] Updating statues report: "s + string{slint_text});
        //                     (*handle)->set_syncing_status(slint_text);
        //                 }
        //             });
        //         }
        //         else if (rep.code == MsgCode::Code::_sentinel_) {
        //             // show be the ws connection reports
        //             // anlog("Show be the ws connection report ...");
        //         }
        //         else if (!rep.body.empty()) {
        //             string clientpath_state = map2str(rep.Body().syncingPage.clientPaths);
        //             string status_txt = std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, clientpath_state);
        //             anlog(status_txt);

        //             // ISSUE slint ui helper: can update ui with a static helper
        //             slint::SharedString slint_text(status_txt);
        //             slint::invoke_from_event_loop([this, slint_text]() {
        //                 if (auto handle = window_weak.lock()) {
        //                     anlog("[onmsg] Updating statues report: "s + string{slint_text});
        //                     (*handle)->set_syncing_status(slint_text);
        //                 }
        //             });
        //         }
        //         else
        //             anlog("on DocsResp: empty response body.");
        //     }
        // };

        WSClient* _wsclient = new WSClient{JServUrl{appsettings.wshost, appsettings.wsport, {"ipc"}}, onmsg};
        try {
            _wsclient->connect();
            this->wsclient.reset(_wsclient);
        }
        catch (...) {
            delete _wsclient;
        throw;
        }
    }

    int timeout_attempts = 20; // 20 * 100ms = 2 seconds max wait
    while (wsclient && timeout_attempts > 0) {
        string state = wsclient.get()->ipconn_state();
        if (state == WSClient::Open) {
            break;
        }
        std::this_thread::sleep_for(100ms);
        timeout_attempts--;
    }

    if (wsclient && wsclient.get()->ipconn_state() == WSClient::Open) {
        anlog("IPC Agent connection is opened successfully.");
        return;
    } else {
        anerror("IPC Agent failed to open connection within timeout.");
    }
}

void AsynClienter::push_files(const map<string, vector<LangExt::VarType>>& syncing_paths, const WSPort& port) {
    PathsPage syncingpage;
    syncingpage.clientPaths = syncing_paths;
    syncingpage.start = 0;
    syncingpage.end = syncing_paths.size();

    reconnect_ipc();
    wsclient->place_tasks(syncingpage, port);
}

void AsynClienter::asy_echows(const string & echo_msg) {
    std::thread bg_thread([this, echo_msg]() {
        reconnect_ipc();
        std::this_thread::sleep_for(500ms);

        EchoReq echo{EchoReq::A::echo};
        echo.echo = echo_msg;
        AnsonMsg<EchoReq> echomsg(Port(Port::echo), echo);

        wsclient->asynSend(echomsg);
    });

    bg_thread.detach();
}
