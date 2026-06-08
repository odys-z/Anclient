/**
 * Reference: https://github.com/jetty/jetty-examples : example/endpoint
 */

package io.oz.anclient.ipcagent;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import jakarta.websocket.server.ServerEndpointConfig;
import jetty.examples.endpoint.EchoClient;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;
import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.JServUrl;

import static org.junit.jupiter.api.Assertions.*;

public class T_WServPointTest {
    private Server server;

    @SuppressWarnings("serial")
	@BeforeEach
    public void startServerAndClient() throws Exception {
	    AgentSettings settings = Anson.fromPath("src/test/resources/WEB-INF/settings.json");
        server = T_WSAgent._main2(new ArrayList<ServerEndpointConfig.Builder> () {
        	{ add (ServerEndpointConfig.Builder
        		.create(T_EchoEndpoint.class, "/" + T_EchoEndpoint.endpath));};
        	{ add (ServerEndpointConfig.Builder
        		.create(WServPoint.class, "/" + T_WSAgent.ipc_path)
        		.configurator(new ServerEndpointConfig.Configurator() {
        				@SuppressWarnings("unchecked")
						@Override
	                    public <T> T getEndpointInstance(Class<T> clazz) {
	                        return (T) WServPoint.build(server, settings);
	                    }
        		}));}
        }, settings);
        server.start();
    }

    @AfterEach
    public void stopAll() {
        LifeCycle.stop(server);
    }

    @Test
    public void testEcho() throws Exception {

    	WebSocketContainer wsClient;
        wsClient = ContainerProvider.getWebSocketContainer();
        T_EchoEndpoint.token = "token: Bonjour";

        URI uri = new URI("ws", server.getURI().getAuthority(), "/" + T_EchoEndpoint.endpath, null, null);

        List<String> msgs = EchoClient.performEcho(wsClient, uri);
		// String expected = "session openned: " + T_EchoEndpoint.lastSession.getId();
		String expected = "token: Bonjour";

        assertEquals(msgs.get(0), expected);
    }

    @Test
    public void testServPoint() throws Exception {
        // URI uri = new URI("ws", server.getURI().getAuthority(), "/" + WSAgent.ipc_path, null, null);
        JProtocol p = new JProtocol(WSAgent.ipc_path);
        JServUrl jserv = new JServUrl(p, false, "localhost", 8700);

        WSClient wsclient = new WSClient(jserv, true);
        AnsonMsg<AnsonBody> msgs = SessionClient.userReq(null, "", Port.echo, null);
        AnsonResp resp = wsclient.commit(msgs, null);
		String expected = "session openned: " + WServPoint.lastSession.getId();

        assertEquals(resp.msg(), expected);
    }
}
