package io.odysz.jclient;

import static io.odysz.common.LangExt.isblank;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.LogAct;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.U.AnInsertReq;
import io.odysz.semantic.jserv.U.AnUpdateReq;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.jsession.AnSessionReq;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantic.jsession.HeartBeat;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;

/**
 * AnClient.java with session managed.
 * 
 * @author odys-z@github.com
 *
 */
public class SessionClient {
	static boolean verbose;
	public static void verbose(boolean v) { verbose = v;}

	protected final String myservRt;

	protected SessionInf ssInf;
	public SessionInf ssInfo () { return ssInf; }

	/** * @since 0.5.0 */
	protected Anson profile;
	/** * @since 0.5.0 */
	public Anson profile() { return profile; }
	
	private ArrayList<String[]> urlparas;
	private AnsonHeader header;

	private boolean stoplink;
	private String syncFlag;
	private AnsonMsg<HeartBeat> beatReq;
	private int msInterval;

	
	/**
	 * Session login response from server.
	 * @param sessionInfo
	 */
	public SessionClient(final String jservRoot, SessionInf sessionInfo) {
		this.ssInf = sessionInfo;
		this.myservRt = isblank(jservRoot) ? Clients.servRt : new String(jservRoot);
		if (isblank(this.myservRt))
			throw new AnsonException(0, "Initialized final field myservRt is empty.");
	}
	
	/**
	 * @since 0.5.0
	 * @param r session login response from server.
	 * @param pswdPlain 
	 * @throws SsException 
	 */
	public SessionClient(final String jservRoot, AnSessionResp r, String pswdPlain) throws SsException {
		try {
			myservRt = isblank(jservRoot) ? Clients.servRt : new String(jservRoot);
			if (isblank(this.myservRt))
				throw new AnsonException(0, "Initialized final field myservRt is empty.");

			ssInf = r.ssInf();
			ssInf.ssToken = AESHelper.repackSessionToken(ssInf.ssToken, pswdPlain, ssInf.uid());
			profile = r.profile();
		} catch (GeneralSecurityException | IOException e) {
			throw new SsException(e.getMessage());
		}
	}

	/**
	 * Login and return a client instance (with session managed by jserv).
	 * 
	 * <h5>Note: since 2.0.0, deprecating static way of {@link Clients#servRt}
	 * since anclient.java 1.4.14</h5>
	 * This class uses instance's url root jserv, which is copied from {@link Clients#servRt}
	 * that is usually be initialized with {@link Clients#init(String, boolean...)}. 
	 * 
	 * @param uri
	 * @param uid
	 * @param pswdPlain
	 * @param mac
	 * @return a SessionClient instance if login has succeed.
	 * @throws IOException
	 * @throws SemanticException
	 * @throws AnsonException
	 * @throws SsException
	 * @since 2.0.0
	 */
	public SessionClient loginWithUri(String uri, String uid, String pswdPlain, String... mac)
			throws IOException, SemanticException, AnsonException, SsException {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		if (uid == null || pswdPlain == null)
			throw new SemanticException("user id and password can not be null.");
		String tk64;
		try {
			tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		} catch (GeneralSecurityException e) {
			e.printStackTrace();
			throw new SsException("AES encrpyt failed: %s\nCause: %s",
								e.getMessage(), e.getCause().getMessage());
		}
		
		AnsonMsg<AnSessionReq> reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64, mac)
										.uri(uri);

		HttpServClient httpClient = new HttpServClient();
		String url = servUrl(Port.session); 

		AnsonMsg<AnsonResp> resp = httpClient.post(url, reqv11);
		if (Clients.verbose)
			Utils.logi(resp.toString());

		if (AnsonMsg.MsgCode.ok == resp.code()) {
			SessionClient c = new SessionClient(myservRt, (AnSessionResp) resp.body(0), pswdPlain);

			if (mac != null && mac.length > 0)
				c.ssInfo().device(mac[0]);
		
			return c;
		}
		else throw new SsException(
				"loging failed\ncode: %s\nerror: %s",
				resp.code(), ((AnsonResp)resp.body(0)).msg());
	}

	String servUrl(IPort p) {
		return String.format("%s/%s", myservRt, p.url());
	}

	/**
	 * Start a heart beat thread which is sleeping on thread signal {@link #syncFlag}.
	 * @param clientUri
	 * @param onLink can be null
	 * @param onBroken can be null
	 * @param msInterv
	 * @return this
	 */
	public SessionClient openLink(String clientUri, OnOk onLink, OnError onBroken, int... msInterv) {
		// link
		syncFlag = "link";
		stoplink = false;

		HeartBeat beat = new HeartBeat(null, clientUri, ssInf.ssid(), ssInf.uid());
		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		beatReq = new AnsonMsg<HeartBeat>(Port.heartbeat)
				.header(header)
				.body(beat);
		
		msInterval = msInterv == null || msInterv.length < 1 ? 60000 : msInterv[0];

		new Thread(() -> {
			int failed = 0;
			while (!stoplink)
				synchronized(syncFlag) {
				try {
					HttpServClient httpClient = new HttpServClient();
					AnsonMsg<AnsonResp> resp = httpClient.post(Clients.servUrl(beatReq.port()), beatReq);
					MsgCode code = resp.code();
					if (MsgCode.ok != code)
						throw new SemanticException("retry");
					failed = 0;

					if (onLink != null)
						onLink.ok(resp.body(0));

					syncFlag.wait(msInterval);
				}
				catch (InterruptedException e) { }
				catch (TransException | AnsonException | IOException | SQLException e) {
					failed++;
					if (onBroken != null)
						onBroken.err(MsgCode.exSession, "heart link broken");
					try { syncFlag.wait(msInterval * Math.min(failed, 20)); }
					catch (InterruptedException e1) { }
				} }
		}).start();
		
		return this;
	}
	
	/**
	 * Release any threads block on {@link #syncFlag}.
	 * 
	 * @see #openLink(String, OnOk, OnError, int...)
	 * @return this
	 */
	public SessionClient closeLink() {
		stoplink = true;
		if (syncFlag != null)
			synchronized(syncFlag) {
				syncFlag.notifyAll();
				syncFlag = null;
			}
		return this;
	}
	
	/**
	 * Format a query request object, including all information for construct a "select" statement.
	 * 
	 * @param uri connection id
	 * @param tbl main table, (sometimes function category), e.g. "e_areas"
	 * @param alias from table alias, e.g. "a"
	 * @param page -1 for no paging at server side.
	 * @param size
	 * @param funcId current function ID
	 * @return formatted query object.
	 * @throws Exception
	 */
	public AnsonMsg<AnQueryReq> query(String uri, String tbl, String alias,
			int page, int size, String... funcId) throws SemanticException {

		AnsonMsg<AnQueryReq> msg = new AnsonMsg<AnQueryReq>(Port.query);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		if (funcId != null && funcId.length > 0)
			AnsonHeader.usrAct(funcId[0], "query", "R", "test");
		msg.header(header);

		AnQueryReq itm = AnQueryReq.formatReq(uri, msg, tbl, alias);
		msg.body(itm);
		itm.page(page, size);

		return msg;
	}
	
	@SuppressWarnings("unchecked")
	public AnsonMsg<AnUpdateReq> update(String furi, String tbl, String... act)
			throws SemanticException {

		AnUpdateReq itm = AnUpdateReq.formatUpdateReq(furi, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.update, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		if (act != null && act.length > 0)
			header.act(act);
		
		return (AnsonMsg<AnUpdateReq>) jmsg.header(header);
	}

	/**
	 * <p>create a user type of message.</p>
	 * 
	 * @deprecated replaced by {@link #userReq(String, IPort, AnsonBody, LogAct...)}
	 * @param <T> body type
	 * @param port
	 * @param act not used for session less
	 * @param req request body
	 * @return Anson message
	 * @since 1.3.3
	 * @throws SemanticException
	 */
	public <T extends AnsonBody> AnsonMsg<T> userReq(IPort port, String[] act, T req)
			throws SemanticException {
		if (ssInf == null)
			throw new SemanticException("SessionClient can not visit jserv without session information.");

		AnsonMsg<T> jmsg = new AnsonMsg<T>(port);
		
		header().act(act);
		jmsg.header(header);
		jmsg.body(req);

		return jmsg;
	}

	/**
	 * Create a user request message.
	 * 
	 * @param <T>
	 * @param uri component uri
	 * @param port
	 * @param bodyItem request body, created by like: new jvue.UserReq(uri, tabl).
	 * @param act action, optional.
	 * @return AnsonMsg 
	 * @throws AnsonException port is null
	 */
	public <T extends AnsonBody> AnsonMsg<T> userReq(String uri, IPort port, T bodyItem, LogAct... act)
			throws AnsonException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<UserReq> needs port explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		bodyItem.uri(uri);
		if (act != null && act.length > 0)
			header().act(act[0]); 

		return new AnsonMsg<T>(port).header(header()).body(bodyItem);
	}

	public AnsonMsg<?> insert(String conn, String tbl, String ... act) throws SemanticException {
		AnInsertReq itm = AnInsertReq.formatInsertReq(conn, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.insert, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		if (act != null && act.length > 0)
			header.act(act);
		
		return  jmsg.header(header) 
					.body(itm);
	}

	/**
	 * @param uri
	 * @param port
	 * @param body
	 * @param localpath
	 * @param act
	 * @return local full path
	 * @throws AnsonException
	 * @throws SemanticException
	 * @throws IOException
	 */
	public <T extends DocsReq> String download(String uri, IPort port, T body, String localpath, LogAct... act) throws AnsonException, SemanticException, IOException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<DocsReq> needs port being explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		body.uri(uri);
		if (act != null && act.length > 0)
			header().act(act[0]); 

		AnsonMsg<T> msg = new AnsonMsg<T>(port).header(header()).body(body);
		if (Clients.verbose) Utils.logi(msg.toString());
    	HttpServClient httpClient = new HttpServClient();
  		return httpClient.streamdown(Clients.servUrl(port), msg, localpath);
	}

	/*
	public <T extends DocsReq> AnsonMsg<AnsonResp> upload(String uri, IPort port, T body, String localpath, LogAct... act) throws AnsonException, SemanticException, IOException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<DocsReq> needs port explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		body.uri(uri);
		if (act != null && act.length > 0)
			header.act(act[0]); 

		AnsonMsg<T> msg = new AnsonMsg<T>(port).header(header).body(body);
		if (Clients.verbose) Utils.logi(msg.toString());
    	HttpServClient httpClient = new HttpServClient();
  		return httpClient.streamup(Clients.servUrl(port), msg, localpath);
	}
	*/
	
	public AnsonHeader header() {
		if (header == null)
			header = new AnsonHeader(ssInf.ssid(), ssInf.uid(), ssInf.ssToken);
		return header;
	}
	
	public SessionClient urlPara(String pname, String pv) {
		if (urlparas == null)
			urlparas = new ArrayList<String[]>();
		urlparas.add(new String[] {pname, pv});
		return this;
	}

	/**
	 * Print Json Request (no request sent to server)
	 * 
	 * @param req 
	 * @return this object
	 * @throws SQLException 
	 */
	public SessionClient console(AnsonMsg<? extends AnsonBody> req) throws SQLException {
		if(Clients.verbose) {
			try {
				Utils.logi(req.toString());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	/**
	 * Submit a request.
	 * 
	 * @param <R> request type
	 * @param <A> answer type
	 * @param req
	 * @param err
	 * @return response
	 * @throws SemanticException
	 * @throws IOException
	 * @throws AnsonException
	 */
	@SuppressWarnings("unchecked")
	public <R extends AnsonBody, A extends AnsonResp> A commit(AnsonMsg<R> req, OnError err)
			throws SemanticException, IOException, AnsonException {
    	if (verbose) {
    		Utils.logi(servUrl(req.port()));
    		Utils.logAnson(req);
    	}
    	
    	if (isblank(req.body(0).a()))
    		throw new AnsonException(0,
    			"Since anclient.java 0.5, jserv 2.0.0, empty a-tag is forced for session-required request.");
    	
    	HttpServClient httpClient = new HttpServClient();
  		AnsonMsg<AnsonResp> resp = httpClient.post(servUrl(req.port()), req);

  		MsgCode code = resp.code();

		if(verbose) {
			Utils.printCaller(false);
			Utils.logAnson(resp);
		}

		if (MsgCode.ok == code) {
			return (A) resp.body(0);
		}
		else {
			err.err(code, resp.body(0).msg());
			return null;
		}
	}

	public void logout() {
		closeLink();
	}

	public boolean isSessionValid() {
		return !stoplink;
	}

}
