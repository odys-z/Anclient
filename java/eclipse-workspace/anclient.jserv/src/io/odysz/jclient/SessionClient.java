package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.SCallbackV11;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.U.AnInsertReq;
import io.odysz.semantic.jserv.U.AnUpdateReq;
import io.odysz.semantic.jsession.SessionInf;
import io.odysz.semantics.x.SemanticException;

/**TODO rename as SessionClient
 * @author odys-z@github.com
 *
 */
public class SessionClient {

	private SessionInf ssInf;
	public SessionInf ssInfo () { return ssInf; }
	
	private ArrayList<String[]> urlparas;
	private AnsonHeader header;
	
	/**Session login response from server.
	 * @param sessionInfo
	 */
	SessionClient(SessionInf sessionInfo) {
		this.ssInf = sessionInfo;
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
			// FIXME Bug? No test for DB log since Antson 1.0?
			// FIXME Bug? No test for DB log since Antson 1.0?
			// FIXME Bug? No test for DB log since Antson 1.0?
			AnsonHeader.usrAct(funcId[0], "query", "R", "test");
		msg.header(header);

		AnQueryReq itm = AnQueryReq.formatReq(conn, msg, tbl, alias);
		msg.body(itm);
		itm.page(page, size);

		return msg;
	}
	
	@SuppressWarnings("unchecked")
	public AnsonMsg<AnUpdateReq> update(String conn, String tbl, String... act)
			throws SemanticException {

		AnUpdateReq itm = AnUpdateReq.formatUpdateReq(conn, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.update, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return (AnsonMsg<AnUpdateReq>) jmsg.header(header) 
					;//.body(itm);
	}

	public <T extends AnsonBody> AnsonMsg<? extends AnsonBody> userReq(IPort port, String[] act, T req)
			throws SemanticException {
		if (ssInf == null)
			throw new SemanticException("SessionClient can not visit jserv without session information.");

		AnsonMsg<?> jmsg = new AnsonMsg<T>(port);
		
		header().act(act);
		jmsg.header(header);
		jmsg.body(req);

		return jmsg;
	}

	public AnsonMsg<?> insert(String conn, String tbl, String ... act) throws SemanticException {
		AnInsertReq itm = AnInsertReq.formatInsertReq(conn, null, tbl);
		AnsonMsg<? extends AnsonBody> jmsg = userReq(Port.insert, act, itm);

		AnsonHeader header = new AnsonHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return jmsg.header(header) 
					.body(itm);
	}

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
		if(Clients.console) {
			try {
				Utils.logi(req.toString());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	// public void commit(AnsonMsg<? extends AnsonBody> req, SCallbackV11 onOk, SCallbackV11... onErr)
	@SuppressWarnings("unchecked")
	public <R extends AnsonBody, A extends AnsonResp> void commit(AnsonMsg<R> req, SCallbackV11 onOk, SCallbackV11... onErr)
			throws SemanticException, IOException, SQLException, AnsonException {
    	HttpServClient httpClient = new HttpServClient();
  		httpClient.post(Clients.servUrl(req.port()), req,
  				(code, obj) -> {
  					if(Clients.console) {
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

	public void logout() { }

}
