#pragma once

#include <cstdlib>
#include <string>
#include <algorithm>
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
 * p's domain list & synode list is not bind here.
 * @brief bind_profile
 * @param p
 * @param s
 * @return true if the regiserv is different
 */
inline static bool bind_profile(UserProfileModel& p, const anson::DesktopSettings& s) {
    bool refresh =  string{p.regiserv} != s.regiserv;

    p.market_name = s.market_name;
    p.regiserv = s.regiserv;
    p.synode_jserv = s.synode_jserv;
    p.domain_selected = s.domain;
    p.org_selected = s.org;
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
