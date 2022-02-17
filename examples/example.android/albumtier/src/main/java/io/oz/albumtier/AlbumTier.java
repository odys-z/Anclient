package io.oz.albumtier;

import java.io.IOException;
import java.util.ArrayList;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.jclient.tier.Semantier;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.AlbumPort;
import io.oz.album.client.ClientPhotoUser;
import io.oz.album.tier.AlbumReq;
import io.oz.album.tier.AlbumReq.A;
import io.oz.album.tier.AlbumResp;
import io.oz.album.tier.Photo;

/**
 * @deprecated
 */
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

	public String download(Photo photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		AlbumReq req = new AlbumReq().download(photo);
		req.a(A.download);
		return client.download(funcUri, AlbumPort.album, req, localpath);
	}

	public AlbumResp insertPhoto(String fullpath, String clientname) throws SemanticException, IOException, AnsonException {
		AlbumReq req = new AlbumReq()
				.createPhoto(null, fullpath)  // null collect-id: have sever figure out it
				.photoName(clientname);
		req.a(A.insertPhoto);

		String[] act = AnsonHeader.usrAct("AlbumTest", "create photo", "c/photo", "test");
		AnsonHeader header = client.header().act(act);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq("test/collect", AlbumPort.album, req)
									.header(header);

		return client.commit(q, errCtx);
	}

	public void uploadPhotos(ArrayList<? extends DocsResp> list, ClientPhotoUser usr) throws IOException, AnsonException, SemanticException {
		AlbumReq req = new AlbumReq();
	    for (DocsResp f : list) {
	        req.createPhoto(f, usr);
		}
		req.a(A.insertPhoto);

		String[] act = AnsonHeader.usrAct("AlbumTest", "create photo", "c/photo", "test");
		AnsonHeader header = client.header().act(act);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq("test/collect", AlbumPort.album, req)
				.header(header);
		AlbumResp resp = client.commit(q, errCtx);
	}
}
