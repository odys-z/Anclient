package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import io.odysz.common.AESHelper;
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
	/** DB connection ID. same in connects.xml/t/c/id at server side. */
	private static String conn;


	/**Initialize configuration.
	 * @param servRoot
	 * @param connId
	 */
	public static void init(String servRoot, String... connId) {
		servRt = servRoot;
		conn = connId == null || connId.length == 0 || connId[0] == null ?
				null : connId[0];
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
						// Utils.warn("loging failed\ncode: %s\nmsg: %s", code, msg.getString("error"));
						throw new SemanticException("loging failed\ncode: %s\nerror: %s", code, msg.getString("error"));
				});
  		if (inst[0] == null)
  			throw new IOException("HttpServClient return null client.");
  		return inst[0];
	}

	/**Get a insecure client - for no session handling request.
	 * @param uid
	 * @param pswdPlain
	 * @return a client can only read data from server.
	 * @throws Exception
	 */
	public static SessionClient readOnly(String uid, String pswdPlain) throws Exception {
		return new InsecureClient(servRt, conn);
	}

	/**Helper for generate serv url (with configured server root and db connection ID).
	 * @param port
	 * @return url, e.g. http://localhost:8080/query.serv?conn=null
	 */
	static String servUrl(Port port) {
		return String.format("%s/%s?conn=%s", servRt, port.url(), conn);
	}
}
