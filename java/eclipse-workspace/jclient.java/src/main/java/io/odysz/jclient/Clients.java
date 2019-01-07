package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.MsgCode;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jsession.SessionReq;
import io.odysz.semantics.x.SemanticException;

/**
 * @author ody
 *
 */
public class Clients<T extends JBody> {
	public static final boolean console = true;

	public static String servRt;
	private static String conn;


	public static void init(String servRoot, String... connId) {
		servRt = servRoot;
		conn = connId == null || connId.length == 0 || connId[0] == null ?
				null : connId[0];
	}
	
	/**Login and return a client instance (with session managed by jserv).
	 * @param uid
	 * @param pswdPlain
	 * @return
	 * @throws SQLException 
	 * @throws SemanticException 
	 * @throws GeneralSecurityException 
	 * @throws Exception
	 */
	public static SessionClient login(String uid, String pswdPlain)
			throws IOException, SemanticException, SQLException, GeneralSecurityException {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		
		// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
		JMessage<SessionReq> req = SessionReq.formatLogin(uid, tk64, iv64);

		SessionClient[] inst = new SessionClient[1]; 

		HttpServClient httpClient = new HttpServClient();
		// String.format("%s/login.serv?t=login", servRt);
		String url = servUrl(Port.session);
  		httpClient.post(url, req, (code, msg) -> {
					if (MsgCode.ok.eq(code)) {
						// create a logged in client
						inst[0] = new SessionClient(msg);

						if (Clients.console)
							JHelper.logi(msg);
					}
					else 
						Utils.warn("loging failed\ncode: %s\nmsg: %s", code, msg.getString("error"));
				});
  		if (inst[0] == null)
  			throw new IOException("HttpServClient return null client.");
  		// return inst[0].httpClient(httpClient);
  		return inst[0];
	}

	public static SessionClient readOnly(String uid, String pswdPlain) throws Exception {
		return new InsecureClient(servRt, conn);
	}

	public static String servUrl(Port port) {
		return String.format("%s/%s?conn=%s", servRt, port.url(), conn);
	}
}
