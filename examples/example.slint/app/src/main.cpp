#include <memory>
#include <string>
#include "app-window.h"
#include "webview-ext.h"
#include "slingleton.h"

// This order is to avoid compile error
#include <io/odysz/anserializer.h>

int main(int argc, char **argv) {
    using namespace anson;

    map<string, vector<LangExt::VarType>> fileselection;

    Slingleton slingle = Slingleton::get_instance();

    auto ui = App::create();

    ui->set_window_title("SurrealTree Explorer v1.0");
    ui->window().set_maximized(false);

    std::unique_ptr<webview::webview> wv = nullptr;

    ui->on_menu_changed([&](int index, slint::SharedString page_ix, slint::SharedString page_name) {
        std::string menu_id = page_ix.data();
        anlog(std::format("Menu changed! Index: {}, ID: {}", index, menu_id));

        if (menu_id == "1") {
            launch_webview_window(ui);
        }
    });

    ui->on_pingws([&]() {
        anlog("Ping IPC Agent clicked!");
        slingle.doclientier->push_files({});
        ui->invoke_update_syncing_status("From CPP: ping ...");
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

    ui->run();
    return 0;
}
