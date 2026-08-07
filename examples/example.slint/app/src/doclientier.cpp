#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include <io/odysz/utils.h>
#include <io/odysz/common.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/gen/anclient_settings.hpp>
#include "slingleton.h"
#include "doclientier.h"
#include "gen/app_settings.hpp"

namespace anson {

void AsynClienter::reconnect_ipc() {
    // if (!load_settings(settings_json)) {
    //     anerror("Failed to load settings.");
    //     return;
    // }
    if (!wsclient || wsclient->ipconn_state() == WSClient::Closed) {
        anlog("Re-connect IPC Agent...");
        // WSClient* _wsclient = new WSClient{JServUrl{appsettings.wshost, appsettings.wsport, {"ipc"}}, onmsg};
        JServUrl synjserv{appsettings.synode_jserv, JProtocol{"ipc", {}}};
        WSClient* _wsclient = new WSClient(synjserv, onmsg);
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
    reconnect_ipc();

    PathsPage syncingpage;
    syncingpage.device = appsettings.device;

    for (auto&[p, flgs] : syncing_paths) {
        syncingpage.clientPaths.emplace(Anson::posix_path(p), flgs);
    }
    syncingpage.start = 0;
    syncingpage.end = syncing_paths.size();

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

void AsynClienter::query_syncflags(const map<string, vector<LangExt::VarType>>& syncing_paths, OnOk ok) {
    if (syncing_paths.size() == 0)
        return;
    
    if (!client.jserv.valid()) {
        anerror("Invalid jserv URL: " + client.jserv.jserv());
        return;
    }
    
    std::thread query_thread([this, syncing_paths, ok]() {
        if (LangExt::isblank(client.ssInf.ssid) || !client.heartbeating) {
            anlog("Login to "s + appsettings.synode_jserv);
            login_synode(this->appsettings.admin, this->appsettings.domain_token, this->appsettings.device);
            client.openLink(sysuri);
        }

        if (LangExt::isblank(client.ssInf.ssid) || !client.heartbeating) {
            return;
        }
        if (!client.heartbeating) {
            client.openLink(sysuri);
            return;
        }
        
		client.header.Act(synuri, Port::docstier, DocsReq::A::selectSyncs, "query sync");

		DocsReq req;
        req.syncingPage = PathsPage{Slingleton::appsettings.device, 0, static_cast<int>(syncing_paths.size())};
        req.syncingPage.clientPaths = syncing_paths;
        req.docTabl = Doclientier::doctbl;
        req.device = Device{Slingleton::appsettings.device, Slingleton::appsettings.device, Slingleton::appsettings.device};
        req.a = DocsReq::A::selectSyncs;
        req.limit = -1;
        req.pageInf.size = -1;

        anlog("=========================\n"s + client.ssInf.toBlock());

		AnsonMsg<DocsReq> q = client.userReq(synuri, Port{Port::docstier}, req)
				                    .Header(client.ssInf);
        anlog("=========================\n"s + q.toBlock());

        try {
            DocsResp resp = client.commit<DocsResp>(q, err);
            ok(resp);
        } 
        catch (const SemanticException& e) {
            anerror(e.what());
        } 
        catch (const AnsonException& e) {
            anerror(e.what());
        } 
        catch (const std::exception& e) {
            anerror(e.what());
        } 
        catch (...) {
            anerror("Caught unknown exception.");
        }
    });
    query_thread.detach();
}
}