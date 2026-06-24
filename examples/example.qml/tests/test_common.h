#pragma once

#include <string>
#include <qdoclientier.h>

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
