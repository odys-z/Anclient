#include "knownpath.h"

#include <cstdlib>
#include <fstream>
#include <system_error>

#include <io/odysz/anson.h>

namespace anson {

namespace fs = std::filesystem;

std::string get_home_dir() {
#ifdef _WIN32
    if (const char* p = std::getenv("USERPROFILE"); p && *p) return p;
    if (const char* h = std::getenv("HOME"); h && *h) return h;
#else
    if (const char* h = std::getenv("HOME"); h && *h) return h;
#endif
    return ".";
}

std::string expand_tilde(const std::string& p) {
    if (p.empty() || p[0] != '~') {
        return p;
    }
    std::string home = anson::Anson::posix_path(anson::get_home_dir());
    if (p.size() == 1) {
        return home;
    }
    if (p[1] == '/' || p[1] == '\\') {
        return home + p.substr(1);
    }
    return p;
}

std::string normalize_path(const fs::path& raw, bool require_exists) {
    if (raw.empty()) return {};

    std::error_code ec;
    fs::path p = raw;
    std::string s = anson::Anson::posix_path(p.string());
    if (!s.empty() && s[0] == '~') {
        std::string home = anson::Anson::posix_path(get_home_dir());
        if (s.size() == 1) {
            p = fs::path(home);
        } else if (s[1] == '/') {
            p = fs::path(home) / s.substr(2);
        }
    }

    if (require_exists && !fs::exists(p, ec)) {
        return {};
    }

    fs::path resolved = fs::weakly_canonical(fs::absolute(p, ec), ec);
    if (resolved.empty()) {
        resolved = fs::absolute(p, ec);
    }
    return anson::Anson::posix_path(resolved.string());
}

#ifndef _WIN32
namespace {

std::string xdg_dir(const char* xdg_key, const std::string& home, const char* fallback_sub) {
    const char* xdg_cfg_env = std::getenv("XDG_CONFIG_HOME");
    fs::path cfg = (xdg_cfg_env && *xdg_cfg_env)
        ? (fs::path(xdg_cfg_env) / "user-dirs.dirs")
        : (fs::path(home) / ".config/user-dirs.dirs");

    std::ifstream ifs(cfg);
    std::string line;
    while (ifs && std::getline(ifs, line)) {
        auto pos = line.find('=');
        if (pos == std::string::npos) continue;
        std::string key = line.substr(0, pos);
        while (!key.empty() && (key.front() == ' ' || key.front() == '\t')) key.erase(key.begin());
        while (!key.empty() && (key.back() == ' ' || key.back() == '\t')) key.pop_back();
        if (key != xdg_key) continue;

        std::string val = line.substr(pos + 1);
        while (!val.empty() && (val.front() == ' ' || val.front() == '\t' || val.front() == '"'))
            val.erase(val.begin());
        while (!val.empty() && (val.back() == ' ' || val.back() == '\t' || val.back() == '"' || val.back() == '\r'))
            val.pop_back();

        std::string home_posix = anson::Anson::posix_path(home);
        for (const std::string& tok : {std::string("${HOME}"), std::string("$HOME")}) {
            size_t idx = 0;
            while ((idx = val.find(tok, idx)) != std::string::npos) {
                val.replace(idx, tok.size(), home_posix);
                idx += home_posix.size();
            }
        }
        if (!val.empty()) return val;
    }
    return (fs::path(home) / fallback_sub).string();
}

} // namespace

DesknownPaths collect_known_paths(bool require_exists) {
    DesknownPaths out;
    std::string home = get_home_dir();

    out.home = normalize_path(fs::path(home), require_exists);
    out.desktop_settings = normalize_path(fs::path("settings/app-settings.json"), require_exists);
    out.desktop   = normalize_path(xdg_dir("XDG_DESKTOP_DIR",   home, "Desktop"),   require_exists);
    out.documents = normalize_path(xdg_dir("XDG_DOCUMENTS_DIR", home, "Documents"), require_exists);
    out.download  = normalize_path(xdg_dir("XDG_DOWNLOAD_DIR",  home, "Downloads"), require_exists);
    out.pictures  = normalize_path(xdg_dir("XDG_PICTURES_DIR",  home, "Pictures"),  require_exists);
    out.music     = normalize_path(xdg_dir("XDG_MUSIC_DIR",     home, "Music"),     require_exists);
    out.video     = normalize_path(xdg_dir("XDG_VIDEOS_DIR",    home, "Videos"),    require_exists);

    return out;
}
#endif

} // namespace anson
