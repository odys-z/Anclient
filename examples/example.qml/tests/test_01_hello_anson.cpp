#include <gtest/gtest.h>

#include <io/odysz/anson.h>
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
