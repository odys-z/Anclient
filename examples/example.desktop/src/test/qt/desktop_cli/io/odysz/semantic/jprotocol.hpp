#ifndef io_odysz_semantic_jprotocol_hpp
#define io_odysz_semantic_jprotocol_hpp

#include <format>

#include "io/odysz/anson.hpp"
#include "io/odysz/module/rs.hpp"

// class IPort : public IJsonable {

// public:
//     /**
//      * Get port url surfix, e.g. "echo.jserv".
//      * @return url surfix, the servlet pattern
//      */
//     string url() { return "echo.jserv"; }

//     /**
//      * @since 1.5.16
//      * @param jservroot
//      * @return jservroot/{@link #url()}
//      */
//     string url(string jservroot) { return format("{:s}/{:s}", jservroot, url()); }

//     virtual string name();

//     /**
//      * Equivalent of enum.valueOf(), except for subclass returning instance of jserv.Port.
//      * @throws SemanticException port name not found
//      */
//     virtual IPort valof(string pname);
// };

enum class Port : int {
    heartbeat = 0, //("ping.serv"),
    session, //("login.serv"),
    query, //("r.serv"),
    update, //("u.serv"),
    insert, // ("c.serv"),
    del, //("d.serv"),
    echo, //("echo.less"),

    /** serv port for downloading json/xml file or uploading a file.<br>
         * see io.odysz.semantic.jserv.file.JFileServ in semantic.jserv. */
    file,
    // ("file.serv"),

    /**
         * Any user defined request using message body of subclass of JBody must use this port
         * @deprecated since 1.4.36
         */
    user, //("user.serv11"),

    /** experimental */
    userstier, //("users.tier"),
    /** semantic tree of dataset extensions<br>
         * see io.odysz.semantic.ext.SemanticTree in semantic.jserv. */
    stree, //("s-tree.serv"),

    /** @deprecated replaced by {@link #stree} */
    stree11, //("s-tree.serv11"),

    /** dataset extensions<br>
         * see io.odysz.semantic.ext.Dataset in semantic.jserv. */
    dataset, //("ds.serv"),

    /** @deprecated replaced by {@link #dataset} */
    dataset11, //("ds.serv11"),

    /** ds.tier, dataset's semantic tier */
    datasetier, //("ds.tier"),

    /** document manage's semantic tier */
    docstier, //("docs.tier"),

    /**
         * Synode tier service: sync.tier
         * @since 2.0.0
         */
    syntier //("sync.tier");
};

template <>
struct glz::meta<Port> {
    using T = Port;
    static constexpr auto value = enumerate(
        "heartbeat", T::heartbeat,
        "session", T::session,
        "query", T::query,
        "update", T::update,
        "insert", T::insert,
        "delete", T::del,
        "echo", T::echo,
        "file", T::file,
        "user", T::user,
        "userstier", T::userstier,
        "stree", T::stree,

        "dataset", T::dataset,
        "datasetier", T::datasetier,
        "docstier", T::docstier,
        "syntier", T::syntier
        );
};

class AnsonBody : public Anson {
protected:
    string uri;
    string a;

public:
    virtual ~AnsonBody() = default;

    struct glaze {
        using T = AnsonBody;
        static constexpr auto value = glz::object(
            "uri", &T::uri,
            "a",   &T::a
        );
    };
};

template <std::derived_from<AnsonBody> T>
class AnsonMsg : public Anson {
public:
    virtual ~AnsonMsg() = default;

    Port port;
    vector<T> body;
};

class AnsonResp : public AnsonBody {
    string type = "io.odysz.semantic.jprotocol.AnsonResp";

public:
    ~AnsonResp() = default;

    string m;
    vector<AnResultset> rs;

    struct glaze {
        using T = AnsonResp;
        static constexpr auto value = glz::object(
            "type", &T::type,
            "m",    &T::m,
            "rs",   &T::rs
        );
    };
};

#endif
