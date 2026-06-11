#include <gtest/gtest.h>
#include <ixwebsocket/IXNetSystem.h>
#include <ixwebsocket/IXWebSocket.h>
#include <iostream>
#include <chrono>
#include <thread>
#include <atomic>
#include <qDebug>
#include <io/odysz/jprotocol.h>
#include <io/odysz/semantier.h>
#include <io/odysz/gen/doctier.hpp>
#include "gen/test_settings.hpp"

namespace anson {
template <typename R>
static void sendReq(ix::WebSocket & socket, AnsonMsg<R>& req) {
    qDebug() << "[sent-req].body" << req.Body().toBlock().c_str();
    qDebug() << "[sent-req].port url" << req.port.url();

    string reqs = req.toBlock();
    socket.sendText(reqs);
}
}

static anson::AstMap asts;
static anson::JsonOpt opts{&asts};

TEST(IXWEBSOKET, HELLO) {
    register_jserv(asts, opts);
    register_doctier(asts, "ast");
    register_qmltestsettingsAst(asts);

    ix::initNetSystem();

    std::atomic<bool> keepRunning{true};
    ix::WebSocket webSocket;
    ix::SocketTLSOptions tlsOptions;
    webSocket.setTLSOptions(tlsOptions);

    bool openned = false;
    bool closed  = false;
    webSocket.setOnMessageCallback([&keepRunning, &openned, &closed](const ix::WebSocketMessagePtr& msg) {
        switch (msg->type) {
            case ix::WebSocketMessageType::Open:
                std::cout << "[Client] ✅ Connection established cleanly via OpenSSL!" << std::endl;
                std::cout << "         Target URI: " << msg->openInfo.uri << std::endl;
                std::cout << "         Protocol:   " << msg->openInfo.protocol << std::endl;
                openned = true;
                break;

            case ix::WebSocketMessageType::Message:
                std::cout << "[Client] 📥 Received message: " << msg->str << std::endl;
                if (msg->str == "bye") {
                    std::cout << "[Client] Server initiated application teardown sequence." << std::endl;
                    // keepRunning = false;
                }
                break;

            case ix::WebSocketMessageType::Close:
                std::cout << "[Client] 🛑 Connection closed by remote endpoint." << std::endl;
                std::cout << "         Code:   " << msg->closeInfo.code << std::endl;
                std::cout << "         Reason: " << msg->closeInfo.reason << std::endl;
                closed = true;
                keepRunning = false;
                break;

            case ix::WebSocketMessageType::Error:
                std::cerr << "[Client] ❌ Network Error occurred!" << std::endl;
                std::cerr << "         Description: " << msg->errorInfo.reason << std::endl;
                std::cerr << "         HTTP Status: " << msg->errorInfo.http_status << std::endl;
                keepRunning = false;
                break;

            case ix::WebSocketMessageType::Ping:
            case ix::WebSocketMessageType::Pong:
            case ix::WebSocketMessageType::Fragment:
                break;
        }
    });

    std::string url = "ws://127.0.0.1:8700/ipc";
    std::cout << "[Client] Initializing connection to " << url << "..." << std::endl;
    webSocket.setUrl(url);

    webSocket.start();

    std::cout << "[Client] Worker background thread running. Main thread free to send payloads..." << std::endl;
    
    std::this_thread::sleep_for(std::chrono::milliseconds(500));

    if (webSocket.getReadyState() == ix::ReadyState::Open) {
        anson::EchoReq echo {anson::EchoReq::A::echo};
        echo.echo = "TEST_F(Ipcproxy, PING_Proxy)... ";
        anson::AnsonMsg<anson::EchoReq> echomsg(anson::Port(anson::Port::echo), echo);
        anson::sendReq(webSocket, echomsg);
    }

    auto start = std::chrono::steady_clock::now();
    while (keepRunning) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    auto end = std::chrono::steady_clock::now();

    std::chrono::duration<double, std::milli> elapsed = end - start;
    qDebug() << "Time elapsed: " << elapsed.count() << " ms\n";

    qDebug() << "[Client] Stopping engine and cleaning up allocations...";
    webSocket.stop(); // Gracefully joins the background network worker thread

    ix::uninitNetSystem();

    ASSERT_TRUE(openned) << "openned?";
    ASSERT_TRUE(closed)  << "closed?";
}
