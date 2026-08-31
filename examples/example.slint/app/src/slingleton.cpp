#include "slingleton.h"

using namespace anson;

AstMap  Slingleton::asts;
JsonOpt Slingleton::opts{&asts};

AstMap  Slingleton::registry_asts;
JsonOpt Slingleton::registry_opts{&registry_asts};

Slingleton* Slingleton::instance = nullptr;
DesktopSettings Slingleton::appsettings;

bool Slingleton::load_settings(const string& settings_json, const JsonOpt& opts) {
    try {
        Anson::from_file(settings_json, appsettings, &opts);

    } catch (AnsonException e) {
        anerror(e.what());
        return false;
    }
    return true;
}

void Slingleton::setup_doclientier(slint::ComponentWeakHandle<App>& appwin, const JsonOpt* ctx) {
    AsynClienter::onErr = [appwin](MsgCode::Code c, const string& e, vector<string>args) {
        if (!instance->validsettings()) {
            // anerror(std::format("[ERROR code {}], error: {}", MsgCode::to_string(c), e));
            // slint::invoke_from_event_loop([&appwin]() {
            // if (auto app = appwin.lock()) {
            //     auto data = (*app)->global<AppState>().get_model();

            //     auto status_model = data.syncing_status;
            //     auto vec_model = std::dynamic_pointer_cast<slint::VectorModel<slint::SharedString>>(status_model);

            //     if (vec_model) {
            //         vec_model->insert(0, "Status not able to read.");
            //     }

            //     (*app)->global<AppState>().set_model(data);
            // }});
            insert_status(appwin, e);
        }
    };

    if (doclientier)
        doclientier->turndown_synlink();

    // if (!doclientier) {
        if (ctx == nullptr)
            ctx = &opts;
        doclientier = new AsynClienter(appwin, appsettings, {appsettings.synode_jserv, ctx}, [&appwin](connect_state connstates) {
        instance->constates = connstates;

        // debug notes: cannot capture outer lamda's 'connstates' as it quit immediatly, before this one is running.
        slint::invoke_from_event_loop([&appwin]() {
            if (auto app = appwin.lock()) {
                auto data = (*app)->global<AppState>().get_model();
                data.synode_linked = instance->constates.synlink == connect_state::online;
                (*app)->global<AppState>().set_model(data);
            }});
        });
    // }
}

void Slingleton::setup_regclient()  {

    JServUrl regjserv{appsettings.regiserv, &registry_opts};

    OnLink onbeat = [](connect_state conn) {
        anlog("registry connect_state: "s + conn.registlink);
    };

    registryClient = new RegistryClient(appsettings, regjserv,
                                        onbeat, AsynClienter::onErr);

    registryClient->market  = appsettings.market_id;
    registryClient->orgid   = appsettings.org;
    registryClient->orgname = appsettings.org_name;
}
