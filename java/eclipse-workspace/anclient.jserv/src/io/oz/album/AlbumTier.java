package io.oz.album;

import java.io.IOException;
import java.sql.SQLException;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.jclient.tier.Semantier;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol.SCallbackV11;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.tier.AlbumReq;
import io.oz.album.tier.AlbumReq.A;

public class AlbumTier extends Semantier {

	private SessionClient client;
	private ErrorCtx errCtx;
	private String funcUri;

	public AlbumTier(SessionClient client, ErrorCtx errCtx) {
		this.client = client;
		this.errCtx = errCtx;
	}

	public void getCollect(String collectId, SCallbackV11 onOk) throws SemanticException, IOException, SQLException, AnsonException {
		AlbumReq req = new AlbumReq(funcUri).collectId("c-001");
		req.a(A.collect);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq("test/collect", AlbumPort.album, req);
		client.commit(q, onOk, errCtx);
	}

}
