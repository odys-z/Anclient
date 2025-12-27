package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;

import org.eclipse.jetty.websocket.api.Session;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.transact.x.TransException;

public class T_Doclient extends Doclient {

	@Override
	public void onMessage(AnsonBody body, Session session)
			throws AnsonException, SsException, IOException, TransException {

		DocsReq req = (DocsReq)body;

		if (eq(req.a(), "test"))
			session.getRemote().sendStringByFuture("Decode this: step next.");
		else super.onMessage(body, session);
	}

}
