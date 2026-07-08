#include <iostream>
#include <filesystem>
#include <memory>
#include <string>
#include <vector>

#include "file-table.h" 
#include "app-window.h" 

namespace fs = std::filesystem;

class FileAdapter : public std::enable_shared_from_this<FileAdapter> {
private:
    std::shared_ptr<App> table_ui;
    slint::VectorModel<slint::SharedVector<slint::StandardListViewItem>> row_models;
    std::vector<fs::path> row_paths;

public:
    FileAdapter(std::shared_ptr<App> main_ui) : table_ui(main_ui) {
        // row_models = std::make_shared<std::vector<slint::StandardListViewItem>>();
    }

    // void init_handlers() {
    //     std::weak_ptr<FileAdapter> weak_self = shared_from_this();
        
    //     table_ui->global<TableViewPageAdapter>().on_load_init_folder([weak_self]() {
    //         if (auto self = weak_self.lock()) {
    //             // Load the application's current working directory initially
    //             self->load_folder(fs::current_path().string());
    //         }
    //     });
    // }

    void load_folder(slint::SharedString rootpath) {

        // std::vector<slint::VectorModel<slint::StandardListViewItem>> matrix;
    
        // Create a row
        std::vector<slint::StandardListViewItem> row1 = {
            slint::StandardListViewItem{ slint::SharedString("C++ Loaded 1.1") },
            slint::StandardListViewItem{ slint::SharedString("C++ Loaded 1.2") },
            slint::StandardListViewItem{ slint::SharedString("C++ Loaded 1.3") },
            slint::StandardListViewItem{ slint::SharedString("C++ Loaded 1.4") }
        };
        
        // 2. Wrap your data in Slint's Model structures
        // For completely dynamic arrays, Slint uses slint::VectorModel or slint::ComponentModel
        auto row_model = std::make_shared<slint::VectorModel<slint::StandardListViewItem>>(row1);
        
        auto table_model = std::make_shared<slint::VectorModel<slint::SharedVector<slint::StandardListViewItem> > >();
        table_model->push_back(slint::SharedVector<slint::StandardListViewItem>(row1.begin(), row1.end()));
        // table_ui->globals<TableViewPageAdapter>().set_row_data(table_model);
        table_ui->set_filelist(table_model);



        // row_models->clear();
        // row_paths.clear();
        // fs::path root{std::string(rootpath)};
        // try {
        //     if (root.has_parent_path() && root != root.root_path()) {
        //         auto row = std::make_shared<slint::VectorModel<slint::StandardListViewItem>>();
        //         row->push_back(slint::StandardListViewItem{slint::SharedString("..")});
        //         row->push_back(slint::StandardListViewItem{slint::SharedString("Folder")});
        //         row->push_back(slint::StandardListViewItem{slint::SharedString("-")});
        //         row_models->push_back(slint::SharedVector<slint::StandardListViewItem>(row.begin(), row.end())); //no suitable user-defined conversion from "std::shared_ptr<slint::VectorModel<slint::language::StandardListViewItem>>" to "const slint::Model<slint::language::StandardListViewItem>" exists
        //     }
        //     for (const auto& entry : fs::directory_iterator(root)) {
        //         auto row = std::make_shared<slint::VectorModel<slint::StandardListViewItem>>();
        //         std::string name = entry.path().filename().string();
        //         row->push_back(slint::StandardListViewItem{slint::SharedString(name)});
        //         std::string type = entry.is_directory() ? "Folder" : (entry.is_regular_file() ? "File" : "Other");
        //         row->push_back(slint::StandardListViewItem{slint::SharedString(type)});
        //         std::string size = entry.is_regular_file() ? std::to_string(entry.file_size()) : "-";
        //         row->push_back(slint::StandardListViewItem{slint::SharedString(size)});

        //         row_models->push_back(row);
        //         row_paths.push_back(entry.path());
        //     }
        // } catch (const fs::filesystem_error& e) {
        //     std::cerr << "Filesystem error: " << e.what() << std::endl;
        // }
        // table_ui->global<TableViewPageAdapter>().set_row_data(row_models);
    }
};
