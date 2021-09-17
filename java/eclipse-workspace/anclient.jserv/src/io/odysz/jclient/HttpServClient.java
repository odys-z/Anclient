package io.odysz.jclient;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.SCallbackV11;
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
	public void post(String url, AnsonMsg<? extends AnsonBody> jreq, SCallbackV11 onResponse)
			throws IOException, SemanticException, SQLException, AnsonException {
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

		// JHelper.writeAnsonReq(con.getOutputStream(), jreq);
		jreq.toBlock(con.getOutputStream());

		if (Clients.console) Utils.logi(url);

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.console) {
				Utils.printCaller(false);
				Utils.logi(x.toString());
			}

			onResponse.onCallback(x.code(), x.body(0));
		}
		else {
			Utils.warn("HTTP ERROR: code: %s", responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}
}