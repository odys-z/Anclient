package io.oz.anclient.ipcagent;

import java.io.IOException;

import org.eclipse.jetty.websocket.api.Session;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;

abstract public class IPCPort <T extends AnsonBody> {

	public abstract void onMessage(AnsonBody req, Session session)
			throws SemanticException, AnsonException, SsException, IOException, TransException;

}
