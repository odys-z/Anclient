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
