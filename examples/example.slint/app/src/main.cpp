#include <memory>
#include <string>
#include "app-window.h"
#include "webview-ext.h"
#include "slingleton.h"

int main(int argc, char **argv) {
    using namespace anson;
    Slingleton slingle = Slingleton::get_instance();

    auto ui = App::create();

    ui->set_window_title("SurrealTree Explorer v1.0");

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

    /* working with file-table-0.slint
    ui->on_load_folder([&](slint::SharedString pth) {
        anlog("load folder ...");
        anlog(string{pth});
        
        std::vector<slint::StandardListViewItem> row1 = {
            slint::StandardListViewItem{ slint::SharedString("C++ 1.1") },
            slint::StandardListViewItem{ slint::SharedString("C++ 1.2") },
            slint::StandardListViewItem{ slint::SharedString("C++ 1.3") },
            slint::StandardListViewItem{ slint::SharedString("C++ 1.4") }
        };
        
        // 2. Wrap your data in Slint's Model structures
        // For completely dynamic arrays, Slint uses slint::VectorModel or slint::ComponentModel
        auto row_model = std::make_shared<slint::VectorModel<slint::StandardListViewItem>>(row1);

        // The UI expects a model of models: Model<std::shared_ptr<Model<StandardListViewItem>>>
        using InnerModel = slint::Model<slint::StandardListViewItem>;
        auto table_model = std::make_shared<slint::VectorModel<std::shared_ptr<InnerModel>>>();
        table_model->push_back(row_model);

        ui->set_filelist(table_model);
    });
    */

    ui->on_load_folder([&](slint::SharedString pth) {
        anlog("load folder: "s + std::string(pth));

        // PathItemData p1 { true, {}, "test", "1000", "doc" };
        
        // // auto row_model = std::make_shared<PathItemData>(p1);

        // auto table_model = std::make_shared<slint::VectorModel<PathItemData>>();
        // table_model->push_back(p1);

        // ui->set_filelist(table_model);


        auto table_model = std::make_shared<slint::VectorModel<PathItemData>>();
        fs::path root{std::string(pth)};
        try {
            if (root.has_parent_path() && root != root.root_path()) {
                PathItemData p { true, {}, "..", "", "", slint::SharedString(root.parent_path().string()) };
                table_model->push_back(p);
            }
            for (const auto& entry : fs::directory_iterator(root)) {
                std::string name = entry.path().filename().string();
                std::string type = entry.is_directory() ? "Folder" : (entry.is_regular_file() ? "File" : "Other");
                std::string size = entry.is_regular_file() ? std::to_string(entry.file_size()) : "-";
                PathItemData row {.is_folder{entry.is_directory()},
                            .indent = {},
                            .fname{name},
                            .size{size},
                            .type{type},
                            .fullpath{entry.path().string()} };

                table_model->push_back(row);
            }

            ui->set_filelist(table_model);
        } catch (const fs::filesystem_error& e) {
            anerror("Filesystem error: "s + e.what());
        }
    });

    ui->run();
    return 0;
}
