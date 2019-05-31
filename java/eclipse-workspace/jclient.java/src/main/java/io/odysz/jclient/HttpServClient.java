package io.odysz.jclient;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;

public class HttpServClient {
	private static final String USER_AGENT = "JClient.java/1.0";

	/**Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link SemantiClientTest} for a query example.<br>
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
//		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
//		byte[] utf8JsonString = jreq.getBytes("UTF8");
//		wr.write(utf8JsonString, 0, utf8JsonString.length);
//		wr.flush();
//		wr.close();

		// JHelper<SessionReq> jSsReqHelper = new JHelper<SessionReq>();
		// jSsReqHelper.writeJsonReq(con.getOutputStream(), jreq, SessionReq.class);
		JHelper.writeJsonReq(con.getOutputStream(), jreq);

		if (Clients.console) Utils.logi(url);;

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			SemanticObject x = JHelper.readResp(con.getInputStream());
			if (Clients.console) {
				Utils.printCaller(false);
				JHelper.logi(x);
			}

			onResponse.onCallback(String.valueOf(x.get("code")), x);
		}
		else {
			Utils.warn("HTTP ERROR: code: %s", responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}
}