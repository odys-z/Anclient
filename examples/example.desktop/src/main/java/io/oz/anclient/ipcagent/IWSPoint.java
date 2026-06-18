package io.oz.anclient.ipcagent;

import java.io.IOException;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public interface IWSPoint {

	WSPort doclient = null;

	public void onMessage(AnsonMsg<? extends AnsonBody> message, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException;

	public IPort port();

}
