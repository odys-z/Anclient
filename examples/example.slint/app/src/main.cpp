#include <algorithm>
#include <memory>
#include <string>
#include <io/odysz/anserializer.h>
#include "app-window.h"
#include "webview-ext.h"

// webview-ext.h -> webview.h -> gtk.h:
// `#define Status int`, which clashes with cpr::ThreadPool's `enum Status`
// So undefine Status, as gtk is donw.
// Claude.ai: This is a well know confliction, including that of OpenCV.
#ifdef Status
#undef Status
#endif

#include "slingleton.h"

// This order is to avoid compile error
#include "helper.h"
#include "router.h"

int main(int argc, char **argv) {
    using namespace anson;
    using ss = slint::SharedString;

    // TODO move to synching list
    map<string, vector<LangExt::VarType>> fileselection;

    auto ui = App::create();
    slint::ComponentWeakHandle<App> ui_weak = ui;

    string settings_path = argc > 1 ? string{argv[1]} : "settings/app-settings.json";
    Slingleton& slingle = Slingleton::get_instance(ui_weak, settings_path);

    {
        auto data = ui->global<AppState>().get_model();
        data.window_title = "Portfolio Desktop";
        data.enable_vol = slingle.has_synode_vol();
        ui->global<AppState>().set_model(data);
    }
    ui->window().set_maximized(false);

    std::unique_ptr<webview::webview> wv = nullptr;

    ui->on_menu_changed([&](slint::SharedString page_ix) {
        std::string menu_id = string{page_ix};
        anlog(std::format("Menu changed! ID: {}", menu_id));

        if (menu_id == menu_home && !ui->global<UserProfile>().invoke_closing()) {
            return;
        }

        if (menu_id == menu_album) {
            launch_webview_window(ui, slingle.appsettings);
        }
        else if (menu_id == menu_volume) {
            anlog("Launching volume explorer");
            slingle.open_volume();
        }
    });

    ui->on_echows([&](slint::SharedString msg) {
        slingle.doclientier->asy_echows(string{msg});
    });

    ui->on_pingws([&](std::shared_ptr<slint::Model<slint::SharedString>> files) {
        anlog("Ping IPC Agent clicked!");
        map<string, vector<LangExt::VarType>> filemap;

        slint::SharedString status{ShareFlag::pushing};
        for (int i = 0; i < files->row_count(); ++i) {
            auto f = files->row_data(i);
            if (!f.has_value())
                continue;

            std::string file_str(*f);
            filemap.emplace(file_str, std::vector<LangExt::VarType>{"syncing"});

            std::string updated_status = std::string(std::string_view(status)) + std::string(std::string_view(*f));
            status = slint::SharedString(" "s + updated_status);
        }

        insert_status(ui, "Ping: placing tasks ...");
        slingle.doclientier->push_files(filemap, Port::ping);
    });

    ui->on_load_folder([&](slint::SharedString pth) {
        if (pth == ".")
            pth = fs::absolute(fs::path{string{pth}}).string();

        anlog(std::format("load folder: {}, selected files: {}", std::string(pth), fileselection.size()));

        auto table_model = std::make_shared<slint::VectorModel<PathItemData>>();
        fs::path root{std::string(pth)};
        try {
            if (root.has_parent_path() && root != root.root_path()) {
                PathItemData p { true, {}, "..", "", "", slint::SharedString(root.parent_path().string()) };
                table_model->push_back(p);
            }

            fs::directory_iterator syncpage = fs::directory_iterator(root);
            for (const auto& entry : syncpage) {
                std::string type = entry.is_directory() ? "Folder" : (entry.is_regular_file() ? "File" : "Other");
                PathItemData row {
                    .is_folder = entry.is_directory(),
                    .indent = {},
                    .fname{entry.path().filename().string()},
                    .size{entry.is_regular_file() ? std::to_string(entry.file_size()) : "-"},
                    .type{type},
                    .fullpath{entry.path().string()},
                    .iselected = fileselection.find(string{row.fullpath}) != fileselection.end(),
                    .syncicon = SyncingIcon::Invisible};

                table_model->push_back(row);
            }

            // Build the breadcrumb trail: one crumb per ancestor folder of `root`,
            // from the filesystem root down to the folder just loaded.
            auto crumbs_model = std::make_shared<slint::VectorModel<PathItemData>>();
            {
                fs::path abs_root = fs::absolute(root);
                std::vector<fs::path> ancestors{abs_root};
                for (fs::path walk = abs_root; walk.has_parent_path() && walk != walk.parent_path(); ) {
                    walk = walk.parent_path();
                    ancestors.push_back(walk);
                }
                std::reverse(ancestors.begin(), ancestors.end());

                for (const auto& p : ancestors) {
                    std::string label = p.filename().string();
                    if (label.empty())
                        label = p.string(); // filesystem root, e.g. "/" or "C:\"

                    PathItemData crumb {
                        .is_folder = true,
                        .indent = {},
                        .fname{label},
                        .size = "",
                        .type = "Folder",
                        .fullpath{p.string()},
                        .iselected = false,
                        .syncicon = SyncingIcon::Invisible};
                    crumbs_model->push_back(crumb);
                }
            }

            {
                auto data = ui->global<AppState>().get_model();
                data.filelist = table_model;
                data.current_pth = pth;
                data.path_crumbs = crumbs_model;
                ui->global<AppState>().set_model(data);
            }

            ui->invoke_query_syncflags();
        } catch (const fs::filesystem_error& e) {
            anerror("Filesystem error: "s + e.what());
        }
    });

    ui->on_select_file([&](PathItemData fileitem, bool selected) {
        if (!selected)
            fileselection.erase(string{fileitem.fullpath});
        else
            fileselection.emplace(string{fileitem.fullpath}, std::vector<LangExt::VarType>{"syncing"});
        
        string status = std::format("Total selected files: \n{}.", map2str(fileselection, Slingleton::opts));
        anlog(status);
    });

    ui->on_upload_files([&]() {
        slingle.doclientier->push_files(fileselection);
    });

    ui->on_query_syncflags([&]() {
        fs::path root = fs::absolute(fs::path{string{ui->global<AppState>().get_model().current_pth}});

        map<string, vector<LangExt::VarType>> pthpage{};
        try {
            fs::directory_iterator syncpage = fs::directory_iterator(root);
            for (const auto& entry : syncpage) {
                pthpage.emplace(Anson::posix_path(entry.path().string()),
                                vector<LangExt::VarType>{ShareFlag::pushing});
            }

            slingle.doclientier->query_syncflags(pthpage, [ui_weak, &slingle](AnsonResp& resp) {
                // slingle.enqueue_synode(std::make_shared<DocsResp>(resp));
                if (auto* docs = dynamic_cast<DocsResp*>(&resp)) {
                    slingle.enqueue_synode(std::make_shared<DocsResp>(std::move(*docs)));
                } else {
                    anwarn("query_syncflags: unexpected response type, dropping");
                    return;
                }
                slint::invoke_from_event_loop([ui_weak]() {
                    if (auto handle = ui_weak.lock()) {
                        anlog("querying page ...");
                        (*handle)->invoke_update_syncflags();
                    }
                });
            });
        } catch (const fs::filesystem_error& e) {
            anerror("Querying syncing page error: "s + e.what());
        }
    });

    ui->on_update_syncflags([&, ui]() {
        // TODO: drop the query results silently if current folder changed while querying.
        shared_ptr<AnsonResp> qryptr = slingle.dequeue_synode();
        if (!qryptr) return;
        shared_ptr<DocsResp> qry = std::dynamic_pointer_cast<DocsResp>(qryptr);
        if (!qry) {
            anwarn("Dropping expected DocsResp ===========");
            anwarn(qryptr->toBlock(Slingleton::opts));
            return;
        }

        auto data = ui->global<AppState>().get_model();
        auto filelist = std::dynamic_pointer_cast<slint::VectorModel<PathItemData>>(data.filelist);

        if (filelist) {
            std::size_t count = filelist->row_count();
            
            for (std::size_t i = 0; i < count; ++i) {
                if (auto row_opt = filelist->row_data(i)) {
                    PathItemData row = *row_opt;

                    #ifdef _WIN32
                    const string posixpath{Anson::posix_path(string{row.fullpath})};
                    #else
                    const string posixpath{row.fullpath};
                    #endif
                    // anlog(posixpath);
                    if (!qry->syncingPage.clientPaths.contains(posixpath)) continue;

                    string icon = LangExt::var_str(qry->syncingPage.clientPaths[posixpath][1]).value_or("");
                    anlog(std::format("updating sync-flag {} : {}", posixpath, icon));

                    // map string icon to SyncingIcon enum/value
                    if (icon == ShareFlag::pushing || icon == "pushing")
                        row.syncicon = SyncingIcon::Pushing;
                    else if (icon == ShareFlag::publish || icon == "publish")
                        row.syncicon = SyncingIcon::Publish;
                    else if (icon == ShareFlag::prv || icon == "prv")
                        row.syncicon = SyncingIcon::Private;
                    // else if (slingle.constates.synlink == connect_state::online)
                    //     row.syncicon = SyncingIcon::Ready4sync;
                    else
                        row.syncicon = SyncingIcon::Invisible;

                    filelist->set_row_data(i, row);
                }
            }

            // filelist rows were mutated in place on the same model instance
            // referenced by data.filelist, but we still round-trip through
            // set_model() (matching the original set_filelist(filelist) call)
            // in case something downstream relies on AppState.model-changed firing.
            data.filelist = filelist;
            ui->global<AppState>().set_model(data);
        }
    });

    /**
     * Open web page to a link.
     */
    ui->on_open_web([](slint::SharedString url) {
        open_browser(std::string(url));
    });

    ui->on_open_volume([&slingle]() {
        slingle.open_volume();
    });

    // user
    ui->on_query_orgdoms([&ui, &slingle](const slint::SharedString& org) {
        auto profile = ui->global<UserProfile>().get_model();
        slingle.update_regjserv(string{profile.regiserv});
        slingle.query_orgdoms(string{org});
    });

    ui->on_query_domnodes([&ui, &slingle](const ss& org, const ss& domain) {
        auto profile = ui->global<UserProfile>().get_model();
        slingle.appsettings.regiserv = profile.regiserv;
        slingle.query_domnodes(string{org}, string{domain});
    });

    ui->on_ping_synode([&ui, &slingle](const ss& org, const ss& domain, const ss& synid, const ss& jserv) {
        auto profile = ui->global<UserProfile>().get_model();
        slingle.ping_synode(ui, string{org}, string{domain}, string{synid}, string{jserv});
    });

    ui->on_select_synode([&ui, &slingle](const ss& synid) {
        auto profile = ui->global<UserProfile>().get_model();
        slingle.on_select_synode(synid);
    });

    ui->on_test_synlogin([&ui, &slingle](const ss& uid, const ss& pswd, const ss& pswd2){
        // create a temp ssclient & a temp jserv for test login
        auto profile = ui->global<UserProfile>().get_model();
        slingle.on_test_synlogin(ui, string{uid}, string{pswd}, string{pswd2}, string{profile.synode_jserv});
    });

    ui->on_save_userinfo([&ui, &ui_weak, &settings_path, &slingle]() {
        UserProfileModel p = ui->global<UserProfile>().get_model();

        anlog("on_save_userinfo(): jserv = "s + string{p.synode_jserv});

        // We need a better validation pattern. See https://claude.ai/share/a00185d7-3a8d-460f-9c35-5fa8189b0c1f
        if (string{p.password_text} != string{p.confirm_password_text})
            insert_status(ui, "Domain Token doesn't march with confirming text.");

        DesktopSettings s {slingle.appsettings};
        s.regiserv = p.regiserv;
        s.synode_id = p.synode_selected;
        s.domain = p.domain_selected;
        s.synode_jserv = p.synode_jserv;
        s.admin = string{p.user_id_text};
        s.domain_token = p.password_text;
        s.device = p.device;

        optional<string> err = Slingleton::validate_settings(s);
        if (!err) {
            if (LangExt::isblank(slingle.appsettings.device)) {
                // TASK: check device with the synode.
                shared_ptr temp_doclientier = std::make_shared<AsynClienter>(ui_weak, s, JServUrl{s.synode_jserv, &slingle.opts},
                        [ui_weak](connect_state connstates) {
                            anlog("Temp-link should never be openned");
                        });


                temp_doclientier->login_synode(s.admin, s.domain_token, s.device);

                if (temp_doclientier->client.ssInf.ssid.empty()) {
                    show_dlg(ui_weak, "Warning", "Must login to a synode for creating a new device.");
                    return; // Automatically destroyed here (ref count hits 0)
                }

                // Capture temp_doclientier in the lambda to keep it alive until the network callback executes
                temp_doclientier->asy_register_dev(s, [ui, ui_weak, s, &slingle, settings_path, temp_doclientier](const AnsonResp& r) {
                    slint::invoke_from_event_loop([ui]() {
                        UserProfileModel p = ui->global<UserProfile>().get_model();
                        p.is_device_locked = true;
                        ui->global<UserProfile>().set_model(p);
                    });

                    slingle.settings(s);
                    slingle.save_settings(settings_path);
                    slingle.setup_doclientier(ui_weak);
                    anlog("saved: "s + settings_path);

                    insert_status(ui, r.m);
                    show_dlg(ui, "Saved", r.m);
                }, [temp_doclientier](MsgCode::Code c, const string& e, const vector<string> &a) {
                    AsynClienter::onErr(c, e, a);
                });
            }
        }
        else {
            anwarn(*err);
            insert_status(ui, *err);
        }
    });

    // Design Notes: call for a post load event callback API.
    // Tip: data.syncing_status in slint model is backed as an immutable field
    auto data = ui->global<AppState>().get_model();
    data.window_title = "Portfolio Desktop";
    data.enable_vol = slingle.has_synode_vol();
    data.syncing_status = std::make_shared<slint::VectorModel<slint::SharedString>>(
        std::vector<slint::SharedString>{"Ready"});
    ui->global<AppState>().set_model(data);

    slint::invoke_from_event_loop([&ui, &slingle]() {
        auto appstat = ui->global<AppState>().get_model();
        auto profile = ui->global<UserProfile>().get_model();

        bool reload = bind_profile(profile, slingle.appsettings);

        if (slingle.validsettings()) {
            appstat.menu_id = menu_home;
        } else {
            appstat.menu_id = menu_user;
            profile.detail_label = "Please check settings!";
        }

        ui->global<AppState>().set_model(appstat);
        ui->global<UserProfile>().set_model(profile);
    });

    try { ui->run();
    } catch(runtime_error e) {
        anerror(e.what());
    }
    slingle.agentController->stop_agent();
    return 0;
}
