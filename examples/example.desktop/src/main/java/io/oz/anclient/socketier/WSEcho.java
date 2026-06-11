package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.Utils.logi;

import java.io.IOException;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantic.jserv.echo.EchoReq.A;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WServPoint;
import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class WSEcho implements IPCPort {
	

	final WServPoint socket;

	public WSEcho(WServPoint wsSocket) {
		this.socket = wsSocket;
	}

	@Override
	public void onMessage(AnsonMsg<?> ansonMsg, Basic synremote, Async asyremote)
			throws SemanticException, TransException, AnsonException, SsException, IOException {
		logi("WSEcho.onMessage()");

		EchoReq msg = (EchoReq) ansonMsg.body(0); 

		if (!eq(msg.a(), A.echo))
			throw new IPCException(MsgCode.ext, "expecting act of msg.echo");
		else {
			logi("WSEcho.onMessage(), a = echo");
			socket.<AnsonResp>ok(synremote, port(),
				(AnsonResp)new AnsonResp(null, msg.echo)
				.uri(msg.uri())
				.a(msg.a()));
		}
	}

	@Override
	public IPort port() {
		return WSPort.echo;
	}

}
