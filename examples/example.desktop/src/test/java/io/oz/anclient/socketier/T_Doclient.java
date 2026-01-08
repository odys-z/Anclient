package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;

import java.io.IOException;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.transact.x.TransException;
import jakarta.websocket.Session;

public class T_Doclient extends Doclient {

	@Override
	public void onMessage(AnsonMsg<?> msg, Session session)
			throws AnsonException, SsException, IOException, TransException {

		DocsReq req = (DocsReq)msg.body(0);

		if (eq(req.a(), "test"))
			session.getAsyncRemote().sendText("Decode this: step next.");
		else super.onMessage(msg, session);
	}

}
