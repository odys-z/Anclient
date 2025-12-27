package io.oz.anclient.ipcagent;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.eclipse.jetty.websocket.client.WebSocketClient;
import java.net.URI;
import java.util.concurrent.TimeUnit;

@WebSocket
public class SimpleClient {

	@OnWebSocketConnect
	public void onConnect(Session session) {
		System.out.println("Connected to: " + session.getRemoteAddress());
		session.getRemote().sendString("Hello Jetty 12!", null);
	}

	@OnWebSocketMessage
	public void onMessage(String message) {
		System.out.println("Received: " + message);
	}

	public static void ipc_comm(String[] args) throws Exception {
		WebSocketClient client = new WebSocketClient();
		SimpleClient socket = new SimpleClient();
		
		try {
			client.start(); // Starts internal lifecycle and HttpClient
			URI uri = new URI("ws://127.0.0.1:%s");
			client.connect(socket, uri).get(5, TimeUnit.SECONDS); 
			
			Thread.sleep(2000); // Allow time for message exchange
		} finally {
			client.stop(); // Cleanly closes all sessions and resources
		}
	}
}
