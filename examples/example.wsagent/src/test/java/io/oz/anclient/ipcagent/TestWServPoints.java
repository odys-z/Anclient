/**
 * Reference: https://github.com/jetty/jetty-examples : example/endpoint
 */

package io.oz.anclient.ipcagent;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
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

import io.odysz.anson.AnsonException;
import io.odysz.common.CheapIO;
import io.odysz.common.LangExt;
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
import io.oz.anclient.app.DesktopSettings;
import io.oz.anclient.socketier.WSPing;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.JServUrl;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.Utils.warn;
import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.pause;
import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("unused")
public class TestWServPoints {
    private Server server;

    DesktopSettings  appsettings;

	@BeforeEach
    public void startServerAndClient() throws Exception {
        server = T_WSAgent._main("src/test/resources/WEB-INF/desktop-settings.gitignore.json");
        server.start();
        
        appsettings    = T_WSAgent.settings; 
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
        JServUrl jserv = new JServUrl(p, false, "localhost", appsettings.wsport);

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
        JServUrl jserv = new JServUrl(p, false, "localhost", appsettings.wsport);
        
        WSClient pinger = new WSClient(jserv, true);
        pinger.connect();

		ArrayList<String> paths = new ArrayList<String>(Arrays.asList("ping-path/a", "ping-path/b"));

        List<DocsResp> reps = placeTasks_ping(pinger, paths);

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

	@SuppressWarnings("deprecation")
	private List<DocsResp> placeTasks_ping(
			WSClient wsclient, ArrayList<String> paths)
			throws AnsonException, IOException, SemanticException, InterruptedException {
		return placeTasks(appsettings, WSPort.ping, wsclient, paths);
	}

	@SuppressWarnings("deprecation")
	private List<DocsResp> placeTasks_upload(WSClient wsclient, ArrayList<String> paths)
			throws AnsonException, IOException, SemanticException, InterruptedException {
		return placeTasks(appsettings, WSPort.docstier, wsclient, paths);
	}

	static List<DocsResp> placeTasks(DesktopSettings settings,
			@SuppressWarnings("deprecation") WSPort wsport,
			WSClient wsclient, ArrayList<String> paths)
			throws AnsonException, IOException, SemanticException, InterruptedException {
		ArrayList<DocsResp> pongs = new ArrayList<DocsResp>(paths.size());
		
		DocsReq reqbd = (DocsReq) new DocsReq(settings.synuri)
						.device(settings.sysuri)
						.a(DocsReq.A.requestSyn);

		PathsPage pthpage = new PathsPage();
		for (String pth : paths)
			pthpage.add(pth);
		reqbd.syncing(pthpage);
		
		wsclient.asynRequest(wsport, reqbd);
		
		AnsonMsg<AnsonResp> resp = wsclient.block_pop(WSPing.msInterval + 500);
		while (resp != null) {
			if (
				// c++ with polymorphism registered should expecting this: 
				resp.port() == wsport
				// java test with jprotocol setup as Port should expecting this:
			  || resp.port() == Port.ping || resp.port() == Port.docstier) {
				AnsonResp repbd = resp.body(0);
				if (!(repbd instanceof DocsResp))
					warn("UNEXPECTED REPLY: %s\n\t%s", repbd.getClass().getName(), repbd.msg());
				else {
					DocsResp docrep = (DocsResp) repbd;
					if (!eq(docrep.a(), DocsReq.A.requestSyn))
						warn("UNEXPECTED ACT in reply: %s", docrep.a());
					pongs.add(docrep);
				}
			}
			else warn("UNEXPECTED REPLY, port: %s", resp.port());
			resp = wsclient.block_pop(WSPing.msInterval + 1000);
		}

		return pongs;
	}
	
    @Test
    public void testTaskUpload() throws Exception {
    	logi("======================= test upload ==========================");

        JProtocol p = new JProtocol(T_WSAgent.ipc_path);
        JServUrl jserv = new JServUrl(p, false, appsettings.wshost, appsettings.wsport);
        
        WSClient pusher = new WSClient(jserv, true);
        pusher.connect();

		ArrayList<String> paths = new ArrayList<String>(Arrays
									.asList(CheapIO.genTestFile("src/test/resources/182x121.png", "png")));

        List<DocsResp> reps = placeTasks_upload(pusher, paths);


		// pause("Press enter to quite ...");
		assertTrue(reps.size() >= 3);

		String fullpath = reps.get(reps.size() - 1).xdoc.clientpath;
		logi(fullpath);
		assertNotNull(fullpath);
		assertTrue(Files.exists(Path.of(fullpath)));
    }
}
