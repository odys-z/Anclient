package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;
import java.util.List;

import org.eclipse.jetty.websocket.api.Session;

import io.odysz.anson.AnsonException;
import io.odysz.jclient.syn.Doclientier;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCPort;

public class Doclient extends IPCPort<DocsReq> {
	
	public static class IPC_A {
		public static final String login = "ws/login";
		public static final String push = "ws/push";
	}
	
	Doclientier doctier;


	@Override
	public void onMessage(AnsonBody body, Session session)
			throws AnsonException, SsException, IOException, TransException {

		DocsReq req = (DocsReq)body;
		
		if (eq(req.a(), IPC_A.login))
			doctier.loginWithUri(null, null, null, null);

		else if (eq(req.a(), IPC_A.push)) {
			List<IFileDescriptor> videos = null;

			OnProcess proc = (r, rs, bx, bs, resp) -> {
				session.getRemote().sendStringByFuture("Processing your request...");
				return false;
			};
			OnDocsOk docsOk = null;
			OnError onErr = null;

			doctier.startPushs(null, req.doc.tabl(), videos, proc, docsOk, onErr);
		}
	}
}
