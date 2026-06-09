// Reference: https://github.com/jetty/jetty-examples : example/endpoint

package io.oz.anclient.ipcagent;

import java.net.URI;
import java.util.List;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import jetty.examples.endpoint.EchoClient;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.odysz.common.Utils.logi;

import static org.junit.jupiter.api.Assertions.*;
//import static org.hamcrest.MatcherAssert.assertThat;
//import static org.hamcrest.Matchers.contains;

public class T_WSAgent_EchoTest {
    private Server server;
    private WebSocketContainer wsClient;

    @BeforeEach
    public void startServerAndClient() throws Exception {
        T_EchoEndpoint.token = "token: 123456";
        server = T_WSAgent._main("src/test/resources/WEB-INF/settings.json");
        server.start();
        wsClient = ContainerProvider.getWebSocketContainer();
    }

    @AfterEach
    public void stopAll() {
        LifeCycle.stop(server);
    }

    @Test
    public void testEcho() throws Exception {
        URI uri = new URI("ws", server.getURI().getAuthority(), "/" + T_EchoEndpoint.pointpath, null, null);
        
        logi("Client performing echo to %s", uri.toString());
        List<String> msgs = EchoClient.performEcho(wsClient, uri);
		String[] expected = { "token: 123456" };

        // assertThat(msgs, contains(expected));
        assertEquals(msgs.get(0), expected[0]);
    }
}
