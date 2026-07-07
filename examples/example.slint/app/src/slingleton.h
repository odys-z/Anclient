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

namespace anson {

  class Slingleton {
    static JsonOpt opts;
    static AstMap  asts;
    static Slingleton* instance;
    static QMLAppSettings qmlsettings;

    JavaAgentController* agentController = nullptr;

    WSClient* wsclient = nullptr;

  public:
    AsynClienter* doclientier = nullptr;

    Slingleton() {}

    static Slingleton& get_instance() {
      if (instance == nullptr) {
          instance = new Slingleton();
          register_jserv(asts, opts);
          register_semantier(asts, "");
          register_doctier(asts, "ast");
          register_iport<WSPort>(asts, "ast/wsport.ast.json");
          register_qmltestsettingsAst(asts);

          Anson::from_file("settings/app-settings.json", qmlsettings);

          instance->agentController = new JavaAgentController(qmlsettings.java_path, qmlsettings.wsagent_jar);
          instance->agentController->start_agent(qmlsettings.wsagent_settings);

          ix::initNetSystem();

          instance->doclientier = new AsynClienter();
      }
      return *instance;
    }
  };
}
