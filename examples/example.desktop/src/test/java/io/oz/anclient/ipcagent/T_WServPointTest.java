/**
 * Reference: https://github.com/jetty/jetty-examples : example/endpoint
 */

package io.oz.anclient.ipcagent;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
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
import io.odysz.common.LangExt;
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
import io.odysz.semantics.x.SemanticException;
import io.oz.anclient.socketier.WSPing;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.JServUrl;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.Utils.warn;
import static org.junit.jupiter.api.Assertions.*;

public class T_WServPointTest {
    private Server server;

    AnclientSettings clientsettings;

	@BeforeEach
    public void startServerAndClient() throws Exception {
        server = T_WSAgent._main("src/test/resources/WEB-INF/settings.json");
        server.start();
        
        clientsettings = Anson.fromPath("src/test/resources/wsclient-settings.gitignore.json");
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
        pinger.connect();

		ArrayList<String> paths = new ArrayList<String>(Arrays.asList("ping-path/a", "ping-path/b"));

        List<DocsResp> reps = placeTasks(pinger, paths);

		assertEquals(5, reps.size());

		assertEquals("ping-path/a", reps.get(1).xdoc.clientpath);
		assertArrayEquals(new String[] {"0", "2", "0", "2", "rx rows bx blocks"}, LangExt.split(reps.get(1).msg()));
		assertEquals("ping-path/a", reps.get(2).xdoc.clientpath);
		assertArrayEquals(new String[] {"0", "2", "1", "2", "rx rows bx blocks"}, LangExt.split(reps.get(2).msg()));
		assertEquals("ping-path/b", reps.get(3).xdoc.clientpath);
		assertArrayEquals(new String[] {"1", "2", "0", "2", "rx rows bx blocks"}, LangExt.split(reps.get(3).msg()));
		assertEquals("ping-path/b", reps.get(4).xdoc.clientpath);
		assertArrayEquals(new String[] {"1", "2", "1", "2", "rx rows bx blocks"}, LangExt.split(reps.get(4).msg()));
    }

	private List<DocsResp> placeTasks(WSClient wsclient, ArrayList<String> paths)
			throws AnsonException, IOException, SemanticException, InterruptedException {
		ArrayList<DocsResp> pongs = new ArrayList<DocsResp>(paths.size());
		
		DocsReq reqbd = (DocsReq) new DocsReq(clientsettings.synuri)
						.device(clientsettings.sysuri)
						.a(DocsReq.A.requestSyn)
						;

		PathsPage pthpage = new PathsPage();
		for (String pth : paths)
			pthpage.add(pth);
		reqbd.syncing(pthpage);
		
		wsclient.asynRequest(WSPort.ping, reqbd);
		
		AnsonMsg<AnsonResp> resp = wsclient.block_pop(WSPing.msInterval + 500);
		while (resp != null) {
			if (resp.port() == WSPort.ping) {
				AnsonResp repbd = resp.body(0);
				if (!(repbd instanceof DocsResp))
					warn("UNEXPECTED REPLY: %s\n\t%s", repbd.getClass().getName(), repbd.msg());
				else {
					DocsResp docrep = (DocsResp) repbd;
					if (eq(docrep.a(), DocsReq.A.requestSyn))
						pongs.add(docrep);
					else warn("UNEXPECTED ACT in reply: %s", docrep.a());
				}
			}
			else warn("UNEXPECTED REPLY, port: %s", resp.port());
			resp = wsclient.block_pop(WSPing.msInterval + 1000);
		}

		return pongs;
	}
 
}
