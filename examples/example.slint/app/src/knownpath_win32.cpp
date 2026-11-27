#ifdef _WIN32

#ifndef NOMINMAX
#define NOMINMAX
#endif
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>
#include <shlobj.h>
#include <objbase.h>

#ifdef _MSC_VER
#pragma comment(lib, "Shell32.lib")
#pragma comment(lib, "Ole32.lib")
#endif

#include "knownpath.h"

#include <filesystem>
#include <string>

namespace anson {

namespace fs = std::filesystem;

namespace {

std::string windows_known_folder(const GUID& folder_id) {
    PWSTR wide_path = nullptr;
    HRESULT hr = SHGetKnownFolderPath(folder_id, KF_FLAG_DONT_VERIFY, nullptr, &wide_path);
    if (FAILED(hr) || !wide_path) {
        return {};
    }
    int len = WideCharToMultiByte(CP_UTF8, 0, wide_path, -1, nullptr, 0, nullptr, nullptr);
    std::string utf8;
    if (len > 1) {
        utf8.resize(static_cast<size_t>(len - 1));
        WideCharToMultiByte(CP_UTF8, 0, wide_path, -1, utf8.data(), len - 1, nullptr, nullptr);
    }
    CoTaskMemFree(wide_path);
    return utf8;
}

} // namespace

DesknownPaths collect_known_paths(bool require_exists) {
    DesknownPaths out;
    std::string home = get_home_dir();

    out.home = normalize_path(fs::path(home), require_exists);
    out.desktop_settings = normalize_path(fs::path("settings/app-settings.json"), require_exists);

    auto win_or = [&](const GUID& id, const char* fallback) {
        std::string kf = windows_known_folder(id);
        return normalize_path(kf.empty() ? (fs::path(home) / fallback) : fs::path(kf), require_exists);
    };

    out.desktop   = win_or(FOLDERID_Desktop,   "Desktop");
    out.documents = win_or(FOLDERID_Documents, "Documents");
    out.download  = win_or(FOLDERID_Downloads, "Downloads");
    out.pictures  = win_or(FOLDERID_Pictures,  "Pictures");
    out.music     = win_or(FOLDERID_Music,     "Music");
    out.video     = win_or(FOLDERID_Videos,    "Videos");

    return out;
}

} // namespace anson

#endif // _WIN32
