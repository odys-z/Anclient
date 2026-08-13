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
    if (!wsclient || wsclient->ipconn_state() == WSClient::Closed) {
        anlog("Re-connect IPC Agent...");
        JServUrl wsjserv{std::format("ws://{}:{}", appsettings.wshost, appsettings.wsport), JProtocol{"ipc", &Slingleton::opts}};
        WSClient* _wsclient = new WSClient(wsjserv, appsettings, onmsg);
        try {
            _wsclient->connect();
            this->wsclient.reset(_wsclient);
        }
        catch (...) {
            delete _wsclient;
        throw;
        }
    }

    int timeout_attempts = 60; // 60 * 1000ms = 60 seconds max wait
    while (wsclient && timeout_attempts > 0) {
        string state = wsclient.get()->ipconn_state();
        if (state == WSClient::Open) {
            break;
        }
        std::this_thread::sleep_for(1000ms);
        timeout_attempts--;
    }

    if (wsclient && wsclient.get()->ipconn_state() == WSClient::Open) {
        anlog("IPC Agent connection is opened successfully.");
        return;
    } else {
        anerror("IPC Agent failed to open connection within timeout.");
    }
}

void AsynClienter::push_files(const map<string, vector<LangExt::VarType>>& syncing_paths, const Port& port) {
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
        AnsonMsg<EchoReq> echomsg(Port(client.jserv.jprotocol.ctx, Port::echo), echo);

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
            client.openLink(appsettings.sysuri);
        }

        if (LangExt::isblank(client.ssInf.ssid) || !client.heartbeating) {
            return;
        }
        if (!client.heartbeating) {
            client.openLink(appsettings.sysuri);
            return;
        }
        
        client.header.Act(appsettings.synuri, Port::docstier, DocsReq::A::selectSyncs, "query sync");

		DocsReq req;
        DesktopSettings& s = Slingleton::appsettings;
        req.syncingPage = PathsPage{s.device, 0, static_cast<int>(syncing_paths.size())};
        req.syncingPage.clientPaths = syncing_paths;
        req.docTabl = Doclientier::doctbl;
        req.device = Device{s.device, s.device, s.device};
        req.a = DocsReq::A::selectSyncs;
        req.synuri = s.synuri;
        req.limit = -1;
        req.pageInf.size = -1;

        anlog("=========================\n"s + client.ssInf.toBlock(*client.jserv.jprotocol.ctx));

        AnsonMsg<DocsReq> q = client.userReq(s.synuri, Port{client.jserv.jprotocol.ctx, Port::docstier}, req)
				                    .Header(client.ssInf);
        anlog("=========================\n"s + q.toBlock(*client.jserv.jprotocol.ctx));

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
