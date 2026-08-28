#pragma once

#include <io/odysz/clients.h>
#include <io/odysz/common.h>
#include <io/odysz/jprotocol.h>

#include <io/odysz/jprotocol.h>
#include <io/odysz/jclient/syn.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/semantic/tier/docs.h>
#include <gen/app_settings.hpp>

#include "app-window.h"
#include "wsclients.h"

namespace anson {

class AsynClienter : public Doclientier {
protected:
    DesktopSettings& appsettings;

    OnMsg onmsg = [this]() -> void {
        if (!wsclient->block_poll(200)) return;

        AnsonMsg<DocsResp> rep = wsclient->pop_envelope<DocsResp>();
        if (rep.body.empty()) {
            anlog("on DocsResp: empty response body.");
            return;
        }

        if (rep.code == MsgCode::Code::ok) {
            anlog(rep.Body().m);
            string proc_report = format_proc_report(rep.Body());
            anlog(proc_report);
            inv_insert_status(window_weak, proc_report);
        }
        else if (rep.code == MsgCode::Code::_sentinel_) {
            // show be the ws connection reports
            // anlog("Show be the ws connection report ...");
        }
        else { //if (!rep.body.empty()) {
            string clientpath_state = map2str(rep.Body().syncingPage.clientPaths, *client.jserv.jprotocol.ctx);
            string status_txt = std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, clientpath_state);
            anlog(status_txt);
            inv_insert_status(window_weak, status_txt);
        }

        // ui_query_synchings();
        slint::invoke_from_event_loop([this]() {
            if (auto handle = window_weak.lock()) {
                anlog("querying page ...");
                (*handle)->invoke_query_syncflags();
            }
        });
    };

    slint::ComponentWeakHandle<App> window_weak;

public:
    std::unique_ptr<WSClient> wsclient;

    inline static OnError onErr = [](MsgCode c, const string& e, const vector<string> &a) {
        anerror(std::format("[ERROR code {}], error: {}", c.to_string(c.valeur), e));
    };

    inline static OnProgress onprogress = [](const string& m, const string &a) {
        aninfo(std::vformat(m, std::make_format_args(a)));
    };

    explicit AsynClienter(slint::ComponentWeakHandle<App>& appwin, DesktopSettings& desksets, const JServUrl& jserv, OnLink onlink)
        : Doclientier("h_photos", desksets, jserv, onlink, onErr), window_weak(appwin), appsettings(desksets) {}

    explicit AsynClienter(slint::ComponentWeakHandle<App>& appwin, DesktopSettings& desksets, const JServUrl& jserv, OnLink onlink, OnError err)
        : Doclientier("h_photos", desksets, jserv, onlink, err), window_weak(appwin), appsettings(desksets) {}

    void reconnect_ipc();


    void push_files(const map<string, vector<LangExt::VarType>>& paths, const Port& port);
    void push_files(const map<string, vector<LangExt::VarType>>& paths, const string& port_code = Port::docstier) {
        push_files(paths, Port{client.jserv.jprotocol.ctx, port_code});
    }

    void query_synode(vector<std::string> paths) {
        std::cout << "'''''''''''''''''''''''''''''''''''''''''''''''";
    }

    void login_synode(const string &uid, const string &pswd, const string& device) noexcept {
        try {
            anlog("''''''''''''''''''' login: "s + client.jserv.jserv() + " ''''''''''''''''''''''");

            client.loginWithUri(appsettings.sysuri, uid, pswd, device, onErr);
        } catch (const std::logic_error e) {
            anwarn(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        } catch (const std::exception e) {
            anerror(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        }
    }

    void asy_echows(const string& echo = "Echo by Asynclientier from C++");

    void query_syncflags(const map<string, vector<LangExt::VarType>>& syncing_paths, OnOk ok);

    void asy_register_dev(const DesktopSettings& set_inst, OnOk ok, OnError err);

    /**
     * FIXME move to syn.h?
     * @brief bringup_synlink
     * @param sets_inst
     * @return
     */
    bool bringup_synlink(DesktopSettings sets_inst) {
        if (LangExt::isblank(client.ssInf.ssid) || !client.heartbeating) {
            anlog("Login to "s + sets_inst.synode_jserv);
            login_synode(sets_inst.admin, sets_inst.domain_token, sets_inst.device);
            client.openLink(sets_inst.sysuri);
        }

        if (LangExt::isblank(client.ssInf.ssid) || !client.heartbeating) {
            return false;
        }
        if (!client.heartbeating) {
            client.openLink(sets_inst.sysuri);
            return false;
        }
        return true;
    }

    /// helper
    static void inv_insert_status(slint::ComponentWeakHandle<App>& appwin, const string& txt) {
        slint::SharedString slint_text(txt);
        slint::invoke_from_event_loop([&appwin, slint_text]() {
            if (auto app = appwin.lock()) {
                anlog("[onmsg] Updating statues report: "s + string{slint_text});
                auto data = (*app)->global<AppState>().get_model();
                // data.syncing_status = slint_text;
                auto status_model = data.syncing_status;
                auto vec_model = std::dynamic_pointer_cast<slint::VectorModel<slint::SharedString>>(status_model);
                if (vec_model) {
                    vec_model->insert(0, slint_text);
                }
                (*app)->global<AppState>().set_model(data);
            }
        });
    }

private:
    string format_proc_report(const DocsResp& resp) {
        std::vector<std::string_view> report = LangExt::split(resp.m, ',');
        if (report.size() >= 4) {
            int current_row   = std::stoi(std::string(report[0]));
            int total_rows    = std::stoi(std::string(report[1]));
            int current_block = std::stoi(std::string(report[2]));
            int total_blocks  = std::stoi(std::string(report[3]));

            if (total_blocks > 0) {
                float percentage = (static_cast<float>(current_block + 1) / total_blocks) * 100.0f;
                return std::format("File {}/{}, {:.0f}% [{}]", current_row + 1, total_rows, percentage, resp.xdoc.clientpath);
            }
        }
        return resp.m;
    }
};

}
