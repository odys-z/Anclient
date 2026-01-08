package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.musteq;

import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.DeploymentException;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;

@ClientEndpoint
public class SimpleClient {

    private static CountDownLatch latch;
    Session session;

	@OnOpen
    public void onOpen(Session session) {
        System.out.println("Client Connected: " + session.getId());

        musteq(this.session, session);
        // Send initial message to Jetty server's @OnMessage handler
        session.getAsyncRemote().sendText("Hello from Simple Java Client!");
    }

    @OnMessage
    public void onMessage(String message) {
        System.out.println("Received from Server: " + message);
        // Once we get a response, we can count down the latch to allow main() to exit
        if (latch != null) {
            latch.countDown();
        }
    }
    
    public void asynSend(String msg) throws IPCException {
        if (session != null && session.isOpen()) {
            session.getAsyncRemote().sendText(msg);
        }
        else throw new IPCException(MsgCode.exIo, "Session not available.");
    }

    public static SimpleClient connect(TestSettings testtings) throws IOException, InterruptedException, DeploymentException {
		latch = new CountDownLatch(1);
		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		// String uri = "ws://localhost:8080/ipc"; // Matches your Jetty server endpoint
		String uri = f("ws://127.0.0.1:%d/%s", testtings.ipc_port, WSAgent.ipc_path);

		// Connects the endpoint class to the URI
		SimpleClient client = new SimpleClient();
		container.connectToServer(client, URI.create(uri));
		
		// Wait for the message to be received (latch.countDown() is called in onMessage)
		latch.await(10, TimeUnit.SECONDS);
		
		return client;
    }
}
