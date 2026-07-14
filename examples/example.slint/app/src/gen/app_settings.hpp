#pragma once

#include <entt/meta/factory.hpp>
#include <entt/meta/meta.hpp>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/module/rs.h>



namespace anson {

class QMLAppSettings : public anson::Anson {
public:
    inline static const std::string _type_ = "io.odysz.anclient.slint.QMLAppSettings";
    string sysuri;
    string synuri;
    string temp_dir;
    string java_path;
    string doctier_jar;
    string wsagent_jar;
    string synode_id;
    string synode_vol;
    string domain;
    string admin;
    string token;
    string wsagent_settings;
    string wshost;
    int wsport;

    QMLAppSettings() : Anson() {
        Type(_type_);
    }
};

inline static void register_qmlappsettingsAst(AstMap & asts) {

    AnsonAst * ast = createAST <QMLAppSettings, AnsonAst> (
        asts, Anson::_type_, map <string, AnsonField> {
        {"sysuri", {.dataAnclass="string"} },
        {"synuri", {.dataAnclass="string"} },
        {"temp_dir", {.dataAnclass="string"} },
        {"java_path", {.dataAnclass="string"} },
        {"doctier_jar", {.dataAnclass="string"} },
        {"wsagent_jar", {.dataAnclass="string"} },
        {"synode_id", {.dataAnclass="string"} },
        {"synode_vol", {.dataAnclass="string"} },
        {"domain", {.dataAnclass="string"} },
        {"admin", {.dataAnclass="string"} },
        {"token", {.dataAnclass="string"} },
        {"wsagent_settings", {.dataAnclass="string"} },
        {"wshost", {.dataAnclass="string"} },
        {"wsport", {.dataAnclass="int"} },
       });

    entt::meta_factory <anson::QMLAppSettings> ()
        .type(ast->enttypeid)
        .base<Anson>()

        .data<&anson::QMLAppSettings::sysuri>("sysuri")
        .data<&anson::QMLAppSettings::synuri>("synuri")
        .data<&anson::QMLAppSettings::temp_dir>("temp_dir")
        .data<&anson::QMLAppSettings::java_path>("java_path")
        .data<&anson::QMLAppSettings::doctier_jar>("doctier_jar")
        .data<&anson::QMLAppSettings::wsagent_jar>("wsagent_jar")
        .data<&anson::QMLAppSettings::synode_id>("synode_id")
        .data<&anson::QMLAppSettings::synode_vol>("synode_vol")
        .data<&anson::QMLAppSettings::domain>("domain")
        .data<&anson::QMLAppSettings::admin>("admin")
        .data<&anson::QMLAppSettings::token>("token")
        .data<&anson::QMLAppSettings::wsagent_settings>("wsagent_settings")
        .data<&anson::QMLAppSettings::wshost>("wshost")
        .data<&anson::QMLAppSettings::wsport>("wsport")
        ;

        //
        ast->get_field_instance = [ast](const IJsonable& ans, const string& fieldname) -> meta_any {
            if (ast->fields.contains(fieldname)) {
                auto& concrete = static_cast<const QMLAppSettings&>(ans);
                if ("sysuri" == fieldname)
                    return entt::forward_as_meta(concrete.sysuri);
                if ("synuri" == fieldname)
                    return entt::forward_as_meta(concrete.synuri);
                if ("temp_dir" == fieldname)
                    return entt::forward_as_meta(concrete.temp_dir);
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
                if ("domain" == fieldname)
                    return entt::forward_as_meta(concrete.domain);
                if ("admin" == fieldname)
                    return entt::forward_as_meta(concrete.admin);
                if ("token" == fieldname)
                    return entt::forward_as_meta(concrete.token);
                if ("wsagent_settings" == fieldname)
                    return entt::forward_as_meta(concrete.wsagent_settings);
                if ("wshost" == fieldname)
                    return entt::forward_as_meta(concrete.wshost);
                if ("wsport" == fieldname)
                    return entt::forward_as_meta(concrete.wsport);
            }

            if (IJsonable::contxt_ptr->has_ast(ast->baseAnclass)) {
                AnsonAst *bast = IJsonable::contxt_ptr->ast<AnsonAst>(ast->baseAnclass);
                return bast->get_field_instance(ans, fieldname);
            }

            anerror("get_field_instance<QMLAppSettings>(): Failed to get entt instance (meta_any)");
            return { };
        };
}

}
