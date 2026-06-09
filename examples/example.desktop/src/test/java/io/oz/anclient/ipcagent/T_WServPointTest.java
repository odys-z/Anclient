/**
 * Reference: https://github.com/jetty/jetty-examples : example/endpoint
 */

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

import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantic.jserv.echo.EchoReq.A;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.JServUrl;

import static org.junit.jupiter.api.Assertions.*;

public class T_WServPointTest {
    private Server server;

//    @SuppressWarnings("serial")
	@BeforeEach
    public void startServerAndClient() throws Exception {
//	    AgentSettings settings = Anson.fromPath("src/test/resources/WEB-INF/settings.json");
//        server = T_WSAgent.createServer(new ArrayList<ServerEndpointConfig.Builder> () {
//        	{ add (ServerEndpointConfig.Builder
//        		.create(T_EchoEndpoint.class, "/" + T_EchoEndpoint.pointpath));};
//        	{ add (ServerEndpointConfig.Builder
//        		.create(WServPoint.class, "/" + T_WSAgent.ipc_path)
//        		.configurator(new ServerEndpointConfig.Configurator() {
//        				@SuppressWarnings("unchecked")
//						@Override
//	                    public <T> T getEndpointInstance(Class<T> clazz) {
//	                        return (T) WServPoint.build(settings);
//	                    }
//        		}));}
//        }, settings);
//        server.start();

        server = T_WSAgent._main("src/test/resources/WEB-INF/settings.json");
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

        URI uri = new URI("ws", server.getURI().getAuthority(), "/" + T_EchoEndpoint.pointpath, null, null);

        List<String> msgs = EchoClient.performEcho(wsClient, uri);
		// String expected = "session openned: " + T_EchoEndpoint.lastSession.getId();
		String expected = "token: Bonjour";

        assertEquals(msgs.get(0), expected);
    }

    @Test
    public void testServPoint() throws Exception {
        JProtocol p = new JProtocol(T_WSAgent.ipc_path);
        JServUrl jserv = new JServUrl(p, false, "localhost", 8700);

        WSClient wsclient = new WSClient(jserv, true);
        
		EchoReq req = new EchoReq("слава Україні");
		req.a(A.echo);
        AnsonMsg<AnsonBody> msgs = SessionClient.userReq(null, "/ipc/test.java", Port.echo, req);

        AnsonResp resp = wsclient.commit(msgs, (MsgCode code, String m, String ... args) -> {
        		fail(m);
        	});

        assertEquals(resp.msg(), "слава Україні");
    }
}
