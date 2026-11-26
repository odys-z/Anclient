#include <gtest/gtest.h>

#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>

#include <io/odysz/anson.h>
#include <io/odysz/entt_jserv.h>
#include "../app/src/gen/app_settings.hpp"
#include "../app/src/knownpath.h"

namespace anson {

AstMap asts;
JsonOpt opts{&asts};

/**
 * Test-only dump function: serializes DesknownPaths via Anson and writes
 * to `out` (and optionally to `out_file`).
 */
std::string dump_known_paths_for_test(std::ostream& out,
                                      bool require_exists = false,
                                      const std::string& out_file = "") {

    DesknownPaths paths = collect_known_paths(require_exists);
    std::string json_str = paths.toBlock(opts);

    out << json_str << std::endl;
    out.flush();

    if (!out_file.empty()) {
        std::ofstream ofs(out_file, std::ios::binary);
        if (ofs) {
            ofs << json_str;
        }
    }
    return json_str;
}


TEST(KnownPathsTest, DUMP) {
    bool require_exists = false;
    std::string python_dumps = std::string("known_paths_dump.json");

    register_jserv(&anson::opts);
    register_desknownpathsAst(&anson::opts);

    DesknownPaths knowns = collect_known_paths(require_exists);

    anson::DesknownPaths pypaths;
    anson::Anson::from_file(python_dumps, pypaths, &opts);

    EXPECT_EQ(knowns.home, pypaths.home);
    EXPECT_EQ(knowns.desktop, pypaths.desktop);
    EXPECT_EQ(knowns.desktop_settings, pypaths.desktop_settings);
    EXPECT_EQ(knowns.download, pypaths.download);
    EXPECT_EQ(knowns.documents, pypaths.documents);
    EXPECT_EQ(knowns.pictures, pypaths.pictures);
    EXPECT_EQ(knowns.music, pypaths.music);
    EXPECT_EQ(knowns.video, pypaths.video);
}

} // namespace