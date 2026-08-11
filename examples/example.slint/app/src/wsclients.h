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

    inline static const string sysuri = "/sys/cpp";
    inline static const string synuri = "/syn/cpp";

    inline static const string Connecting = "Connecting";
    inline static const string Open = "Open";
    inline static const string Closing = "Closing";
    inline static const string Closed = "Closed";

    WSClient(const JServUrl& jserv, const OnMsg& onmsg);
    WSClient(const JsonOpt* ctx) : jserv_("ipc", ctx) {}

    ~WSClient();

    // void setup(const string& jserv, const string& protocol_root, const JsonOpt* ctx, const OnMsg& onmsg);

    string ipconn_state();

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
    // void place_tasks(PathsPage& tasks, const WSPort port = WSPort{jserv_.jprotocol.ctx, WSPort::docstier});
    void place_tasks(PathsPage& tasks, const string& port_name = WSPort::docstier) { place_tasks(tasks, WSPort{jserv_.jprotocol.ctx}); }
    void place_tasks(PathsPage& tasks, const WSPort& p);

private:
    JServUrl jserv_;
    bool verbose_;
    ix::WebSocket websocket;
    static constexpr int TIMEOUT_SECS = 120;

    std::queue<std::string> msg_queue;

    std::mutex queueMutex_;
    std::condition_variable queueCv_;
};

template <typename BD>
int WSClient::asynSend(const AnsonMsg<BD>& reqmsg) {
    anlog(reqmsg.toBlock(*jserv_.jprotocol.ctx));
    websocket.sendText(reqmsg.toBlock(*jserv_.jprotocol.ctx));
    return msg_queue.size();
}

template <typename R>
AnsonMsg<R> WSClient::pop_envelope() {
    if (msg_queue.size() == 0)
        throw SemanticException("Empty Queue");

    string top;
    {
        std::lock_guard<std::mutex> lock(queueMutex_);
        top = std::move(msg_queue.front());
        msg_queue.pop();
    }

    anlog(top);
    if (Regex::startEnvelope(top)) {
        AnsonMsg<R> r{jserv_.jprotocol.ctx};
        Anson::from_json<AnsonMsg<R>>(top, r, jserv_.jprotocol.ctx);
        return r;
    }

    if (Regex::start_with(top, "session openned: ")) {
        aninfo("Popping and ignoring expected message: "s + top);
        AnsonMsg<R> r{jserv_.jprotocol.ctx};
        r.code = MsgCode::Code::_sentinel_;
        return r;
    }
    else throw SemanticException("Message is not an envelope: " + top);
}

}
