#pragma once

#include <cstdlib>
#include <string>
#include <algorithm>
#include <memory>
#include <vector>
#include "app-window.h"
#include "gen/app_settings.hpp"
#include "ipcagent_manager.h"

inline static void open_browser(const std::string& url) {
#if defined(_WIN32) || defined(_WIN64)
    // Windows
    std::string command = "start " + url;
    std::system(command.c_str());
#elif defined(__APPLE__)
    // macOS
    std::string command = "open " + url;
    std::system(command.c_str());
#elif defined(__linux__)
    // Linux
    std::string command = "xdg-open " + url;
    std::system(command.c_str());
#endif
}

inline static void open_file_explorer(std::string path) {
    path = anson::resolveHomePath(path);
#if defined(_WIN32) || defined(_WIN64)
    // Windows: Open explorer at the specific path
    std::replace(path.begin(), path.end(), '/', '\\');
    std::string formatted_path = path;
    std::string command = "explorer.exe \"" + formatted_path + "\"";
    std::system(command.c_str());
#elif defined(__APPLE__)
    // macOS: Open Finder at the specific path
    std::string command = "open \"" + path + "\"";
    std::system(command.c_str());
#elif defined(__linux__)
    // Linux: Open the default file manager
    std::string command = "xdg-open \"" + path + "\"";
    std::system(command.c_str());
#endif
}

/**
 * The album web page, i.e. the root path of every web url, for JServUrl(url, jprotocol).
 * Users never type it; whatever path is in a url is replaced by this one, and shown.
 */
inline static const anson::JProtocol web_protocol{"webview.html", nullptr};

/**
 * @return DesktopSettings::album_web, parsed by JServUrl with album_webroot, i.e.
 * scheme://host:port/webview.html, whatever path is typed; a port-only value, e.g. "8900"
 * (also the legacy album_web), is taken on synode_jserv's host. "" if no valid host and port.
 */
inline static string resolve_album_web(const anson::DesktopSettings& s) {
    anson::JServUrl web{s.album_web, web_protocol};
    return web.valid() ? web.jserv() : "";
}

/**
 * jserv_list is not bind here (populated later via query_domnodes/on_domnodes,
 * it isn't shown in a ComboBox so it doesn't need the same startup seeding).
 * domains_list and synodes_list are seeded with just the configured value so
 * their ComboBoxes have a consistent (model, current-value) pair immediately;
 * on_org_domains()/on_domnodes() replace them with the full registry-provided
 * lists once those async calls return, and re-assert the configured value as
 * selected there too.
 * @brief bind_profile
 * @param p
 * @param s
 * @return true if the regiserv is different
 */
inline static bool bind_profile(UserProfileModel& p, const anson::DesktopSettings& s) {
    bool refresh =  string{p.regiserv} != s.regiserv;

    p.market_name = s.market_name;
    p.device = s.device;
    p.is_device_locked = !s.device.empty();
    p.regiserv = s.regiserv;
    p.regist_uid  = s.centralUid;
    p.regist_pswd = s.centralPswd;
    p.synode_jserv = s.synode_jserv;
    p.synode_web = resolve_album_web(s);
    p.domains_list = std::make_shared<slint::VectorModel<slint::SharedString>>(
        std::vector<slint::SharedString>{slint::SharedString(s.domain)});
    p.domain_selected = s.domain;
    p.org_selected = s.org;
    p.synodes_list = std::make_shared<slint::VectorModel<slint::SharedString>>(
        std::vector<slint::SharedString>{slint::SharedString(s.synode_id)});
    p.jserv_list = std::make_shared<slint::VectorModel<slint::SharedString>>(
        std::vector<slint::SharedString>{slint::SharedString(s.synode_jserv)});
    p.synode_selected = s.synode_id;
    p.user_id_text = s.admin;
    p.password_text = s.domain_token;
    p.confirm_password_text = s.domain_token;
    return refresh;
}

inline static void insert_status(slint::ComponentWeakHandle<App> weak_ui, std::string s) {
    slint::invoke_from_event_loop([weak_ui, s = std::move(s)]() {
        if (auto ui = weak_ui.lock()) {
            auto data = (*ui)->global<AppState>().get_model();
            auto status_model = data.syncing_status;
            auto vec_model = std::dynamic_pointer_cast<slint::VectorModel<slint::SharedString>>(status_model);
            if (vec_model) {
                vec_model->insert(0, slint::SharedString(s));
                while (vec_model->row_count() > 1024) {
                    vec_model->erase(vec_model->row_count() - 1);
                }
                (*ui)->global<AppState>().set_model(data);
            }
        }
    });
}

inline static void insert_status(const slint::ComponentHandle<App>& ui, std::string s) {
    slint::ComponentWeakHandle<App> ui_weak = ui;
    insert_status(ui_weak, s);
}

inline static void show_dlg(slint::ComponentWeakHandle<App> weak_ui, const string& title, const string& inform) {
    slint::invoke_from_event_loop([weak_ui, title, inform]() {
        if (auto ui = weak_ui.lock()) {
            auto data = (*ui)->global<AppState>().get_model();
            auto status_model = data.syncing_status;

            auto dlg_model = (*ui)->global<UserDialogState>().get_model();
        }
    });
}

/**
 * Clean the name string to avoid formatted readable string polution.
 *
 * @brief cleanz_devname
 * @param suspecious
 * @return e.g. my-device[001] => my-device
 */
inline static string cleanz_devname(const string& suspecious) {
    std::regex pattern(R"(\[[^\]]*\])");
    std::string result = std::regex_replace(suspecious, pattern, "");
    return result;
}
