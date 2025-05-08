package io.odysz.jclient;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;

import org.apache.commons.io.IOUtils;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonException;
import io.odysz.common.FilenameUtils;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;

/**
 * Semantic.jserv client, java version.
 * 
 * @author Ody
 *
 */
public class HttpServClient {
	protected static final String USER_AGENT = "Anclient.java/0.5.0";
	
	/**
	 * HttpServClient use this to put message code into exception object.
	 * Upper layer use this to get exception code (SemanticException must
	 * carry multiple error handled differently at client side)
	 * 
	 * FIXME This is a design error, will be eliminated in the future version, Enveloparser.py. 
	 */
	public static String EXCODE_KEY = "io.odysz.jclient.HttpServClient#ex-code";
	
	/**
	 * @See {@link #EXCODE_KEY}
	 */
	public static String EXMSG_KEY = "io.odysz.jclient.HttpServClient#ex-msg";

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
	 * @throws SQLException 
	 * @throws TransException 
	 */
	public void post(String url, AnsonMsg<? extends AnsonBody> jreq,
			// SCallbackV11 onResponse)
			OnOk onResponse)
			throws IOException, SQLException, AnsonException, TransException {
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

		if (Clients.verbose) Utils.logi("[Clients.verbose] %s", url);

		int responseCode = con.getResponseCode();
		
		if (responseCode == 206) {
			// since 0.4.28
			Utils.warn("\nFatal Warning\n\nAnclient.java/Clients is not supposed to support ranged resourse query. Resoponse code of 206 is forced to change to 200 at client side.\n\n");
			responseCode = 200;
		}

		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.verbose) {
				Utils.printCaller(false);
				Utils.logi("[Clients.verbose]\n%s", x.toString());
			}

			// onResponse.onCallback(x.code(), x.body(0));
			onResponse.ok(x.body(0));
		}
		else {
			Utils.warn("HTTP ERROR: code: %s", responseCode);
			throw new IOException("HTTP ERROR: code: " + responseCode + "\n" + url);
		}
	}

	/**
	 * Post in synchronized style. Call this within a worker thread.<br>
	 * See {@link AnsonClientTest} for a query example.<br>
	 * @param url
	 * @param jreq
	 * @return response if succeed
	 * @throws IOException connection error
	 * @throws SemanticException jserv replied with error message
	 * (since 1.4.39, a code return by jserv is also included in the exception object)
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

		jreq.toBlock(con.getOutputStream());

		if (Clients.verbose) Utils.logi("[Clients.verbose] %s", url);

		int responseCode = con.getResponseCode();
		if (responseCode == 206) {
			// since 0.4.28
			Utils.warn("\nFatal Warning\n"
					+ "Anclient.java/Clients is not supposed to support ranged resourse query. "
					+ "Resoponse code of 206 is forced to change to 200 at client side.\n");
			responseCode = 200;
		}

		if (responseCode == 200) {

			if (con.getContentLengthLong() == 0)
				throw new SemanticException("Error: server return null at %s ", url);

			@SuppressWarnings("unchecked")
			AnsonMsg<AnsonResp> x = (AnsonMsg<AnsonResp>) Anson.fromJson(con.getInputStream());
			if (Clients.verbose) {
				Utils.printCaller(false);
				Utils.logi("[Clients.verbose]\n%s", x);
			}

			if (x.code() != MsgCode.ok) {
				SemanticException ex = new SemanticException(
						"Code: %s, mesage:\n%s", x.code().name(), x.body(0).msg());

				// @since 1.4.39, semantic exception can be handled differently for different errors, this used for save error code at client.
				ex.ex().put(EXCODE_KEY, x.code())
						.put(EXMSG_KEY, x.body(0).msg());
				throw ex;
			}

			return x;
		}
		else {
			InputStream i = con.getInputStream();
	        String res = String.format("%d\n%s\n", responseCode, url);
	        InputStreamReader in = new InputStreamReader(i);
	        BufferedReader br = new BufferedReader(in);
	        String output;
	        while ((output = br.readLine()) != null) {
	            res += (output);
	        }

			Utils.warn(res);
			throw new IOException(res);
		}
	}

	/**
	 * @param url
	 * @param jreq
	 * @param localpath
	 * @return localpath
	 * @throws IOException
	 * @throws AnsonException
	 * @throws SemanticException
	 */
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
		
		String folder = FilenameUtils.getFullPath(localpath);
		new File(folder).mkdirs();
		File yourFile = new File(localpath);
		yourFile.createNewFile(); // if file already exists will do nothing 

		FileOutputStream ofs = new FileOutputStream(localpath);  
		IOUtils.copy(ins, ofs);
		ofs.close();

		AnsonMsg<AnsonResp> s = null;
		String type = null; 
		try {
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
	
}