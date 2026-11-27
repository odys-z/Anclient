
#include "../app/src/knownpath.h"

#include <cstdlib>
#include <filesystem>
#include <format>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

#include <gtest/gtest.h>

#include <io/odysz/anson.h>
#include <io/odysz/entt_jserv.h>
#include "../app/src/gen/app_settings.hpp"
#include "test_common.h"

namespace anson {

AstMap asts;
JsonOpt opts{&asts};

namespace {

string collect_paths_py{"collect_known_paths.py"};

std::string resolve_python_script() {
    // if (const char* env_p = std::getenv("KNOWN_PATHS_PY_SCRIPT"); env_p && *env_p) {
    //     return std::string(env_p);
    // }

    #ifdef ALBUM_TESTS_SRC_DIR
    std::filesystem::path p = std::filesystem::path(ALBUM_TESTS_SRC_DIR) / collect_paths_py;
    if (std::filesystem::exists(p)) {
        return p.string();
    }
    #endif

    for (const string candidate : {
        collect_paths_py,
        "../" + collect_paths_py,
        "../../" + collect_paths_py,
        "scripts/" + collect_paths_py
    }) {
        if (std::filesystem::exists(candidate)) {
            return std::string(candidate);
        }
    }
    return collect_paths_py;
}

const std::string& python_executable() {
    if (const string py = std::getenv("PYTHON_BIN"); !py.empty()) {
        static const std::string env_py = expand_tilde(py);
        return env_py;
    }

    #ifdef _WIN32
    static const std::string kPythonExe = expand_tilde(string{venv_python_win});
    #else
    static const std::string kPythonExe = expand_tilde(venv_python_posix);
    #endif
    return kPythonExe;
}
}


/**
 * Test-only dump function: runs the Python collector to write `out_file`
 * (`known_paths_dump.json` by default), reads the generated JSON back,
 * writes it to `out`, and returns the JSON string.
 */
std::string dump_known_paths_for_test(std::ostream& out,
                                      bool require_exists = false,
                                      const std::string& out_file = "known_paths_dump.json") {
    std::string target = out_file.empty() ? std::string("known_paths_dump.json") : out_file;
    std::string script = resolve_python_script();
    std::string py = python_executable();

    std::string cmd = std::format("\"{}\" \"{}\" --out \"{}\"{}",
                                  py,
                                  script,
                                  target,
                                  require_exists ? " --existing-only" : "");

    int rc = std::system(cmd.c_str());
    if (rc != 0) {
        anerror(std::format("dump_known_paths_for_test: python script failed (rc={}): {}", rc, cmd));
        return {};
    }

    std::ifstream ifs(target, std::ios::binary);
    if (!ifs.is_open()) {
        anerror("dump_known_paths_for_test: failed to open generated file: " + target);
        return {};
    }

    std::ostringstream buf;
    buf << ifs.rdbuf();
    std::string json_str = buf.str();

    out << json_str << std::endl;
    out.flush();
    return json_str;
}

TEST(KnownPathsTest, DUMP) {
    bool require_exists = false;
    std::string python_dumps = "known_paths_dump.json";

    register_jserv(&anson::opts);
    register_desknownpathsAst(&anson::opts);

    std::string dumped = dump_known_paths_for_test(std::cout, require_exists, python_dumps);
    ASSERT_FALSE(dumped.empty());

    DesknownPaths knowns = collect_known_paths(require_exists);

    anson::DesknownPaths pypaths;
    ASSERT_TRUE(anson::Anson::from_file(python_dumps, pypaths, &opts));

    EXPECT_EQ(knowns.home, pypaths.home);
    EXPECT_EQ(knowns.desktop, pypaths.desktop);
    EXPECT_EQ(knowns.desktop_settings, pypaths.desktop_settings);
    EXPECT_EQ(knowns.download, pypaths.download);
    EXPECT_EQ(knowns.documents, pypaths.documents);
    EXPECT_EQ(knowns.pictures, pypaths.pictures);
    EXPECT_EQ(knowns.music, pypaths.music);
    EXPECT_EQ(knowns.video, pypaths.video);
}

} // namespace anson
