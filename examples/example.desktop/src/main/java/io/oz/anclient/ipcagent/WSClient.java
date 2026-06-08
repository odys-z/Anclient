package io.oz.anclient.ipcagent;

import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.warn;
import static io.odysz.common.LangExt.is;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.mustnonull;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.common.AESHelper2;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JServUrl;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantics.x.SemanticException;
import jakarta.websocket.ClientEndpointConfig;
import jakarta.websocket.CloseReason;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.DeploymentException;
import jakarta.websocket.Endpoint;
import jakarta.websocket.EndpointConfig;
import jakarta.websocket.MessageHandler;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

public class WSClient extends Endpoint implements MessageHandler.Whole<String> {
    private final LinkedBlockingDeque<String> messageQueue = new LinkedBlockingDeque<>();
    private final CountDownLatch closeLatch = new CountDownLatch(1);

    boolean verbose;
	JServUrl jserv;

    public WSClient(JServUrl jserv, boolean... verbose) {
    	this.jserv = jserv;
    	this.verbose = is(verbose, false);
	}

	@Override
    public void onClose(Session session, CloseReason closeReason) {
        if (verbose) logi("WebSocket Close: %s", closeReason);
        closeLatch.countDown();
    }

    @Override
    public void onError(Session session, Throwable cause) {
        warn("WebSocket Error", cause);
    }

    @Override
    public void onOpen(Session session, EndpointConfig config) {
        if (verbose) logi("WebSocket Open: {}", session);
        session.addMessageHandler(this);
    }

    @Override
    public void onMessage(String message) {
        if (verbose) logi("EchoEclient onMessage: %s", message);
        messageQueue.offer(message);
    }

    public String readMessage() {
        return messageQueue.pollFirst();
    }

    WebSocketContainer wsClient;
	private Session session;

    /**
     * 
     * @param <R> Request Body
     * @param <A> Response type
     * @param req
     * @param err
     * @return response
     * @throws DeploymentException the configuration is invalid.
     * @throws InterruptedException 
     */
	@SuppressWarnings("unchecked")
	public <R extends AnsonBody, A extends AnsonResp> A commit(AnsonMsg<R> req, OnError err)
			throws SemanticException, IOException, AnsonException, DeploymentException, InterruptedException {
    	if (verbose) {
    		Utils.logi(jserv.jserv());
    		Utils.logAnson(req);
    	}
    	
    	if (isblank(req.body(0).a()))
    		throw new AnsonException(0,
    			"Since anclient.java 0.5, jserv 1.5.0, a non-empty a-tag is forced for session-required request.");
    	
    	if (this.wsClient == null)
    		this.wsClient = connect(jserv);

  		AnsonMsg<AnsonResp> resp = synSend(req);

  		MsgCode code = resp.code();

		if(verbose) {
			Utils.printCaller(false);
			Utils.logAnson(resp);
		}

		if (MsgCode.ok == code) {
			return (A) resp.body(0);
		}
		else {
			err.err(code, resp.body(0).msg());
			return null;
		}
	}
	
	/**
	 * Synchronously send.
	 * 
	 * Gemini: 
	 * 
	 * If the message is within the allowed buffer limits (or you have increased the limits),
	 * the container will assemble the entire large text string and pass it to your onMessage
	 * method all at once.
	 * 
	 * Therefore:
	 * - Your messageQueue will contain exactly one entry.
	 * - That single entry will be the entire large text string.
	 * 
	 * @param reqmsg
	 * @return
	 * @throws IOException 
	 * @throws AnsonException 
	 * @throws InterruptedException 
	 */
	AnsonMsg<AnsonResp> synSend(AnsonMsg<? extends AnsonBody> reqmsg) throws AnsonException, IOException, InterruptedException {
		mustnonull(this.wsClient);
		reqmsg.toBlock(session.getBasicRemote().getSendStream());
        String msg = messageQueue.poll(20, TimeUnit.SECONDS);

        @SuppressWarnings("unchecked")
		AnsonMsg<AnsonResp> resp = (AnsonMsg<AnsonResp>) Anson.fromJson(msg);
		return resp;
	}
	
	/**
	 * Connect to server and return the WebSocketContainer.
	 * Web Socket is a protocol for small size messages. All messages are entirely ready in queue.
	 * @param jserv
	 * @return container, the ws-client.
	 * @throws URISyntaxException 
	 * @throws DeploymentException see {@link jakarta.websocket.WebSocketContainer#connectToServer(Class, java.net.URI)} 
	 * @throws IOException 
	 */
	public WebSocketContainer connect(JServUrl jserv) throws IOException, DeploymentException {
    	WebSocketContainer wsContainer = ContainerProvider.getWebSocketContainer();
    	wsContainer.setDefaultMaxTextMessageBufferSize(AESHelper2.blockSize() + 3 * 1024);
    	
        ClientEndpointConfig endpointConfig = ClientEndpointConfig.Builder.create().build();

		this.session = wsContainer.connectToServer(this, endpointConfig, jserv.uri());
		if (verbose) logi("client session: %s", session.getId());

		return wsContainer;
	}
	
}
