package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantic.jserv.R.QueryReq;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

public class SessionClient {

	private String servRt;
	private String conn;
	private HttpServClient httpClient;

	private JMessage<? extends JBody> req;
	private SemanticObject ssInf;
	private Port port;
	private String t;
	private String maint;
	private int page;
	private int size;
	private String[] usrAct;
	private List<String[]> urlparas;
	private List<String[]> exprs;
	private List<String[]> joins;
	private List<String[]> conds;
	private List<String[]> orders;
	private List<String[]> groupings;
	
	SessionClient(SemanticObject sessionInfo, String servRt, String conn) {
		this.ssInf = sessionInfo;
		this.servRt = servRt;
		this.conn = conn;
	}
	
	public SessionClient httpClient(HttpServClient client) {
		this.httpClient = client;
		return this;
	}

	public void commit(SCallback callback)
			throws SemanticException, IOException, SQLException {
		String url = req.servUrl(servRt, conn);
  		httpClient.post(url, req, callback);
	}
	
	/**
	 * @param t e.g. e_areas
	 * @param funcId current function ID
	 * @param page
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public SessionClient query(String t, String funcId, int page, int size) throws SemanticException {
		this.port = Port.query;
		this.t = t;
		this.maint = t;
		this.page = page;
		this.size = size;
		return setUserAct(funcId, "query", t, "R");
	}

	protected SessionClient setUserAct(String funcId, String funcName, String url, String cmd) {
		usrAct = new String[] {funcId, funcName, url, cmd};
		return this;
	}

	public SessionClient urlPara(String pname, String pv) {
		if (urlparas == null)
			urlparas = new ArrayList<String[]>();
		urlparas.add(new String[] {pname, pv});
		return this;
	}

	public SessionClient expr(String expr, String alais, String... tabl) {
		if (exprs == null)
			exprs = new ArrayList<String[]>();
		// expr: [ tabl, expr, alais(optional) ]
		exprs.add(JBody.expr(alais, expr,
				tabl != null && tabl.length > 0 ? tabl[0]
						: maint != null ? maint : t));
		return this;
	}

	/**Join clause
	 * @param joinTabl
	 * @param onCondts
	 * @return
	 * @throws SQLException 
	 */
	public SessionClient j(String joinTabl, String onCondts) throws SQLException {
		return join("j", joinTabl, onCondts);
	}
	
	public SessionClient r(String joinTabl, String onCondts) throws SQLException {
		return join("r", joinTabl, onCondts);
	}
	
	public SessionClient l(String joinTabl, String onCondts) throws SQLException {
		return join("l", joinTabl, onCondts);
	}
	
	/**Use this to set main table if query(t) where t is not the main table.
	 * @param mtabl
	 * @return
	 * @throws SQLException
	 */
	public SessionClient maintbl(String mtabl) throws SQLException {
		if (joins != null)
			throw new SQLException("main-table must been set before any joins");
		if (exprs != null)
			Utils.warn("It's not safe to set main table (%s) after exprs be set", mtabl);
		maint = mtabl;
		joins = new ArrayList<String[]>();
		joins.add(new String[] {"main-table", mtabl, null});
		return this;
	}

	private SessionClient join(String jt, String joinTabl, String onCondts) throws SQLException {
		if ("main-table".equals(jt))
			maintbl(joinTabl);

		if (joins == null)
			maintbl(maint);
		
		joins.add(new String[] {jt, joinTabl, onCondts});
		return this;
	}
	
	public SessionClient where(String logic, String field, String v, String... tabl) {
		if (conds == null)
			conds = new ArrayList<String[]> ();
		conds.add(JBody.jcondt(logic, field, v,
				tabl == null || tabl.length == 0 || tabl[0] == null ? null : tabl[0]));
		return this;
	}

	/**Print Json Request (no request sent to server)
	 * @return
	 * @throws SQLException 
	 */
	public SessionClient console() throws SQLException {
		if(Clients.console) {
			try {
				System.out.println("JsonClient.test():");

				String url = formatUrl("query");
				System.out.println(url);

				JMessage<QueryReq> payload;
				if (port == Port.query)
					payload = QueryReq.formatReq(ssInf, usrAct, joins, exprs, conds, orders, groupings);
				else 
					throw new SQLException("currently test() is used only for query condition verification.");

				System.out.println(payload.toString());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	private String formatUrl(String servId) {
		String url = String.format("%s/%s.serv?t=%s&page=%s&size=%s",
							servRt,
							servId == null ? "query" : servId,
							t == null ? "" : t,
							page, size);
		if (urlparas != null)
			for (String[] para : urlparas)
				url += String.format("&%s=%s", (Object[])para);
		return url;
	}

}
