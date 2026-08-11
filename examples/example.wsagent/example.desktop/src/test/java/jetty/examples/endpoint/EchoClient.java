// Reference: https://github.com/jetty/jetty-examples : example/endpoint

package jetty.examples.endpoint;

import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.warn;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

import jakarta.websocket.ClientEndpointConfig;
import jakarta.websocket.CloseReason;
import jakarta.websocket.DeploymentException;
import jakarta.websocket.Endpoint;
import jakarta.websocket.EndpointConfig;
import jakarta.websocket.MessageHandler;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

public class EchoClient {
    static int timeout = 100;

    public static List<String> performEcho(WebSocketContainer client, URI uri)
    		throws IOException, InterruptedException, DeploymentException {
        List<String> ret = new ArrayList<>();
        FlatTxtClient echoSocket = new FlatTxtClient();
        ClientEndpointConfig endpointConfig = ClientEndpointConfig.Builder.create().build();
        try (Session session = client.connectToServer(echoSocket, endpointConfig, uri)) {
        	logi("client session: %s", session.getId());
            session.getBasicRemote().sendText("Hello from " + EchoClient.class.getName());

            /**
             * Gemini: 
             * 
             * If the message is within the allowed buffer limits (or you have increased the limits),
             * the container will assemble the entire large text string and pass it to your onMessage
             * method all at once.
             * 
             * Therefore:
             * - Your messageQueue will contain exactly one entry.
             * - That single entry will be the entire large text string.
             */
            String msg = echoSocket.q_msg.poll(timeout, TimeUnit.SECONDS);
            ret.add(msg);
            session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Goodbye"));
            if (!echoSocket.closeLatch.await(timeout, TimeUnit.SECONDS))
                throw new IOException("Failed to receive WebSocket close");
        }
        return ret;
    }

    public static class FlatTxtClient extends Endpoint implements MessageHandler.Whole<String> {
        private final LinkedBlockingDeque<String> q_msg = new LinkedBlockingDeque<>();
        private final CountDownLatch closeLatch = new CountDownLatch(1);

        @Override
        public void onClose(Session session, CloseReason closeReason) {
            logi("WebSocket Close: %s", closeReason);
            closeLatch.countDown();
        }

        @Override
        public void onError(Session session, Throwable cause) {
            warn("WebSocket Error", cause);
        }

        @Override
        public void onOpen(Session session, EndpointConfig config) {
            logi("WebSocket Open: {}", session);
            session.addMessageHandler(this);
        }

        @Override
        public void onMessage(String message) {
            logi("EchoEclient onMessage: %s", message);
            q_msg.offer(message);
        }
    }
}
