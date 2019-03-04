package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.MsgCode;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantic.jserv.R.QueryReq;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

public class SessionClient {

	private SemanticObject ssInf;
	private ArrayList<String[]> urlparas;
	
	/**Session login response from server.
	 * @param sessionInfo
	 */
	SessionClient(SemanticObject sessionInfo) {
		this.ssInf = sessionInfo;
	}
	
	/**Format a query request object, including all information for construct a "select" statement.
	 * @param t main table, (sometimes function category), e.g. "e_areas"
	 * @param alias from table alias, e.g. "a"
	 * @param funcId current function ID
	 * @param page -1 for no paging at server side.
	 * @param size
	 * @return formatted query object.
	 * @throws Exception
	 */
	public JMessage<QueryReq> query(String conn, String t, String alias, String funcId,
			int page, int size) throws SemanticException {

		JMessage<QueryReq> req = new JMessage<QueryReq>(Port.query);
		req.t = t;

		JHeader header = new JHeader(funcId, ssInf.getString("uid"));
		JHeader.usrAct(funcId, "query", t, "R");
		req.header(header);

		QueryReq itm = QueryReq.formatReq(conn, req, ssInf, t, alias);
		req.body(itm);
		itm.page(page, size);

		return req;
	}
	
	public <T extends JBody> JMessage<? extends JBody> userReq(String conn, String t, Port port, String[] act, T req)
			throws SemanticException {
		if (ssInf == null)
			throw new SemanticException("SessionClient can not visit jserv without session information.");

		JMessage<?> jmsg = new JMessage<T>(port);
		jmsg.t = t;
		
		JHeader header = new JHeader(ssInf.getString("ssid"), ssInf.getString("uid"));
		header.act(act);
		jmsg.header(header);
		jmsg.body(req);

		return jmsg;
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
	public SessionClient console(JMessage<QueryReq> req) throws SQLException {
		if(Clients.console) {
			try {
				Utils.logi(req.toStringEx());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	public void commit(JMessage<QueryReq> req, SCallback onOk, SCallback... onErr)
			throws SemanticException, IOException, SQLException {
    	HttpServClient httpClient = new HttpServClient();
  		httpClient.post(Clients.servUrl(Port.query), req,
  				(code, obj) -> {
  					JHelper.logi(obj);
  					SemanticObject o = (SemanticObject) obj.get("data");
  					if (MsgCode.ok.eq(obj.getString("code"))) {
  						onOk.onCallback(code, o);
  					}
  					else {
  						if (onErr != null && onErr.length > 0 && onErr[0] != null)
  							onErr[0].onCallback(code, o);
  						else Utils.warn("code: %s\nerror: %s", code, o.get("error"));
  					}
  				});
	}

	public void logout() {
	}

}
