package io.odysz.jclient.syn;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.LangExt.str;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.xml.sax.SAXException;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.FilenameUtils;
import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.jclient.tier.Semantier;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.jsession.JUser.JUserMeta;
import io.odysz.semantic.meta.ExpDocTableMeta;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsReq.A;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.ShareFlag;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;

public class Doclientier extends Semantier {
	public static boolean verbose = true;

	protected final String doctbl;

	public SessionClient client;
	
	/** @since 2.0.0 changed to static */
	protected static ErrorCtx errCtx;

	protected ExpDocRobot robt;

	/** For download. */
	protected String tempath;

	protected String synuri;
	public String synuri() { return synuri; }
	
	IFileProvider fileProvider;
	public Doclientier fileProvider(IFileProvider p) {
		this.fileProvider = p;
		return this;
	}
	
	/**
	 * @param sysuri - the client function uri this instance will be used for.
	 * @param errCtx
	 * @throws IOException 
	 * @throws SAXException 
	 * @throws SQLException 
	 * @throws SemanticException 
	 */
	public Doclientier(String doctbl, String sysuri, String synuri, ErrorCtx errCtx)
			throws SemanticException, IOException {
		mustnonull(doctbl);
		mustnonull(sysuri);
		mustnonull(synuri);

		this.doctbl = doctbl;
		Doclientier.errCtx = errCtx;
		this.uri = sysuri;
		this.synuri = synuri;
		
		tempath = ".";
	}
	
	/**
	 * Temporary root will be changed after login.
	 * 
	 * @param root
	 * @return this
	 */
	public Doclientier tempRoot(String root) {
		tempath = root; 
		return this;
	}
	
	public String device() {
		return client != null && client.ssInfo() != null ? client.ssInfo().device : null;
	}

	/**
	 * 
	 * @deprecated use {@link #loginWithUri(String, String, String)} instead
	 * 
	 * @param workerId
	 * @param device
	 * @param pswd
	 * @return this
	 * @throws SemanticException 
	 * @throws SQLException
	 * @throws AnsonException
	 * @throws IOException
	 * @throws TransException 
	 * @throws SsException 
	public Doclientier login(String workerId, String device, String pswd)
			throws SemanticException, AnsonException, SsException, IOException {

		client = Clients.login(workerId, pswd, device);

		return onLogin(client);
	}
	 */

	/**
	 * Login to hub, where hub root url is initialized with {@link Clients#init(String, boolean...)}.
	 * 
	 * @param workerId
	 * @param device
	 * @param pswd
	 * @return
	 * @throws SemanticException
	 * @throws AnsonException
	 * @throws SsException
	 * @throws IOException
	 */
	public Doclientier loginWithUri(String jservrt, String workerId, String device, String pswd)
			throws SemanticException, AnsonException, SsException, IOException {

		// client = Clients.loginWithUri(uri, workerId, pswd, device);
		client = SessionClient.loginWithUri(jservrt, uri, workerId, pswd, device);

		return onLogin(client);
	}

	/**
	 * Start heart beat, create robot for synchronizing,
	 * clean and create local temporary directory for downloading,
	 * load user information.
	 * 
	 * @param client
	 * @return this
	 * @throws TransException 
	 */
	public Doclientier onLogin(SessionClient client) {
		SessionInf ssinf = client.ssInfo();
		try {
			robt = new ExpDocRobot(ssinf.uid(), null, ssinf.userName());
			tempath = FilenameUtils.concat(tempath,
						f("io.oz.doc.%s.%s", ssinf.device, ssinf.uid()));
			
			new File(tempath).mkdirs(); 
			
			JUserMeta um = new JUserMeta(); // a temporary solution for client without DB connections

			AnsonMsg<AnQueryReq> q = client.query(uri, um.tbl, "u", 0, -1);
			q.body(0)
			 .l(um.om.tbl, "o", String.format("o.%1$s = u.%1$s", um.org))
			 .whereEq("u." + um.pk, robt.uid());

			AnsonResp resp = client.commit(q, errCtx);
			AnResultset rs = resp.rs(0).beforeFirst();
			if (rs.next())
				robt.orgId(rs.getString(um.org))
					.orgName(rs.getString(um.orgName));
			else throw new SemanticException("User identity haven't been reqistered: %s", robt.uid());
		} catch (Exception e) {
			e.printStackTrace();
		}

		return this;
	}
	
	public static ExpSyncDoc videoUpByApp(Doclientier doclient, Device atdev, String respath,
 			String entityName, ShareFlag share, OnOk ok, OnProcess proc) throws Exception {

		ExpSyncDoc doc = (ExpSyncDoc) new ExpSyncDoc()
					.share(doclient.robt.uid(), share.name(), new Date())
					.shareflag(ShareFlag.publish.name())
					.folder(atdev.tofolder)
					.device(atdev.id)
					.fullpath(respath);

		DocsResp resp = doclient.startPush(null, entityName, doc, ok, proc);

		String docId = resp.xdoc.recId();
		DocsResp rp = doclient.selectDoc(entityName, docId);

		return rp.xdoc;
	}

	/**
	 * Synchronizing files to a {@link ExpDoctier} using block chain, accessing port {@link Port.docstier}.
	 * This method will use meta to create entity object of doc.
	 * @param meta for creating {@link ExpSyncDoc} object 
	 * @param rs tasks, rows should be limited, and must be understandable by {@link ExpSyncDoc#ExpSyncDoc(AnResultset, ExpDocTableMeta)}.
	 * @param onProc
	 * @return Sync response list
	 * @throws TransException 
	 * @throws AnsonException 
	 * @throws IOException 
	 */
	List<DocsResp> syncUp(ExpDocTableMeta meta, AnResultset rs, OnProcess onProc)
			throws TransException, AnsonException, IOException {
		List<IFileDescriptor> videos = new ArrayList<IFileDescriptor>();
		try {
			while (rs.next())
				videos.add(new ExpSyncDoc(rs, meta));

			return syncUp(meta.tbl, videos, onProc);
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	public List<DocsResp> syncUp(String tabl, List<IFileDescriptor> videos,
			OnProcess onProc, OnDocsOk... docsOk)
			throws TransException, AnsonException, IOException, SQLException {
		return startPushs(
				null, tabl, videos, onProc,
				isNull(docsOk) ? new OnDocsOk() {
					@Override
					public void ok(List<? extends AnsonResp> resps) { }
				} : docsOk[0],
				errCtx);
	}
	
	/**
	 * [Synchronously]
	 * High level API: Upward pushing with BlockChain.
	 * 
	 * @param tbl doc table name
	 * @param videos any doc-table managed records, of which uri shouldn't be loaded,
	 * e.g. use {@link io.odysz.transact.sql.parts.condition.Funcall#extfile(String...) extFile()} as sql select expression.
	 * - the method is working in stream mode
	 * @param proc reporting at each block finished
	 * @param docOk callback for implementing asynchronous wrapper
	 * @param onErr
	 * @return list of response
	 * @throws SQLException 
	 * @throws AnsonException 
	 */
	public List<DocsResp> startPushs(ExpSyncDoc template, String tbl, List<IFileDescriptor> videos,
				OnProcess proc, OnDocsOk docOk, OnError ... onErr)
				throws TransException, IOException, AnsonException, SQLException {
		OnError err = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		return pushBlocks(client, synuri, tbl, videos, fileProvider, AESHelper.blockSize(), template,
				proc, docOk, isNull(onErr) ? err : onErr[0]);
	}

	/**
	 * 
	 * <p>To use this function at client side, use the high level API,
	 * {@link #startPush(String, ExpSyncDoc, OnOk, ErrorCtx...)} for single file or
	 * {@link #startPushs(String, List, OnProcess, OnOk, OnError...)} for multiple files</p>
	 * 
	 * @param client
	 * @param uri
	 * @param tbl
	 * @param videos
	 * @param blocksize
	 * @param proc
	 * @param docsOk
	 * @param errHandler
	 * @return response list
	 * @throws TransException
	 * @throws IOException
	 * @throws SQLException 
	 * @throws AnsonException 
	 */
	public static List<DocsResp> pushBlocks(SessionClient client, String uri, String tbl,
			List<IFileDescriptor> videos, IFileProvider fileProvider, int blocksize, ExpSyncDoc template,
			OnProcess proc, OnDocsOk docsOk, OnError errHandler)
			throws TransException, IOException, AnsonException, SQLException {

		SessionInf ssinf = client.ssInfo();

        DocsResp resp0 = null;
        DocsResp respi = null;

		String[] act = AnsonHeader.usrAct("synclient.java", "sync", "c/sync", "push blocks");
		AnsonHeader header = client.header().act(act);

		List<DocsResp> reslts = new ArrayList<DocsResp>(videos.size());

		for ( int px = 0; px < videos.size(); px++ ) {

			FileInputStream ifs = null;
			int seq = 0;
			int totalBlocks = 0;

			/* 
			 * 025-03-02 fix class casting error while pick files on Android.
			 * 2025-03-04 fix error of reading non-latin file name.
			 */

			IFileDescriptor f = videos.get(px);
			if (fileProvider == null) {
				if (isblank(f.fullpath()) || isblank(f.clientname()) || isblank(f.cdate()))
					throw new IOException(
							f("File information is not enough: %s, %s, create time %s",
							f.clientname(), f.fullpath(), f.cdate()));
			}
			else if (fileProvider.meta(f) < 0) {
				// sometimes third part apps will report wrong doc, e. g. WPS files deleted by users.
				reslts.add((DocsResp) new DocsResp()
						.doc(f.syndoc(template)
							  .shareflag(ShareFlag.deny,
								f("File provide returned error: %s", f.fullpath()))));
				continue;
			}

			ExpSyncDoc p = f.syndoc(template);

			if ( isblank(p.clientpath) ||
				(!isblank(p.device()) && !eq(p.device(), ssinf.device)))
				throw new SemanticException(
						"Docs' pushing requires device id and clientpath.\n" +
						"Doc Id: %s, device id: %s(%s), client-path: %s, resource name: %s",
						p.recId, p.device(), ssinf.device, p.clientpath, p.pname);
			
			DocsReq req  = new DocsReq(tbl, p.folder(p.folder()), uri)
					.device(ssinf.device)
					.resetChain(true)
					.blockStart(p, ssinf);
			
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(uri, Port.docstier, req)
									.header(header);

			try {
				resp0 = client.commit(q, errHandler);

				String pth = p.fullpath();
				if (!pth.equals(resp0.xdoc.fullpath()))
					Utils.warn("Resp is not replied with exactly the same path: %s",
							resp0.xdoc.fullpath());

				// Doesn't work for Chinese file name in Android 10:
				// totalBlocks = (int) ((Files.size(Paths.get(pth)) + 1) / blocksize);
				totalBlocks = (int) (Math.max(0, p.size - 1) / blocksize) + 1;

				if (proc != null) proc.proc(videos.size(), px, 0, totalBlocks, resp0);

				ifs = (FileInputStream) fileProvider.open(f);

				String b64 = AESHelper.encode64(ifs, blocksize);
				while (b64 != null) {
					req = new DocsReq(tbl, uri).blockUp(seq, p, b64, ssinf);
					seq++;

					q = client.<DocsReq>userReq(uri, Port.docstier, req)
								.header(header);

					respi = client.commit(q, errHandler);
					if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

					b64 = AESHelper.encode64(ifs, blocksize);
				}
				req = new DocsReq(tbl, uri).blockEnd(respi == null ? resp0 : respi, ssinf);

				q = client.<DocsReq>userReq(uri, Port.docstier, req)
							.header(header);
				respi = client.commit(q, errHandler);
				if (proc != null) proc.proc(px, videos.size(), seq, totalBlocks, respi);

				reslts.add(respi);
			}
			catch (IOException | TransException | AnsonException ex) { 
				if (verbose) ex.printStackTrace();

				String exmsg = ex.getMessage();
				Utils.warn(exmsg);
				
				if (resp0 != null) {
					req = new DocsReq(tbl, uri).blockAbort(resp0, ssinf);
					req.a(DocsReq.A.blockAbort);
					q = client.<DocsReq>userReq(uri, Port.docstier, req)
								.header(header);
					respi = client.commit(q, errHandler);
				}

				if (ex instanceof IOException)
					continue;
				else {
					// Tag: MVP - This is not correct way of deserialize exception at client side
					if (!isblank(exmsg)) {
						try {
							// Code: ext, mesage: {
							//   \"type\": \"io.odysz.semantics.SemanticObject\",
							//   \"props\": {\"code\": 99,
							//   \"reasons\": [\"Found existing file for device & client path.\",
							//                 \"0001\", \"/storage/emulated/0/Download/1732626036337.pdf\"]}}\n

							exmsg = exmsg.replaceAll("^Code: .*, mess?age:\\s*", "").trim();
							SemanticObject exp = (SemanticObject) Anson.fromJson(Anson.unescape(exmsg));
							String reasons = exmsg;
							try {
								Object ress = exp.get("reasons");
								reasons = ress == null ? null
										: ress instanceof ArrayList<?> ? str((ArrayList<?>)ress)
										: ress instanceof String[] ? str((String[])ress)
										: ress.toString();
							}
							catch (Exception e) {
								e.printStackTrace();
							}
							errHandler.err(MsgCode.ext, reasons, String.valueOf(exp.get("code")));
						}
						catch (Exception exx) {
							errHandler.err(MsgCode.exGeneral, ex.getMessage(),
								ex.getClass().getName(), isblank(ex.getCause()) ? null : ex.getCause().getMessage());
						}
					}
					else
						errHandler.err(MsgCode.exGeneral, ex.getMessage(),
							ex.getClass().getName(), isblank(ex.getCause()) ? null : ex.getCause().getMessage());
				}
			}
//			finally {
//				if (ifs != null)
//					ifs.close();
//				// DocLocks.readed(p.fullpath());
//			}
		}
		if (docsOk != null) docsOk.ok(reslts);

		return reslts;
	}
	
	/**
	 * Helper for compose file uploading responses to readable string
	 * @param resps e.g response of calling {@link #startPushs(String, List, OnProcess, OnDocsOk, OnError...)}. 
	 * @return [size, denied, invalid]
	 */
	public static int[] parseErrorCodes(List<DocsResp> resps) {
		if (resps != null) {
			int ignored = 0;
			int invalid = 0;
			int size = 0;
			for(DocsResp r : resps) {
				if (r.xdoc == null)
					ignored++;
				size++;
			}
			return new int[] { size, ignored, invalid };
		}

		return new int[] {0, 0, 0};
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

		DocsReq req = (DocsReq) new DocsReq(docTabl, synuri)
					.pageInf(0, -1, "pid", docId)
					.a(A.rec);

		DocsResp resp = null;
		try {
			AnsonMsg<DocsReq> q = client
					.<DocsReq>userReq(synuri, Port.docstier, req)
					.header(header);

			resp = client.commit(q, errCtx);
		} catch (AnsonException | SemanticException e) {
			errHandler.err(MsgCode.exSemantic,
				e.getMessage() + " " + (e.getCause() == null ?
				"" : e.getCause().getMessage()));
		} catch (IOException e) {
			errHandler.err(MsgCode.exIo,
				e.getMessage() + " " + (e.getCause() == null ?
				"" : e.getCause().getMessage()));
		}
		return resp;
	}
	
	public DocsResp listNodes(String docTabl, String org, ErrorCtx ... onErr) {
		OnError errHandler = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
		String[] act = AnsonHeader.usrAct("synclient.java", "synch", "c/photo", "multi synch");
		AnsonHeader header = client.header().act(act);

		DocsReq req = new DocsReq(docTabl, synuri);
		req.a(A.orgNodes);
		req.org = org;

		DocsResp resp = null;
		try {
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(synuri, Port.docstier, req)
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
		DocsReq req = (DocsReq) new DocsReq(tabl, synuri)
				.doc(device, clientpath)
				.a(A.del);

		DocsResp resp = null;
		try {
			String[] act = AnsonHeader.usrAct("synclient.java", "del", "d/photo", "");
			AnsonHeader header = client.header().act(act);
			AnsonMsg<DocsReq> q = client.<DocsReq>userReq(synuri, Port.docstier, req)
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
	 * [Synchronously]
	 * Create a doc record at server side, then start pushing.
	 * <p>Using block chain for file upload.</p>
	 * 
	 * @param tabl
	 * @param doc
	 * @param follow handling following pushes.
	 * @param errorCtx
	 * @param onproc 
	 * @param template 
	 * @return doc response
	 * @throws TransException
	 * @throws IOException
	 * @throws SQLException
	 */
	public DocsResp startPush(ExpSyncDoc template, String tabl, ExpSyncDoc doc, OnOk follow, OnProcess onproc, ErrorCtx ... errorCtx)
			throws TransException, IOException, SQLException {
		List<IFileDescriptor> videos = new ArrayList<IFileDescriptor>();
		videos.add(doc);
		
		OnDocsOk follows = new OnDocsOk() {
			@Override
			public void ok(List<? extends AnsonResp> resps)
					throws IOException, AnsonException, TransException, SQLException {
				follow.ok(isNull(resps) ? null : resps.get(0));
			}
		};

		List<DocsResp> resps = startPushs(template, tabl, videos, onproc,
				follows, isNull(errorCtx) ? errCtx : errorCtx[0]);
		return isNull(resps) ? null : resps.get(0);
	}
	
	/**
	 * @param page
	 * @param tabl
	 * @return reply
	 * @throws TransException
	 * @throws IOException
	 */
	public <T extends IPort> DocsResp synQueryPathsPage(PathsPage page, T port)
			throws TransException, IOException {
		String[] act = AnsonHeader.usrAct("synclient.java", "query", "r/states", "query sync");
		AnsonHeader header = client.header().act(act);

		DocsReq req = (DocsReq) new DocsReq()
				.syncing(page)
				.docTabl(doctbl)
				.device(new Device(page.device, null))
				.a(A.selectSyncs); 

		AnsonMsg<DocsReq> q = client
				.<DocsReq>userReq(synuri, port, req)
				.header(header);

		DocsResp resp = client.commit(q, errCtx);

		return resp;
	}
}
