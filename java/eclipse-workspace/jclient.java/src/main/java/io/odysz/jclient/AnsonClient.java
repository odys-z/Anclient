package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jprotocol.JProtocol.CRUD;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.U.InsertReq;
import io.odysz.semantic.jserv.U.UpdateReq;
import io.odysz.semantic.jsession.SessionInf;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

import static io.odysz.jsample.cheap.CheapCode.*;

/**TODO rename
 * @author odys-z@github.com
 *
 */
public class AnsonClient {

	private SessionInf ssInf;
	public SessionInf ssInfo () { return ssInf; }
	
	private ArrayList<String[]> urlparas;
	private JHeader header;
	
	/**Session login response from server.
	 * @param sessionInfo
	 */
	AnsonClient(SessionInf sessionInfo) {
		this.ssInf = sessionInfo;
	}
	
	/**Format a query request object, including all information for construct a "select" statement.
	 * @param t main table, (sometimes function category), e.g. "e_areas"
	 * @param alias from table alias, e.g. "a"
	 * @param page -1 for no paging at server side.
	 * @param size
	 * @param funcId current function ID
	 * @return formatted query object.
	 * @throws Exception
	 */
	public AnsonMsg<AnQueryReq> query(String conn, String alias,
			int page, int size, String... funcId) throws SemanticException {

		AnsonMsg<AnQueryReq> req = new AnsonMsg<AnQueryReq>(Port.query);

		JHeader header = new JHeader(ssInf.ssid(), ssInf.uid());
		if (funcId != null && funcId.length > 0)
			JHeader.usrAct(funcId[0], "query", "R");
		req.header(header);

		AnQueryReq itm = AnQueryReq.formatReq(conn, req, alias);
		req.body(itm);
		itm.page(page, size);

		return req;
	}
	
	@SuppressWarnings("unchecked")
	public JMessage<UpdateReq> update(String conn, String tbl, String... act)
			throws SemanticException {

		UpdateReq itm = UpdateReq.formatReq(conn, null, tbl, CRUD.U);
		JMessage<? extends JBody> jmsg = userReq(tbl, Port.update, act, itm);

		JHeader header = new JHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return (JMessage<UpdateReq>) jmsg.header(header) 
					.body(itm);
	}

	@SuppressWarnings("unchecked")
	public JMessage<InsertReq> insert(String conn, String tbl, String... act)
			throws SemanticException {
		InsertReq itm = InsertReq.formatReq(conn, null, tbl);
		JMessage<? extends JBody> jmsg = userReq(tbl, Port.insert, act, itm);

		JHeader header = new JHeader(ssInf.ssid(), ssInf.uid());
		if (act != null && act.length > 0)
			header.act(act);
		
		return (JMessage<InsertReq>) jmsg.header(header) 
					.body(itm);
	}


	public <T extends JBody> JMessage<? extends JBody> userReq(String t, IPort port, String[] act, T req)
			throws SemanticException {
		if (ssInf == null)
			throw new SemanticException("SessionClient can not visit jserv without session information.");

		JMessage<?> jmsg = new JMessage<T>(port);
		jmsg.t = t;
		
		header().act(act);
		jmsg.header(header);
		jmsg.body(req);

		return jmsg;
	}

	public JHeader header() {
		if (header == null)
			header = new JHeader(ssInf.ssid(), ssInf.uid());
		return header;
	}
	
	public AnsonClient urlPara(String pname, String pv) {
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
	public AnsonClient console(JMessage<? extends JBody> req) throws SQLException {
		if(Clients.console) {
			try {
				Utils.logi(req.toStringEx());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	public void commit(JMessage<? extends JBody> req, SCallback onOk, SCallback... onErr)
			throws SemanticException, IOException, SQLException {
    	HttpServClient httpClient = new HttpServClient();
  		httpClient.post(Clients.servUrl(req.port()), req,
  				(code, obj) -> {
  					if(Clients.console) {
  						Utils.printCaller(false);
  						JHelper.logi(obj);
  					}
  					SemanticObject o = (SemanticObject) obj.get("data");
  					if (isOk(obj.code())) {
  						onOk.onCallback(code, o);
  					}
  					else {
  						if (onErr != null && onErr.length > 0 && onErr[0] != null)
  							onErr[0].onCallback(code, obj);
  						else Utils.warn("code: %s\nerror: %s", code, obj.get("error"));
  					}
  				});
	}

	public void logout() {
	}

}
