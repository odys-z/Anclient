#pragma once

// #include <rttr/type.h>
// #include <rttr/variant.h>
// #include <rttr/registration.h>

#include <io/odysz/jprotocol.hpp>
#include <vector>
#include <map>
// #include <io/odysz/rttr.hpp>

namespace anson {

// class PathsPage : public Anson {
// public:
//     PathsPage(string device) : Anson(), device(device) {}

//     string device;
//     size_t start;
//     size_t end;

//     map<string, vector<string>>clientPaths;

//     RTTR_ENABLE(Anson)
// };

/**
 * @brief The DocSyncReq class
 * java type: io.odysz.semantics.SemanticObject
 */
// class DocsReq : public UserReq {
// public:
//     string synuri;
//     string docTabl;
//     DocsReq(string a) : UserReq(a) {}

//     RTTR_ENABLE(UserReq)
// };


RTTR_REGISTRATION {
    using namespace rttr;
    using namespace anson;
    rttr::registration::class_<Anson>("anson::Anson")
        .constructor<std::string>()
        (policy::ctor::as_std_shared_ptr,
         default_arguments(string("-type-")) )
        .property("type", &Anson::type)
        ;

    rttr::registration::class_<AnsonBody>("anson::AnsonBody")
        .constructor<std::string>()
        (policy::ctor::as_std_shared_ptr,
         default_arguments(string("-a-")) )
        .property("a", &AnsonBody::a)
        ;

    rttr::registration::class_<UserReq>("anson::UserReq")
        .constructor<string>()
        .property("data", &UserReq::data)
        ;

    rttr::registration::class_<AnsonResp>("anson::AnsonResp")
        .constructor<>()
        .constructor<std::string>()
        (policy::ctor::as_std_shared_ptr,
         default_arguments(string("-a-")) )
        .property("code", &AnsonResp::code)
        ;

    rttr::registration::enumeration<Port>("Port")(
        rttr::value("query", Port::query),
        rttr::value("update", Port::update),
        rttr::value("echo", Port::echo)
        );

    rttr::registration::enumeration<MsgCode>("MsgCode")(
        rttr::value("ok", MsgCode::ok),
        rttr::value("exDA", MsgCode::exDA),
        rttr::value("exGeneral", MsgCode::exGeneral),
        rttr::value("exIo", MsgCode::exIo),
        rttr::value("exSemantic", MsgCode::exSemantic),
        rttr::value("exSession", MsgCode::exSession),
        rttr::value("exTransct", MsgCode::exTransct),
        rttr::value("ext", MsgCode::ext)
        );


    using RqEch = AnsonMsg<EchoReq>;
    rttr::registration::class_<RqEch>("anson::AnsonMsg<EchoReq>")
        .constructor<Port>()
        .property("port", &RqEch::port)
        ;

    // rttr::registration::class_<DocsReq>("anson::AnsonMsg<EchoReq>")
    //     .constructor<string>()
    //     ;
}
}
