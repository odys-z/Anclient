package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;


import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WSSocket;
import io.oz.anclient.socketier.ConfigIPCReq.A;
import jakarta.websocket.Session;

public class ConfigIPC implements IPCPort {
	final WSSocket socket;

	public ConfigIPC(WSSocket wsSocket) {
		this.socket = wsSocket;
	}
	
	@Override
	public void onMessage(AnsonMsg<?> msg, Session session)
			throws SemanticException, TransException, AnsonException, SsException, IOException {
		ConfigIPCReq req = (ConfigIPCReq) msg.body(0); 

		if (eq(req.a(), A.teardown)) {
			// TODO check tokens
			// socket.onClose(null);
			new Thread(() -> {
			    try {
			        // Wait a tiny bit to allow the WebSocket response/close frame to send
			        Thread.sleep(100); 
			        
			        socket.server.stop();
			        socket.server.join(); // Now safe because this thread isn't in Jetty's pool
			        
			        System.out.println("Server stopped successfully.");
			        System.exit(0); 
			    } catch (Exception e) {
			        e.printStackTrace();
			    }
			}).start();

			socket.<AnsonResp>ok(session, port(),
				(AnsonResp)new AnsonResp(null, "Tearing ...")
				.uri(req.uri())
				.a(req.a()));
		}
		else
			throw new IPCException(MsgCode.exGeneral, "Unsupported %s", req.a());
	}

	@Override
	public IPort port() {
		return WSPort.configIPC;
	}

}
