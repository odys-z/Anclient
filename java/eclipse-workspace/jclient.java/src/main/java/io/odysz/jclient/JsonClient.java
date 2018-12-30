//package io.odysz.jclient;
//
//import java.io.ByteArrayInputStream;
//import java.io.IOException;
//import java.sql.SQLException;
//import java.util.ArrayList;
//import java.util.List;
//
//import io.odysz.common.AESHelper;
//import io.odysz.common.Configs;
//import io.odysz.common.Utils;
//import io.odysz.semantic.jprotocol.JBody;
//import io.odysz.semantic.jprotocol.JMessage;
//import io.odysz.semantic.jprotocol.JMessage.Port;
//import io.odysz.semantic.jprotocol.JProtocol;
//import io.odysz.semantic.jprotocol.JProtocol.SCallback;
//import io.odysz.semantic.jserv.R.QueryReq;
//import io.odysz.semantic.jserv.x.SsException;
//import io.odysz.semantic.jsession.SessionReq;
//import io.odysz.semantics.SemanticObject;
//import io.odysz.semantics.x.SemanticException;
//import io.odysz.transact.sql.parts.Sql;
//
///**
// * For how to use lambda expressions, see {@link #testAsych(IrCallback)}.
// * @author ody
// *
// */
//public class JsonClient {
//	static final boolean console = false;
//
//	/**A helper method for test that let user get comfort with lambda expression.
//	 * sample code:<pre>
//	new JsonClient("").testAsych((code, data) -> {
//		System.out.println(String.format("code: %s\ndata: %s", code, data));
//	});
//	System.out.println("Main thread going on...");</pre>
//	 *
//	 * output:<pre>
//	Main thread going on... (wait for a while)
//	code: 0101
//	data: D-XYZ</pre>
//	 * For lambda expression basics, see
//	 * <a href='https://javabydeveloper.com/lambda-expression-in-java8/'>what is Lambda (λ) Expression ?</a>
//	 * and <a href='https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html'>Lambda Expressions @ oracle java tutorial</a>. <br>
//	 * For why is lambda, see <a href='https://stackoverflow.com/questions/1842734/how-to-asynchronously-call-a-method-in-java'>How to asynchronously call a method in Java</a>.
//	 * @param callback a {@link IrCallback} implementation
//	 */
//	@SuppressWarnings("unused")
//	private void testAsych(SCallback callback) {
//		new Thread(new Runnable() {
//		    public void run() {
//		    	try {
//					Thread.sleep(1000); // post
//					//callback.onCallback("0101", new ByteArrayInputStream("D-XYZ".getBytes()));
//					callback.onCallback("0101", new SemanticObject().put("msg", "D-XYZ"));
//				} catch (IOException | SemanticException e) {
//					e.printStackTrace();
//				} catch (InterruptedException e) {
//					e.printStackTrace();
//				} catch (SQLException e) {
//					e.printStackTrace();
//				}
//		    }
//		}).start();
//	}
//
//	/**Tested Case 1. Login then query domain table: <pre>
//// example of how to handle call back
//IrCallback onOk = (ok, msg) -> {
//	try {
//		// example of how to get CRUD query client
//		JsonClient.client("admin")
//			.setUserAct("query", "", null, null)
//			.query(null, "a_domain", "test-main", -1, 0)
//			.j("a_reg_org:o", "domainId=o.orgType")
//			.post((code, data) -> {
//				System.out.println(String.format("on callback args:\ncode: %s\ndata: %s", code, data));
//			);
//	} catch (Exception e) { e.printStackTrace(); } };
//JsonClient.login("admin", "admin", onOk, null);
//// after login, client instance with user id 'admin' can be used to do CRUD request.</pre>
//	 * @param args
//	 * @throws Exception
//	 */
//	public static void main(String[] args) throws Exception {
//		SCallback onOk = (ok, msg) -> {
//			try {
//				JsonClient.login("127.0.0.1/ifire", "admin", "admin")
//						.setUserAct("query", "", null, null)
//						.query(null, "a_domain", "test-main", -1, 0)
//						.j("a_reg_org:o", "domainId=o.orgType")
//						.post((code, data) -> {
//							System.out.println(String.format("on callback args:\ncode: %s\ndata: %s", code, data));
//						});
//			} catch (Exception e) { e.printStackTrace(); } };
//
//		JsonClient.loginAsyncTest("admin", "admin", onOk, null);
//	}
//
//	/**last logged in uid when success on calling login()*/
//	static String lastUid;
//	/**get logged in uid's client. If uid == null, return the last logged in uid's client.
//	 * @param uid
//	 * @return
//	public static JsonClient client(String uid) {
//		if (uid == null)
//			return clients == null ? null : clients.get(lastUid);
//		else
//			return clients == null ? null : clients.get(uid);
//	}
//	 */
//
//	public static void loginAsyncTest(String uid, String pswdPlain, SCallback onOk, SCallback onErr) throws Exception {
//		byte[] iv =   AESHelper.getRandom();
//		String iv64 = AESHelper.encode64(iv);
//		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
//		
//		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
//		JMessage<SessionReq> req = SessionReq.formatLogin(uid, tk64, iv64);
//		@SuppressWarnings("unused")
//		JsonClient loginClient = new JsonClient()
//				.data(req)
//				.post((code, msg) -> {
//					if ("OK".equals(code)) {
//						// create a logged in client
//						JsonObject[] sessionInfo = Protocol.parseLogin((JsonObject) msg, uid, tk64, iv64);
//						JsonClient inst = new JsonClient(sessionInfo);
//						lastUid = uid;
//						// clients.put(lastUid, inst);
//
//						if (console) System.out.println(String.format(
//									"login succeed - uid: %s, ss-inf: %s",
//									uid, sessionInfo[0]));;
//						if (onOk != null) onOk.onCallback(code, msg);
//					}
//					else {
//						// clients.remove(uid);
//						if (onErr != null)
//							onErr.onCallback(code, msg);
//						else IrSingleton.warn("loging failed\ncode: %s\nmsg: %s", code, msg);
//					}
//				});
//	}
//
//	private Port port;
//	private String servId;
//	private String t;
//	private String maint;
//	private int page = 0;
//	private int size = 20;
//	/** [0] ss-inf, [1] usr-inf, see ir-frame.js/login().onSucess<pre>
//	 {"code":"OK",
//	  "msg":"0m1CQ63tNKu03yUaLF16-L7h",
//	  "obj":{"uid":"admin","userName":"admin","roleId":"010501","roleName":"平台管理员","orgId":"000001","orgName":"云智科技 A","orgType":"0105"},
//	  "url":"index.html"
//	 }</pre> */
//	protected JsonObject[] ssInf;
//
//	protected String[] usrAct;
//
//	/** post body payload set by payload() directly */
//	private JBody body;
//	/** [[0: j/l/r, 1: tabl:alais, 2: on and conditions]]  */
//	private ArrayList<String[]> joins;
//
//	/** [expr], where expr: [ tabl, expr, alais(optional) ]
//	 * elements should always been parsed/set by {@link Protocol#prepareExpr(String, String, String)}
//	 */
//	private ArrayList<String[]> exprs;
//	private ArrayList<String[]> conds;
//	private ArrayList<String> orders;
//	private ArrayList<String> groupings;
//
//	private ArrayList<String[]> urlparas;
//
//	// String servRoot = "http://221.236.26.28/ifire";
//	protected String servRoot = "http://localhost:8080/ifire";
//
//	protected JsonClient(JsonObject[] sessionInfo) {
//		try { servRoot = Configs.getCfg("url.serv");
//		} catch (ExceptionInInitializerError e) {
//			Utils.warn("--- FATAL ---\nCenter server URL missing in config.xml: ", "url.serv");
//		}
//
//		// sessionHeader = formatHeader(sessionId, userId, homepage, tk, iv64);
////		sessionHeader = sessionInfo[0];
////		this.sessionId = sessionInfo[1];
////		this.sessionUsr = sessionInfo[2];
////		this.homepage = sessionInfo[3];
//		this.ssInf = sessionInfo;
//	}
//
//	//loadPage(pagerId, listId, queryId, onSelectf, isSelectFirst, onCheckf, onCheckAllf)
//
//	/**Only used for login
//	 * @param header
//	 */
//	protected JsonClient() {
//		try { servRoot = Configs.getCfg("url.serv");
//		} catch (ExceptionInInitializerError e) {}
//
//		t = "login";
//		servId = "login";
//	}
//
//	/**Seam as ir-frame.js/setUserAction()<pre>
//  	ssinf.usrAct = {
//		funcId: funcId,
//		funcName: funcName,
//		url: url,
//		cmd: cmd
//	};</pre>
//	 * @param string
//	 * @param string2
//	 * @return
//	 */
//	protected JsonClient setUserAct(String funcId, String funcName, String url, String cmd) {
//		usrAct = new String[] {funcId, funcName, url, cmd};
//		return this;
//	}
//
//	/**
//	 * @param servId null for query
//	 * @param t e.g. e_areas
//	 * @param funcId current function ID
//	 * @param page
//	 * @param size
//	 * @return
//	 * @throws Exception
//	 */
//	public JsonClient query(String servId, String t, String funcId, int page, int size) throws Exception {
//		this.port = Port.query;
//		this.servId = servId;
//		this.t = t;
//		this.maint = t;
//		this.page = page;
//		this.size = size;
//		setUserAct(funcId, "query", "", "R");
//		return this;
//	}
//
//	public JsonClient urlPara(String pname, String pv) {
//		if (urlparas == null)
//			urlparas = new ArrayList<String[]>();
//		urlparas.add(new String[] {pname, pv});
//		return this;
//	}
//
//	public JsonClient expr(String expr, String alais, String... tabl) {
//		if (exprs == null)
//			exprs = new ArrayList<String[]>();
//		// expr: [ tabl, expr, alais(optional) ]
//		exprs.add(JBody.expr(alais, expr,
//				tabl != null && tabl.length > 0 ? tabl[0]
//						: maint != null ? maint : t));
//		return this;
//	}
//
//	/**Join clause
//	 * @param joinTabl
//	 * @param onCondts
//	 * @return
//	 * @throws SQLException 
//	 */
//	public JsonClient j(String joinTabl, String onCondts) throws SQLException {
//		return join("j", joinTabl, onCondts);
//	}
//	
//	public JsonClient r(String joinTabl, String onCondts) throws SQLException {
//		return join("r", joinTabl, onCondts);
//	}
//	
//	public JsonClient l(String joinTabl, String onCondts) throws SQLException {
//		return join("l", joinTabl, onCondts);
//	}
//	
//	/**Use this to set main table if query(t) where t is not the main table.
//	 * @param mtabl
//	 * @return
//	 * @throws SQLException
//	 */
//	public JsonClient maintbl(String mtabl) throws SQLException {
//		if (joins != null)
//			throw new SQLException("main-table must been set before any joins");
//		if (exprs != null)
//			Utils.warn("It's not safe to set main table (%s) after exprs be set", mtabl);
//		maint = mtabl;
//		joins = new ArrayList<String[]>();
//		joins.add(new String[] {"main-table", mtabl, null});
//		return this;
//	}
//
//	private JsonClient join(String jt, String joinTabl, String onCondts) throws SQLException {
//		if ("main-table".equals(jt))
//			maintbl(joinTabl);
//
//		if (joins == null)
//			maintbl(maint);
//		
//		joins.add(new String[] {jt, joinTabl, onCondts});
//		return this;
//	}
//	
//	public JsonClient where(String logic, String field, String v, String... tabl) {
//		if (conds == null)
//			conds = new ArrayList<String[]> ();
//		conds.add(JBody.jcondt(logic, field, v,
//				tabl == null || tabl.length == 0 || tabl[0] == null ? null : tabl[0]));
//		return this;
//	}
//
//	public JsonClient data(JBody dat) {
//		port = Port.user;
//		this.body = dat;
//		return this;
//	}
//
//	/**Print Json Request (no request sent to server)
//	 * @return
//	 * @throws SQLException 
//	 */
//	public JsonClient console() throws SQLException {
//		if(console) {
//			try {
//				System.out.println("JsonClient.test():");
//
//				String url = formatUrl();
//				System.out.println(url);
//
//				JMessage payload;
//				if (port == Port.query)
//					payload = QueryReq.formatReq(ssInf[0], usrAct, joins, exprs, conds, orders, groupings);
//				else 
//					throw new SQLException("currently test() is used only for query condition verification.");
//
//				System.out.println(payload.build().toString());
//			} catch (Exception ex) { ex.printStackTrace(); }
//		}
//		return this;
//	}
//
//	/**Post in asynchrony style - start a thread then call HttpServClient.post(url, ... ). <br>
//	 * 'onResponse' is called in the thread when returned back after blocked on http.
//	 * @param onResponse
//	 * @return
//	 * @throws IOException
//	 * @throws IrSessionException
//	 */
//	public JsonClient post(SCallback onResponse) throws IOException, SsException {
//		String url = formatUrl();
//		List<JBody> payload = null;
//		/*
//		JsonObjectBuilder body = Json.createObjectBuilder();
//		body.add("header", sessionHeader == null ? "" : sessionHeader); // null when login
//		HttpServClient.post(url, body.build().toString(), onResponse);
//		*/
//		if (port == Port.query)
//			payload = QueryReq.formatReq(ssInf[0], usrAct, joins, exprs, conds, orders, groupings);
//		else if (port == Port.update) {
//		}
//		else if (port == Port.delete) {
//		}
//		else if (port == Port.insert) {
//		}
//		else if (port == Port.session) {
//			if (ssInf == null) {
//				payload = body;
//			}
//			else {
//	//			JsonObjectBuilder pay = Json.createObjectBuilder();
//	//			pay.add("header", ssInf[0]);
//				if (body == null)
//					body = Json.createObjectBuilder();
//				if (usrAct != null) {
//					JsonObject ss = Protocol.attachUsrAct(ssInf[0], usrAct);
//					body.add("header", ss);
//				}
//				else
//					body.add("header", ssInf[0]);
//				payload = body;
//			}
//		}
//		else if (port == Port.user) {
//			// TODO sample
//			// TODO sample
//			// TODO sample
//		}
//
//		// HttpServClient.post(url, payload == null ? "" : payload.build().toString(), onResponse);
//		new Thread(new Runnable() {
//		    public void run() {
//		    	try {
//		    		HttpServClient.post(url, payload, onResponse);
//				} catch (IOException | SQLException | SemanticException e) {
//					e.printStackTrace();
//				}
//		    }
//		}).start();
//
//		return this;
//	}
//
//	private String formatUrl() {
//		String url = String.format("%s/%s.serv?t=%s&page=%s&size=%s",
//							servRoot,
//							servId == null ? "query" : servId,
//							t == null ? "" : t,
//							page, size);
//		if (urlparas != null)
//			for (String[] para : urlparas)
//				url += String.format("&%s=%s", (Object[])para);
//		return url;
//	}
//
//}
