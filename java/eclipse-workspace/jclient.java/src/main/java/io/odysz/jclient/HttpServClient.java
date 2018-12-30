package io.odysz.jclient;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantic.jsession.SessionReq;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

public class HttpServClient {
	private static final String USER_AGENT = "JClient.java/1.0";

//	private String servRt;
//	private JHelper<? extends JBody> jreqHelper;

//	public HttpServClient(String servRoot, JHelper<? extends JBody> jreqHelper) {
//		this.servRt = servRoot;
//	}

	/**Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link JsonClient#main(String[])} for a query example.<br>
	 * IMPORTANT onResponse is called synchronized.
	 * @param url
	 * @param jreq
	 * @param onResponse
	 * @throws IOException
	 * @throws SemanticException 
	 * @throws SQLException 
	 */
	public void post(String url, JMessage<? extends JBody> jreq, SCallback onResponse)
			throws IOException, SemanticException, SQLException {
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		//add reuqest header
		con.setRequestMethod("POST");
		con.setRequestProperty("User-Agent", USER_AGENT);
		con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
		con.setRequestProperty("Content-Type", "text/plain"); 
	    con.setRequestProperty("charset", "utf-8");

		// Send post request
		con.setDoOutput(true);

		
		// DEBUGGED: these 2 lines won't send Chinese characters:
		// wr.writeChars(body);
		// wr.writeByte(body);
		// See https://docs.oracle.com/javase/6/docs/api/java/io/DataOutputStream.html#writeBytes(java.lang.String)
		// --- by discarding its high eight bits --- !!!
		// also see https://stackoverflow.com/questions/17078207/gson-not-sending-in-utf-8
		//
//		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
//		byte[] utf8JsonString = jreq.getBytes("UTF8");
//		wr.write(utf8JsonString, 0, utf8JsonString.length);
//		wr.flush();
//		wr.close();

		JHelper<SessionReq> jSsReqHelper = new JHelper<SessionReq>();
		jSsReqHelper.writeJson(con.getOutputStream(), jreq);

<<<<<<< HEAD
		if (ClientFlags.http) System.out.println(url);;
=======

		if (Clients.console) System.out.println(url);;
>>>>>>> branch 'master' of https://github.com/odys-z/jclient.git

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			SemanticObject x = jSsReqHelper.readJson(con.getInputStream());

			if (Clients.console) System.out.println(x.toString());
			onResponse.onCallback(String.valueOf(x.get("code")), x);
		}
		else {
			// onResponse.onCallback("http-error", String.valueOf(responseCode));
			System.err.println("HTTP ERROR: code: " + responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}
}