#pragma once

#include <string>
#include <queue>
#include <mutex>
#include <ixwebsocket/IXWebSocket.h>
#include <io/odysz/semantic/x.h>
#include <io/odysz/jprotocol.h>
#include <io/odysz/gen/doctier.hpp>

#include "gen/wsport.hpp"

namespace anson {

// using OnMsg = std::function<bool(AnsonMsg<AnsonResp> resp)>;
/**
 * @return true if the message needs to be dropped
 */
using OnMsg = std::function<void()>;

/**
 * @brief The WSClient class
 * A concurret, no-state asynchronous websocket client.
 * Users must poll on the responsed message queue, with poll().
 */
class WSClient {
protected:
    OnMsg onMsg;

public:
    WSClient() : jserv_({"", {}}) {}
    WSClient(const JServUrl& jserv, const OnMsg& onmsg);
    ~WSClient();

    void setup(const string& jserv, const string& protocol_root, const OnMsg& onmsg) {
        jserv_ = JServUrl(jserv, {protocol_root});
        onMsg = onmsg;
    }

    // template<typename R, typename A>
    // std::shared_ptr<A> commit(const AnsonMsg<R>& req, const OnError& err);

    string state();
    void connect();
    void disconnect();
    bool shouldReconnect(int code) const;
    void onMessage(const ix::WebSocketMessagePtr& msg);

    template<typename BD>
    int asynSend(const AnsonMsg<BD>& reqmsg);

    int poll();
    bool block_poll(int ms_timout = -1);
    template <typename R> AnsonMsg<R> pop_envelope();

    WSClient* on_msg(OnMsg on) { onMsg = on; return this; }
    void place_tasks(PathsPage& tasks, const WSPort port = WSPort{WSPort::ping});

private:
    // Dependencies & Configuration
    JServUrl jserv_;
    bool verbose_;
    ix::WebSocket websocket;
    static constexpr int TIMEOUT_SECS = 120;

    // Thread-safe Message Queue
    std::queue<std::string> msg_queue;

    std::mutex queueMutex_;
    std::condition_variable queueCv_;
};

// // Template method definition
// template<typename R, typename A>
// std::shared_ptr<A> WSClient::commit(const AnsonMsg<R>& req, const OnError& err2) {
//     andebug(std::format("JServ URI: {}", jserv_.jserv().c_str()));

//     if (req.body(0)->a.empty()) {
//         throw anson::SemanticException("A non-empty a-tag is forced for session-required request.");
//     }

//     if (websocket.getReadyState() != ix::ReadyState::Open) {
//         connect();
//     }

//     // Cast payload slice up to the generic base body signature
//     AnsonMsg<AnsonResp> resp = synSend(req);

//     MsgCode::Code code = resp.code;

//     if (MsgCode::Code::ok == code) {
//         return std::static_pointer_cast<A>(resp.Body());
//     } else {
//         err2(code, resp.Body().m, {});
//         return nullptr;
//     }
// }

template <typename BD>
int WSClient::asynSend(const AnsonMsg<BD>& reqmsg) {
    anwarn(reqmsg.toBlock());
    websocket.sendText(reqmsg.toBlock());
    return msg_queue.size();
}
}

template <typename R>
anson::AnsonMsg<R> anson::WSClient::pop_envelope() {
    if (msg_queue.size() == 0)
        throw SemanticException("Empty Queue");

    string top;
    {
        std::lock_guard<std::mutex> lock(queueMutex_);
        top = std::move(msg_queue.front());
        msg_queue.pop();
    }

    // anlog("TODO anlog -> andebug, pop():\n=============================");
    anlog(top);
    if (Regex::startEnvelope(top)) {
        // AnsonMsg<AnsonResp> r;
        AnsonMsg<R> r;
        Anson::from_json<AnsonMsg<R>>(top, r);
        return r;
    }
    else throw SemanticException("Message is not an envelope: " + top);
}
