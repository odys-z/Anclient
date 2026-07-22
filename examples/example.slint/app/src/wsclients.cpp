#include <filesystem>

#include "wsclients.h"

#include "gen/wsport.hpp"

namespace anson {

namespace fs = std::filesystem;

/**
 * @brief Constructs a WSClient instance with the specified JServUrl and message callback.
 */
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

void WSClient::setup(const string& jserv, const string& protocol_root, const OnMsg& onmsg) {
    jserv_ = JServUrl(jserv, {protocol_root});
    onMsg = onmsg;

    string ipcurl = jserv_.wservUri();
    aninfo(std::format("[****** WSClient ******] Constructing with jserv: {}", ipcurl));
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

/**
 * @return WSClient::Connecting | WSClient::Open | WSClient::Closing | WSClient::Closed;
 */
string WSClient::ipconn_state() {
    const string stats[] = {Connecting, Open, Closing, Closed};
    int s = static_cast<int>(websocket.getReadyState());
    if (s >= 0 && s < static_cast<int>(sizeof(stats) / sizeof(stats[0])))
        return stats[s];
    else return Closed;
}

void WSClient::disconnect() {
    andebug("WSClient disconnecting...");

    websocket.close();
    websocket.stop();

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
        if (!shouldReconnect(msg->closeInfo.code)) {
            anlog("Fatal or intentional closure. Reconnection aborted.");
            websocket.disableAutomaticReconnection(); // Abort engine retries
        }

        {
            std::lock_guard<std::mutex> lock(queueMutex_);
        }
        queueCv_.notify_all();

        anlog(std::format("Connection closed. Code: {:d}. Reason: {:s}",
                          msg->closeInfo.code, msg->closeInfo.reason));
    }
    else if (msg->type == ix::WebSocketMessageType::Error) {
        anwarn("WebSocket Error: "s + msg->errorInfo.reason);
        queueCv_.notify_all();
        // ISSUE slint ui helper: can update ui with a static helper
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
    uploadreq.device = Device{pthpage.device, pthpage.device, pthpage.device};
    uploadreq.syncingPage = pthpage;
    uploadreq.a = DocsReq::A::requestSyn;
    AnsonMsg<DocsReq> msg(port, std::move(uploadreq));

    anlog("-----------------------------------------------\n" + msg.toBlock());
    asynSend(msg);
}

}
