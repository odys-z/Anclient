package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;
import java.util.List;

import io.odysz.anson.AnsonException;
import io.odysz.jclient.syn.Doclientier;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSAgent;
import io.oz.anclient.ipcagent.WSPort;
import jakarta.websocket.Session;

public class Doclient implements IPCPort {
	public static final String func_uri = "/syn/ipc/doclient";
	
	public static class IPC_A {
		public static final String login = "ws/login";
		public static final String push = "ws/push";
	}
	
	Doclientier doctier;

	@Override
	public void onMessage(AnsonMsg<?> msg, Session session)
			throws AnsonException, SsException, IOException, TransException {

		DocsReq req = (DocsReq)msg.body(0);
		String jserv = WSAgent.settings.synodeJserv();
		
		if (eq(req.a(), IPC_A.login))
			doctier.loginWithUri(jserv, func_uri, null, null);

		else if (eq(req.a(), IPC_A.push)) {
			List<IFileDescriptor> videos = null;

			OnProcess proc = (r, rs, bx, bs, resp) -> {
				session.getBasicRemote().sendText("Processing your request...");
				return false;
			};
			OnDocsOk docsOk = null;
			OnError onErr = null;

			doctier.startPushs(null, req.doc.tabl(), videos, proc, docsOk, onErr);
		}
	}

	@Override
	public IPort port() {
		return WSPort.doclient;
	}
}
