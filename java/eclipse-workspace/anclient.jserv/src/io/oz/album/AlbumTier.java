package io.oz.album;

import java.io.IOException;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.jclient.tier.Semantier;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.tier.AlbumReq;
import io.oz.album.tier.AlbumReq.A;
import io.oz.album.tier.AlbumResp;

public class AlbumTier extends Semantier {

	private SessionClient client;
	private ErrorCtx errCtx;
	private String funcUri;

	public AlbumTier(SessionClient client, ErrorCtx errCtx) {
		this.client = client;
		this.errCtx = errCtx;
	}

	public AlbumResp getCollect(String collectId) throws SemanticException, IOException, AnsonException {
		AlbumReq req = new AlbumReq(funcUri).collectId("c-001");
		req.a(A.collect);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq("test/collect", AlbumPort.album, req);
		return client.commit(q, errCtx);
	}

}
