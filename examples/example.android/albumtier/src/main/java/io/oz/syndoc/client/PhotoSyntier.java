package io.oz.syndoc.client;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.isNull;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.syn.Doclientier;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantics.meta.TableMeta;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.album.peer.AlbumPort;
import io.oz.album.peer.AlbumReq;
import io.oz.album.peer.AlbumReq.A;
import io.oz.albumtier.IFileProvider;

public class PhotoSyntier extends Doclientier {

	public PhotoSyntier(TableMeta doctbl, String sysuri, String synuri, ErrorCtx errCtx)
			throws SemanticException, IOException {
		super(doctbl.tbl, sysuri, synuri, errCtx);
	}

	public PhotoSyntier(TableMeta doctbl, String clienturi, OnError err) throws SemanticException, IOException {
		this(doctbl, clienturi, clienturi, new ErrorCtx() {
			public void err(MsgCode code, String msg, String... device) { err.err(code, msg, device);}});
	}

	IFileProvider fileProvider;
	public PhotoSyntier fileProvider(IFileProvider p) {
		this.fileProvider = p;
		return this;
	}
	
	public PhotoSyntier asyLogin(String uid, String pswd, String device, OnLogin ok, OnError err) {
		Clients.loginAsync(uid, pswd, (client) -> {
			this.client = client;
			onLogin(client);
			ok.ok(client);
		}, err, device);

		return this;
	}

	public void asyPing(OnOk ok, OnError err) {
		new Thread(() -> {
			try {
				AnsonResp resp = Clients.pingLess(uri, err);
				ok.ok(resp);
			} catch (IOException e) {
				err.err(MsgCode.exIo, e.getMessage());
			} catch (TransException | SQLException e) {
				err.err(MsgCode.exSemantic, e.getMessage());
			}
		}).start();
	}

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
		} catch (AnsonException | TransException | SQLException e) {
			if (isNull(onErr))
				errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
		}
	  }).start();
	  return this;
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

				resp = synQueryPathsPage(page, AlbumPort.album);
				try {
					onOk.ok(resp);
				} catch (AnsonException | SemanticException | IOException | SQLException e) {
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
			} catch (AnsonException | TransException | SQLException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
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
			} catch (AnsonException | TransException | SQLException e) {
				if (isNull(onErr))
					errCtx.err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
				else onErr[0].err(MsgCode.exGeneral, "%s\n%s", e.getClass().getName(), e.getMessage());
			}
		}).start();
		return this;
	}

	/**
	 * Push up videos (larg files) with
	 * {@link #pushBlocks(String, List, OnProcess, OnOk, OnError...)}
     *
	 * @return this (handle events with callbacks)
	 */
	public PhotoSyntier asyVideos(List<? extends ExpSyncDoc> videos,
				OnProcess proc, OnOk docsOk, OnError ... onErr)
			throws TransException, IOException {
		new Thread(() -> {
			try {
				// syncVideos(videos, proc, docsOk, onErr);
				pushBlocks(doctbl, videos, proc, docsOk, onErr);
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

	public DocsResp del(String device, String clientpath) {
		DocsReq req = (DocsReq) new AlbumReq(doctbl)
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
	
	public String download(String syname, ExpSyncDoc photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		DocsReq req = (DocsReq) new DocsReq(syname, uri).uri(synuri);
		req.doc.recId = photo.recId;
		req.a(A.download);
		return client.download(synuri, Port.docsync, req, localpath);
	}
}
