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

    QMLAppSettings appsettings;
    JavaAgentController agentController;

    string _device;

    OnMsg onmsg;

    QMLAppSettings qmlsettings;

    slint::ComponentWeakHandle<App> window_weak; // = main_window;

public:
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

    explicit AsynClienter() : Doclientier("h_photos", sysuri, synuri, onErr),
        agentController("java", "agent.jar"), window_weak(slint::ComponentWeakHandle<App>()) {}

    explicit AsynClienter(OnError err) : Doclientier("h_photos", sysuri, synuri, err),
        agentController("java", "agent.jar"), window_weak(slint::ComponentWeakHandle<App>()) {}

    bool load_settings();
    bool start_ipcagent();
    bool stop_ipcagent();

    void reconnect_ipc();

    void push_files(const map<string, vector<LangExt::VarType>>& paths);

    void query_synode(vector<std::string> paths) {
        std::cout << "'''''''''''''''''''''''''''''''''''''''''''''''";
    }

    void login_synode(const JServUrl & jserv, const string &uid, const string &pswd) noexcept {
        try {
            andebug("''''''''''''''''''  login  '''''''''''''''''''''''''''''");
            SessionClient ssclient = SessionClient::loginWithUri(jserv,
                                    sysuri, uid, pswd, _device, onErr);
            jservclient = make_unique<AsynClienter>(onErr);
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

private:
    string format_proc_report(const string& proc_msg) {
        vector<string_view> report = LangExt::split(proc_msg, ',');
        if (report.size() >= 4) {
            int rows = std::stoi(string{report[1]});
            if (rows > 0)
                return std::format("File {}/{}, {}",
                    report[2], report[3], std::stof(std::string(report[1])) / rows);
        }
        return proc_msg;
    }
};
