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

inline static void bind_profile(UserProfileModel& p, const anson::DesktopSettings& s) {
    p.market_name = s.market_name;
    p.synode_jserv = s.synode_jserv;
    p.domain_selected = s.domain;
    p.org_selected = s.org;
    p.synode_selected = s.synode_id;
}

inline static void insert_status(const slint::ComponentHandle<App>& ui, std::string s) {
    auto data = ui->global<AppState>().get_model();
    auto status_model = data.syncing_status;
    auto vec_model = std::dynamic_pointer_cast<slint::VectorModel<slint::SharedString>>(status_model);
    if (vec_model) {
        slint::SharedString slintxt(s);
        vec_model->insert(0, slintxt);
        ui->global<AppState>().set_model(data);
    }
}