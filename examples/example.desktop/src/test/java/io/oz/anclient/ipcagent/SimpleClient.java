package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.musteq;
import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.Utils.logT;
import static io.odysz.common.Utils.warn;

import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.CloseReason;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.DeploymentException;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.LogAct;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantics.SessionInf;
import io.oz.anclient.socketier.WSEchoReq;

@ClientEndpoint
public class SimpleClient {
	public static final String funcid = "test";

	private BlockingQueue<AnsonResp> mailbox;
    Session session;

	
	final SessionInf ssInf;
	SimpleClient(SessionInf ssinf) {
		this.ssInf = ssinf;
		mailbox = new ArrayBlockingQueue<AnsonResp>(64);
	}

	@OnOpen
    public void onOpen(Session session) {
        System.out.println("Client Connected: " + session.getId());

        if (this.session == null)
        	this.session = session;
        musteq(this.session, session);
        // Send initial message to Jetty server's @OnMessage handler
        // session.getAsyncRemote().sendText("Hello from Simple Java Client!");
    }

    @OnMessage
    public void onMessage(String message) {
        System.out.println("Received from Server: " + message);
        try {
			mailbox.put((AnsonResp) Anson.fromJson(message));
		} catch (AnsonException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			warn(e.getMessage());
		}
    }
    
    @OnMessage
    public void onBinaryStream(InputStream is) {
        try {
            logT(new Object() {}, "Client is receiving a binary stream from Jetty server...");
            mailbox.put((AnsonResp) ((AnsonMsg<?>)Anson.fromJson(is)).body(0));
            logT(new Object() {}, "Stream from server completed.");
        } catch (IOException | AnsonException | InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    public void asynEcho(String msg) throws IPCException, AnsonException {
        if (session != null && session.isOpen()) {
        	EchoReq req = new WSEchoReq(msg);
			AnsonMsg<?> q = userReq(funcid, WSPort.echo, req)
					.header(header);
            try {
				session.getAsyncRemote().sendText(q.toBlock());
			} catch (IOException e) {
				e.printStackTrace();
				throw new IPCException(MsgCode.exIo, e.getMessage());
			}
        }
        else throw new IPCException(MsgCode.exIo, "Session not available.");
    }
    
    public AnsonResp nextEnvelope() throws InterruptedException {
    	return mailbox.take();
    }

    public static SimpleClient connect(TestSettings testtings, int timout)
    		throws IOException, InterruptedException, DeploymentException {

		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		container.setDefaultMaxSessionIdleTimeout(timout); 

		// String uri = "ws://localhost:8080/ipc"; // Matches your Jetty server endpoint
		// String uri = f("ws://127.0.0.1:%d/%s", testtings.ipc_port, WSAgent.ipc_path);
		String uri = testtings.wsUri();

		// Connects the endpoint class to the URI
		mustnonull(testtings.ipc_session);
		SimpleClient client = new SimpleClient(testtings.ipc_session);

		container.connectToServer(client, URI.create(uri));
		
		return client;
    }
    
	public <T extends AnsonBody> AnsonMsg<T> userReq(String uri, IPort port, T bodyItem, LogAct... act)
			throws AnsonException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<UserReq> needs port explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		bodyItem.uri(uri);
		if (act != null && act.length > 0)
			header().act(act[0]); 

		return new AnsonMsg<T>(port).header(header()).body(bodyItem);
	}

	AnsonHeader header;
	public AnsonHeader header() {
		if (header == null)
			header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		return header;
	}

	public void close() {
		if (session != null && session.isOpen()) {
			try {
				session.close(new CloseReason(
					CloseReason.CloseCodes.NORMAL_CLOSURE, 
					"Client shutting down"
				));
			} catch (IOException e) {
				warn("Error closing session: %s", e.getMessage());
			}
		}
	}
}
