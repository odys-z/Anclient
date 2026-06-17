package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.Utils.logi;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.anson.JsonOpt;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.socketier.WSDoctier;
import io.oz.anclient.socketier.WSEcho;
import jakarta.websocket.CloseReason;
import jakarta.websocket.Endpoint;
import jakarta.websocket.EndpointConfig;
import jakarta.websocket.MessageHandler;
import jakarta.websocket.OnError;
import jakarta.websocket.RemoteEndpoint;
import jakarta.websocket.RemoteEndpoint.Basic;
import jakarta.websocket.Session;

//@ServerEndpoint(value = "/" + WSAgent.ipc_path)
public class WServPoint extends Endpoint implements MessageHandler.Whole<String> {

    static WServPoint instance;
    public static WServPoint instance() { return instance; }

	protected final HashMap<IPort, WSPointPort> ipcPorts;
	/** {"host:port": session} */
	protected final HashMap<String, Session> sessions;


	public static WServPoint build(AgentSettings settings) {
		mustnonull(settings.tiers);
		instance = new WServPoint(settings.tiers);
		return instance;
	}
	

	private RemoteEndpoint.Async asyremote;
	private RemoteEndpoint.Basic synremote;
	static Session lastSession;

	public WServPoint() {
		ipcPorts = new HashMap<IPort, WSPointPort>();
		sessions = new HashMap<String, Session>();
		instance = this;
	}

	public WServPoint(String[] tiernames) {
		ipcPorts = new HashMap<IPort, WSPointPort>(tiernames.length);

		WSPointPort wsp = new WSEcho(this);
		ipcPorts.put(wsp.port(), wsp);

		wsp = new WSDoctier(this);
		ipcPorts.put(wsp.port(), wsp);

		sessions = new HashMap<String, Session>();
	}

	public InetSocketAddress updateRemote(Session session) {
	    InetSocketAddress addr = (InetSocketAddress) 
	            session.getUserProperties().get("jakarta.websocket.endpoint.remoteAddress");
	    
	    sessions.put(f("%s:%s", addr.getHostString(), addr.getPort()), session);
	    
	    return addr;
	}

	protected AnsonMsg<AnsonResp> err(MsgCode code, Exception e, Object ... args) {
		AnsonMsg<AnsonResp> msg = new AnsonMsg<AnsonResp>(null, code);
		AnsonResp bd = new AnsonResp(msg,
				// TODO let's send the e object back to client
				e.getMessage());

		return msg.body(bd);
	}
	
	/**
	 * Write message to resp.
	 * 
	 * @param resp can be null if user handled response already
	 * @param msg
	 * @param opts
	 */
	protected void write(Session resp, AnsonMsg<? extends AnsonResp> msg, JsonOpt... opts) {
		try {
			if (msg != null) {
				try (OutputStream o = resp.getBasicRemote().getSendStream()) {
					msg.toBlock(o, opts);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public <U extends AnsonResp> AnsonMsg<U> ok(Basic remote, IPort p, U body) {
		AnsonMsg<U> msg = new AnsonMsg<U>(p, MsgCode.ok);
		msg.body(body);
		write(remote, msg);
		return msg;
	}
	
    @Override
    public void onClose(Session session, CloseReason reason) {
        System.out.println("WSPoint Closed: " + reason);
    }

    @OnError
    public void onError(Throwable cause) {
        cause.printStackTrace();
    }

	public void sendEnvelope(String string, OnOk object) {
	}

	@Override
	public void onOpen(Session session, EndpointConfig config) {
		logi("WSPoint onOpen: %s", session.getRequestURI().toString());

        lastSession = session;
        this.asyremote  = session.getAsyncRemote();
        this.synremote  = session.getBasicRemote();
        
        session.addMessageHandler(this);
        this.asyremote.sendText("session openned: " + session.getId());
	}

    @Override
    public void onMessage(String message) {
        logi("WServPoint onMessage: %s", message);
        try {
            AnsonMsg<?> req = (AnsonMsg<?>) Anson.fromJson(message);
            IPort p = req.port();
            ipcPorts.get(p).onMessage(req, synremote, asyremote);
        } catch (AnsonException e) {
			write(synremote, err(MsgCode.ext, e, e.code()));
        } catch (TransException e) {
			write(synremote, err(MsgCode.exSemantic, e));
        } catch (IOException e) {
			write(synremote, err(MsgCode.exIo, e));
        } catch (SsException e) {
			write(synremote, err(MsgCode.exSession, e));
        } catch (Exception e) {
            e.printStackTrace();
			write(synremote, err(MsgCode.exGeneral, e));
        }
    }
    
	protected void write(RemoteEndpoint.Basic remote, AnsonMsg<? extends AnsonResp> msg, JsonOpt... opts) {
		try {
			if (msg != null) {
				// try (OutputStream o = remote.getSendStream()) { msg.toBlock(o, opts); }
				remote.sendText(msg.toBlock(opts));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}