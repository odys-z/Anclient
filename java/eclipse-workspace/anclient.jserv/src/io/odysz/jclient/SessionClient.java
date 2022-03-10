package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.jclient.tier.ErrorCtx;
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
import io.odysz.semantic.jsession.HeartBeat;
import io.odysz.semantic.jsession.SessionInf;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.x.SemanticException;

/**AnClient.java with session managed.
 * @author odys-z@github.com
 *
 */
public class SessionClient {
	static boolean verbose;
	public static void verbose(boolean v) { verbose = v;}

	private SessionInf ssInf;
	public SessionInf ssInfo () { return ssInf; }
	
	private ArrayList<String[]> urlparas;
	private AnsonHeader header;

	private boolean stoplink;
	private String syncFlag;
	private AnsonMsg<HeartBeat> beatReq;
	private int msInterval;
	
	/**Session login response from server.
	 * @param sessionInfo
	 */
	SessionClient(SessionInf sessionInfo) {
		this.ssInf = sessionInfo;
	}
	
	public SessionClient openLink(String clientUri, OnOk onLink, OnError onBroken, int... msInterv) {
		// link
		syncFlag = "link";
		stoplink = false;

		HeartBeat beat = new HeartBeat(null, clientUri, ssInf.ssid(), ssInf.uid());
		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
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
					onLink.ok(resp.body(0));
					syncFlag.wait(msInterval);
				}
				catch (InterruptedException e) { }
				catch (SemanticException | AnsonException | IOException e) {
					failed++;
					if (onBroken != null)
						onBroken.err(MsgCode.exSession, "heart link broken");
					try { syncFlag.wait(msInterval * Math.min(failed, 20)); }
					catch (InterruptedException e1) { }
				} }
		}).start();
		
		return this;
	}
	
	public SessionClient closeLink() {
		stoplink = true;
		if (syncFlag != null)
			synchronized(syncFlag) {
				syncFlag.notifyAll();
				syncFlag = null;
			}
		return this;
	}
	
	/**Format a query request object, including all information for construct a "select" statement.
	 * @param conn connection id
	 * @param tbl main table, (sometimes function category), e.g. "e_areas"
	 * @param alias from table alias, e.g. "a"
	 * @param page -1 for no paging at server side.
	 * @param size
	 * @param funcId current function ID
	 * @return formatted query object.
	 * @throws Exception
	 */
	public AnsonMsg<AnQueryReq> query(String conn, String tbl, String alias,
			int page, int size, String... funcId) throws SemanticException {

		AnsonMsg<AnQueryReq> msg = new AnsonMsg<AnQueryReq>(Port.query);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		if (funcId != null && funcId.length > 0)
			AnsonHeader.usrAct(funcId[0], "query", "R", "test");
		msg.header(header);

		AnQueryReq itm = AnQueryReq.formatReq(conn, msg, tbl, alias);
		msg.body(itm);
		itm.page(page, size);

		return msg;
	}
	
	@SuppressWarnings("unchecked")
	public AnsonMsg<AnUpdateReq> update(String furi, String tbl, String... act)
			throws SemanticException {

		AnUpdateReq itm = AnUpdateReq.formatUpdateReq(furi, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.update, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return (AnsonMsg<AnUpdateReq>) jmsg.header(header) 
					;//.body(itm);
	}

	/**<p>create a user type of message.</p>
	 * @deprecated replaced by {@link #userReq(String, IPort, AnsonBody, LogAct...)}
	 * @param <T> body type
	 * @param port
	 * @param act not used for session less
	 * @param req request body
	 * @return Anson message1.3.3-SNAPSHOT
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

	/**Create a user request message.
	 * @param <T>
	 * @param uri component uri
	 * @param port
	 * @param bodyItem request body, created by like: new jvue.UserReq(uri, tabl).
	 * @param act action, optional.
	 * @return AnsonMsg 
	 * @throws AnsonException port is null
	 */
	public <T extends AnsonBody> AnsonMsg<T> userReq(String uri, IPort port, T bodyItem, LogAct... act) throws AnsonException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<UserReq> needs port explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		bodyItem.uri(uri);
		if (act != null && act.length > 0)
			header.act(act[0]); 

		return new AnsonMsg<T>(port).header(header).body(bodyItem);
	}

	public AnsonMsg<?> insert(String conn, String tbl, String ... act) throws SemanticException {
		AnInsertReq itm = AnInsertReq.formatInsertReq(conn, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.insert, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return  jmsg.header(header) 
					.body(itm);
	}

	public <T extends DocsReq> String download(String uri, IPort port, T body, String localpath, LogAct... act) throws AnsonException, SemanticException, IOException {
		if (port == null)
			throw new AnsonException(0, "AnsonMsg<DocsReq> needs port explicitly specified.");

		// let header = Protocol.formatHeader(this.ssInf);
		body.uri(uri);
		if (act != null && act.length > 0)
			header.act(act[0]); 

		AnsonMsg<T> msg = new AnsonMsg<T>(port).header(header).body(body);
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
			header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		return header;
	}
	
	public SessionClient urlPara(String pname, String pv) {
		if (urlparas == null)
			urlparas = new ArrayList<String[]>();
		urlparas.add(new String[] {pname, pv});
		return this;
	}

	/**Print Json Request (no request sent to server)
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

	/**@deprecated This is an asynchronous API but works synchronously.
	 * The {@link ErrorCtx} API pattern is better.
	 * @see HttpServClient#post(String, AnsonMsg)
	 * @see #commit(AnsonMsg, ErrorCtx)
	 * @param <R> Request type
	 * @param <A> Response type
	 * @param req request
	 * @param onOk on ok callback
	 * @param onErr error context
	 * @throws SemanticException
	 * @throws IOException
	 * @throws SQLException
	 * @throws AnsonException
	@SuppressWarnings("unchecked")
	public <R extends AnsonBody, A extends AnsonResp> void commit(AnsonMsg<R> req, SCallbackV11 onOk, SCallbackV11... onErr)
			throws SemanticException, IOException, SQLException, AnsonException {
    	HttpServClient httpClient = new HttpServClient();

    	if (verbose) {
    		Utils.logi(Clients.servUrl(req.port()));
    		Utils.logAnson(req);
    	}
  		httpClient.post(Clients.servUrl(req.port()), req,
  				(code, obj) -> {
  					if(Clients.verbose) {
  						Utils.printCaller(false);
  						Utils.logAnson(obj);
  					}
  					if (MsgCode.ok == code) {
  						onOk.onCallback(code, (A) obj);
  					}
  					else {
  						if (onErr != null && onErr.length > 0 && onErr[0] != null)
  							onErr[0].onCallback(code, obj);
  						else Utils.warn("code: %s\nerror: %s", code, ((AnsonResp)obj).msg());
  					}
  				});
	}
	 */
	//

	/**
	 * Submit request.
	 * @param <R>
	 * @param <A>
	 * @param req
	 * @param err
	 * @return response
	 * @throws SemanticException
	 * @throws IOException
	 * @throws AnsonException
	 */
	@SuppressWarnings("unchecked")
	public <R extends AnsonBody, A extends AnsonResp> A commit(AnsonMsg<R> req, ErrorCtx err)
			throws SemanticException, IOException, AnsonException {
    	if (verbose) {
    		Utils.logi(Clients.servUrl(req.port()));
    		Utils.logAnson(req);
    	}
    	HttpServClient httpClient = new HttpServClient();
  		AnsonMsg<AnsonResp> resp = httpClient.post(Clients.servUrl(req.port()), req);

  		MsgCode code = resp.code();

		if(Clients.verbose) {
			Utils.printCaller(false);
			Utils.logAnson(resp);
		}

		if (MsgCode.ok == code) {
			return (A) resp.body(0);
		}
		else {
			err.onError(code, resp.body(0).msg());
			return null;
		}
	}

	public void logout() {
		closeLink();
	}

}
