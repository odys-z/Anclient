package io.oz.anclient.socketier;

import java.io.IOException;
import io.odysz.anson.AnsonException;
import io.odysz.jclient.syn.Doclientier;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WServPoint;
import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class Doclient implements IPCPort {
	public static final String func_uri = "/syn/ipc/doclient";
	
	public static class IPC_A {
		public static final String login = "ws/login";
		public static final String push = "ws/push";
	}
	
	Doclientier doctier;

	final WServPoint socket;

	public Doclient(WServPoint wsSocket) {
		socket = wsSocket;
	}

//	@Override
//	public void onMessage(AnsonMsg<?> msg, Session session)
//			throws AnsonException, SsException, IOException, TransException {
//
//		DocsReq req = (DocsReq)msg.body(0);
//		String jserv = WSAgent.settings.synodeJserv();
//		
//		if (eq(req.a(), IPC_A.login))
//			doctier.loginWithUri(jserv, func_uri, null, null);
//
//		else if (eq(req.a(), IPC_A.push)) {
//			List<IFileDescriptor> videos = null;
//
//			OnProcess proc = (r, rs, bx, bs, resp) -> {
//				session.getBasicRemote().sendText("Processing your request...");
//				return false;
//			};
//			OnDocsOk docsOk = null;
//			OnError onErr = null;
//
//			doctier.startPushs(null, req.doc.tabl(), videos, proc, docsOk, onErr);
//		}
//	}

	@Override
	public IPort port() {
		return WSPort.doclient;
	}

	@Override
	public void onMessage(AnsonMsg<? extends AnsonBody> message, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException {
		// TODO Auto-generated method stub
	}
}
