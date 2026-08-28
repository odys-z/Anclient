#pragma once

#include <algorithm>
#include <chrono>

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
#include "doclientier.h"
#include "ipcagent_manager.h"
#include "helper.h"

namespace anson {

  class Slingleton {

    static JsonOpt registry_opts;
    static AstMap  registry_asts;

    static Slingleton* instance;

    static AstMap  asts;
  public:
    static JsonOpt opts;

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
        register_jserv(&opts);
        register_semantier(&opts, "ast");
        register_doctier(&opts, "ast");
        register_anclient_cmake(&opts, "ast");
        register_desktopsettingsAst(&opts);
        register_langstringAst(&opts);

        // AsynClienter::registerCtx("ipc");

        // settings, and validate as some fields is enforced for going on
        aninfo("Loading settings from: "s + resolveHomePath(settings_path));
        instance->load_settings(settings_path, opts);
        instance->validsettings();

        if (auto err = validate_settings(appsettings))
          anwarn(std::format("App setings is invalid, file: {}, error: {}", settings_path, *err));
        else {
          aninfo("[***** DEVICE *****] "s + appsettings.device);
          anlog(std::format("org   : {}\ndomain: {}\ndevice: {}\nsynode: {}\njserv : {}\nregistry: {}",
              appsettings.org, appsettings.domain, appsettings.device, appsettings.synode_id, appsettings.synode_jserv, appsettings.regiserv));
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
        instance->setup_doclientier(appwin, &opts);

        // registry client 
        register_jserv(&registry_opts);
        register_semantier(&registry_opts, "ast");
        register_centralclientier(&registry_opts, "ast/");
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

    void setup_regclient();

    void setup_doclientier(slint::ComponentWeakHandle<App>& appwin, const JsonOpt* ctx = &opts) ;

    void query_orgdoms(const string & orgid) {
      slint::invoke_from_event_loop([this]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          profile.detail_label = "Loading organization domains ...";
          profile.org_name = appsettings.org_name;
          (*app)->global<UserProfile>().set_model(profile);
        }
      });

      registryClient->asyquery_orgdoms(orgid,
        [this](AnsonResp& resp) {
            RegistResp& r = static_cast<RegistResp&>(resp); // no copy
            anlog("asyquery_orgdoms() resp: "s + r.toBlock(registry_opts));
            on_org_domains(r); },
        AsynClienter::onErr);
    }

    void on_org_domains(RegistResp& res) {
      //
      anlog("on_org_domains(): \n"s + res.toBlock(registry_opts));

      vector<string> domains(res.orgDomains.begin(), res.orgDomains.end());

      string configured = appsettings.domain;
      if (!configured.empty() && std::find(domains.begin(), domains.end(), configured) == domains.end())
        domains.insert(domains.begin(), configured);

      string selected = !configured.empty() ? configured : (domains.empty() ? "" : domains.front());
      int selectIx = LangExt::ix(domains, selected);

      slint::invoke_from_event_loop([this, domains, selected, selectIx]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          vector<slint::SharedString> sl;
          for (auto& d : domains) sl.push_back(slint::SharedString(d));

          profile.domains_list = std::make_shared<slint::VectorModel<slint::SharedString>>(sl);
          profile.domain_selected = slint::SharedString(selected);
          profile.domain_selected_idx = selectIx;
          profile.detail_label = domains.empty() ? "No domains found." : "Loading synodes ...";
          (*app)->global<UserProfile>().set_model(profile);

          /*
          // Same node-combo ComboBox quirk as domain-combo (slint-ui/slint#5214,
          // #7632): re-assert domain_selected on a real later tick — nesting
          // another invoke_from_event_loop() here isn't enough, since both
          // callbacks can drain in the same iteration before the engine
          // actually repaints the ComboBox against the new model. A short
          // single_shot timer forces an actual separate pass.
          anlog("+++++++++++++++++++++* triggering in single slot... "s + selected);
          slint::Timer::single_shot(std::chrono::milliseconds(3000), [this, selected]() {
            anlog("********************** triggered in single slot..."s + selected);
            slint::invoke_from_event_loop([this, selected]() {
              if (auto app2 = window_weak.lock()) {
                auto profile2 = (*app2)->global<UserProfile>().get_model();
                profile2.domain_selected = slint::SharedString(selected);
                (*app2)->global<UserProfile>().set_model(profile2);
              }
            });
          });
          */

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
      anlog("on_domnodes(), handling: "s + res.toBlock(registry_opts));
      vector<string> synodes;
      for (auto& peer : res.diction.peers) synodes.push_back(peer.synid);

      string configured = appsettings.synode_id;
      string selected = synodes.empty() ? "" : synodes.front();
      // int    selectIx = synodes.empty() ? -1 : 0;

      for (auto& s : synodes) if (s == configured) { selected = s; break; }
      int selectIx = LangExt::ix(synodes, selected);

      string jserv;
      for (auto& peer : res.diction.peers) if (peer.synid == selected) {
        jserv = peer.jserv;
      }

      vector<Synode> peers = res.diction.peers;

      slint::invoke_from_event_loop([this, synodes, peers, selected, selectIx, jserv]() {
        if (auto app = window_weak.lock()) {
          auto profile = (*app)->global<UserProfile>().get_model();
          vector<slint::SharedString> sl;
          vector<slint::SharedString> jservlst;
          for (auto& p : peers) {
              sl.push_back(slint::SharedString(p.synid));
              jservlst.push_back(slint::SharedString(p.jserv));
          }
          profile.jserv_list = std::make_shared<slint::VectorModel<slint::SharedString>>(jservlst);
          profile.synodes_list = std::make_shared<slint::VectorModel<slint::SharedString>>(sl);
          profile.synode_selected = slint::SharedString(selected);
          profile.synode_selected_idx = selectIx;
          profile.detail_label = synodes.empty() ? "No synodes found in domain." : "Ready.";

          if (!jserv.empty())
              profile.synode_jserv = jserv;

          (*app)->global<UserProfile>().set_model(profile);

          /*
          // Same fix as domain-combo: a real timer, not a nested
          // invoke_from_event_loop(), to force an actual later render pass.
          slint::Timer::single_shot(std::chrono::milliseconds(50), [this, selected]() {
            slint::invoke_from_event_loop([this, selected]() {
              if (auto app2 = window_weak.lock()) {
                auto profile2 = (*app2)->global<UserProfile>().get_model();
                profile2.synode_selected = slint::SharedString(selected);
                (*app2)->global<UserProfile>().set_model(profile2);
              }
            });
          });
          */
        }
      });
    }

    void on_select_synode(const slint::SharedString synid) {
        slint::invoke_from_event_loop([this, synid]() {
            if (auto app = window_weak.lock()) {

                auto profile = (*app)->global<UserProfile>().get_model();
                slint::SharedString jserv_select;
                for (int i = 0; i < profile.synodes_list->row_count(); i++)
                    if (synid == profile.synodes_list->row_data(i).value()) {
                        jserv_select = profile.jserv_list->row_data(i).value();
                        anlog(std::format("profile.synodes_list[{:d}] = {}, jserv_list[{}] : {}; ",
                                          i, std::string_view(synid), i, std::string_view(jserv_select)));
                        break;
                    }
                profile.synode_jserv = jserv_select;
                (*app)->global<UserProfile>().set_model(profile);
            }
        });
    }

    void on_test_synlogin(const slint::ComponentHandle<App>& ui,
                          const string& uid, const string& pswd, const string& pswd2, const string& synjserv) {

        if (auto err = validate_jserv(synjserv)) {
            insert_status(ui, err.value());
            return;
        }
        if (auto err = validate_token(pswd)) {
            insert_status(ui, err.value());
            return;
        }
        if (pswd != pswd) {
            insert_status(ui, "The password and teh confirm are not the same.");
            return;
        }

        std::string msg{std::format("login {} -> {}", uid, synjserv)};
        insert_status(ui, msg);

        SessionClient ssclient{JServUrl{synjserv, &opts}, {}, {}};

        ssclient.loginWithUri(appsettings.sysuri, uid, pswd, "test-device",
                              [ui, this](MsgCode::Code c, const string& e, const vector<string>& args) {
            insert_status(ui, e);
        });

        if (!ssclient.ssInf.ssid.empty())
            insert_status(ui, "Ok!");
    }

    void ping_synode(const slint::ComponentHandle<App>& ui,
                     const string& org, const string& domain, const string& synid, const string& ui_jserv) {
        std::string msg{std::format("Pinging {}/{}/{} : {}", org, domain, synid, ui_jserv)};
        insert_status(ui, msg);
        // Desgin / Debug Notes
        // use temp jserv, not doclientier's
        // Error popped here because there is no wrapper like asyquery_domconfig() etc.
        try {
            AnsonResp resp = Clients::pingLess(JServUrl{ui_jserv, &opts},
                                      appsettings.sysuri, "ping by slingleton", AsynClienter::onErr);
            insert_status(ui, resp.m);
        }
        catch (const std::exception& e) {
            anerror(e.what());
            AsynClienter::onErr(MsgCode::Code::exIo, e.what(), {});
        }
        catch (...) {
            anerror("Caught unknown exception.");
        }
        insert_status(ui, {"Pinging OK: "s + ui_jserv});
    }

    void on_register_device(const slint::ComponentHandle<App>& ui, const DesktopSettings& s_inst) {
        doclientier->asy_register_dev(s_inst);
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
      anlog("Enqueuing: "s + msg->toBlock(opts));
      synode_msgs.push(msg);
    }

    std::optional<std::string> update_regjserv(const string& url) {
        if (auto err = validate_jserv(url)) return err;
        registryClient->setjserv(url);
        return std::nullopt;
    }

    /**
     * TODO We need a better setting validator based on semantics, maybe one generated by parser.
     */
    bool validsettings() {
        // can only be hacked
        LangExt::mustnonull(appsettings.market_id);
        LangExt::mustnonull(appsettings.synuri);
        LangExt::mustnonull(appsettings.sysuri);
        LangExt::mustnonull(appsettings.java_path);
        LangExt::mustnonull(appsettings.wsagent_jar);
        LangExt::mustnonull(appsettings.wshost);
        LangExt::mustin(appsettings.wsport, 1024, 65536);
        LangExt::mustnonull(appsettings.regiserv);

        return !appsettings.synode_jserv.empty()
            && !appsettings.device.empty()
            && !appsettings.org.empty()
            && !Regex::asJserv(appsettings.synode_jserv).empty()
            && !appsettings.admin.empty()
            && !appsettings.domain_token.empty() && appsettings.domain_token.size() >= 4
            ;
    }

    void settings(const DesktopSettings& s) { this->appsettings = std::move(s); }

    void save_settings(const string& pth) {
        anlog(std::format(R"("saving settings:
        market: {}, market_name: {}
        sysuri: {}, synuri: {}")",
        appsettings.market_id, appsettings.market_name,
        appsettings.sysuri, appsettings.synuri
        ));
        appsettings.to_file(pth, &opts);
    }

    /**
     * There is a validation pattern issue in slint.
     * See https://claude.ai/share/a00185d7-3a8d-460f-9c35-5fa8189b0c1f
     */
    static std::optional<std::string> validate_settings(DesktopSettings s) {
      return [&]() -> std::optional<std::string> {
            if (s.device.empty())		return "device id is empty";
            if (s.market_id.empty())		return "market id is empty";
            if (s.domain.empty()) 	    return "domain id is mepty";
            if (s.org.empty())		    return "org id is empty";
            if (s.synode_id.empty())	return "synode id is empty";
            if (s.java_path.empty())    return "Java path cannot be empty";
            if (s.synode_jserv.empty()) return "Synode Jserv cannot be empty";
            if (s.admin.empty())        return "Admin field cannot be empty";
            if (auto err = validate_jserv(s.synode_jserv)) return err;
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
