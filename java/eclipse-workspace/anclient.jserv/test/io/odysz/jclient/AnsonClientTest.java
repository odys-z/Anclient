package io.odysz.jclient;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Radix64;
import io.odysz.common.Utils;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.U.AnInsertReq;
import io.odysz.semantic.jserv.U.AnUpdateReq;
import io.odysz.semantic.jserv.echo.EchoReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Unit test for sample App. 
 */
public class AnsonClientTest {
	private static String jserv = "http://localhost:8080/jserv-sample";
	private static String pswd = "123456";
	private static String filename = "res/Sun_Yat-sen_2.jpg";
	
	private SessionClient client;
	private static ErrorCtx errCtx;

	@BeforeAll
	public static void init() {
		Utils.printCaller(false);
		// trigger factory registration, prevent error:
		// io.odysz.anson.x.AnsonException: Invoking registered factory failed for value: session
		// Field Type: io.odysz.semantic.jprotocol.IPort,
		AnsonMsg.understandPorts(AnsonMsg.Port.echo);

    	Clients.init(jserv);
    	errCtx = new ErrorCtx() {
    		public void err(MsgCode code, String resp, String ...args ) {
    			fail(String.format("code: %s\nmsg: %s", resp));
    		}
    	};
    }

	@Test
    public void queryTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException, AnsonException {
    	Utils.printCaller(false);

    	String sys = "sys-sqlite";
    	
    	client = Clients.login("ody", pswd);
    	AnsonMsg<AnQueryReq> jreq = client.query(sys,
    			"a_users", "u",
    			-1, -1); // no paging

    	jreq.body(0)
    		.expr("userName", "uname")
    		.expr("userId", "uid")
    		.expr("r.roleId", "role")
    		.j("a_roles", "r", "u.roleId = r.roleId")
    		.where("=", "u.userId", "'admin'");

    	AnsonResp resp = client.commit(jreq, errCtx);
		List<AnResultset> rses = (List<AnResultset>) resp.rs();
		for (AnResultset rs : rses) {
			  rs.beforeFirst();
			  while(rs.next()) {
				  String uid0 = rs.getString("uid");
				  assertEquals("admin", uid0);
						  
				  String roleId = rs.getString("role");
				  getEcho("admin", roleId);

				  // function/semantics tests
				  testUpload(client);
				  // insert/load oracle reports
				  // testORCL_Reports(client);
			  }
		}
    	/* client.commit(jreq, (code, data) -> {
				List<AnResultset> rses = (List<AnResultset>) data.rs();
  				for (AnResultset rs : rses) {
  					rs.printSomeData(true, 2, "uid", "uname", "role");
  					rs.beforeFirst();
  					while(rs.next()) {
  						String uid0 = rs.getString("uid");
  						assertEquals("admin", uid0);
  								
  						String roleId = rs.getString("role");
  						getEcho("admin", roleId);

  						// function/semantics tests
  						testUpload(client);

  						// insert/load oracle reports
  						// testORCL_Reports(client);
  					}
  				}
    		}, (code, err) -> {
  				fail(err.msg());
  				client.logout();
    	}); */
    }

	private void getEcho(String string, String roleId)
			throws SemanticException, IOException, SQLException, AnsonException {
		if (!jserv.contains("jserv-sample")) {
			Utils.warn("getEcho() can only work with jsample");
			return;
		}
		EchoReq req = new EchoReq(null);

		String t = "menu";
		String[] act = AnsonHeader.usrAct("SemanticClientTest", "init", t,
				"test jclient.java loading menu from menu.sample");
		AnsonHeader header = client.header().act(act);

		AnsonMsg<? extends AnsonBody> jmsg = client.<EchoReq>userReq("test/echo", Port.echo, req);
		jmsg.header(header);

		Anson.verbose = true;
		AnsonResp resp = client.commit(jmsg, errCtx);
		assertNotNull(resp.msg());
	}

	static void testUpload(SessionClient client)
			throws SemanticException, IOException, SQLException, AnsonException {
		Path p = Paths.get(filename);
		byte[] f = Files.readAllBytes(p);
		String b64 = AESHelper.encode64(f);

		String furi = "test/Anclient";
		AnsonMsg<? extends AnsonBody> jmsg = client.update(furi, "a_users");
		((AnUpdateReq) jmsg.body(0))
			.nv("nationId", "CN")
			.whereEq("userId", "admin")
			// .post(((UpdateReq) new UpdateReq(null, "a_attach")
			.post(AnUpdateReq
				.formatDelReq(furi, null, "a_attaches")
				.whereEq("busiTbl", "a_users")
				.whereEq("busiId", "admin")
				.post((AnInsertReq
					.formatInsertReq(furi, null, "a_attaches")
					.cols("attName", "busiId", "busiTbl", "uri")
					.nv("attName", "'s Portrait")
					// The parent pk can't be resulved, we must provide the value.
					// See https://odys-z.github.io/notes/semantics/best-practices.html#fk-ins-cate
					.nv("busiId", "admin")
					.nv("busiTbl", "a_users")
					.nv("uri", b64))));

		jmsg.header(client.header());

		AnsonResp resp = client.commit(jmsg, errCtx);
		// String obj = ((SemanticObject) resp.data().get("resulved")).resulve("a_attaches", "");
		String aid = resp.resulvedata("a_attaches", "attId");

		assertTrue( Radix64.validate(aid) );
	}
}
