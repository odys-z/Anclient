#include "wsclients.h"

namespace anson {

WSClient::WSClient(const JServUrl& jserv, const OnMsg& onmsg)
    : jserv_(jserv), onMsg(onmsg) {
    
    // IXWebSocket automatically handles backoff and reconnection policies in a background thread.
    // We bind its configuration parameters natively to achieve what ReconnectionManager did.
    websocket.setUrl(jserv_.wservUri());
    websocket.setPingInterval(30); // 30 seconds keepalive
    
    // Configure automatic reconnection parameters mirroring the Java custom rules
    websocket.enableAutomaticReconnection();
    // webSocket_.setMaxReconnectionAttempts(10);
    // webSocket_.setMinWaitBetweenReconnections(1000); // 1 Second base delay

    // Bind event callback
    websocket.setOnMessageCallback([this](const ix::WebSocketMessagePtr& msg) {
        this->onMessage(msg);
    });
}

WSClient::~WSClient() {
    websocket.stop();
}

void WSClient::connect() {
    websocket.start();

    // Emulate waiting for the connection event or initial welcome packet if required
    // std::unique_lock<std::mutex> lock(queueMutex_);
    // bool success = queueCv_.wait_for(lock, std::chrono::seconds(TIMEOUT_SECS), [this] {
    //     return websocket.getReadyState() == ix::ReadyState::Open;
    // });

    // if (!success && verbose_) {
    //     std::cerr << "WS connection timed out or failed initialization." << std::endl;
    // }
}

ix::ReadyState WSClient::state() {
    return websocket.getReadyState();
}

void WSClient::disconnect() {
    andebug("WSClient disconnecting...");

    websocket.close();

    {
        std::lock_guard<std::mutex> lock(queueMutex_);
        std::queue<std::string> emptyQueue;
        std::swap(msg_queue, emptyQueue);
    } // auto-unlock

    // queueCv_.notify_all();

    anlog("WSClient disconnected successfully.");
}

bool WSClient::shouldReconnect(int code) const {
    if (code == 1008) return false; // Violated Policy
    if (code == 1009) return false; // Message too big
    if (code == 1000) return false; // Normal closure

    if (code >= 3000 && code <= 3999) {
        return false;
    }

    return true;
}

void WSClient::onMessage(const ix::WebSocketMessagePtr& msg) {
    if (msg->type == ix::WebSocketMessageType::Message) {
        if (verbose_) {
            printf("WSClient onMessage: %s\n", msg->str.c_str());
        }
        {
            std::lock_guard<std::mutex> lock(queueMutex_);
            msg_queue.push(msg->str);
        } // auto-unlock
        // queueCv_.notify_one();

        // AnsonMsg<AnsonResp> env;
        // Anson::from_json(msg_queue.front(), env);
        // if (onMsg(env)) {
        //     std::lock_guard<std::mutex> lock(queueMutex_);
        //     msg_queue.pop();
        // }
    } 
    else if (msg->type == ix::WebSocketMessageType::Open) {
        // queueCv_.notify_one(); // Wake up connection blocks
        anlog("WebSocket Open: uri = "s + msg->openInfo.uri.c_str());
    }
    else if (msg->type == ix::WebSocketMessageType::Close) {
        anlog(std::format("Connection closed. Code: {:d}. Reason: {:s}",
                          msg->closeInfo.code, msg->closeInfo.reason));

        if (!shouldReconnect(msg->closeInfo.code)) {
            anlog("Fatal or intentional closure. Reconnection aborted.");
            websocket.disableAutomaticReconnection(); // Abort engine retries
        }
    } 
    else if (msg->type == ix::WebSocketMessageType::Error) {
        anwarn("WebSocket Error: "s + msg->errorInfo.reason);
    }
}

int WSClient::poll() {
    return msg_queue.size();
}

int WSClient::block_poll(int ms_timeout) {
    int s;
    while ((s = msg_queue.size()) == 0 && ms_timeout != 0) {
        this_thread::sleep_for(200ms);
        if (ms_timeout > 0)
            ms_timeout = max(0, ms_timeout - 200);
    }
    return s;
}

AnsonMsg<AnsonResp> WSClient::pop_envelope() {
    if (msg_queue.size() == 0)
        throw SemanticException("Empty Queue");


    string top;
    {
        std::lock_guard<std::mutex> lock(queueMutex_);
        top = msg_queue.front();
        msg_queue.pop();
    }
    anlog("TODO anlog -> andebug, pop():\n=============================");
    anlog(top);
    if (Regex::startEnvelope(top)) {
        AnsonMsg<AnsonResp> r;
        Anson::from_json(top, r);
        return r;
    }
    else throw SemanticException("Message is not an envelope: " + top);
}


}
