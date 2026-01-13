package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.mustnonull;

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
import io.oz.anclient.socketier.T_Doclient;
import io.oz.anclient.socketier.WSEcho;
import jakarta.websocket.CloseReason;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/" + WSAgent.ipc_path)
public class WSSocket {

    static WSSocket instance;
    public static WSSocket instance() { return instance; }

	protected final HashMap<IPort, IPCPort> ipcPorts;
	/** {"host:port": session} */
	protected final HashMap<String, Session> sessions;

	public static WSSocket build(AgentSettings settings) {
		mustnonull(settings.tiers);
		instance = new WSSocket(settings.tiers);
		return instance;
	}

	public WSSocket(String[] tiernames) {
		ipcPorts = new HashMap<IPort, IPCPort>(tiernames.length);

		T_Doclient p = new T_Doclient(this);
		ipcPorts.put(p.port(), p);
		
		WSEcho e = new WSEcho(this);
		ipcPorts.put(e.port(), e);

		sessions = new HashMap<String, Session>();
	}

	@OnOpen
    public void onOpen(Session session) {

		InetSocketAddress remote = updateRemote(session);

		if (remote != null) {
			// int port = remoteAddress.getPort();
			System.out.println("New connection from: " + remote.getHostString() + ":" + remote.getPort());
	        
        
			// Check if the address is a loopback address
			if (!remote.getAddress().isLoopbackAddress()) {

				// white list is configured in WSAgent. This can still be used for priority I believe.
				System.out.println("1008: warning on non-local connection from: " + remote.getHostString());
				// session.close(1008, "Only local connections allowed");
				return;
			}
			
			System.out.println("Connected: " + remote.getHostString());
		}
    }
	
	public InetSocketAddress updateRemote(Session session) {
	    InetSocketAddress addr = (InetSocketAddress) 
	            session.getUserProperties().get("jakarta.websocket.endpoint.remoteAddress");
	    
	    sessions.put(f("%s:%s", addr.getHostString(), addr.getPort()), session);
	    
	    return addr;
	}

	@OnMessage
    public void onMessage(Session session, String message) {
        System.out.println("[WS Agent] Received: " + message);
        try {
            // Echo the message back to the client
            // session.getRemote().sendString("Echo: " + message);
            AnsonMsg<?> req = (AnsonMsg<?>) Anson.fromJson(message);
            IPort p = req.port();

            if (ipcPorts.containsKey(p)) {
            	ipcPorts.get(p).onMessage(req.addr(updateRemote(session).getHostString()), session);
            }
            else ; //err(p);
        } catch (AnsonException e) {
			write(session, err(MsgCode.ext, e, e.code()));
        } catch (TransException e) {
			write(session, err(MsgCode.exSemantic, e));
        } catch (IOException e) {
			write(session, err(MsgCode.exIo, e));
        } catch (SsException e) {
			write(session, err(MsgCode.exSession, e));
        } catch (Exception e) {
            e.printStackTrace();
			write(session, err(MsgCode.exGeneral, e));
        }
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

	public <U extends AnsonResp> AnsonMsg<U> ok(Session session, IPort p, U body) {
		AnsonMsg<U> msg = new AnsonMsg<U>(p, MsgCode.ok);
		msg.body(body);
		write(session, msg);
		return msg;
	}
	
    @OnClose
    public void onClose(CloseReason reason) {
        System.out.println("Closed: " + reason);
    }

    @OnError
    public void onError(Throwable cause) {
        cause.printStackTrace();
    }

	public void sendEnvelope(String string, OnOk object) {
	}
}