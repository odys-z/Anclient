package io.odysz.jclient;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import org.apache.commons.io.IOUtils;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.SCallbackV11;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Js equivalent: Ajax.
 * 
 * @author Alice
 *
 */
public class HttpServClient {
	protected static final String USER_AGENT = "Anclient.java/1.0";

	/**
	 * Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link AnsonClientTest} for a query example.<br>
	 * IMPORTANT onResponse is called synchronized.
	 * <p>
	 * @deprecated Replaced by {@link #post(String, AnsonMsg)}.
	 * As this is a synchronized function, why use asynchronize style of function signature?</p>
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

		if (Clients.verbose) Utils.logi(url);

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.verbose) {
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

	/**
	 * Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link AnsonClientTest} for a query example.<br>
	 * IMPORTANT onResponse is called synchronized.
	 * @param url
	 * @param jreq
	 * @return response if succeed
	 * @throws IOException connection error
	 * @throws SemanticException jserv replied with error message
	 * @throws AnsonException
	 */
	public AnsonMsg<AnsonResp> post(String url, AnsonMsg<? extends AnsonBody> jreq)
			throws IOException, SemanticException, AnsonException {
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

		if (Clients.verbose) Utils.logi(url);

		int responseCode = con.getResponseCode();
		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.verbose) {
				Utils.printCaller(false);
				Utils.logi(x.toString());
			}

			if (x.code() != MsgCode.ok)
				throw new SemanticException("Code: %s, mesage:\n%s", x.code().name(), x.body(0).msg());
			return x;
		}
		else {
			Utils.warn("HTTP ERROR: code: %s", responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}

	@SuppressWarnings("unchecked")
	public String streamdown(String url, AnsonMsg<? extends DocsReq> jreq, String localpath)
			throws IOException, AnsonException, SemanticException {
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

		if (Clients.verbose) Utils.logi(url);

		InputStream ins = con.getInputStream();
		FileOutputStream ofs = new FileOutputStream(localpath);  
		IOUtils.copy(ins, ofs);
		ofs.close();

		AnsonMsg<AnsonResp> s = null;
		String type = null; 
		try {
			// FileInputStream ifs = new FileInputStream(localpath);
			// type = detector.detect(ifs);
			// ifs.close();
			if (localpath.endsWith(".json"))
				type = "json";
		}
		catch (Exception e) {
			return localpath;
		}

		if (type != null && type.startsWith("json")) {
			FileInputStream ifs = new FileInputStream(localpath);
			try {
				s = (AnsonMsg<AnsonResp>) Anson.fromJson(ifs);
			}
			catch (Exception e) {
				return localpath;
			}
			finally { ifs.close(); }
			throw new SemanticException("Code: %s\nmsg: %s", s.code(), s.body(0).msg());
		}

		return localpath;
	}
	
	/* Introduction stream field in Anson?
	public AnsonMsg<AnsonResp> streamup(String url, AnsonMsg<? extends DocsReq> req, String localpath) throws IOException, AnsonException, SemanticException {
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
		OutputStream ups = con.getOutputStream();

		if (Clients.verbose) Utils.logi(url);

		req.toBlockStream(ups);

		int repcode = con.getResponseCode();
		if (repcode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.verbose) {
				Utils.printCaller(false);
				Utils.logi(x.toString());
			}

			if (x.code() != MsgCode.ok)
				throw new SemanticException("Code: %s, mesage:\n%s", x.code().name(), x.body().toString());
			return x;
		}
		else {
			Utils.warn("HTTP ERROR: code: %s", repcode);
			throw new IOException("HTTP ERROR: code: " + repcode + "\n" + url);
		}
	}
	*/

}