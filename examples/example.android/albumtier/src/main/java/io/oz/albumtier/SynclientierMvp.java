package io.oz.albumtier;

import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io_odysz.FilenameUtils;
import org.xml.sax.SAXException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.DocLocks;
import io.odysz.common.EnvPath;
import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.HttpServClient;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.jclient.tier.Semantier;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.DATranscxt;
import io.odysz.semantic.DA.Connects;
import io.odysz.semantic.ext.DocTableMeta;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jsession.JUser.JUserMeta;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsReq.A;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.semantic.tier.docs.SyncDoc.SyncFlag;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.sql.PageInf;
import io.odysz.transact.x.TransException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.AlbumReq;
import io.oz.album.x.DocsException;

/**
 * Redundant to docsync.jser/Synclientier.
 * 
 * @author odys-z@github.com
 */
public class SynclientierMvp extends Semantier {
	public boolean verbose = false;

	protected SessionClient client;
	protected OnError errCtx;

	protected SyncRobot robot;

	protected String tempath;

	int blocksize = 3 * 1024 * 1024;

	/**
	 * Change default block size for performance. Default is 3 Mib.
	 *
	 * @param size must be multiple of 12
	 * @throws SemanticException
	 */
	public SynclientierMvp blockSize(int size) throws SemanticException {
		if (size % 12 != 0)
			throw new SemanticException("Block size must be multiple of 12.");
		blocksize = size;
		return this;
	}
	
	/**
	 * @param clientUri - the client function uri this instance report to the jserv.
	 * @param errCtx
	 * @throws IOException 
	 * @throws SAXException 
	 * @throws SQLException 
	 * @throws SemanticException 
	 */
	public SynclientierMvp(String clientUri, OnError errCtx)
			throws SemanticException, IOException {
		this.errCtx = errCtx;
		this.uri = clientUri;
		
		tempath = ".";
	}
	
	/**
	 * Temporary root will be changed after login.
	 * 
	 * @param root
	 * @return this
	 */
	public SynclientierMvp tempRoot(String root) {
		tempath = root; 
		return this;
	}
	
	IFileProvider fileProvider;
	public SynclientierMvp fileProvider(IFileProvider p) {
		this.fileProvider = p;
		return this;
	}

	public DocsResp queryDevices(String devname)
			throws SemanticException, AnsonException, IOException {
		String[] act = AnsonHeader.usrAct("synclient.java", "query", A.devices, Port.docsync.name());
		AnsonHeader header = client.header().act(act);

		DocsReq req = (DocsReq) new DocsReq("doc_devices", uri);
		req.pageInf = new PageInf(0, -1, devname);
		req.a(A.devices);

		AnsonMsg<DocsReq> q = client
			.<DocsReq>userReq(uri, Port.docsync, req)
			.header(header);

		return client.commit(q, errCtx);
	}

	/**
	 * Implementing new device registering together with {@link #queryDevices(String)}.
	 * 
	 * <pre>CREATE TABLE doc_devices (
      synode0 varchar(12)  NOT NULL, -- initial node a device is registered
      device  varchar(12)  NOT NULL, -- ak, generated when registering, but is used together with synode-0 for file identity.
      devname varchar(256) NOT NULL, -- set by user, warn on duplicate, use old device id if user confirmed, otherwise generate a new one.
      mac     varchar(512),          -- an anciliary identity for recognize a device if there are supporting ways to automatically find out a device mac
      orgId   varchar(12)  NOT NULL, -- fk-del, usually won't happen
      owner   varchar(12),           -- or current user, not permenatly bound
      PRIMARY KEY (synode0, device)
      ); -- registered device names. Name is set by user, prompt if he's device names are duplicated
	 * </pre>
	 * @return this
	 * @throws IOException 
	 * @throws AnsonException 
	 * @throws SemanticException 
	 * @since 0.2.5
	 */
	public AnsonResp registerDevice(String devname)
			throws SemanticException, AnsonException, IOException {
		String[] act = AnsonHeader.usrAct("synclient.java", "register", A.devices, Port.docsync.name());
		AnsonHeader header = client.header().act(act);

		DocsReq req = (DocsReq) new DocsReq("doc_devices", uri);
		req.pageInf = new PageInf(0, -1, devname);
		req.a(A.registDev);

		AnsonMsg<DocsReq> q = client
			.<DocsReq>userReq(uri, Port.docsync, req)
			.header(header);

		return client.commit(q, errCtx);
	}
	
	/**
	 * Login to hub, where hub root url is initialized with {@link Clients#init(String, boolean...)}.
	 * 
	 * @param workerId
	 * @param device
	 * @param pswd
	 * @return this
	 * @throws SQLException
	 * @throws AnsonException
	 * @throws IOException
	 * @throws TransException 
	 * @throws GeneralSecurityException 
	 */
	public SynclientierMvp login(String workerId, String device, String pswd)
			throws AnsonException, IOException, TransException, GeneralSecurityException {

		client = Clients.login(workerId, pswd, device);

		return onLogin(client);
	}
	
	/**
	 * Create robot for synchronizing,
	 * clean and create local temporary directory for downloading,
	 * load user information, org and homepage url.
	 * 
	 * @param client
	 * @return this
	 * @throws TransException 
	 */
	public SynclientierMvp onLogin(SessionClient client) {
		SessionInf ssinf = client.ssInfo();
		try {
			robot = new SyncRobot(ssinf.uid())
					.device(ssinf.device);
			tempath = FilenameUtils.concat(tempath,
					String.format("io.oz.sync.%s.%s", ssinf.device, ssinf.uid()));
			
			new File(tempath).mkdirs(); 
			
			JUserMeta um = null;
			if (!isNull(Connects.getAllConnIds()))
				um = (JUserMeta) robot.meta();
			else // a temporary solution for client without DB connections
				um = new JUserMeta();

			AnsonMsg<AnQueryReq> q = client.query(uri, um.tbl, "u", 0, -1);
			q.body(0)
			 .j(um.orgTbl, "o", String.format("o.%1$s = u.%1$s", um.org))
			 .whereEq("u." + um.pk, robot.userId);

			AnsonResp resp = client.commit(q, errCtx);
			AnResultset rs = resp.rs(0).beforeFirst();
			if (rs.next())
				robot.orgId(rs.getString(um.org))
					 .orgName(rs.getString(um.orgName));
			else throw new SemanticException("Synode haven't been reqistered: %s", robot.userId);
		} catch (TransException | AnsonException | SQLException | IOException e) {
			e.printStackTrace();
		}

		return this;
	}

	/**
	 * @param meta for creating {@link SyncDoc} object
	 * @param rs tasks, rows should be limited
	 * @param workerId
	 * @param onProc
	 * @throws TransException
	 * @throws AnsonException
	 * @throws IOException
	List<DocsResp> syncUp(DocTableMeta meta, AnResultset rs, String workerId, OnProcess onProc)
			throws TransException, AnsonException, IOException {
		List<SyncDoc> videos = new ArrayList<SyncDoc>();
		try {
			while (rs.next())
				videos.add(new SyncDoc(rs, meta));

			return syncUp(meta.tbl, videos, workerId, onProc);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}
	 */

	/**
	 * Synchronizing files to hub using block chain, accessing port {@link Port#docsync}.
	 * This method will use meta to create entity object of doc.
	 *
	 * @param tabl
	 * @param videos
	 * @param workerId
	 * @param onProc
	 * @param docOk
	 * @return Sync response list
	 * @throws TransException
	 * @throws AnsonException
	 * @throws IOException
	 */
	public List<DocsResp> syncUp(String tabl, List<? extends SyncDoc> videos, String workerId,
			OnProcess onProc, OnDocsOk... docOk)
			throws TransException, AnsonException, IOException {
		SessionInf photoUser = client.ssInfo();
		photoUser.device = workerId;

		return pushBlocks(
				tabl, videos, onProc,
				isNull(docOk) ? new OnDocsOk() {
					@Override
					public void ok(List<DocsResp> resps)
						throws IOException, AnsonException, TransException { }
				} : docOk[0],
				errCtx);
	}

	public static void setLocalSync(DATranscxt localSt, String conn,
			DocTableMeta meta, SyncDoc doc, String syncflag, SyncRobot robot)
			throws TransException, SQLException {
		localSt.update(meta.tbl, robot)
			.nv(meta.syncflag, SyncFlag.hub)
			.whereEq(meta.pk, doc.recId)
			.u(localSt.instancontxt(conn, robot));
	}

	/**
	 * Downward synchronizing.
	 * @param p
	 * @param meta
	 * @return doc record (e.g. h_photos)
	 * @throws AnsonException
	 * @throws IOException
	 * @throws TransException
	 * @throws SQLException
	 */
	SyncDoc synStreamPull(SyncDoc p, DocTableMeta meta)
			throws AnsonException, IOException, TransException, SQLException {

		if (!verifyDel(p, meta)) {
			DocsReq req = (DocsReq) new DocsReq()
							.docTabl(meta.tbl)
							.org(robot.orgId)
							.queryPath(p.device(), p.fullpath())
							.a(A.download);

			String tempath = tempath(p);
			tempath = client.download(uri, Port.docsync, req, tempath);
		}
		return p;
	}

	protected boolean verifyDel(SyncDoc f, DocTableMeta meta) {
		String pth = tempath(f);
		File file = new File(pth);
		if (!file.exists())
			return false;

		long size = f.size;
		long length = file.length();

		if ( size == length ) {
			// move temporary file
			String targetPath = ""; //resolvePrivRoot(f.uri, meta);
			if (verbose)
				Utils.logi("   %s\n-> %s", pth, targetPath);
			try {
				Files.move(Paths.get(pth), Paths.get(targetPath), StandardCopyOption.ATOMIC_MOVE);
			} catch (Throwable t) {
				Utils.warn("Moving temporary file failed: %s\n->%s\n  %s\n  %s",
							pth, targetPath, f.device(), f.fullpath());
			}
			return true;
		}
		else {
			try { FileUtils.delete(new File(pth)); }
			catch (Exception ex) {}
			return false;
		}
	}
	
	/**
	 * Upward pushing with BlockChain
	 * 
	 * @param tbl doc table name
	 * @param videos any doc-table managed records, of which uri shouldn't be loaded,
	 * e.g. use {@link io.odysz.transact.sql.parts.condition.Funcall#extFile(String) extFile()} as sql select expression.
	 * - the method is working in stream mode
	 * @param proc
	 * @param docOk
	 * @param onErr
	 * @return list of response
	public List<DocsResp> pushBlocks(String tbl, List<? extends SyncDoc> videos,
				OnProcess proc, OnDocsOk docOk, OnError ... onErr)
				throws TransException, IOException {
		OnError err = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		return pushBlocks(client, uri, tbl, videos, blocksize, proc, docOk, err);
	}
	 */
	public List<DocsResp> pushBlocks(String tbl, List<? extends SyncDoc> videos,
			OnProcess proc, OnDocsOk docOk, OnError ... onErr)
			throws TransException, IOException {
		OnError err = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		return pushBlocks(client, uri, tbl, videos, fileProvider,
							proc, docOk, err, blocksize);
	}

	/*
	public static List<DocsResp> pushBlocks(SessionClient client, String uri, String tbl,
			List<? extends SyncDoc> videos, int blocksize,
			OnProcess proc, OnDocsOk docOk, OnError errHandler)
			throws TransException, IOException {

		SessionInf user = client.ssInfo();
        DocsResp resp0 = null;
        DocsResp respi = null;

		String[] act = AnsonHeader.usrAct("synclient.java", "sync", "c/sync", "push blocks");
		AnsonHeader header = client.header().act(act);

		List<DocsResp> reslts = new ArrayList<DocsResp>(videos.size());

		for ( int px = 0; px < videos.size(); px++ ) {

			FileInputStream ifs = null;
			int seq = 0;
			int totalBlocks = 0;

			SyncDoc p = videos.get(px);
			DocsReq req = new DocsReq(tbl)
					.folder(p.folder())
					.share(p)
					.device(new Device(user.device, null))
					.resetChain(true)
					.blockStart(p, user);

			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, Port.docsync, req)
									.header(header);

			try {
				resp0 = client.commit(q, errHandler);

				String pth = p.fullpath();
				if (!pth.equals(resp0.doc.fullpath()))
					Utils.warn("Resp is not replied with exactly the same path: %s", resp0.doc.fullpath());

				// FIXME Call requires API level 26 (current min is 17): `java.nio.file.Files#size`
				// FIXME Call requires API level 26 (current min is 17): `java.nio.file.Paths#get`
				totalBlocks = (int) ((Files.size(Paths.get(pth)) + 1) / blocksize);
				if (proc != null) proc.proc(videos.size(), px, 0, totalBlocks, resp0);

				DocLocks.reading(p.fullpath());
				ifs = new FileInputStream(new File(p.fullpath()));

				String b64 = AESHelper.encode64(ifs, blocksize);
				while (b64 != null) {
					req = new DocsReq(tbl).blockUp(seq, p, b64, user);
					seq++;

					q = client.<DocsReq>userReq(uri, Port.docsync, req)
								.header(header);

					respi = client.commit(q, errHandler);
					if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

					b64 = AESHelper.encode64(ifs, blocksize);
				}
				req = new DocsReq(tbl).blockEnd(respi, user);

				q = client.<DocsReq>userReq(uri, Port.docsync, req)
							.header(header);
				respi = client.commit(q, errHandler);
				if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

				// if (docOk != null) docOk.ok(respi.doc, respi);
				reslts.add(respi);
			}
			catch (IOException | TransException | AnsonException ex) { 
				Utils.warn(ex.getMessage());

				if (resp0 != null) {
					req = new DocsReq(tbl).blockAbort(resp0, user);
					req.a(DocsReq.A.blockAbort);
					q = client.<DocsReq>userReq(uri, Port.docsync, req)
								.header(header);
					respi = client.commit(q, errHandler);
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

		if (docOk != null) docOk.ok(reslts);

		return reslts;
	}
	*/
	/**
	 * MEMO: what about have Anson.toBlock() support input stream field?
	 * 
	 * @return response list for each block
	 * @throws IOException file access error
	 * @throws TransException 
	 * @throws AnsonException 
	 */
	public static List<DocsResp> pushBlocks(SessionClient client, String uri, String tbl,
								List<? extends SyncDoc> videos, IFileProvider fileProvider,
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
					/*
					(c, m, args) -> {
					if (c == MsgCode.ext) {
						DocsException docx = (DocsException)Anson.fromJson(m);
						if (docx.code() == DocsException.Duplicate) {
							reslts.add((DocsResp) new DocsResp().msg("Ignoring duplicate file: " + p.pname));
						}
					}
					else errHandler.err(c, m, args);
					}*/
					errHandler);

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
				if (ex instanceof SemanticException
					&& ((MsgCode)((SemanticException)ex).ex().get(HttpServClient.EXCODE_KEY)) == MsgCode.ext) {

					// Design Notes:
					// For Anprism.Enveloparser, it should be the object of DocsException been deserialized here.
					SemanticObject docx = (SemanticObject)Anson.fromJson(
							Anson.unescape(((SemanticException)ex).ex().getString(HttpServClient.EXMSG_KEY)));
					if (Integer.valueOf(docx.code()) == DocsException.Duplicate) {
						reslts.add((DocsResp) new DocsResp()
								.doc(p.syncFlag(SyncFlag.deny))
								.msg("Ignoring duplicate file: " + p.pname));
						continue;
					}
				}

				Utils.warn("[%s] %s", ex.getClass().getName(), ex.getMessage());

				if (startAck != null) {
					req = new DocsReq(tbl, uri).blockAbort(startAck, user);
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

	public String download(String clientUri, String syname, SyncDoc photo, String localpath)
			throws SemanticException, AnsonException, IOException {
		DocsReq req = (DocsReq) new DocsReq(syname, uri).uri(clientUri);
		req.docId = photo.recId;
		req.a(A.download);
		return client.download(clientUri, Port.docsync, req, localpath);
	}

	/**
	 * Get a doc record from jserv.
	 * 
	 * @param docTabl 
	 * @param docId
	 * @param onErr
	 * @return response
	 */
	public DocsResp selectDoc(String docTabl, String docId, ErrorCtx ... onErr) {
		OnError errHandler = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		String[] act = AnsonHeader.usrAct("synclient.java", "synch", "c/photo", "multi synch");
		AnsonHeader header = client.header().act(act);

		DocsReq req = new DocsReq(docTabl, uri);
		req.a(A.rec);
		req.docId = docId;

		DocsResp resp = null;
		try {
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, Port.docsync, req)
										.header(header);

			resp = client.commit(q, errCtx);
		} catch (AnsonException | SemanticException e) {
			errHandler.err(MsgCode.exSemantic, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		} catch (IOException e) {
			errHandler.err(MsgCode.exIo, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		}
		return resp;
	}
	
	public DocsResp listNodes(String docTabl, String org, ErrorCtx ... onErr) {
		OnError errHandler = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		String[] act = AnsonHeader.usrAct("synclient.java", "synch", "c/photo", "multi synch");
		AnsonHeader header = client.header().act(act);

		DocsReq req = new DocsReq(docTabl, uri);
		req.a(A.orgNodes);
		req.org = org;

		DocsResp resp = null;
		try {
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, Port.docsync, req)
										.header(header);

			resp = client.commit(q, errCtx);
		} catch (AnsonException | SemanticException e) {
			errHandler.err(MsgCode.exSemantic, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		} catch (IOException e) {
			errHandler.err(MsgCode.exIo, e.getMessage() + " " + (e.getCause() == null ? "" : e.getCause().getMessage()));
		}
		return resp;
		
	}
	
	public DocsResp synDel(String tabl, String device, String clientpath) {
		DocsReq req = (DocsReq) new DocsReq(tabl, uri)
				.device(new Device(device, null))
				.clientpath(clientpath)
				.a(A.del);

		DocsResp resp = null;
		try {
			String[] act = AnsonHeader.usrAct("synclient.java", "del", "d/photo", "");
			AnsonHeader header = client.header().act(act);
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, Port.docsync, req)
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

	DocsResp synClosePush(SyncDoc p, String docTabl)
			throws AnsonException, IOException, TransException, SQLException {

		DocsReq clsReq = (DocsReq) new DocsReq()
						.docTabl(docTabl)
						.org(robot.orgId)
						.queryPath(p.device(), p.fullpath())
						.a(A.synclosePush);

		AnsonMsg<DocsReq> q = client
				.<DocsReq>userReq(uri, AnsonMsg.Port.docsync, clsReq);

		DocsResp r = client.commit(q, errCtx);
		return r;
	}
	
	/**
	 * Tell upper synode to close the doc downloading.
	 * @param p
	 * @param docTabl
	 * @return
	 * @throws SemanticException
	 * @throws AnsonException
	 * @throws IOException
	 */
	DocsResp synClosePull(SyncDoc p, String docTabl)
			throws SemanticException, AnsonException, IOException {
		DocsReq clsReq = (DocsReq) new DocsReq()
						.docTabl(docTabl)
						.org(robot.orgId)
						.queryPath(p.device(), p.fullpath())
						.a(A.synclosePull);

		AnsonMsg<DocsReq> q = client
				.<DocsReq>userReq(uri, AnsonMsg.Port.docsync, clsReq);

		DocsResp r = client.commit(q, errCtx);
		return r;
	}
	
	/**
	 * Now clients only match paths with local DB.
	 * 
	 * @param page
	 * @param tabl
	 * @return
	 * @throws TransException
	 * @throws IOException
	 */
	public <T extends IPort> DocsResp synQueryPathsPage(PathsPage page, String tabl, T port)
			throws TransException, IOException {
		String[] act = AnsonHeader.usrAct("synclient.java", "query", "r/states", "query sync");
		AnsonHeader header = client.header().act(act);

		DocsReq req = (DocsReq) new DocsReq()
				.syncing(page)
				.docTabl(tabl)
				.device(new Device(page.device, null))
				.a(A.selectSyncs); // v 0.1.50

		AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, port/*MVP 0.2.1 Port.docsync*/, req)
								.header(header);

		DocsResp resp = client.commit(q, errCtx);

		return resp;
	}

	public String tempath(IFileDescriptor f) {
		String clientpath = f.fullpath().replaceAll(":", "");
		return EnvPath.decodeUri(tempath, f.device(), FilenameUtils.getName(clientpath));
	}

    public boolean verifyDeviceId(String device, String devname) {
		return true;
    }
}
