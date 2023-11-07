package io.oz.albumtier;

import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;
import static io.oz.albumtier.AlbumContext.clientUri;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.DocLocks;
import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.InsecureClient;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.OnDocOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.AlbumReq;
import io.oz.album.tier.AlbumReq.A;
import io.oz.album.tier.AlbumResp;
import io.oz.album.tier.PhotoMeta;
import io.oz.album.tier.PhotoRec;

/**
 * Photo client,
 * 
 * @deprecated only for MVP (0.3.x)
 * 
 * @author odys-z@github.com
 *
 */
public class PhotoSyntier extends SynclientierMvp {
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
	 */
	public PhotoSyntier(String clientUri, String device, OnError errCtx)
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

	IFileProvider fileProvider;
	public PhotoSyntier fileProvider(IFileProvider p) {
		this.fileProvider = p;
		return this;
	}

	public AlbumResp getCollect(String collectId) throws SemanticException, IOException, AnsonException {
		AlbumReq req = new AlbumReq(uri).collectId("c-001");
		req.a(A.collect);
		AnsonMsg<AlbumReq> q = client.<AlbumReq>userReq(uri, AlbumPort.album, req);
		return client.commit(q, errCtx);
	}

	public SessionClient client () { return this.client; }

	/**
	 * Get this user's settings from port album.less.
	 *
	 * For album-jserv 0.6.50, the webroot is configured in org's field.
	 *
	 * port: album + A.getPrefs
	 *
	 * @return this
	 */
	public PhotoSyntier asyGetSettings(OnOk onOk, OnError... onErr) {
	  new Thread(() -> {
		try {
			AnsonHeader header = client.header()
					.act("album.java", "profile", "r/settings", "load profile");

			AlbumReq req = new AlbumReq(uri);
			req.a(A.getPrefs);
			AnsonMsg<AlbumReq> q = client.userReq(uri, AlbumPort.album, req)
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
	  }).start();
	  return this;
	}

	public PhotoSyntier asyAvailableDevices(OnOk ok, ErrorCtx... onErr) throws IOException, SemanticException {
		new Thread(() -> {
			try {
				AnsonHeader header = client.header()
						.act(uri, "devices", "r/devices", "restore devices");

				AlbumReq req = new AlbumReq(uri);
				req.a(DocsReq.A.devices);
				AnsonMsg<AlbumReq> q = client.userReq(uri, AlbumPort.album, req)
						.header(header);
				AnsonResp resp = client.commit(q, errCtx);
				ok.ok(resp);
			} catch (IOException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
			} catch (AnsonException | SemanticException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			}
		}).start();
		return this;
	}

	/**
	 * @see #syncVideos(List, OnProcess, OnDocOk, OnError...)
     *
	 * @return list of response
	 */
	public PhotoSyntier asyVideos(List<? extends SyncDoc> videos,
				OnProcess proc, OnDocOk docOk, OnError ... onErr)
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
	 * {@link #pushBlocks(String, List, OnProcess, OnDocOk, OnError...)}
	 *
	 * @return list of response
	 */
	public List<DocsResp> syncVideos(List<? extends SyncDoc> videos,
				OnProcess proc, OnDocOk docOk, OnError ... onErr)
			throws TransException, IOException {
		return pushBlocks(meta.tbl, videos, proc, docOk, onErr);
	}

	/**
	 * Upward pushing with BlockChain
	 * 
	 * @param tbl doc table name
	 * @param videos any doc-table managed records, of which uri shouldn't be loaded,
	 * e.g. use {@link io.odysz.transact.sql.parts.condition.Funcall#extFile(String) extFile()} as sql select expression.
	 * - the method is working in stream mode
	 * @return list of response
	 */
	public List<DocsResp> pushBlocks(String tbl, List<? extends SyncDoc> videos,
				OnProcess proc, OnDocOk docOk, OnError ... onErr)
				throws TransException, IOException {
		OnError err = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		return pushBlocks(client, uri, tbl, videos, fileProvider,
        					proc, docOk, err, blocksize);
	}

	/**
	 * MEMO: what about have Anson.toBlock() support input stream field?
	 * 
	 * @return response list for each block
	 * @throws SemanticException block information is incorrect, e.g. con not find device id.
	 * @throws IOException file access error
	 */
	public static List<DocsResp> pushBlocks(SessionClient client, String uri, String tbl,
								List<? extends SyncDoc> videos, IFileProvider fileProvider,
								OnProcess proc, OnDocOk docOk, OnError errHandler, int blocksize)
			throws SemanticException, IOException {

		SessionInf user = client.ssInfo();
		DocsResp startAck = null;
		DocsResp respi = null;

		String[] act = AnsonHeader.usrAct("synclient.java", "sync", "c/sync", "push blocks");
		AnsonHeader header = client.header().act(act);

		List<DocsResp> reslts = new ArrayList<>(videos.size());

		for ( int px = 0; px < videos.size(); px++ ) {

			FileInputStream ifs = null;
			int seq = 0;
			int totalBlocks = 0;

			SyncDoc p = videos.get(px);
			fileProvider.meta(p);
			DocsReq req = new AlbumReq(uri)
					.folder(fileProvider.saveFolder())
					.share(p)
					.device(new Device(user.device, null))
					.resetChain(true)
					.blockStart(p, user);

			AnsonMsg<DocsReq> q = client.userReq(uri, AlbumPort.album, req)
									.header(header);

			try {
				startAck = client.commit(q, errHandler);

				String pth = p.fullpath();
				if (!pth.equals(startAck.doc.fullpath()))
					Utils.warn("Resp is not replied with exactly the same path: %s", startAck.doc.fullpath());

				totalBlocks = p.size == 0 ? 0 : 1 + (int) ((p.size - 1 ) / blocksize);

				if (proc != null) proc.proc(videos.size(), px, 0, totalBlocks, startAck);

				DocLocks.reading(p.fullpath());
				ifs = (FileInputStream) fileProvider.open(p);

				byte[] buf = new byte[blocksize];
				int cur = 0;
				while (cur < p.size) {
					if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

					String b64 = AESHelper.encode64(buf, ifs, 0, blocksize - cur);
					cur += blocksize;
					req = new AlbumReq(tbl).blockUp(seq, p, b64, user);
					seq++;

					q = client.userReq(uri, AlbumPort.album, req)
							.header(header);

					respi = client.commit(q, errHandler);
				}
                
				req = new AlbumReq(tbl).blockEnd(respi, user);

				q = client.userReq(uri, AlbumPort.album, req)
							.header(header);
				respi = client.commit(q, errHandler);
				if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

				if (docOk != null) docOk.ok(respi.doc, respi);
				reslts.add(respi);
			}
			catch (IOException | TransException | AnsonException ex) { 
				Utils.warn("[%s] %s", ex.getClass().getName(), ex.getMessage());

				if (startAck != null) {
					req = new DocsReq(tbl).blockAbort(startAck, user);
					req.a(DocsReq.A.blockAbort);
					AnsonMsg<DocsReq> abt = client.<DocsReq>userReq(uri, AlbumPort.album, req)
							.header(header);
					// Abort
					new Thread( () -> {
						try {
							client.commit(abt, errHandler);
						} catch (Exception e) {
							e.printStackTrace();
						} } ).start();
				}
				if (ex instanceof IOException)
					continue;
				else errHandler.err(MsgCode.exGeneral, ex.getMessage(), ex.getClass().getName(), isblank(ex.getCause()) ? null : ex.getCause().getMessage());
			}
			finally {
				if (ifs != null)
					ifs.close();
				DocLocks.readed(p.fullpath());
			}
		}

		return reslts;
	}

	public String download(PhotoRec photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		return download(uri, meta.tbl, photo, localpath);
	}

	/**
	 * Asynchronously query synchronizing records.
	 * 
	 * @return this
	 */
	public PhotoSyntier asynQueryDocs(List<? extends SyncDoc> files, PathsPage page, OnOk onOk, OnError onErr) {
		new Thread(() -> {
			DocsResp resp = null;
			try {
				page.clear();
				for (int i = page.start(); i < page.end() & i < files.size(); i++) {
					SyncDoc p = files.get((int)i);
					if (isblank(p.fullpath()))
						continue;
					else page.add(p.fullpath());
				}

				resp = synQueryPathsPage(page, meta.tbl, AlbumPort.album);
				try {
					onOk.ok(resp);
				} catch (AnsonException | SemanticException | IOException e) {
					e.printStackTrace();
				}
			} catch (IOException e) {
				onErr.err(MsgCode.exIo, e.getMessage(),
						e.getClass().getName(), resp == null ? null : resp.msg());
			} catch (AnsonException e) {
				onErr.err(MsgCode.exGeneral, e.getMessage(),
						e.getClass().getName(), resp == null ? null : resp.msg());
				e.printStackTrace();
			} catch (SemanticException e) {
				onErr.err(MsgCode.exSemantic, e.getMessage(),
						e.getClass().getName(), resp == null ? null : resp.msg());
			} catch (TransException e) {
				onErr.err(MsgCode.exTransct, e.getMessage(),
						e.getClass().getName(), resp == null ? null : resp.msg());
			}
		}).start();
		return this;
	}

	public PhotoSyntier asyRegisterDevice(String device, String devname, OnOk ok, OnError... onErr) {
		new Thread(() -> {
			try {
				AnsonHeader header = client.header()
						.act(uri, "devices", "r/devices", "restore devices");

				DocsReq req = new DocsReq(uri)
						.device(new Device(device, null, devname));
				req.a(DocsReq.A.registDev);
				AnsonMsg<DocsReq> q = client.userReq(uri, AlbumPort.album, req)
						.header(header);
				AnsonResp resp = client.commit(q, errCtx);
				ok.ok(resp);
			} catch (IOException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exIo, "%s\n%s", e.getClass().getName(), e.getMessage());
			} catch (AnsonException | SemanticException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
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
	 * @return this
	 */
	public PhotoSyntier asyncPhotosUp(List<? extends SyncDoc> photos,
									  OnProcess proc, OnDocOk docOk, OnError onErr) {
		new Thread(() -> {
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
		}).start();
		return this;
	}

	public AlbumResp selectPhotoRec(String docId, ErrorCtx ... onErr) throws SemanticException {
		throw new SemanticException("Why needed?");
	}

	public DocsResp del(String device, String clientpath) {
		DocsReq req = (DocsReq) new AlbumReq(meta.tbl)
				.device(device)
				.clientpath(clientpath)
				.a(A.del);

		DocsResp resp = null;
		try {
			String[] act = AnsonHeader.usrAct("synclient.java", "del", "d/photo", "");
			AnsonHeader header = client.header().act(act);
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, AlbumPort.album, req)
										.header(header);

			resp = client.commit(q, errCtx);
		} catch (AnsonException | SemanticException e) {
			e.printStackTrace();
			errCtx.err(MsgCode.exSemantic, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		} catch (IOException e) {
			errCtx.err(MsgCode.exIo, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		}
		return resp;
	}

	/**
	 * TODO: move to Clients
	 * Ping port echo without session.
	 *
	 * @param funcUri
	 * @param errCtx
	 * @return echo message
	 * @throws IOException
	 * @throws AnsonException
	 * @throws SemanticException
	 */
	public static AnsonResp pingLess(String funcUri, OnError errCtx)
			throws SemanticException, AnsonException, IOException {
		Utils.warn("Use Clients.pingLess() instead!");
		EchoReq req = new EchoReq(null);
		req.a(EchoReq.A.echo);

		InsecureClient client = new InsecureClient();
		AnsonMsg<? extends AnsonBody> jmsg = client.<EchoReq>userReq(funcUri, AnsonMsg.Port.echo, req);

		Anson.verbose = true;
		AnsonResp resp = client.commit(jmsg, errCtx);

		return resp;
	}

	public static void asyPing(String funcUri, OnOk ok, OnError err) {
		new Thread(new Runnable() {
			public void run() {
				try {
					AnsonResp resp = pingLess(clientUri, err);
					ok.ok(resp);
					;
				} catch (IOException e) {
					err.err(MsgCode.exIo, e.getMessage());
				} catch (SemanticException e) {
					err.err(MsgCode.exSemantic, e.getMessage());
				}
			}}).start();
	}

}
