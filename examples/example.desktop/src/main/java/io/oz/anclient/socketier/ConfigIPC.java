package io.oz.anclient.socketier;

import java.io.IOException;


import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCPort;
import io.oz.anclient.ipcagent.WSPort;
import jakarta.websocket.Session;

public class ConfigIPC implements IPCPort {

	@Override
	public void onMessage(AnsonMsg<?> req, Session session)
			throws SemanticException, TransException, AnsonException, SsException, IOException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public IPort port() {
		return WSPort.configIPC;
	}

}
