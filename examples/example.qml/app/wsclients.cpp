#include "wsclients.h"

#include <QDebug>
#include <gen/wsport.hpp>

namespace anson {

WSClient::WSClient(const JServUrl& jserv, const OnMsg& onmsg)
    : jserv_(jserv), onMsg(onmsg) {
    
    string ipcurl = jserv_.wservUri();
    anlog(std::format("WSClient is constructing with jserv: {}", ipcurl));
    websocket.setUrl(ipcurl);
    websocket.setPingInterval(15);
    
    websocket.disableAutomaticReconnection();

    websocket.setOnMessageCallback([this](const ix::WebSocketMessagePtr& msg) {
        this->onMessage(msg);
    });
}

WSClient::~WSClient() {
    websocket.stop();
}

void WSClient::connect() {
    websocket.start();
}

string WSClient::ipconn_state() {//     enum class ReadyState { Connecting = 0, Open = 1, Closing = 2, Closed = 3 };
    string stats[] = {Connecting, Open, Closing, Closed};
    return stats[(int)websocket.getReadyState()];
}

string WSClient::syncon_state() {
    string stats[] = {Connecting, Open, Closing, Closed};
    return stats[(int)websocket.getReadyState()];
}

void WSClient::disconnect() {
    andebug("WSClient disconnecting...");

    websocket.close();

    {
        std::lock_guard<std::mutex> lock(queueMutex_);
        std::queue<std::string> emptyQueue;
        std::swap(msg_queue, emptyQueue);
    } // auto-unlock

    queueCv_.notify_all();

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
        queueCv_.notify_one();

        onMsg();
    }
    else if (msg->type == ix::WebSocketMessageType::Open) {
        // queueCv_.notify_one(); // Wake up connection blocks
        anlog("WebSocket Open: uri = "s + msg->openInfo.uri.c_str());
    } else if (msg->type == ix::WebSocketMessageType::Pong) {
        andebug("Ping-pong (connection is alive) ...");
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

bool WSClient::block_poll(int wait_ms) {
    std::unique_lock<std::mutex> lock(queueMutex_);

    if (wait_ms <= -1) {
        std::cout << "[Poller] No timeout specified. Waiting forever...\n";
        // Wait indefinitely until the queue is not empty
        queueCv_.wait(lock, [this]() { return !msg_queue.empty(); });
    } else {
        std::cout << "[Poller] Waiting up to " << wait_ms << "ms...\n";
        // Wait for the specified duration or until the queue is not empty
        bool success = queueCv_.wait_for(lock, std::chrono::milliseconds(wait_ms), [this]() {
            return !msg_queue.empty();
        });

        // If the timeout expired and the queue is still empty, return nullopt
        if (!success)
            return false;
    }
    return true;
}

void WSClient::place_tasks(PathsPage& pthpage, const WSPort port) {
    DocsReq uploadreq{"h_photos", {}};
    uploadreq.syncingPage = {pthpage};
    uploadreq.syncingPage.end = pthpage.clientPaths.size();
    uploadreq.syncingPage.start = 0;
    uploadreq.a = DocsReq::A::requestSyn;
    AnsonMsg<DocsReq> msg(WSPort{WSPort::ping}, uploadreq);
    asynSend(msg);
}

}
