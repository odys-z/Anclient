package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jsession.AnSessionReq;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantics.x.SemanticException;

/**
 * @author Ody Zhou
 * @param <T>
 */
public class Clients {
	public static final boolean console = true;

	public static String servRt;
	/**@deprecated
	 * DB connection ID. same in connects.xml/t/C/id at server side. */
	private static String conn;


	/**Initialize configuration.
	 * @param servRoot
	 */
	public static void init(String servRoot) {
		servRt = servRoot;
		conn = null; // client can't control engine connect. configured in workflow-meta.xml
	}
	
	/**Login and return a client instance (with session managed by jserv).
	 * @param uid
	 * @param pswdPlain
	 * @return null if failed, a SessionClient instance if login succeed.
	 * @throws SQLException the request makes server generate wrong SQL.
	 * @throws SemanticException Request can not parsed correctly 
	 * @throws GeneralSecurityException  other error
	 * @throws Exception, most likely the network failed
	 */
	public static SessionClient login(String uid, String pswdPlain)
			throws IOException, SemanticException, SQLException, GeneralSecurityException, AnsonException {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		if (uid == null || pswdPlain == null)
			throw new SemanticException("user id and password can not be null.");
		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		
		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
  		// AnsonMsg<? extends AnsonBody> reqv11 = new AnsonMsg<AnQueryReq>(Port.session);;
		AnsonMsg<AnSessionReq> reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64);

		SessionClient[] inst = new SessionClient[1]; 

		HttpServClient httpClient = new HttpServClient();
		String url = servUrl(Port.session);
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
	}
	
	/**Helper for generate serv url (with configured server root and db connection ID).
	 * @param port
	 * @return url, e.g. http://localhost:8080/query.serv?conn=null
	 */
	static String servUrl(IPort port) {
		return String.format("%s/%s?", servRt, port.url());
		// Since version for semantier, this will return without conn id. 
		// return String.format("%s/%s?conn=%s", servRt, port.url(), conn);
	}
}
