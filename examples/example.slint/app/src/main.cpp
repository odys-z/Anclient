#include <memory>
#include <string>
#include "app-window.h"
#include "webview-ext.h"
#include "slingleton.h"

// This order is to avoid compile error
#include <io/odysz/anserializer.h>
#include "helper.h"
#include "gen/wsport.hpp"

int main(int argc, char **argv) {
    using namespace anson;

    // TODO move to slingle
    map<string, vector<LangExt::VarType>> fileselection;

    auto ui = App::create();
    slint::ComponentWeakHandle<App> ui_weak = ui;
    Slingleton& slingle = argc > 1 ? Slingleton::get_instance(ui_weak, string{argv[1]})
                                   : Slingleton::get_instance(ui_weak);

    ui->set_window_title("SurrealTree Explorer v1.0");
    ui->set_enable_vol(slingle.has_synode_vol());
    ui->window().set_maximized(false);

    std::unique_ptr<webview::webview> wv = nullptr;

    ui->on_menu_changed([&](slint::SharedString page_ix) {
        std::string menu_id = string{page_ix}; //page_ix.data();
        anlog(std::format("Menu changed! ID: {}", menu_id));

        if (menu_id == "album") {
            launch_webview_window(ui, slingle.appsettings);
        }
        else if (menu_id == "volume") {
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
            anlog("Pinging: "s + file_str);
        }
        ui->set_syncing_status(status);
        slingle.doclientier->push_files(filemap, WSPort{WSPort::ping});
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
                    .is_folder{entry.is_directory()},
                    .indent = {},
                    .fname{entry.path().filename().string()},
                    .size{entry.is_regular_file() ? std::to_string(entry.file_size()) : "-"},
                    .type{type},
                    .fullpath{entry.path().string()},
                    .iselected{fileselection.find(string{row.fullpath}) != fileselection.end()},
                    .syncicon{SyncingIcon::Invisible}};

                table_model->push_back(row);
            }

            ui->set_filelist(table_model);
            ui->set_current_pth(pth);

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
        
        string status = std::format("Total selected files: \n{}.", map2str(fileselection));
        anlog(status);
        ui->set_syncing_status(slint::SharedString{status});
    });

    ui->on_upload_files([&]() {
        slingle.doclientier->push_files(fileselection);
    });

    ui->on_query_syncflags([&]() {
        fs::path root = fs::absolute(fs::path{string{ui->get_current_pth()}});

        map<string, vector<LangExt::VarType>> pthpage{};
        try {
            fs::directory_iterator syncpage = fs::directory_iterator(root);
            for (const auto& entry : syncpage) {
                pthpage.emplace(Anson::posix_path(entry.path().string()), vector<LangExt::VarType>{ShareFlag::pushing});
            }

            slingle.doclientier->query_syncflags(pthpage, [&ui_weak, &slingle](AnsonResp& resp) {
                // slingle.enqueue_synode(std::make_shared<DocsResp>(resp));
                if (auto* docs = dynamic_cast<DocsResp*>(&resp)) {
                    slingle.enqueue_synode(std::make_shared<DocsResp>(std::move(*docs)));
                } else {
                    anwarn("query_syncflags: unexpected response type, dropping");
                    return;
                }
                slint::invoke_from_event_loop([&ui_weak, &resp]() {
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
            anwarn(qryptr->toBlock());
            return;
        }

        auto filelist_model = ui->get_filelist();
        auto filelist = std::dynamic_pointer_cast<slint::VectorModel<PathItemData>>(filelist_model);

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
                    else
                        row.syncicon = SyncingIcon::Invisible;

                    filelist->set_row_data(i, row);
                }
            }
            ui->set_filelist(filelist);
        }
    });

    ui->on_open_link([](slint::SharedString url) {
        open_browser(std::string(url));
    });

    ui->on_open_volume([&slingle]() {
        slingle.open_volume();
    });

    // Design Notes: We need a post load event callback API.
    slint::invoke_from_event_loop([ui, &slingle]() {
        if (slingle.validsettings())
            ui->set_menu_id("home");
        else
            ui->set_menu_id("2-2");
    });

    ui->run();
    return 0;
}
