#include <gtest/gtest.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/gen/doctier.hpp>

#include "gen/test_settings.hpp"


/**
 */
TEST(ANSON, Query) {
    using namespace  anson;

    cout << "--------------------------" << endl;
    AstMap asts;
    register_doctier(asts, "ast");
    register_qmltestsettingsAst(asts);

    anson::QMLTestSettings settings;
    bool result = Anson::from_file("settings/test-settings.json", settings);
    ASSERT_TRUE(result);

    ASSERT_EQ("/sys/qmltest", settings.sysuri);
    ASSERT_EQ("/syn/qmltest", settings.synuri);
    ASSERT_TRUE(std::regex_search(settings.synuri, std::regex{"doctier-[0-9.]+.jar"}));
    ;
    andebug(std::format("{}", settings.synode_settings));
    cout << std::format("{}", settings.synode_settings);
}
