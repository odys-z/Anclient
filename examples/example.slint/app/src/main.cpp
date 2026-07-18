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

    map<string, vector<LangExt::VarType>> fileselection;

    auto ui = App::create();
    slint::ComponentWeakHandle<App> ui_weak = ui;
    Slingleton slingle = argc > 1 ? Slingleton::get_instance(ui_weak, string{argv[1]})
                                  : Slingleton::get_instance(ui_weak);

    ui->set_window_title("SurrealTree Explorer v1.0");
    ui->set_enable_vol(slingle.has_synode_vol());
    ui->window().set_maximized(false);

    std::unique_ptr<webview::webview> wv = nullptr;

    ui->on_menu_changed([&](slint::SharedString page_ix) {
        std::string menu_id = string{page_ix}; //page_ix.data();
        anlog(std::format("Menu changed! ID: {}", menu_id));

        if (menu_id == "album") {
            launch_webview_window(ui, slingle.qmlsettings);
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

        slint::SharedString status = "Pushing";
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
            for (const auto& entry : fs::directory_iterator(root)) {
                std::string type = entry.is_directory() ? "Folder" : (entry.is_regular_file() ? "File" : "Other");
                PathItemData row {.is_folder{entry.is_directory()},
                            .indent = {},
                            .fname{entry.path().filename().string()},
                            .size{entry.is_regular_file() ? std::to_string(entry.file_size()) : "-"},
                            .type{type},
                            .fullpath{entry.path().string()},
                            .iselected{fileselection.find(string{row.fullpath}) != fileselection.end()} };

                table_model->push_back(row);
            }

            ui->set_filelist(table_model);
            ui->set_current_pth(pth);
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

    ui->on_open_link([](slint::SharedString url) {
        open_browser(std::string(url));
    });

    ui->on_open_volume([&slingle]() {
        slingle.open_volume();
    });

    ui->run();
    return 0;
}
