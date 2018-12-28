package io.odysz.jclient;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;
import java.util.ArrayList;

import io.odysz.common.AESHelper;
import io.odysz.semantics.x.SemanticException;

/**
 * For how to use lambda expressions, see {@link #testAsych(IrCallback)}.
 * @author ody
 *
 */
public class JsonClient {
	private static final boolean verbose = false;

	/**Interface with {@link #onCallback(String, Object)} for called on events happen,
	 * e.g. on success when an http post request finished. */
	@FunctionalInterface
	public interface IrCallback {
		void onCallback(String code, Object Data) throws IOException, SQLException, SemanticException;
	}
	
	public static enum Req { query, update, insert, delete, userData };
	
//	static {
//		clients = new HashMap<String, JsonClient>(2);
//	}

	/**A helper method for test that let user get comfort with lambda expression.
	 * sample code:<pre>
	new JsonClient("").testAsych((code, data) -> {
		System.out.println(String.format("code: %s\ndata: %s", code, data));
	});
	System.out.println("Main thread going on...");</pre>
	 *
	 * output:<pre>
	Main thread going on... (wait for a while)
	code: 0101
	data: D-XYZ</pre>
	 * For lambda expression basics, see
	 * <a href='https://javabydeveloper.com/lambda-expression-in-java8/'>what is Lambda (λ) Expression ?</a>
	 * and <a href='https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html'>Lambda Expressions @ oracle java tutorial</a>. <br>
	 * For why is lambda, see <a href='https://stackoverflow.com/questions/1842734/how-to-asynchronously-call-a-method-in-java'>How to asynchronously call a method in Java</a>.
	 * @param callback a {@link IrCallback} implementation
	 */
	@SuppressWarnings("unused")
	private void testAsych(IrCallback callback) {
		new Thread(new Runnable() {
		    public void run() {
		    	try {
					Thread.sleep(1000); // post
					callback.onCallback("0101", "D-XYZ");
				} catch (IOException | SemanticException e) {
					e.printStackTrace();
				} catch (InterruptedException e) {
					e.printStackTrace();
				} catch (SQLException e) {
					e.printStackTrace();
				}
		    }
		}).start();
	}

	/**Tested Case 1. Login then query domain table: <pre>
// example of how to handle call back
IrCallback onOk = (ok, msg) -> {
	try {
		// example of how to get CRUD query client
		JsonClient.client("admin")
			.setUserAct("query", "", null, null)
			.query(null, "a_domain", "test-main", -1, 0)
			.j("a_reg_org:o", "domainId=o.orgType")
			.post((code, data) -> {
				System.out.println(String.format("on callback args:\ncode: %s\ndata: %s", code, data));
			);
	} catch (Exception e) { e.printStackTrace(); } };
JsonClient.login("admin", "admin", onOk, null);
// after login, client instance with user id 'admin' can be used to do CRUD request.</pre>
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		IrCallback onOk = (ok, msg) -> {
			try {
//				JsonClient.client("admin")
//						.setUserAct("query", "", null, null)
				JsonClient.login("127.0.0.1/ifire", "admin", "admin")
						.setUserAct("query", "", null, null)
						.query(null, "a_domain", "test-main", -1, 0)
						.j("a_reg_org:o", "domainId=o.orgType")
						.post((code, data) -> {
							System.out.println(String.format("on callback args:\ncode: %s\ndata: %s", code, data));
						});
			} catch (Exception e) { e.printStackTrace(); } };

		JsonClient.loginAsyncTest("admin", "admin", onOk, null);

		/* output:
		Main thread going on... (wait for a while)
		code: 0101
		data: D-XYZ

		new JsonClient("").testAsych((code, data) -> {
			System.out.println(String.format("code: %s\ndata: %s", code, data));
		});
		System.out.println("Main thread going on...");
		 */
	}

	/** [uid, client-instance(logged in with ssid)] */
//	static HashMap<String, JsonClient> clients;
	/**last logged in uid when success on calling login()*/
	static String lastUid;
	/**get logged in uid's client. If uid == null, return the last logged in uid's client.
	 * @param uid
	 * @return
	public static JsonClient client(String uid) {
		if (uid == null)
			return clients == null ? null : clients.get(lastUid);
		else
			return clients == null ? null : clients.get(uid);
	}
	 */

	public static void loginAsyncTest(String uid, String pswdPlain, IrCallback onOk, IrCallback onErr) throws Exception {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		
		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
		JsonObjectBuilder req = JProtocol.formatLogin(uid, tk64, iv64);
		@SuppressWarnings("unused")
		JsonClient loginClient = new JsonClient()
				.data(req)
				.post((code, msg) -> {
					if ("OK".equals(code)) {
						// create a logged in client
						JsonObject[] sessionInfo = Protocol.parseLoginMsg((JsonObject) msg, uid, tk64, iv64);
						JsonClient inst = new JsonClient(sessionInfo);
						lastUid = uid;
						// clients.put(lastUid, inst);

						if (verbose) System.out.println(String.format(
									"login succeed - uid: %s, ss-inf: %s",
									uid, sessionInfo[0]));;
						if (onOk != null) onOk.onCallback(code, msg);
					}
					else {
						// clients.remove(uid);
						if (onErr != null)
							onErr.onCallback(code, msg);
						else IrSingleton.warn("loging failed\ncode: %s\nmsg: %s", code, msg);
					}
				});
	}

	/**Login and return a client instance.
	 * @param servRoot
	 * @param uid
	 * @param pswdPlain
	 * @return
	 * @throws Exception
	 */
	public static JsonClient login(String servRoot, String uid, String pswdPlain) throws Exception {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		
		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
		JsonObjectBuilder req = JProtocol.formatLogin(uid, tk64, iv64);
//		JsonClient loginClient = new JsonClient().data(req);

		JsonClient[] inst = new JsonClient[1]; 

		String url = String.format("%s/login.serv?t=login", servRoot);
  		HttpServClient.post(url, req.build().toString(), (code, msg) -> {
					if ("OK".equals(code)) {
						// create a logged in client
						JsonObject[] sessionInfo = Protocol.parseLoginMsg((JsonObject) msg, uid, tk64, iv64);
						// JsonClient inst = new JsonClient(sessionInfo);
//						if (clzz == Synclient.class)
//							inst = new Synclient(uid, sessionInfo);
//						else 
							inst[0] = new JsonClient(sessionInfo);
						lastUid = uid;
						// clients.put(lastUid, inst);

						if (verbose) System.out.println(String.format(
									"login succeed - uid: %s, ss-inf: %s",
									uid, sessionInfo[0]));;
//						if (onOk != null) onOk.onCallback(code, msg);
					}
//					else if (onErr != null)
//						onErr.onCallback(code, msg);
					else 
						// clients.remove(uid);
						IrSingleton.warn("loging failed\ncode: %s\nmsg: %s", code, msg);
				});
		// return clients.get(uid);
  		return inst[0];
	}

	private Req req;
	private String servId;
	private String t;
	private String maint;
	private int page = 0;
	private int size = 20;
	/** [0] ss-inf, [1] usr-inf, see ir-frame.js/login().onSucess<pre>
	 {"code":"OK",
	  "msg":"0m1CQ63tNKu03yUaLF16-L7h",
	  "obj":{"uid":"admin","userName":"admin","roleId":"010501","roleName":"平台管理员","orgId":"000001","orgName":"云智科技 A","orgType":"0105"},
	  "url":"index.html"
	 }</pre> */
	protected JsonObject[] ssInf;
	protected String[] usrAct;
//	private String sessionHeader;
//	private String sessionId;
//	private String sessionUsr;
//	private String homepage;
//	private String header;
	/** post body payload set by payload() directly */
	private JsonObjectBuilder data;
	/** [[0: j/l/r, 1: tabl:alais, 2: on and conditions]]  */
	private ArrayList<String[]> joins;

	/** [expr], where expr: [ tabl, expr, alais(optional) ]
	 * elements should always been parsed/set by {@link Protocol#prepareExpr(String, String, String)}
	 */
	private ArrayList<String[]> exprs;
	private ArrayList<String[]> conds;
	private ArrayList<String> orders;
	private ArrayList<String> groupings;

	private ArrayList<String[]> urlparas;

	// String servRoot = "http://221.236.26.28/ifire";
	protected String servRoot = "http://localhost:8080/ifire";
	protected JsonClient(JsonObject[] sessionInfo) {
		try { servRoot = Configs.getCfg("url.serv");
		} catch (ExceptionInInitializerError e) {
			IrSingleton.warn("--- FATAL ---\nCenter server URL missing in config.xml: ", "url.serv");
		}

		// sessionHeader = formatHeader(sessionId, userId, homepage, tk, iv64);
//		sessionHeader = sessionInfo[0];
//		this.sessionId = sessionInfo[1];
//		this.sessionUsr = sessionInfo[2];
//		this.homepage = sessionInfo[3];
		this.ssInf = sessionInfo;
	}

	//loadPage(pagerId, listId, queryId, onSelectf, isSelectFirst, onCheckf, onCheckAllf)

	/**Only used for login
	 * @param header
	 */
	protected JsonClient() {
		try { servRoot = Configs.getCfg("url.serv");
		} catch (ExceptionInInitializerError e) {}

		t = "login";
		servId = "login";
	}

	/**Seam as ir-frame.js/setUserAction()<pre>
  	ssinf.usrAct = {
		funcId: funcId,
		funcName: funcName,
		url: url,
		cmd: cmd
	};</pre>
	 * @param string
	 * @param string2
	 * @return
	 */
	protected JsonClient setUserAct(String funcId, String funcName, String url, String cmd) {
		usrAct = new String[] {funcId, funcName, url, cmd};
		return this;
	}

	/**
	 * @param servId null for query
	 * @param t e.g. e_areas
	 * @param funcId current function ID
	 * @param page
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public JsonClient query(String servId, String t, String funcId, int page, int size) throws Exception {
		this.req = Req.query;
		this.servId = servId;
		this.t = t;
		this.maint = t;
		this.page = page;
		this.size = size;
		setUserAct(funcId, "query", "", "R");
		return this;
	}

	public JsonClient urlPara(String pname, String pv) {
		if (urlparas == null)
			urlparas = new ArrayList<String[]>();
		urlparas.add(new String[] {pname, pv});
		return this;
	}

	public JsonClient expr(String expr, String alais, String... tabl) {
		if (exprs == null)
			exprs = new ArrayList<String[]>();
		// expr: [ tabl, expr, alais(optional) ]
		exprs.add(Protocol.prepareExpr(alais, expr,
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
	public JsonClient j(String joinTabl, String onCondts) throws SQLException {
		return join("j", joinTabl, onCondts);
	}
	
	public JsonClient r(String joinTabl, String onCondts) throws SQLException {
		return join("r", joinTabl, onCondts);
	}
	
	public JsonClient l(String joinTabl, String onCondts) throws SQLException {
		return join("l", joinTabl, onCondts);
	}
	
	/**Use this to set main table if query(t) where t is not the main table.
	 * @param mtabl
	 * @return
	 * @throws SQLException
	 */
	public JsonClient maintbl(String mtabl) throws SQLException {
		if (joins != null)
			throw new SQLException("main-table must been set before any joins");
		if (exprs != null)
			IrSingleton.warn("It's not safe to set main table (%s) after exprs be set", mtabl);
		maint = mtabl;
		joins = new ArrayList<String[]>();
		joins.add(new String[] {"main-table", mtabl, null});
		return this;
	}

	private JsonClient join(String jt, String joinTabl, String onCondts) throws SQLException {
		if ("main-table".equals(jt))
			maintbl(joinTabl);

		if (joins == null)
			maintbl(maint);
		
		joins.add(new String[] {jt, joinTabl, onCondts});
		return this;
	}
	
	public JsonClient where(String logic, String field, String v, String... tabl) {
		if (conds == null)
			conds = new ArrayList<String[]> ();
		conds.add(Protocol.prepareCond(logic, field, v, tabl));
		return this;
	}

	public JsonClient data(JsonObjectBuilder dat) {
		req = Req.userData;
		this.data = dat;
		return this;
	}

	/**Print Json Request (no request sent to server)
	 * @return
	 * @throws SQLException 
	 */
	public JsonClient console() throws SQLException {
		if(verbose) {
			try {
				System.out.println("JsonClient.test():");

				String url = formatUrl();
				System.out.println(url);

				JsonObjectBuilder payload;
				if (req == Req.query)
					payload = Protocol.formatQuery(ssInf[0], usrAct, joins, exprs, conds, orders, groupings);
				else 
					throw new SQLException("currently test() is used only for query condition verification.");

				System.out.println(payload.build().toString());
			} catch (Exception ex) { ex.printStackTrace(); }
		}
		return this;
	}

	JsonObjectBuilder payload = null;
	/**Post in asynchrony style - start a thread then call HttpServClient.post(url, ... ). <br>
	 * 'onResponse' is called in the thread when returned back after blocked on http.
	 * @param onResponse
	 * @return
	 * @throws IOException
	 * @throws IrSessionException
	 */
	public JsonClient post(IrCallback onResponse) throws IOException, SsException {
		String url = formatUrl();
		/*
		JsonObjectBuilder body = Json.createObjectBuilder();
		body.add("header", sessionHeader == null ? "" : sessionHeader); // null when login
		HttpServClient.post(url, body.build().toString(), onResponse);
		*/
		if (req == Req.query)
			payload = Protocol.formatQuery(ssInf[0], usrAct, joins, exprs, conds, orders, groupings);
		else if (req == Req.update) {
		}
		else if (req == Req.delete) {
		}
		else if (req == Req.insert) {
		}
		else if (req == Req.userData) {
			if (ssInf == null) {
				payload = data;
			}
			else {
	//			JsonObjectBuilder pay = Json.createObjectBuilder();
	//			pay.add("header", ssInf[0]);
				if (data == null)
					data = Json.createObjectBuilder();
				if (usrAct != null) {
					JsonObject ss = Protocol.attachUsrAct(ssInf[0], usrAct);
					data.add("header", ss);
				}
				else
					data.add("header", ssInf[0]);
				payload = data;
			}
		}

		// HttpServClient.post(url, payload == null ? "" : payload.build().toString(), onResponse);
		new Thread(new Runnable() {
		    public void run() {
		    	try {
		    		HttpServClient.post(url, payload == null ? "" : payload.build().toString(), onResponse);
				} catch (IOException | SQLException | IrSemanticsException e) {
					e.printStackTrace();
				}
		    }
		}).start();

		return this;
	}

	private String formatUrl() {
		String url = String.format("%s/%s.serv?t=%s&page=%s&size=%s",
							servRoot,
							servId == null ? "query" : servId,
							t == null ? "" : t,
							page, size);
		if (urlparas != null)
			for (String[] para : urlparas)
				url += String.format("&%s=%s", (Object[])para);
		return url;
	}

	public static class HttpServClient {
		//private final String USER_AGENT = "Mozilla/5.0";
		private static final String USER_AGENT = "JsonClient/1.0";

		public HttpServClient(String url) { }

		/**Post in synchronized style. Call this within a worker thread.<br>
		 * See {@link JsonClient#main(String[])} for a query example.<br>
		 * IMPORTANT onResponse is called synchronized.
		 * @param url
		 * @param body
		 * @param onResponse
		 * @throws IOException
		 * @throws SQLException 
		 * @throws IrSemanticsException 
		 */
		public static void post(String url, String body, IrCallback onResponse)
				throws IOException, SQLException, IrSemanticsException {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			//add reuqest header
			con.setRequestMethod("POST");
			con.setRequestProperty("User-Agent", USER_AGENT);
			con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
			con.setRequestProperty("Content-Type", "text/plain"); 
		    con.setRequestProperty("charset", "utf-8");

//			String urlParameters = "sn=C02G8416DRJM&cn=&locale=&caller=&num=12345";
			
			// Send post request
			con.setDoOutput(true);

			DataOutputStream wr = new DataOutputStream(con.getOutputStream());
			
			// DEBUGGED: these 2 lines won't send Chinese characters:
			// wr.writeChars(body);
			// wr.writeByte(body);
			// See https://docs.oracle.com/javase/6/docs/api/java/io/DataOutputStream.html#writeBytes(java.lang.String)
			// --- by discarding its high eight bits --- !!!
			// also see https://stackoverflow.com/questions/17078207/gson-not-sending-in-utf-8
			byte[] utf8JsonString = body.getBytes("UTF8");
			wr.write(utf8JsonString, 0, utf8JsonString.length);

			wr.flush();
			wr.close();

			if (verbose) System.out.println(url);;

			int responseCode = con.getResponseCode();
			if (responseCode == 200) {

				JsonReader rder = Json.createReader(con.getInputStream());
				JsonObject x = (JsonObject) rder.read();
				rder.close();
	
				if (verbose) System.out.println(x.toString());
				onResponse.onCallback(String.valueOf(x.get("code")), x);
			}
			else {
				// onResponse.onCallback("http-error", String.valueOf(responseCode));
				System.err.println("HTTP ERROR: code: " + responseCode);
				throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
			}
		}
	}

}
