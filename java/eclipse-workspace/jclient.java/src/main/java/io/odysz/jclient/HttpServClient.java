package io.odysz.jclient;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantics.x.SemanticException;

public class HttpServClient {
	private static final String USER_AGENT = "JClient.java/1.0";

	public HttpServClient(String url) { }

	/**Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link JsonClient#main(String[])} for a query example.<br>
	 * IMPORTANT onResponse is called synchronized.
	 * @param url
	 * @param body
	 * @param onResponse
	 * @throws IOException
	 * @throws SQLException 
	 * @throws SemanticException 
	 */
	public static void post(String url, JMessage<? extends JBody> body, SCallback onResponse)
			throws IOException, SQLException, SemanticException {
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

		if (JsonClient.verbose) System.out.println(url);;

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			JsonReader rder = Json.createReader(con.getInputStream());
			JsonObject x = (JsonObject) rder.read();
			rder.close();

			if (JsonClient.verbose) System.out.println(x.toString());
			onResponse.onCallback(String.valueOf(x.get("code")), x);
		}
		else {
			// onResponse.onCallback("http-error", String.valueOf(responseCode));
			System.err.println("HTTP ERROR: code: " + responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}
}