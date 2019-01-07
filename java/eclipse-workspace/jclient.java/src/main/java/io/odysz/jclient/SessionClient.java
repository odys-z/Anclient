package io.odysz.jclient;

import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jserv.R.QueryReq;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

public class SessionClient {

	private SemanticObject ssInf;
	private ArrayList<String[]> urlparas;
	
	private JMessage<QueryReq> req;
	
	SessionClient(SemanticObject sessionInfo) {
		this.ssInf = sessionInfo;
	}
	
	/**
	 * @param t e.g. "e_areas"
	 * @param alias e.g. "a"
	 * @param funcId current function ID
	 * @param page -1 for no paging at server side.
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public JMessage<QueryReq> query(String t, String alias, String funcId, int page, int size) throws SemanticException {
		req = new JMessage<QueryReq>(Port.query);
		req.t = t;

		JHeader header = new JHeader(funcId, ssInf.getString("uid"));
		header.usrAct(funcId, "query", t, "R");
		req.header(header);

		QueryReq itm = QueryReq.formatReq(req, ssInf, t, alias);
		req.body(itm);
		itm.page(page, size);

		return req;
	}

	public SessionClient urlPara(String pname, String pv) {
		if (urlparas == null)
			urlparas = new ArrayList<String[]>();
		urlparas.add(new String[] {pname, pv});
		return this;
	}

	/**Print Json Request (no request sent to server)
	 * @return
	 * @throws SQLException 
	 */
	public SessionClient console() throws SQLException {
		if(Clients.console) {
			try {
				Utils.logi(req.toStringEx());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	public void logout() {
		
	}

}
