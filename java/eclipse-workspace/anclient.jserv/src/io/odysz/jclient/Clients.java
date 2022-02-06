package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jsession.AnSessionReq;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.x.SemanticException;

/**
 * @author Ody Zhou
 * @param <T>
 */
public class Clients {
	public static final boolean verbose = true;

	public static String servRt;
	/**@deprecated
	 * DB connection ID. same in connects.xml/t/C/id at server side.
	private static String conn;
	 * */


	/**Initialize configuration.
	 * @param servRoot
	 */
	public static void init(String servRoot) {
		servRt = servRoot;
		// conn = null; // client can't control engine connect. configured in workflow-meta.xml
	}
	
	/**Login and return a client instance (with session managed by jserv).
	 * @param uid
	 * @param pswdPlain
	 * @return null if failed, a SessionClient instance if login succeed.
	 * @throws SemanticException Request can not parsed correctly 
	 * @throws GeneralSecurityException  encrypting password error
	 * @throws Exception, most likely the network failed
	 */
	public static SessionClient login(String uid, String pswdPlain)
			throws IOException, SemanticException, GeneralSecurityException, AnsonException {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		if (uid == null || pswdPlain == null)
			throw new SemanticException("user id and password can not be null.");
		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		
		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
		AnsonMsg<AnSessionReq> reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64);

		HttpServClient httpClient = new HttpServClient();
		String url = servUrl(Port.session);
		/*
			SessionClient[] inst = new SessionClient[1]; 
			httpClient.post(url, reqv11, (code, msg) -> {
					if (AnsonMsg.MsgCode.ok == code) {
						// create a logged in client
						inst[0] = new SessionClient(((AnSessionResp) msg).ssInf());

						if (Clients.console)
							Utils.logi(msg.toString());
					}
					else throw new SemanticException(
							"loging failed\ncode: %s\nerror: %s",
							code, ((AnsonResp)msg).msg());
				});
  		if (inst[0] == null)
  			throw new IOException("HttpServClient return null client.");
  		return inst[0];
  		*/

		AnsonMsg<AnsonResp> resp = httpClient.post(url, reqv11);
		if (Clients.verbose)
			Utils.logi(resp.toString());

		if (AnsonMsg.MsgCode.ok == resp.code()) {
			return new SessionClient(((AnSessionResp) resp.body(0)).ssInf());
		}
		else throw new SemanticException(
				"loging failed\ncode: %s\nerror: %s",
				resp.code(), ((AnsonResp)resp.body(0)).msg());
	}
	
	/**Helper for generate serv url (with configured server root and db connection ID).
	 * @param port
	 * @return url, e.g. http://localhost:8080/query.serv?conn=null
	 */
	static String servUrl(IPort port) {
		// Since version for semantier, this will return without conn id. 
		// return String.format("%s/%s?conn=%s", servRt, port.url(), conn);
		return String.format("%s/%s", servRt, port.url());
	}

	public String download(IPort port, AnsonMsg<? extends DocsReq> req, String localpath)
			throws IOException, AnsonException, SemanticException {
		String url = servUrl(port);
		HttpServClient httpClient = new HttpServClient();
		return httpClient.streamdown(url, req, localpath);
	}

	public AnsonMsg<AnsonResp> upload(IPort port, AnsonMsg<? extends DocsReq> req, String localpath)
			throws SemanticException, IOException, AnsonException {
		String url = servUrl(port);
		HttpServClient httpClient = new HttpServClient();
		return httpClient.streamup(url, req, localpath);
	}

}
