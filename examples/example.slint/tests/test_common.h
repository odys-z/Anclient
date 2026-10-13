#pragma once

// #include <thread>
#include <string>
#include <format>
#include <chrono>
#include <cstdlib>
#include <fstream>
#include <random>
#include <thread>

#include <openssl/evp.h>

#include <io/odysz/common.h>
#include <io/odysz/common.h> // disable clangd warnings
#include <io/odysz/clients.h>
#include <io/odysz/jprotocol.h>

#include <io/odysz/jclient/syn.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/semantic/tier/docs.h>

// #include "../app/src/gen/app_settings.hpp"


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

inline string env_str(const char* name, const string& defualt) {
    const char* v = std::getenv(name);
    return (v && *v) ? string(v) : defualt;
}

inline int env_int(const char* name, int defualt) {
    const char* v = std::getenv(name);
    if (!v || !*v) return defualt;
    try { return std::stoi(v); } catch (...) { return defualt; }
}

/**
 * Copy src to "<stem>_e2e_<timestamp>_<nonce><ext>" and append the nonce after the
 * content (after IEND for a png, which viewers ignore), so every run pushes unique bytes.
 * @return absolute path of the new file.
 */
inline fs::path make_unique_push_file(const string& src) {
    fs::path sourcePath = fs::absolute(src);
    auto now = std::chrono::system_clock::now();
    std::string timestamp = std::format("{:%Y%m%d_%H%M%S}", std::chrono::floor<std::chrono::seconds>(now));
    std::string nonce = std::format("{:08x}", std::random_device{}());

    fs::path target = sourcePath.parent_path() /
        (sourcePath.stem().string() + "_e2e_" + timestamp + "_" + nonce + sourcePath.extension().string());
    fs::copy_file(sourcePath, target, fs::copy_options::overwrite_existing);

    std::ofstream out(target, std::ios::binary | std::ios::app);
    out << "synode-e2e:" << timestamp << ":" << nonce;
    return target;
}

/** @return lowercase hex SHA-256 of the file, or "" if it can't be read. */
inline string sha256_file(const fs::path& p) {
    std::ifstream in(p, std::ios::binary);
    if (!in) return "";

    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(ctx, EVP_sha256(), nullptr);
    char buf[64 * 1024];
    while (in.read(buf, sizeof(buf)) || in.gcount() > 0)
        EVP_DigestUpdate(ctx, buf, static_cast<size_t>(in.gcount()));

    unsigned char md[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    EVP_DigestFinal_ex(ctx, md, &len);
    EVP_MD_CTX_free(ctx);

    string hex;
    for (unsigned int i = 0; i < len; i++)
        hex += std::format("{:02x}", md[i]);
    return hex;
}

/** @return true if any regular file under root has the given size and SHA-256. */
inline bool find_content(const fs::path& root, std::uintmax_t size, const string& digest) {
    std::error_code ec;
    if (!fs::exists(root, ec)) return false;

    for (auto it = fs::recursive_directory_iterator(root, fs::directory_options::skip_permission_denied, ec);
         it != fs::recursive_directory_iterator(); it.increment(ec)) {
        if (ec) { ec.clear(); continue; }
        if (!it->is_regular_file(ec) || it->file_size(ec) != size) continue;
        if (sha256_file(it->path()) == digest) {
            anlog(std::format("[E2E] found {}", it->path().generic_string()));
            return true;
        }
    }
    return false;
}

/** Poll root every 3 s until the content shows up or the deadline passes. */
inline bool wait_for_content(const fs::path& root, std::uintmax_t size, const string& digest,
                             std::chrono::steady_clock::time_point deadline) {
    while (true) {
        if (find_content(root, size, digest)) return true;
        if (std::chrono::steady_clock::now() >= deadline) return false;
        std::this_thread::sleep_for(std::chrono::seconds(3));
    }
}
