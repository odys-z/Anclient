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

    ui->run();
    return 0;
}
