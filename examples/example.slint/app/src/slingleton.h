#pragma once

#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>

#include <io/odysz/utils.h>
#include <io/odysz/anson.h>
#include <io/odysz/entt_jserv.h>
#include <io/odysz/reflect.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/gen/semantier.hpp>
#include <io/odysz/gen/registry.hpp>
#include <io/odysz/semantic/tier/docs.h>
#include <io/odysz/module/langstring.h>

#include "gen/app_settings.hpp"
#include "gen/wsport.hpp"
#include "doclientier.h"
#include "ipcagent_manager.h"
#include "helper.h"

namespace anson {

  class Slingleton {
    static JsonOpt opts;
    static AstMap  asts;

    static JsonOpt registry_opts;
    static AstMap  registry_asts;

    static Slingleton* instance;

  public:
    Slingleton(const Slingleton&) = delete;
    Slingleton& operator=(const Slingleton&) = delete;
    Slingleton(Slingleton&&) = delete;
    Slingleton& operator=(Slingleton&&) = delete;

    static string settings_json;

    /** Desktop settings is shared accross multiple clients. */
    static DesktopSettings appsettings;

    JavaAgentController* agentController = nullptr;
    RegistryClient* registryClient = nullptr;

    AsynClienter* doclientier = nullptr;

    string volume_path;
    connect_state constates;

    slint::ComponentWeakHandle<App> window_weak; // so registry callbacks can reach the UI thread

    queue<shared_ptr<AnsonResp>> synode_msgs;
    mutable std::mutex synode_mutex;

    Slingleton() {}

    static Slingleton& get_instance(slint::ComponentWeakHandle<App>& appwin,
                      const string & settings_path) {
      if (instance == nullptr) {
        instance = new Slingleton();
        instance->window_weak = appwin;
        register_jserv(asts, opts);
        register_semantier(asts, "ast");
        register_doctier(asts, "ast");
        register_iport<WSPort>(asts, "ast/wsport.ast.json");
        register_anclientsettingsAst(asts);
        register_desktopsettingsAst(asts);
        register_langstringAst(asts);

        // settings
        aninfo("Loading settings from: "s + resolveHomePath(settings_path));
        instance->load_settings(settings_path, opts);
        if (LangExt::isblank(appsettings.device))
          anwarn("appsetings.device is empty. file: "s + settings_path);
        else {
          aninfo("[***** DEVICE *****] "s + appsettings.device);
          anlog(appsettings.toBlock(opts));
        }

        // ipc
        instance->agentController = new JavaAgentController(appsettings);
        instance->agentController->start_agent(settings_path);

        // ix::initNetSystem();
        slint::invoke_from_event_loop([&appwin]() {
          anlog("[***** ix::initNetSystem *****] Initializing network subsystems after Slint event loop is spinning ...");
          ix::initNetSystem();
        });

        // doclientier
        instance->setup_doclientier(appwin);

        // registry client 
        register_jserv(registry_asts, registry_opts);
        register_semantier(registry_asts, "ast");
        register_centralclientier(registry_asts, "ast/");
        instance->setup_regclient();

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

    bool load_settings(const string& settings_json, const JsonOpt& opts);

    RegistryClient* setup_regclient();

    AsynClienter* setup_doclientier(slint::ComponentWeakHandle<App>& appwin) ;

    void query_orgdoms(const string & domid) {
      slint::invoke_from_event_loop([this]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          profile.detail_label = "Loading organization domains ...";
          profile.org_name = appsettings.org_name;
          (*app)->global<UserProfile>().set_model(profile);
        }
      });

      registryClient->asyquery_orgdoms(appsettings.org,
        [this](AnsonResp& resp) { on_org_domains(static_cast<RegistResp&>(resp)); },
        AsynClienter::onErr);
    }

    void on_org_domains(RegistResp& res) {
      vector<string> domains(res.orgDomains.begin(), res.orgDomains.end());

      string configured = appsettings.domain;
      string selected = domains.empty() ? "" : domains.front();
      for (auto& d : domains) if (d == configured) { selected = d; break; }

      slint::invoke_from_event_loop([this, domains, selected]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          vector<slint::SharedString> sl;
          for (auto& d : domains) sl.push_back(slint::SharedString(d));

          profile.domains_list = std::make_shared<slint::VectorModel<slint::SharedString>>(sl);
          profile.domain_selected = slint::SharedString(selected);
          profile.detail_label = domains.empty() ? "No domains found." : "Loading synodes ...";
          (*app)->global<UserProfile>().set_model(profile);

          if (!selected.empty())
            query_domnodes(string{profile.domain_selected}, selected);
        }
      });

    }

    void query_domnodes(const string & org, const string& domain) {
      registryClient->asyquery_domconfig(org, domain,
        [this](AnsonResp& resp) { on_domnodes(static_cast<RegistResp&>(resp)); },
        AsynClienter::onErr);
    }

    void on_domnodes(RegistResp& res) {
      vector<string> synodes;
      for (auto& peer : res.diction.peers) synodes.push_back(peer.synid);

      string configured = appsettings.synode_id;
      string selected = synodes.empty() ? "" : synodes.front();

      for (auto& s : synodes) if (s == configured) { selected = s; break; }

      string jserv;
      for (auto& peer : res.diction.peers) if (peer.synid == selected) {
        jserv = peer.jserv;
      }

      slint::invoke_from_event_loop([this, synodes, selected, jserv]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          vector<slint::SharedString> sl;
          for (auto& s : synodes) sl.push_back(slint::SharedString(s));
          profile.synodes_list = std::make_shared<slint::VectorModel<slint::SharedString>>(sl);
          profile.synode_selected = slint::SharedString(selected);
          profile.detail_label = synodes.empty() ? "No synodes found in domain." : "Ready.";

          (*app)->global<UserProfile>().set_model(profile);
        }
      });
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
          && !appsettings.domain_token.empty() && appsettings.domain_token.size() >= 4
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
              if (auto err = validate_token(s.domain_token)) return err;
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
