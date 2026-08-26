#include <gtest/gtest.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/json.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/semantier.hpp>
#include <io/odysz/semantic/tier/docs.h>

#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include "../app/src/slingleton.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <sys/types.h>
#include <signal.h>
#endif


using namespace anson;

TEST(DOCSTIER, DE_ReserializeDocsResp) {
    AstMap asts;
    JsonOpt opts{&asts};
    register_jserv(&opts);
    register_doctier(&opts, "ast");

    auto ui = App::create();
    slint::ComponentWeakHandle<App> ui_weak = ui;
    Slingleton& slingle = Slingleton::get_instance(ui_weak, "../app/settings/app-settings-reddish.json");

    string r =
R"json({"type": "io.odysz.semantic.jprotocol.AnsonMsg", "code": "ok", "opts": null, "port": "docstier", "header": null, "body": [{"type": "io.odysz.semantic.tier.docs.DocsResp", "syndomain": "infor-17-1", "rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null, "org": null, "collectId": null, "stamp": null, "m": null, "uri": null, "syncingPage": {"type": "io.odysz.semantic.tier.docs.PathsPage", "start": 0, "end": 9, "clientPaths": {"C:/Users/Alice/github/anclient/examples/example.slint/build/app/ast/desktop-settings.ast.json": ["slint.test", "prv", "admin", "2026-07-22", 0]}, "device": "slint.test"}
, "xdoc": null, "blockSeqReply": 0, "docTabl": null, "device": {"type": "io.odysz.semantic.tier.docs.Device", "tofolder": null, "synode0": null, "devname": null, "id": "slint.test"}
, "map": null}
], "addr": null, "version": "1.1", "seq": 0})json";

    AnsonMsg<DocsResp> msg{&opts};
    Anson::from_json(r, msg, &opts);

    ASSERT_EQ(MsgCode::Code::ok, msg.code);
    Port exp{&opts, Port::docstier};
    ASSERT_EQ(exp, msg.port);

    string s = msg.toBlock(opts);
    aninfo(s);
    slingle.enqueue_synode(std::make_shared<DocsResp>(std::move(msg.Body())));
    // aninfo(msg.toBlock());

    shared_ptr<AnsonResp> qryptr = slingle.dequeue_synode();
    if (!qryptr) return;
    shared_ptr<DocsResp> qry = std::dynamic_pointer_cast<DocsResp>(qryptr);
    if (!qry) {
        anwarn("Dropping expected DocsResp ===========");
        anwarn(qryptr->toBlock(opts));
        FAIL() << "pointer cast failed.";
    }
}
