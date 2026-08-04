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
#include <io/odysz/module/langstring.h>

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

  public:
    Slingleton(const Slingleton&) = delete;
    Slingleton& operator=(const Slingleton&) = delete;
    Slingleton(Slingleton&&) = delete;
    Slingleton& operator=(Slingleton&&) = delete;

    static DesktopSettings appsettings;

    JavaAgentController* agentController = nullptr;

    AsynClienter* doclientier = nullptr;
    string volume_path;
    connect_state constates;

    queue<shared_ptr<AnsonResp>> synode_msgs;
    mutable std::mutex synode_mutex;

    Slingleton() {}

    static Slingleton& get_instance(slint::ComponentWeakHandle<App>& appwin,
                      const string & settings_path) {
      if (instance == nullptr) {
        instance = new Slingleton();
        register_jserv(asts, opts);
        register_semantier(asts, "ast");
        register_doctier(asts, "ast");
        register_iport<WSPort>(asts, "ast/wsport.ast.json");
        register_desktopsettingsAst(asts);
        register_langstringAst(asts);

        aninfo("Loading settings from: "s + resolveHomePath(settings_path));
        Anson::from_file(settings_path, appsettings);
        if (LangExt::isblank(appsettings.device))
          anwarn("appsetings.device is empty. file: "s + settings_path);
        else aninfo("[***** DEVICE *****] "s + appsettings.device);

        // instance->appwin = appwin;
        instance->agentController = new JavaAgentController(appsettings);
        instance->agentController->start_agent(settings_path);

        // ix::initNetSystem();
        slint::invoke_from_event_loop([&appwin]() {
          anlog("[***** ix::initNetSystem *****] Initializing network subsystems after Slint event loop is spinning ...");
          ix::initNetSystem();
        });

        AsynClienter::onErr = [&appwin](MsgCode::Code c, const string& e, vector<string>args) {
          if (!instance->validsettings()) {
            anerror(std::format("[ERROR code {}], error: {}", AnsonJavaEnumAst::name<MsgCode>(c), e));
            slint::invoke_from_event_loop([&appwin, c, &e, &args]() {
              if (auto app = appwin.lock()) {
                auto data = (*app)->global<AppState>().get_model();

                auto status_model = data.syncing_status;
                auto vec_model = std::dynamic_pointer_cast<slint::VectorModel<slint::SharedString>>(status_model);

                if (vec_model) {
                    vec_model->insert(0, "New status message");
                }

                (*app)->global<AppState>().set_model(data);

              }});
          }
        };

        instance->doclientier = new AsynClienter(appwin, [&appwin](connect_state connstates) {
          instance->constates = connstates;

          // debug notes: cannot capture outer lamda's connstates as it quit immediatly, before this one is running.
          slint::invoke_from_event_loop([&appwin]() {
            if (auto app = appwin.lock()) {
              // (*app)->set_synode_linked(instance->constates.synlink == connect_state::online);
              auto data = (*app)->global<AppState>().get_model();
              data.synode_linked = instance->constates.synlink == connect_state::online;
              (*app)->global<AppState>().set_model(data);
            }});
        });

        instance->doclientier->load_settings(settings_path);

        anlog(std::format("Has volume: {}, {}: {}",
          instance->has_synode_vol(), appsettings.synode_id, appsettings.synode_vol));
      }
      return *instance;
    }

    bool has_synode_vol() {
      return !LangExt::isblank(appsettings.synode_id)
           && std::filesystem::exists(resolveHomePath(appsettings.synode_vol));
    }

    bool open_volume() {
      if (has_synode_vol()) {
        open_file_explorer(appsettings.synode_vol);
        return true;
      }
      return false;
    }

    /**
     * To conert returns to DocsResp:
     * 
     * std::dynamic_pointer_cast<DocsResp>(returns);
     * 
     */
    shared_ptr<AnsonResp> dequeue_synode() {
      std::lock_guard<std::mutex> lock(synode_mutex);
      if (synode_msgs.size() > 0) {
        auto ret = synode_msgs.front();
        synode_msgs.pop();
        return ret;
      }
      else return nullptr;
    }

    /**
     * It's the caller's responsibility to correctly cast and retrieve the object type. Say:
     * 
     * slingle.enqueue_synode(std::make_shared<DocsResp>(msg.Body())); // allocate and copy
     * slingle.enqueue_synode(std::dynamic_cast<DocsResp>(msg.Body())); // cast to actual type at runtime, using vtable
     * 
     * shared_ptr<AnsonResp> qryptr = slingle.dequeue_synode();
     * if (!qryptr) return;
     * shared_ptr<DocsResp> qry = std::dynamic_pointer_cast<DocsResp>(qryptr);
     */
    void enqueue_synode(shared_ptr<AnsonResp> msg) {
      std::lock_guard<std::mutex> lock(synode_mutex);
      anlog("Enqueuing: "s + msg->toBlock());
      synode_msgs.push(msg);
    }

    /**
     * TODO We need a better setting validator based on semantics, maybe one generated by parser.
     */
    bool validsettings() {
      return !appsettings.java_path.empty()
          && !appsettings.synode_jserv.empty()
          && !Regex::asJserv(appsettings.synode_jserv).empty()
          && !appsettings.admin.empty()
          && !appsettings.token.empty() && appsettings.token.size() >= 4
          ;
    }

    void settings(const DesktopSettings& s) { this->appsettings = move(s); }

    /**
     * There is a validation pattern issue in slint.
     * See https://claude.ai/share/a00185d7-3a8d-460f-9c35-5fa8189b0c1f
     */
    static std::optional<std::string> validate_settings(DesktopSettings s) {
      return [&]() -> std::optional<std::string> {
              if (s.java_path.empty())                       return "Java path cannot be empty";
              if (s.synode_jserv.empty())                    return "Synode Jserv cannot be empty";
              if (auto err = validate_jserv(s.synode_jserv)) return err;
              if (s.admin.empty())                           return "Admin field cannot be empty";
              if (auto err = validate_token(s.token))        return err;
              return std::nullopt;
          }();
    }

    static std::optional<std::string> validate_jserv(const std::string& jservstr) {
      return Regex::asJserv(jservstr).empty() 
           ? std::optional<std::string>{"Invalid Jserv"} 
           : std::nullopt;
    }

    static std::optional<std::string> validate_token(const std::string& t) {
      return t.empty() || t.length() > 32 || t.length() < 4 
           ? std::optional<std::string>{"Invalid Token Length"} 
           : std::nullopt;
    }
  };
}
