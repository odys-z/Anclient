/**
 * Reference: https://github.com/jetty/jetty-examples : example/endpoint
 */

package io.oz.anclient.ipcagent;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import jetty.examples.endpoint.EchoClient;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.jclient.AnclientSettings;
import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantic.jserv.echo.EchoReq.A;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.JServUrl;

//import static io.odysz.common.Utils.logi;
import static org.junit.jupiter.api.Assertions.*;

public class T_WServPointTest {
    private Server server;

    AnclientSettings clientsettings;

	@BeforeEach
    public void startServerAndClient() throws Exception {
        server = T_WSAgent._main("src/test/resources/WEB-INF/settings.json");
        server.start();
        
        clientsettings = Anson.fromPath("");
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
    
    @Test
    public void testTaskPing() throws Exception {
        JProtocol p = new JProtocol(T_WSAgent.ipc_path);
        JServUrl jserv = new JServUrl(p, false, "localhost", 8700);
        
        WSClient pinger = new WSClient(jserv, true);

		ArrayList<String> paths = new ArrayList<String>() {
			private static final long serialVersionUID = 1L;
			{add("ping-path/a");}
			{add("ping-path/b");}
		};

        List<DocsResp> reps = placeTasks(pinger, paths);


		assertEquals(reps.size(), paths.size());

		for (int i = 0; i < paths.size(); i++)
			assertEquals(reps.get(0), paths.get(0));
    }

	private List<DocsResp> placeTasks(WSClient wsclient, ArrayList<String> paths)
			throws AnsonException, IOException {
		ArrayList<DocsResp> pongs = new ArrayList<DocsResp>(paths.size());
		
		DocsReq reqbd = new DocsReq(clientsettings.synuri);

		for (String pth : paths)
			reqbd.syncing(new PathsPage().add(pth));
		
		wsclient.asynRequest(WSPort.ping, reqbd);
		
		while (wsclient.block_poll(500) > 0) {
			DocsResp resp = wsclient.pop_envelope();
			pongs.add(resp);
		}

		return pongs;
	}
 
}
