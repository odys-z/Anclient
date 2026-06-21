#pragma once

#include <string>
#include <qml_cpp.h>

namespace fs = std::filesystem;

/**
 * @brief getTestPushFile
 * @return If src is "report.txt", copy to "report_2026-06-14_01-04-51.txt" and return the name.
 */
fs::path getTestPushFile(const string& src) {
    fs::path sourcePath{src};
    auto now = std::chrono::system_clock::now();

    std::string timestamp = std::format("{:%Y-%m-%d_%H-%M-%S}", now);

    fs::path extension = sourcePath.extension();
    fs::path stem = sourcePath.stem();
    fs::path parentDir = sourcePath.parent_path();

    std::string newFileName = stem.string() + "_" + timestamp + extension.string();
    fs::path target_path = parentDir / newFileName;

    fs::copy_file(sourcePath, target_path, fs::copy_options::skip_existing);

    return target_path;
}

/**
 * @brief Resolves the tilde (~) prefix in file paths across different platforms.
 * On Windows, it expands '~' to the USERPROFILE directory.
 * On Unix/Linux/macOS, it expands '~' to the HOME directory.
 */
static u8string resolveHomePath(const std::string& inputPath) {
    if (inputPath.empty() || inputPath[0] != '~') {
        return fs::path(inputPath).u8string();
    }

    std::string homeDir;

    #ifdef _WIN32
        // Windows conditional compilation
        char* userProfile = std::getenv("USERPROFILE");
        if (userProfile) {
            homeDir = userProfile;
        }
    #else
        // Linux / macOS conditional compilation
        char* home = std::getenv("HOME");
        if (home) {
        homeDir = home;
        }
    #endif

    if (homeDir.empty()) {
        return fs::path(inputPath).u8string();
    }

    size_t offset = (inputPath.size() > 1 && (inputPath[1] == '/' || inputPath[1] == '\\')) ? 2 : 1;

    return (fs::path(homeDir) / inputPath.substr(offset)).u8string();
}

