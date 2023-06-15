package io.oz.albumtier;

import static io.odysz.common.LangExt.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import org.xml.sax.SAXException;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.OnDocOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.AlbumReq;
import io.oz.album.tier.AlbumReq.A;
import io.oz.jserv.docsync.Synclientier;
import io.oz.album.tier.AlbumResp;
import io.oz.album.tier.PhotoRec;
import io.oz.album.tier.PhotoMeta;

/**
 * Photo client, a asynchronous wrapper of {@link Synclientier}.
 * 
 * @author odys-z@github.com
 *
 */
public class PhotoSyntier extends Synclientier {
	public static int blocksize = 3 * 1024 * 1024;

	protected static PhotoMeta meta;

	static {
		AnsonMsg.understandPorts(AlbumPort.album);
		try {
			// this tier won't access local db.
			meta = new PhotoMeta(null);
		} catch (TransException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @param clientUri - the client function uri this instance will be used for.
	 * @param device
	 * @param errCtx
	 * @throws IOException 
	 * @throws SAXException 
	 * @throws SQLException 
	 * @throws SemanticException 
	 */
	public PhotoSyntier(String clientUri, String device, ErrorCtx errCtx)
			throws SemanticException, IOException {
		super(clientUri, errCtx);
	}
	
	public PhotoSyntier asyLogin(String uid, String pswd, String device, OnLogin ok, OnError err) {
		Clients.loginAsync(uid, pswd, (client) -> {
			this.client = client;
			onLogin(client);
			ok.ok(client);
		}, err, device);

		return this;
	}

	public AlbumResp getCollect(String collectId) throws SemanticException, IOException, AnsonException {
		AlbumReq req = new AlbumReq(uri).collectId("c-001");
		req.a(A.collect);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq(uri, AlbumPort.album, req);
		return client.commit(q, errCtx);
	}
	
	public PhotoSyntier asyGetSettings(OnOk onOk, OnError... onErr) {
		new Thread(new Runnable() {
			public void run() {
			try {
				AnsonHeader header = client.header()
						.act("album.java", "profile", "r/settings", "load profile");

				AlbumReq req = new AlbumReq(uri);
				req.a(A.getPrefs);
				AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq(uri, AlbumPort.album, req)
						.header(header);
				AnsonResp resp = client.commit(q, errCtx);
				onOk.ok(resp);
			} catch (IOException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
			} catch (AnsonException | SemanticException e) { 
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			} 
		} } ).start();
		
		return this;
	}
	
	/**
	 * @see #syncVideos(List, OnProcess, OnDocOk, ErrorCtx...)
	 * @param videos
	 * @param proc
	 * @param docOk
	 * @param onErr
	 * @return list of response
	 * @throws TransException
	 * @throws IOException
	 */
	public PhotoSyntier asyVideos(List<? extends SyncDoc> videos,
				OnProcess proc, OnDocOk docOk, ErrorCtx ... onErr)
			throws TransException, IOException {
		new Thread(new Runnable() {
	        public void run() {
				try {
					syncVideos(videos, proc, docOk, onErr);
				} catch (TransException e) {
					e.printStackTrace();
					if (!isNull(onErr))
						onErr[0].err(MsgCode.exTransct, e.getMessage(), e.getClass().getName());
				} catch (IOException e) {
					e.printStackTrace();
					if (!isNull(onErr))
						onErr[0].err(MsgCode.exIo, e.getMessage(), e.getClass().getName());
				}
	    } } ).start();
		return this;	
	}

	/**
	 * Push up videos (larg files) with
	 * {@link #pushBlocks(String, List, OnProcess, OnDocOk, ErrorCtx...)}.
	 *
	 * @param videos
	 * @param proc
	 * @param docOk
	 * @param onErr
	 * @return list of response
	 * @throws TransException
	 * @throws IOException
	 */
	public List<DocsResp> syncVideos(List<? extends SyncDoc> videos,
				OnProcess proc, OnDocOk docOk, ErrorCtx ... onErr)
			throws TransException, IOException {
		return pushBlocks(meta.tbl, videos, proc, docOk, onErr);
	}

	public String download(PhotoRec photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		return download(uri, meta.tbl, photo, localpath);
	}

	/**
	 * @param collId
	 * @param localpath
	 * @param clientname
	 * @param share one of {@link io.odysz.semantic.ext.DocTableMeta.Share Share}'s consts.
	 * @return response
	 * @throws IOException 
	 * @throws SQLException 
	 * @throws TransException 
	 */
	public DocsResp insertPhoto(String collId, String localpath, String clientname, String share)
			throws IOException, TransException, SQLException {
		PhotoRec doc = (PhotoRec) new PhotoRec()
					.share(client.ssInfo().uid(), share, new Date())
					.fullpath(localpath);

		return synInsertDoc(meta.tbl, doc, new OnDocOk() {
			@Override
			public void ok(SyncDoc doc, AnsonResp resp)
					throws IOException, AnsonException, TransException {
			}}
		);
	}

	/**
	 * Asynchronously query synchronizing records.
	 * 
	 * @param files
	 * @param page
	 * @param onOk
	 * @param onErr
	 * @return this
	 */
	public PhotoSyntier asynQueryDocs(List<? extends SyncDoc> files, PathsPage page, OnOk onOk, OnError onErr) {
		new Thread(new Runnable() {
	        public void run() {
	        	DocsResp resp = null; 
				try {
					page.clear();
					for (int i = page.start(); i < page.end() & i < files.size(); i++) {
						SyncDoc p = files.get((int)i);
						if (isblank(p.fullpath()))
							continue;
						else page.add(p.fullpath());
					}

					resp = synQueryPathsPage(page, meta.tbl);
					try {
						onOk.ok(resp);
					} catch (AnsonException | SemanticException | IOException e) {
						e.printStackTrace();
					}
				} catch (IOException e) {
					onErr.err(MsgCode.exIo, e.getClass().getName(),
						e.getMessage(), resp == null ? null : resp.msg());
				} catch (AnsonException e) { 
					onErr.err(MsgCode.exGeneral, e.getClass().getName(),
						e.getMessage(), resp == null ? null : resp.msg());
				} catch (SemanticException e) { 
					onErr.err(MsgCode.exSemantic, e.getClass().getName(),
						e.getMessage(), resp == null ? null : resp.msg());
				} catch (TransException e) {
					onErr.err(MsgCode.exTransct, e.getClass().getName(),
						e.getMessage(), resp == null ? null : resp.msg());
				}
	        }
	    }).start();
		return this;
	}

	/**
	 * Asynchronously push photos. This is different from push/pull of jserv nodes.
	 * 
	 * @deprecated since Albumtier 0.1.9, this method also uses block chain for uploading. 
	 * 
	 * TODO: to be changed to handling short text.
	 * 
	 * @param photos
	 * @param user
	 * @param onErr
	 * @return this
	 * @throws SemanticException
	 * @throws IOException
	 * @throws AnsonException
	 */
	public PhotoSyntier asyncPhotosUp(List<? extends SyncDoc> photos, SessionInf user, OnProcess proc, OnDocOk docOk, OnError onErr)
			throws SemanticException, IOException, AnsonException {
		new Thread(new Runnable() {
	        public void run() {
				try {
					syncUp(meta.tbl, photos, client.ssInfo().uid(), proc, docOk);
				} catch (IOException e) {
					onErr.err(MsgCode.exIo, e.getClass().getName());
				} catch (AnsonException e) { 
					onErr.err(MsgCode.exGeneral, e.getClass().getName());
				} catch (SemanticException e) { 
					onErr.err(MsgCode.exSemantic, e.getClass().getName());
				} catch (TransException e) { 
					onErr.err(MsgCode.exTransct, e.getClass().getName());
				}

	    } } ).start();
		return this;
	}

	public AlbumResp selectPhotoRec(String docId, ErrorCtx ... onErr) throws SemanticException {
		throw new SemanticException("Why needed?");
	}

	public DocsResp del(String device, String clientpath) {
		return synDel(meta.tbl, device, clientpath);
	}
}
