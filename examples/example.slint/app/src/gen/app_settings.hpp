#pragma once

#include <entt/meta/factory.hpp>
#include <entt/meta/meta.hpp>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/module/rs.h>



namespace anson {

class DesktopSettings : public anson::Anson {
public:
    inline static const std::string _type_ = "io.oz.anclient.app.DesktopSettings";
    string device;
    string sysuri;
    string synuri;
    string market;
    string org;
    string market_name;
    string org_name;
    string regiserv;
    string java_path;
    string doctier_jar;
    string wsagent_jar;
    string synode_id;
    string synode_vol;
    string synode_jserv;
    string album_web;
    string domain;
    string admin;
    string token;
    string wshost;
    int wsport;
    int wstimeout;

    DesktopSettings() : Anson() {
        Type(_type_);
    }
};

inline static void register_desktopsettingsAst(AstMap & asts) {

    AnsonAst * ast = createAST <DesktopSettings, AnsonAst> (
        asts, Anson::_type_, map <string, AnsonField> {
        {"device", {.dataAnclass="string"} },
        {"sysuri", {.dataAnclass="string"} },
        {"synuri", {.dataAnclass="string"} },
        {"market", {.dataAnclass="string"} },
        {"org", {.dataAnclass="string"} },
        {"market_name", {.dataAnclass="string"} },
        {"org_name", {.dataAnclass="string"} },
        {"regiserv", {.dataAnclass="string"} },
        {"java_path", {.dataAnclass="string"} },
        {"doctier_jar", {.dataAnclass="string"} },
        {"wsagent_jar", {.dataAnclass="string"} },
        {"synode_id", {.dataAnclass="string"} },
        {"synode_vol", {.dataAnclass="string"} },
        {"synode_jserv", {.dataAnclass="string"} },
        {"album_web", {.dataAnclass="string"} },
        {"domain", {.dataAnclass="string"} },
        {"admin", {.dataAnclass="string"} },
        {"token", {.dataAnclass="string"} },
        {"wshost", {.dataAnclass="string"} },
        {"wsport", {.dataAnclass="int"} },
        {"wstimeout", {.dataAnclass="int"} },
       });

    entt::meta_factory <anson::DesktopSettings> ()
        .type(ast->enttypeid)
        .base<Anson>()

        .data<&anson::DesktopSettings::device>("device")
        .data<&anson::DesktopSettings::sysuri>("sysuri")
        .data<&anson::DesktopSettings::synuri>("synuri")
        .data<&anson::DesktopSettings::market>("market")
        .data<&anson::DesktopSettings::org>("org")
        .data<&anson::DesktopSettings::market_name>("market_name")
        .data<&anson::DesktopSettings::org_name>("org_name")
        .data<&anson::DesktopSettings::regiserv>("regiserv")
        .data<&anson::DesktopSettings::java_path>("java_path")
        .data<&anson::DesktopSettings::doctier_jar>("doctier_jar")
        .data<&anson::DesktopSettings::wsagent_jar>("wsagent_jar")
        .data<&anson::DesktopSettings::synode_id>("synode_id")
        .data<&anson::DesktopSettings::synode_vol>("synode_vol")
        .data<&anson::DesktopSettings::synode_jserv>("synode_jserv")
        .data<&anson::DesktopSettings::album_web>("album_web")
        .data<&anson::DesktopSettings::domain>("domain")
        .data<&anson::DesktopSettings::admin>("admin")
        .data<&anson::DesktopSettings::token>("token")
        .data<&anson::DesktopSettings::wshost>("wshost")
        .data<&anson::DesktopSettings::wsport>("wsport")
        .data<&anson::DesktopSettings::wstimeout>("wstimeout")
        ;

        //
        ast->get_field_instance = [ast](const IJsonable& ans, const string& fieldname) -> meta_any {
            if (ast->fields.contains(fieldname)) {
                auto& concrete = static_cast<const DesktopSettings&>(ans);
                if ("device" == fieldname)
                    return entt::forward_as_meta(concrete.device);
                if ("sysuri" == fieldname)
                    return entt::forward_as_meta(concrete.sysuri);
                if ("synuri" == fieldname)
                    return entt::forward_as_meta(concrete.synuri);
                if ("market" == fieldname)
                    return entt::forward_as_meta(concrete.market);
                if ("org" == fieldname)
                    return entt::forward_as_meta(concrete.org);
                if ("market_name" == fieldname)
                    return entt::forward_as_meta(concrete.market_name);
                if ("org_name" == fieldname)
                    return entt::forward_as_meta(concrete.org_name);
                if ("regiserv" == fieldname)
                    return entt::forward_as_meta(concrete.regiserv);
                if ("java_path" == fieldname)
                    return entt::forward_as_meta(concrete.java_path);
                if ("doctier_jar" == fieldname)
                    return entt::forward_as_meta(concrete.doctier_jar);
                if ("wsagent_jar" == fieldname)
                    return entt::forward_as_meta(concrete.wsagent_jar);
                if ("synode_id" == fieldname)
                    return entt::forward_as_meta(concrete.synode_id);
                if ("synode_vol" == fieldname)
                    return entt::forward_as_meta(concrete.synode_vol);
                if ("synode_jserv" == fieldname)
                    return entt::forward_as_meta(concrete.synode_jserv);
                if ("album_web" == fieldname)
                    return entt::forward_as_meta(concrete.album_web);
                if ("domain" == fieldname)
                    return entt::forward_as_meta(concrete.domain);
                if ("admin" == fieldname)
                    return entt::forward_as_meta(concrete.admin);
                if ("token" == fieldname)
                    return entt::forward_as_meta(concrete.token);
                if ("wshost" == fieldname)
                    return entt::forward_as_meta(concrete.wshost);
                if ("wsport" == fieldname)
                    return entt::forward_as_meta(concrete.wsport);
                if ("wstimeout" == fieldname)
                    return entt::forward_as_meta(concrete.wstimeout);
            }

            if (IJsonable::contxt_ptr->has_ast(ast->baseAnclass)) {
                AnsonAst *bast = IJsonable::contxt_ptr->ast<AnsonAst>(ast->baseAnclass);
                return bast->get_field_instance(ans, fieldname);
            }

            anerror("get_field_instance<DesktopSettings>(): Failed to get entt instance (meta_any)");
            return { };
        };
}

}
