#include <gtest/gtest.h>
#include <rttr/type>
#include <rttr/registration>

#include <io/odysz/anson.hpp>
#include "clients.h"

/**
 * cp ../../anclient.jserv/src/test/res/WEB-INF/settings.json .
 *
 * <pre>{"type": "io.odysz.jsample.SampleSettings",
 *	"conn": "sys-sqlite",
 *	"vol_name": "VOLUME_HOME",
 *	"volume": "../volume",
 *	"port": 8080
 * }</pre>
 */
TEST(Hello, ANSON) {
    // deserialize settings.json
}
