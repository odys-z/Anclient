#pragma once

#include <entt/meta/factory.hpp>
#include <entt/meta/meta.hpp>

#include <io/odysz/anson.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/module/rs.h>

#include <io/odysz/gen/anclient_settings.hpp>

namespace anson {

class DesktopSettings : public anson::AnclientSettings {
public:
    inline static const std::string _type_ = "io.oz.anclient.app.DesktopSettings";
    string org_name;
    string java_path;
    string doctier_jar;
    string wsagent_jar;
    string synode_id;
    string synode_vol;
    string synode_jserv;
    string album_web;
    string wshost;
    int wsport{};
    int wstimeout{};

    DesktopSettings() : AnclientSettings() {
        Type(_type_);
    }
};

inline static void register_desktopsettingsAst(JsonOpt* ctx) {

    AnsonAst * ast = createAST <DesktopSettings, AnsonAst> (
        *ctx->asts, AnclientSettings::_type_, map <string, AnsonField> {
        {"org_name", {.dataAnclass="string"} },
        {"java_path", {.dataAnclass="string"} },
        {"doctier_jar", {.dataAnclass="string"} },
        {"wsagent_jar", {.dataAnclass="string"} },
        {"synode_id", {.dataAnclass="string"} },
        {"synode_vol", {.dataAnclass="string"} },
        {"synode_jserv", {.dataAnclass="string"} },
        {"album_web", {.dataAnclass="string"} },
        {"wshost", {.dataAnclass="string"} },
        {"wsport", {.dataAnclass="int"} },
        {"wstimeout", {.dataAnclass="int"} },
       });

    entt::meta_factory <anson::DesktopSettings> ()
        .type(ast->enttypeid)
        .base<AnclientSettings>()

        .data<&anson::DesktopSettings::org_name>("org_name")
        .data<&anson::DesktopSettings::java_path>("java_path")
        .data<&anson::DesktopSettings::doctier_jar>("doctier_jar")
        .data<&anson::DesktopSettings::wsagent_jar>("wsagent_jar")
        .data<&anson::DesktopSettings::synode_id>("synode_id")
        .data<&anson::DesktopSettings::synode_vol>("synode_vol")
        .data<&anson::DesktopSettings::synode_jserv>("synode_jserv")
        .data<&anson::DesktopSettings::album_web>("album_web")
        .data<&anson::DesktopSettings::wshost>("wshost")
        .data<&anson::DesktopSettings::wsport>("wsport")
        .data<&anson::DesktopSettings::wstimeout>("wstimeout")
        ;

        //
        ast->get_field_instance = [ast, ctx](const IJsonable& ans, const string& fieldname) -> meta_any {
            if (ast->fields.contains(fieldname)) {
                auto& concrete = static_cast<const DesktopSettings&>(ans);
                if ("org_name" == fieldname)
                    return entt::forward_as_meta(concrete.org_name);
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
                if ("wshost" == fieldname)
                    return entt::forward_as_meta(concrete.wshost);
                if ("wsport" == fieldname)
                    return entt::forward_as_meta(concrete.wsport);
                if ("wstimeout" == fieldname)
                    return entt::forward_as_meta(concrete.wstimeout);
            }

            if (ctx->has_ast(ast->baseAnclass)) {
                AnsonAst *bast = ctx->ast<AnsonAst>(ast->baseAnclass);
                return bast->get_field_instance(ans, fieldname);
            }

            anerror("get_field_instance<DesktopSettings>(): Failed to get entt instance (meta_any)");
            return { };
        };
}

class DesknownPaths : public anson::Anson {
public:
    inline static const std::string _type_ = "io.oz.anclient.app.DesknownPaths";
    string home;
    string desktop;
    string desktop_settings;
    string download;
    string documents;
    string pictures;
    string music;
    string video;

    DesknownPaths() : Anson() {
        Type(_type_);
    }
};

inline static void register_desknownpathsAst(JsonOpt* ctx) {

    AnsonAst * ast = createAST <DesknownPaths, AnsonAst> (
        *ctx->asts, Anson::_type_, map <string, AnsonField> {
        {"home", {.dataAnclass="string"} },
        {"desktop", {.dataAnclass="string"} },
        {"desktop_settings", {.dataAnclass="string"} },
        {"download", {.dataAnclass="string"} },
        {"documents", {.dataAnclass="string"} },
        {"pictures", {.dataAnclass="string"} },
        {"music", {.dataAnclass="string"} },
        {"video", {.dataAnclass="string"} },
       });

    entt::meta_factory <anson::DesknownPaths> ()
        .type(ast->enttypeid)
        .base<Anson>()

        .data<&anson::DesknownPaths::home>("home")
        .data<&anson::DesknownPaths::desktop>("desktop")
        .data<&anson::DesknownPaths::desktop_settings>("desktop_settings")
        .data<&anson::DesknownPaths::download>("download")
        .data<&anson::DesknownPaths::documents>("documents")
        .data<&anson::DesknownPaths::pictures>("pictures")
        .data<&anson::DesknownPaths::music>("music")
        .data<&anson::DesknownPaths::video>("video")
        ;

        //
        ast->get_field_instance = [ast, ctx](const IJsonable& ans, const string& fieldname) -> meta_any {
            if (ast->fields.contains(fieldname)) {
                auto& concrete = static_cast<const DesknownPaths&>(ans);
                if ("home" == fieldname)
                    return entt::forward_as_meta(concrete.home);
                if ("desktop" == fieldname)
                    return entt::forward_as_meta(concrete.desktop);
                if ("desktop_settings" == fieldname)
                    return entt::forward_as_meta(concrete.desktop_settings);
                if ("download" == fieldname)
                    return entt::forward_as_meta(concrete.download);
                if ("documents" == fieldname)
                    return entt::forward_as_meta(concrete.documents);
                if ("pictures" == fieldname)
                    return entt::forward_as_meta(concrete.pictures);
                if ("music" == fieldname)
                    return entt::forward_as_meta(concrete.music);
                if ("video" == fieldname)
                    return entt::forward_as_meta(concrete.video);
            }

            if (ctx->has_ast(ast->baseAnclass)) {
                AnsonAst *bast = ctx->ast<AnsonAst>(ast->baseAnclass);
                return bast->get_field_instance(ans, fieldname);
            }

            anerror("get_field_instance<DesknownPaths>(): Failed to get entt instance (meta_any)");
            return { };
        };
}

inline static void register_qmltest(JsonOpt* ctx, const string &ast_folder) {
    filesystem::path folder_path{ast_folder};
    register_desktopsettingsAst(ctx);
    register_desknownpathsAst(ctx);
}

}
