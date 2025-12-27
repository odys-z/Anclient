package io.oz.anclient.ipcagent;
import java.net.InetAddress;
import java.util.HashMap;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;

import io.odysz.anson.Anson;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;

@WebSocket
public class WSSocket {

    final HashMap<Port, IPCPort<?>> ipcPorts;

	public static WSSocket build(String[] wsports) {
		return new WSSocket(new HashMap<Port, IPCPort<?>>(wsports.length));
	}

	public WSSocket(HashMap<Port, IPCPort<?>> ports) {
		this.ipcPorts = ports;
	}

	@OnWebSocketConnect
    public void onConnect(Session session) {
        InetAddress remoteAddress = session.getRemoteAddress().getAddress();
        
        // Check if the address is a loopback address
        if (!remoteAddress.isLoopbackAddress()) {
        	// white list is configured in WSAgent. This can still be used for priority I believe.
            System.out.println("1008: warning on non-local connection from: " + remoteAddress);
            // session.close(1008, "Only local connections allowed");
            return;
        }
        
        System.out.println("Connected: " + remoteAddress);
    }

	@OnWebSocketMessage
    public void onMessage(Session session, String message) {
        System.out.println("Received: " + message);
        try {
            // Echo the message back to the client
            // session.getRemote().sendString("Echo: " + message);
            AnsonMsg<?> req = (AnsonMsg<?>) Anson.fromJson(message);
            Port p = (Port) req.port();
            if (ipcPorts.containsKey(p)) {
            	ipcPorts.get(p).onMessage(req.body(0), session);
            }
            else ; //err(p);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        System.out.println("Closed: " + reason);
    }

    @OnWebSocketError
    public void onError(Throwable cause) {
        cause.printStackTrace();
    }
}