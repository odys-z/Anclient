#pragma once

#include <cstdlib>
#include <string>
#include <algorithm>

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
    path = resolveHomePath(path);
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