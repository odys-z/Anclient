package io.oz.anclient.ipcagent;

import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.warn;
import static io.odysz.common.LangExt.is;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.mustnonull;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ScheduledExecutorService;
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
	class ReconnectionManager {
	    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
	    private int attempts = 0;
	    private final int MAX_ATTEMPTS = 10;
	    private final int BASE_DELAY_MS = 1000; // Start with 1 second

	    public void resetAttempts() {
	        this.attempts = 0;
	    }

	    public void scheduleReconnect(WSClient client) {
	        if (attempts >= MAX_ATTEMPTS) {
	            warn("Max WebSocket reconnection attempts reached. Giving up.");
	            return;
	        }

	        attempts++;
	        // Exponential backoff formula: base * 2^(attempts-1)
	        long delay = BASE_DELAY_MS * (long) Math.pow(2, attempts - 1);
	        // to prevent thundering herd problem
	        long totalDelay = delay + (long) (Math.random() * 200);

	        if (verbose) logi("Scheduling reconnect attempt #%d in %d ms%n", attempts, totalDelay);

	        scheduler.schedule(() -> {
	            try {
	                if (verbose) logi("Executing connection retry...");
	                connect(jserv);
	            } catch (Exception e) {
	                // onClose will handle rescheduling
	                warn("Reconnection initialization failed: " + e.getMessage());
	            }
	        }, totalDelay, TimeUnit.MILLISECONDS);
	    }

	    public void cleanUp() {
	        scheduler.shutdown();
	    }
	}
	
    private final LinkedBlockingDeque<String> messageQueue = new LinkedBlockingDeque<>();
    private final CountDownLatch closeLatch = new CountDownLatch(1);
    private final ReconnectionManager reconnectionManager = new ReconnectionManager();
    
    boolean verbose;
	JServUrl jserv;
	
	static int timeout = 120;

    public WSClient(JServUrl jserv, boolean... verbose) {
    	this.jserv = jserv;
    	this.verbose = is(verbose, false);
	}

    private boolean shouldReconnect(CloseReason.CloseCode code) {
        int codeValue = code.getCode();

        // 1. Check strict protocol standard fatal codes
        if (codeValue == CloseReason.CloseCodes.VIOLATED_POLICY.getCode()) {
            return false; // 1008: Server rejected client credentials/behavior
        }
        if (codeValue == CloseReason.CloseCodes.TOO_BIG.getCode()) {
            return false; // 1009: Client sent data payload exceeding server limits
        }
        if (codeValue == CloseReason.CloseCodes.NORMAL_CLOSURE.getCode()) {
            return false; // 1000: Clean, intentional teardown
        }

        // 2. Custom application-level authentication codes (3000-4999 range)
        if (codeValue >= 3000 && codeValue <= 3999) {
            // Usually reserved for explicit auth failures (expired tokens, invalid keys)
            return false; 
        }

        // 3. Reconnect on all infrastructure or transient network drops
        // Includes 1001 (Going Away / Server reboot), 1006 (Abnormal), 1011 (Unexpected condition)
        return true;
    }
    
	@Override
    public void onClose(Session session, CloseReason closeReason) {
        if (verbose) logi("WebSocket Close: %s", closeReason);
        CloseReason.CloseCode code = closeReason.getCloseCode();
        logi("Connection closed. Code: %s (%s). Reason: %s", 
                new Object[]{code.getCode(), code.toString(), closeReason.getReasonPhrase()});

        // Clear local session reference
        this.session = null;

        // Evaluate whether to reconnect based on the Close Code
        if (shouldReconnect(code)) {
            logi("Attempting scheduled reconnection...");
            reconnectionManager.scheduleReconnect(this);
        } else {
            warn("Fatal or intentional closure. Reconnection aborted.");
            reconnectionManager.cleanUp();
        }
        
        closeLatch.countDown();
    }

    @Override
    public void onError(Session session, Throwable cause) {
        warn("WebSocket Error", cause);
    }

    @Override
    public void onOpen(Session session, EndpointConfig config) {
        if (verbose) logi("WSClient onOpen: %s", session);
        session.addMessageHandler(this);
        reconnectionManager.resetAttempts();
    }

    @Override
    public void onMessage(String message) {
        if (verbose) logi("WSClient onMessage: %s", message);
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
	 * TODO requires handling input stream at server with
	 * <pre> try (OutputStream os = session.getBasicRemote().getSendStream()) {
	 *  	reqmsg.toBlock(os);
	 *  	os.flush(); // Force the data out
	 * }</pre>
	 *  
	 * @param reqmsg
	 * @return
	 * @throws IOException 
	 * @throws AnsonException 
	 * @throws InterruptedException 
	 */
	@SuppressWarnings("unchecked")
	AnsonMsg<AnsonResp> synSend(AnsonMsg<? extends AnsonBody> reqmsg)
			throws AnsonException, IOException, InterruptedException {
		mustnonull(this.wsClient);

		session.getBasicRemote().sendText(reqmsg.toBlock());
		
		String msg = null;
	    long deadLine = System.currentTimeMillis() + (timeout * 1000);
	    
	    while (System.currentTimeMillis() < deadLine) {
	        msg = messageQueue.poll(10, TimeUnit.MILLISECONDS);
	        if (msg != null) {
	            break; 
	        }
	        
	        // Crucial: Gives the embedded Jetty server/client network threads 
	        // CPU cycles to process the socket buffers
	        Thread.sleep(250); 
	    }

	    if (msg == null) {
	        throw new InterruptedException("WS sync send timed out waiting for response");
	    }

		return (AnsonMsg<AnsonResp>) Anson.fromJson(msg);
	}

	<T extends AnsonBody> void asynRequest(WSPort port, T reqbd) throws AnsonException, IOException {

		mustnonull(this.wsClient);

		AnsonMsg<T> reqmsg = new AnsonMsg<T>(port);
		reqmsg.body(reqbd);

		session.getBasicRemote().sendText(reqmsg.toBlock());
	}
	
	/**
	 * Connect to server and return the WebSocketContainer.
	 * Web Socket is a protocol for small size messages. All messages are entirely ready in queue.
	 * @param jserv
	 * @return container, the ws-client.
	 * @throws URISyntaxException 
	 * @throws DeploymentException see {@link jakarta.websocket.WebSocketContainer#connectToServer(Class, java.net.URI)} 
	 * @throws IOException 
	 * @throws InterruptedException 
	 */
	WebSocketContainer connect(JServUrl jserv) throws IOException, DeploymentException, InterruptedException {
    	WebSocketContainer wsContainer = ContainerProvider.getWebSocketContainer();
    	wsContainer.setDefaultMaxTextMessageBufferSize(AESHelper2.blockSize() + 3 * 1024);
    	
        ClientEndpointConfig endpointConfig = ClientEndpointConfig.Builder.create().build();

		this.session = wsContainer.connectToServer(this, endpointConfig, jserv.wservUri());

        String msg = messageQueue.poll(timeout, TimeUnit.SECONDS);
		if (verbose) logi("client session: %s, open-msg: %S", session.getId(), msg);

		return wsContainer;
	}

	public int block_poll(int... timeout) {
		int size = 0;
		while ((size = messageQueue.size()) == 0 && timeout != null && timeout[0] != 0) {
			try { Thread.sleep(200); }
			catch (InterruptedException e) {
				return messageQueue.size();
			} 
			timeout[0] = Math.max(0, timeout[0] - 200);
		}
		return size;
	}
}
