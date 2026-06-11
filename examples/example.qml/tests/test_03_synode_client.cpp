#include <gtest/gtest.h>
#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include <iostream>
#include <chrono>
#include <thread>
#include <atomic>
#include <qDebug>
#include <qml_cpp.h>
#include <QJsvalue>
#include <io/odysz/jprotocol.h>
#include <io/odysz/semantier.h>
#include <io/odysz/gen/doctier.hpp>
#include "gen/test_settings.hpp"

static anson::AstMap asts;
static anson::JsonOpt opts{&asts};

TEST(SYNODE_CLIENT, Query) {
    QDoclientier doctier;
    QJSValue paths;
    doctier.query_synode(paths);
}
