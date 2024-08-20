package io.oz.albumtier;

import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;
import static io.oz.albumtier.AlbumContext.clientUri;

import java.io.IOException;
import java.util.List;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.PathsPage;
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
 * - only for MVP (0.3.x)
 *
 * <p>This tier won't access local db.</p>
 * @author odys-z@github.com
 *
 */
public class PhotoSyntier extends SynclientierMvp {
	public static int blocksize = 3 * 1024 * 1024;

	protected static PhotoMeta meta;

	static {
		AnsonMsg.understandPorts(AlbumPort.album);
		try {
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
		} catch (AnsonException | TransException e) {
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
			} catch (AnsonException | TransException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			}
		}).start();
		return this;
	}

	/**
	 * @see #syncVideos(List, OnProcess, OnOk, OnError...)
     *
	 * @return list of response
	 */
	public PhotoSyntier asyVideos(List<? extends ExpSyncDoc> videos,
				OnProcess proc, OnDocsOk docsOk, OnError ... onErr)
			throws TransException, IOException {
		new Thread(() -> {
			try {
				syncVideos(videos, proc, docsOk, onErr);
			} catch (TransException e) {
				e.printStackTrace();
				if (!isNull(onErr))
					onErr[0].err(MsgCode.exTransct, e.getMessage(), e.getClass().getName());
			} catch (IOException e) {
				e.printStackTrace();
				if (!isNull(onErr))
					onErr[0].err(MsgCode.exIo, e.getMessage(), e.getClass().getName());
			}
		}).start();
		return this;	
	}

	/**
	 * Push up videos (larg files) with
	 * {@link #pushBlocks(String, List, OnProcess, OnOk, OnError...)}
	 *
	 * @return list of response
	 */
	public List<DocsResp> syncVideos(List<? extends ExpSyncDoc> videos,
				OnProcess proc, OnDocsOk docsOk, OnError ... onErr)
			throws TransException, IOException {
		return pushBlocks(meta.tbl, videos, proc, docsOk, onErr);
	}

	/**
	 * Upward pushing with BlockChain
	 * 
	 * @param tbl doc table name
	 * @param videos any doc-table managed records, of which uri shouldn't be loaded,
	 * e.g. use {@link io.odysz.transact.sql.parts.condition.Funcall#extFile(String) extFile()} as sql select expression.
	 * - the method is working in stream mode
	 * @return list of response
	public List<DocsResp> pushBlocks(String tbl, List<? extends ExpSyncDoc> videos,
				OnProcess proc, OnDocsOk docOk, OnError ... onErr)
				throws TransException, IOException {
		OnError err = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		return pushBlocks(client, uri, tbl, videos, fileProvider,
        					proc, docOk, err, blocksize);
	}
	 */

	/**
	 * MEMO: what about have Anson.toBlock() support input stream field?
	 * 
	 * @return response list for each block
	 * @throws IOException file access error
	 * @throws TransException 
	 * @throws AnsonException 
	 *
	public static List<DocsResp> pushBlocks(SessionClient client, String uri, String tbl,
								List<? extends ExpSyncDoc> videos, IFileProvider fileProvider,
								OnProcess proc, OnDocsOk docOk, OnError errHandler, int blocksize)
			throws IOException, AnsonException, TransException {

		SessionInf user = client.ssInfo();
		DocsResp startAck = null;
		DocsResp respi = null;

		String[] act = AnsonHeader.usrAct("synclient.java", "sync", "c/sync", "push blocks");
		AnsonHeader header = client.header().act(act);

		List<DocsResp> reslts = new ArrayList<>(videos.size());

		for ( int px = 0; px < videos.size(); px++ ) {

			InputStream ifs = null;
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
				startAck = client.commit(q,
					(c, m, args) -> {
					if (c == MsgCode.ext) {
						DocsException docx = (DocsException)Anson.fromJson(m);
						if (docx.code() == DocsException.Duplicate) {
							reslts.add((DocsResp) new DocsResp().msg("Ignoring duplicate file: " + p.pname));
						}
					}
					else errHandler.err(c, m, args);
				});

				String pth = p.fullpath();
				if (!pth.equals(startAck.doc.fullpath()))
					Utils.warn("Resp is not replied with exactly the same path: %s", startAck.doc.fullpath());

				totalBlocks = p.size == 0 ? 0 : 1 + (int) ((p.size - 1 ) / blocksize);

				if (proc != null) proc.proc(videos.size(), px, 0, totalBlocks, startAck);

				DocLocks.reading(p.fullpath());
				ifs = fileProvider.open(p);

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

				// if (docOk != null) docOk.ok(respi.doc, respi);
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

				if (!(ex instanceof IOException))
					errHandler.err(MsgCode.exGeneral, ex.getMessage(), ex.getClass().getName(),
						isblank(ex.getCause()) ? null : ex.getCause().getMessage());
			}
			catch (Exception e) {
				e.printStackTrace();
			}
			finally {
				if (ifs != null)
					ifs.close();
				DocLocks.readed(p.fullpath());
			}
		}
		if (docOk != null) docOk.ok(reslts);

		return reslts;
	}
	*/

	public String download(PhotoRec photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		return download(uri, meta.tbl, photo, localpath);
	}

	/**
	 * Asynchronously query synchronizing records.
	 * 
	 * @return this
	 */
	public PhotoSyntier asynQueryDocs(List<? extends ExpSyncDoc> files, PathsPage page, OnOk onOk, OnError onErr) {
		new Thread(() -> {
			DocsResp resp = null;
			try {
				page.clear();
				for (int i = page.start(); i < page.end() & i < files.size(); i++) {
					ExpSyncDoc p = files.get((int)i);
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
			} catch (AnsonException | TransException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			}
		}).start();
		return this;
	}

	/**
	 * Asynchronously push photos. This is different from push/pull of jserv nodes.
	 * since Albumtier 0.1.9, this method also uses block chain for uploading.
	 * TODO: to be changed to handling short text.
	 * @return this
	 */
	public PhotoSyntier asyncPhotosUp(List<? extends ExpSyncDoc> photos,
									  OnProcess proc, OnDocsOk docsOk, OnError onErr) {
		new Thread(() -> {
			try {
				syncUp(meta.tbl, photos, client.ssInfo().uid(), proc, docsOk);
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
				.a(A.del);
		req.doc.clientpath(clientpath);

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

	public static void asyPing(OnOk ok, OnError err) {
		new Thread(() -> {
			try {
				AnsonResp resp = Clients.pingLess(clientUri, err);
				ok.ok(resp);
			} catch (IOException e) {
				err.err(MsgCode.exIo, e.getMessage());
			} catch (TransException e) {
				err.err(MsgCode.exSemantic, e.getMessage());
			}
		}).start();
	}

	/**
	 * Helper for compose file uploading responses to readable string
	 * @param template, "size {resps.size}, ignored {duplicate error}"
	 * @param resps e.g response of calling {@link #pushBlocks(String, List, OnProcess, OnOk, OnError...)}.
	 * @return readable message
	 */
	public static String composeFilesMsg(String template, List<DocsResp> resps) {
		String msg = null;
		if (resps != null) {
			int ignore = 0;
			int size = 0;
			for(DocsResp r : resps) {
				if (r.xdoc == null)
					ignore++;
				size++;
			}
			msg = String.format(template, size, ignore);
		}

		return msg;
	}

}
