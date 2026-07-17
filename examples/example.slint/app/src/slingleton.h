#pragma once

#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/reflect.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/semantier.hpp>
#include <io/odysz/semantic/tier/docs.h>

#include "gen/app_settings.hpp"
#include "wsclients.h"
#include "gen/wsport.hpp"
#include "doclientier.h"
#include "ipcagent_manager.h"
#include "helper.h"

namespace anson {

  class Slingleton {
    static JsonOpt opts;
    static AstMap  asts;
    static Slingleton* instance;

    JavaAgentController* agentController = nullptr;

    WSClient* wsclient = nullptr;

  public:
    static DesktopSettings qmlsettings;
    AsynClienter* doclientier = nullptr;
    string volume_path;

    Slingleton() {}

    static Slingleton& get_instance(slint::ComponentWeakHandle<App>& appwin, const string & settings_path = "settings/app-settings.json") {
      if (instance == nullptr) {
        instance = new Slingleton();
        register_jserv(asts, opts);
        register_semantier(asts, "");
        register_doctier(asts, "ast");
        register_iport<WSPort>(asts, "ast/wsport.ast.json");
        register_desktopsettingsAst(asts);

        aninfo("Loading settings from: "s + resolveHomePath(settings_path));
        Anson::from_file(settings_path, qmlsettings);

        instance->agentController = new JavaAgentController(qmlsettings.java_path, qmlsettings.wsagent_jar);
        instance->agentController->start_agent(qmlsettings.synclientjson);

        ix::initNetSystem();

        instance->doclientier = new AsynClienter(appwin);

        anlog(std::format("Has volume: {}, {}: {}",
          instance->has_synode_vol(), qmlsettings.synode_id, qmlsettings.synode_vol));
      }
      return *instance;
    }

    bool has_synode_vol() {
      return !LangExt::isblank(qmlsettings.synode_id)
           && std::filesystem::exists(resolveHomePath(qmlsettings.synode_vol));
    }

    bool open_volume() {
      if (has_synode_vol()) {
        open_file_explorer(qmlsettings.synode_vol);
        return true;
      }
      return false;
    }
  };
}
