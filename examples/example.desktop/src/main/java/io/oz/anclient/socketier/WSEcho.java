package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WSSocket;
import io.oz.anclient.socketier.WSEchoReq.A;
import jakarta.websocket.Session;

public class WSEcho implements IPCPort {
	

	final WSSocket socket;

	public WSEcho(WSSocket wsSocket) {
		this.socket = wsSocket;
	}

	@Override
	public void onMessage(AnsonMsg<?> ansonMsg, Session session)
			throws SemanticException, TransException, AnsonException, SsException, IOException {
		WSEchoReq msg = (WSEchoReq) ansonMsg.body(0); 

		if (eq(msg.a(), A.x))
			throw new IPCException(MsgCode.ext, msg.echo);
		else
			socket.<AnsonResp>ok(session, port(),
				(AnsonResp)new AnsonResp(null, msg.echo)
				.uri(msg.uri())
				.a(msg.a()));
	}

	@Override
	public IPort port() {
		return WSPort.echo;
	}

}
