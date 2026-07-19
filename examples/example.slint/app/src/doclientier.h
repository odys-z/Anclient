#pragma once

#include <thread>

#include <io/odysz/clients.h>
#include <io/odysz/common.h>
#include <io/odysz/jprotocol.h>

#include <thread>
#include <chrono>
#include <io/odysz/jclient/syn.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/semantic/tier/docs.h>
#include <gen/app_settings.hpp>

#include "app-window.h"
#include "wsclients.h"
#include "ipcagent_manager.h"

using namespace anson;

class AsynClienter : public Doclientier {
protected:
    inline static const string sysuri = "/sys/cpp";
    inline static const string synuri = "/syn/cpp";

    string settings_json;
    DesktopSettings appsettings;

    string _device;

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

            slint::SharedString slint_text(proc_report);
            slint::invoke_from_event_loop([this, slint_text]() {
                if (auto handle = window_weak.lock()) {
                    anlog("[onmsg] Updating statues report: "s + string{slint_text});
                    (*handle)->set_syncing_status(slint_text);
                }
            });
        }
        else if (rep.code == MsgCode::Code::_sentinel_) {
            // show be the ws connection reports
            // anlog("Show be the ws connection report ...");
        }
        else { //if (!rep.body.empty()) {
            string clientpath_state = map2str(rep.Body().syncingPage.clientPaths);
            string status_txt = std::format("on DocsResp, msg: {}\n    {}", rep.Body().m, clientpath_state);
            anlog(status_txt);

            // ISSUE slint ui helper: can update ui with a static helper
            slint::SharedString slint_text(status_txt);
            slint::invoke_from_event_loop([this, slint_text]() {
                if (auto handle = window_weak.lock()) {
                    anlog("[onmsg] Updating statues report: "s + string{slint_text});
                    (*handle)->set_syncing_status(slint_text);
                }
            });
        }

        // query_currentfolder();
    };

    slint::ComponentWeakHandle<App> window_weak; // = main_window;

public:
    bool load_settings(const string& settings_json);

    // Getter
    string getDevice() const { return _device; }

    // Setter
    void setDevice(const string &device) {
        if (_device == device) return;
        _device = device;
    }

    std::unique_ptr<WSClient> wsclient;
    std::unique_ptr<AsynClienter> jservclient;

    inline static OnError onErr = [](MsgCode c, const string& e, const vector<string> &a) {
        anerror(std::format("[ERROR code {}], error: {}", AnsonJavaEnumAst::name<MsgCode>(c), e));
    };

    inline static OnProgress onprogress = [](const string& m, const string &a) {
        aninfo(std::vformat(m, std::make_format_args(a)));
    };

    explicit AsynClienter(slint::ComponentWeakHandle<App>& appwin)
        : Doclientier("h_photos", sysuri, synuri, onErr), window_weak(appwin) {}

    explicit AsynClienter(slint::ComponentWeakHandle<App>& appwin, OnError err)
        : Doclientier("h_photos", sysuri, synuri, err), window_weak(appwin) {}

    void reconnect_ipc();

    void push_files(const map<string, vector<LangExt::VarType>>& paths, const WSPort& port = WSPort{WSPort::docstier});

    void query_synode(vector<std::string> paths) {
        std::cout << "'''''''''''''''''''''''''''''''''''''''''''''''";
    }

    void login_synode(const JServUrl & jserv, const string &uid, const string &pswd) noexcept {
        try {
            andebug("''''''''''''''''''  login  '''''''''''''''''''''''''''''");
            SessionClient ssclient = SessionClient::loginWithUri(jserv,
                                    sysuri, uid, pswd, _device, onErr);
            jservclient = make_unique<AsynClienter>(window_weak, onErr);
            jservclient.get()->client = ssclient;
        } catch (const std::logic_error e) {
            anwarn(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        } catch (const std::exception e) {
            anerror(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        }
    }

    /**
     * @brief connections
     * @return [is ws conn ok, is synode conn ok]
     */
    vector<bool> connections() {
        return {wsclient != nullptr && !LangExt::isblank(jservclient.get()->client.ssInf.ssid),
             jservclient != nullptr && !LangExt::isblank(jservclient.get()->client.ssInf.ssid)};
    }

    // void asy_echows(OnOk ok, OnError err);
    void asy_echows(const string& echo = "Echo by Asynclientier from C++");
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
