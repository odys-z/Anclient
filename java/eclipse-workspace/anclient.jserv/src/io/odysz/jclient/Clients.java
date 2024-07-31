package io.odysz.jclient;

import static io.odysz.common.LangExt.isblank;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantic.jserv.echo.EchoReq.A;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.jsession.AnSessionReq;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Anclient.jave raw api - jserv protocol handler
 * 
 * <p>js equivalent: AnClient</p>
 * 
 * @author Ody Zhou
 */
public class Clients {
	@FunctionalInterface
	public interface OnLogin { void ok(SessionClient client); }

	/**
	 * @since 0.4.31 default verbose is false.
	 */
	public static boolean verbose = true;

	public static String servRt;

	/**Initialize configuration.
	 * @param servRoot
	 */
	public static void init(String servRoot, boolean ... enableVerbose) {
		servRt = servRoot;
		verbose = enableVerbose != null && enableVerbose.length > 0 ? enableVerbose[0] == true : false;
	}
	
	/**Login and return a client instance (with session managed by jserv).
	 * 
	 * <h5>Note since anclient.java 1.4.14</h5>
	 * This module uses defualt url root initialized with {@link #init(String, boolean...)}. 
	 * 
	 * @param uid
	 * @param pswdPlain
	 * @param mac  client device name - server can required this or not
	 * @return a SessionClient instance if login succeed.
	 * @throws SemanticException Request can not parsed correctly 
	 * @throws SsException 
	 * @throws Exception, most likely the network failed
	 */
	public static SessionClient login(String uid, String pswdPlain, String... mac)
			throws IOException, SemanticException, AnsonException, SsException {
		byte[] iv =   AESHelper.getRandom();
		String iv64 = AESHelper.encode64(iv);
		if (uid == null || pswdPlain == null)
			throw new SemanticException("user id and password can not be null.");
		String tk64;
		try {
			tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		} catch (GeneralSecurityException e) {
			e.printStackTrace();
			throw new SsException("AES encrpyt failed: %s\nCause: %s", e.getMessage(), e.getCause().getMessage());
		}
		
		AnsonMsg<AnSessionReq> reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64, mac);

		HttpServClient httpClient = new HttpServClient();
		String url = servUrl(Port.session);

		AnsonMsg<AnsonResp> resp = httpClient.post(url, reqv11);
		if (Clients.verbose)
			Utils.logi(resp.toString());

		if (AnsonMsg.MsgCode.ok == resp.code()) {
			SessionClient c = new SessionClient((AnSessionResp) resp.body(0), pswdPlain);

			if (mac != null && mac.length > 0)
				c.ssInfo().device(mac[0]);
		
			return c;
		}
		else throw new SsException(
				"loging failed\ncode: %s\nerror: %s",
				resp.code(), ((AnsonResp)resp.body(0)).msg());
	}
	
	/** Login asynchronously.
	 * @param uid
	 * @param pswdPlain
	 * @param onOk
	 * @param onErr
	 * @param mac
	 */
	public static void loginAsync(String uid, String pswdPlain, OnLogin onOk, OnError onErr, String... mac) {
		new Thread(new Runnable() {
	        public void run() {
				byte[] iv =   AESHelper.getRandom();
				String iv64 = AESHelper.encode64(iv);
				if (uid == null || pswdPlain == null)
					onErr.err(MsgCode.exGeneral, "user id and password can not be null.");
				try {
					String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
					
					AnsonMsg<AnSessionReq> reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64, mac);

					HttpServClient httpClient = new HttpServClient();
					String url = servUrl(Port.session);

					AnsonMsg<AnsonResp> resp = httpClient.post(url, reqv11);
					if (Clients.verbose)
						Utils.logi(resp.toString());

					if (AnsonMsg.MsgCode.ok == resp.code()) {
						onOk.ok(new SessionClient((AnSessionResp) resp.body(0), pswdPlain));
					}
					else 
						onErr.err(resp.code(), "loging failed\ncode: %s\nerror: %s", resp.code().name(), ((AnsonResp)resp.body(0)).msg());	
				} catch (SemanticException | IOException | AnsonException | GeneralSecurityException e) {
					onErr.err(MsgCode.exIo, "Netwrok or server failed\nerror: %s %s", e.getClass().getName(), e.getMessage());	
					e.printStackTrace();
				}
	        }
	    }).start();
	}
	
	/**Helper for generate serv url (with configured server root and db connection ID).
	 * @param port
	 * @return url, e.g. http://localhost:8080/query.serv?conn=null
	 */
	static String servUrl(IPort port) {
		// Since version for semantier, this will return without conn id. 
		if (isblank(servRt))
			throw new AnsonException(0, "The root path is empty. Call init(jserv) first.");
		return String.format("%s/%s", servRt, port.url());
	}

	public String download(IPort port, AnsonMsg<? extends DocsReq> req, String localpath)
			throws IOException, AnsonException, SemanticException {
		String url = servUrl(port);
		HttpServClient httpClient = new HttpServClient();
		return httpClient.streamdown(url, req, localpath);
	}

	/**
	 * Ping port echo without session.
	 * @param funcUri
	 * @param errCtx 
	 * @return echo message
	 * @throws IOException 
	 * @throws AnsonException 
	 * @throws SemanticException 
	 * @since 0.4.35
	 */
	public static AnsonResp pingLess(String funcUri, OnError errCtx)
			throws SemanticException, AnsonException, IOException {
		EchoReq req = new EchoReq(null);
		req.a(A.echo);

		InsecureClient client = new InsecureClient();
		AnsonMsg<? extends AnsonBody> jmsg = client.<EchoReq>userReq(funcUri, AnsonMsg.Port.echo, req);

		Anson.verbose = true;
		AnsonResp resp = client.commit(jmsg, errCtx);

		return resp;
	}
}
