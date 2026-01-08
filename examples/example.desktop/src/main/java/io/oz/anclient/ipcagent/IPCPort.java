package io.oz.anclient.ipcagent;

import java.io.IOException;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import jakarta.websocket.Session;

public interface IPCPort {

	WSPort doclient = null;

	public void onMessage(AnsonMsg<?> ansonMsg, Session session)
			throws SemanticException, TransException, AnsonException, SsException, IOException;

	public IPort port();

}
