// Credits to https://github.com/jetty/jetty-examples : example/endpoint
// 

package io.oz.anclient.ipcagent;

import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.warn;

import jakarta.websocket.CloseReason;
import jakarta.websocket.Endpoint;
import jakarta.websocket.EndpointConfig;
import jakarta.websocket.MessageHandler;
import jakarta.websocket.RemoteEndpoint;
import jakarta.websocket.Session;

/**
 */
public class T_EchoEndpoint extends Endpoint implements MessageHandler.Whole<String> {
    static String token;

	protected static final String endpath = "t_echo";

    static Session lastSession;
    private RemoteEndpoint.Async remote;

    @Override
    public void onClose(Session session, CloseReason close) {
        super.onClose(session, close);
        session = null;
        this.remote = null;
        logi("WebSocket Close: %s - %s", close.getCloseCode(), close.getReasonPhrase());
    }

    @Override
    public void onOpen(Session session, EndpointConfig config) {
        T_EchoEndpoint.lastSession = session;
        this.remote = session.getAsyncRemote();
        logi("WebSocket Open: %s", session);
        // attach echo message handler
        session.addMessageHandler(this);
        this.remote.sendText(token == null ? "" : token);
    }

    @Override
    public void onError(Session session, Throwable cause) {
        super.onError(session, cause);
        warn("WebSocket Error", cause);
    }

    @Override
    public void onMessage(String message) {
        logi("Echoing back text message [%s]", message);
        this.remote.sendText(message);
    }
}
