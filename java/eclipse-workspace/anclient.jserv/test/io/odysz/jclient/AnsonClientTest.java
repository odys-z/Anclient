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
import io.odysz.common.Utils;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.ext.AnDatasetReq;
import io.odysz.semantic.ext.AnDatasetResp;
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
	// private static String jserv = "http://localhost:8081/jserv-album";
	private static String jserv = "http://localhost:8080/jserv-sample";
	private static String pswd = "123456";
	private static String filename = "res/Sun_Yat-sen_2.jpg";
	
	private SessionClient client;
	private static ErrorCtx errCtx;

	@BeforeAll
	public static void init() {
		Utils.printCaller(false);
//		jserv = System.getProperty("jserv");
//		if (jserv == null)
//			fail("\nTo test AnsonClient, you need start a jsample server and define @jserv like this to run test:\n" +
//				"-Djserv=http://localhost:8080/doc-base\n" +
//				"In Eclipse, it is defined in:\n" +
//				"Run -> Debug Configurations ... -> Junit [your test case name] -> Arguments");
//   		pswd = System.getProperty("pswd");
//   		if (pswd == null)
//			fail("\nTo test Anclient.java, you need to configure user 'admin' and it's password at jsample server, then define @pswd like this to run test:\n" +
//				"-Dpswd=*******");

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
		// AnDatasetReq req = new AnDatasetReq(null, "jserv-sample");
		if (!jserv.contains("jserv-sample"))
		{
			Utils.warn("getEcho() can only work with jsample");
			return;
		}
		EchoReq req = new EchoReq(null);

		String t = "menu";
		String[] act = AnsonHeader.usrAct("SemanticClientTest", "init", t,
				"test jclient.java loading menu from menu.sample");
		AnsonHeader header = client.header().act(act);

		// AnsonMsg<? extends AnsonBody> jmsg = client.userReq(Port.echo, act, req);
		AnsonMsg<? extends AnsonBody> jmsg = client.<EchoReq>userReq("test/echo", Port.echo, req);//, act);
		jmsg.header(header);

		// client.console(jmsg);
		
		Anson.verbose = true;
		AnsonResp resp = client.commit(jmsg, errCtx);
		// assertTrue(((AnsonResp)resp).forest().size() > 0);
		assertNotNull(resp.data());
		/*
    	client.commit(jmsg, (code, data) -> {
			List<?> rses = ((AnDatasetResp)data).forest();
			Utils.logi(rses);;
    	});
    	*/
	}

	static void testUpload(SessionClient client)
			throws SemanticException, IOException, SQLException, AnsonException {
		Path p = Paths.get(filename);
		byte[] f = Files.readAllBytes(p);
		String b64 = AESHelper.encode64(f);

		String furi = "test/Anclient";
		AnsonMsg<? extends AnsonBody> jmsg = client.update(furi, "a_users");
		AnUpdateReq upd = (AnUpdateReq) jmsg.body(0);
		upd.nv("nationId", "CN")
			.whereEq("userId", "admin")
			// .post(((UpdateReq) new UpdateReq(null, "a_attach")
			.post(AnUpdateReq.formatDelReq(furi, null, "a_attaches")
					.whereEq("busiTbl", "a_users")
					.whereEq("busiId", "admin")
					.post((AnInsertReq.formatInsertReq(furi, null, "a_attaches")
							.cols("attName", "busiId", "busiTbl", "uri")
							.nv("attName", "'s Portrait")
							// The parent pk can't be resulved, we must provide the value.
							// See https://odys-z.github.io/notes/semantics/best-practices.html#fk-ins-cate
							.nv("busiId", "admin")
							.nv("busiTbl", "a_users")
							.nv("uri", b64))));

		jmsg.header(client.header());

		// client.console(jmsg);
		
		AnsonResp resp = client.commit(jmsg, errCtx);
		assertEquals("", (String) resp.data().get("aid"));
		/*
    	client.commit(jmsg,
    		(code, data) -> {
    			// This line can not been tested without branch
    			// branching v1.1
				if (MsgCode.ok.eq(code.name()))
					Utils.logi(code.name());
				else Utils.warn(data.toString());
    		},
    		(c, err) -> {
				fail(String.format("code: %s, error: %s", c, err.msg()));
    		});
    	*/
	}

	/*
	private void testORCL_Reports(SessionClient client)
			throws SemanticException, IOException, SQLException, AnsonException {
		String orcl = "orcl.alarm-report";

		// 1. generate a report
		AnInsertReq recs = AnInsertReq.formatInsertReq(orcl, null, "b_reprecords")
				.cols(new String[] {"deviceId", "val"});

		for (int i = 0; i < 20; i++) {
			ArrayList<Object[]> row = new ArrayList<Object[]> ();
			row.add(new String[] {"deviceId", String.format("d00%2s", i)});
			row.add(new Object[] {"val", new ExprPart(randomVal())});
			recs.valus(row);
		}
		
		AnsonMsg<?> jmsg = client.insert(orcl, "b_reports");
		AnInsertReq rept = ((AnInsertReq) jmsg.body(0));
		rept.cols(new String[] {"areaId", "stamp", "ignored"} )
			.nv("areaId", "US")
			// TODO requirements issue
			// TODO all of three trying failed.
			// TODO - how to add expression at client without semantext?
			//        E.g. funcall can not serialized without semantext.
			// TODO should this become a requirements issue?
			// 1 .nv("stamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()))
			// 2 .nv("stamp", Funcall.now())
			// 3 .nv("stamp", String.format("to_date('%s', 'YYYY-MM-DD HH24:MI:SS')",
			//		new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()))))
			.nv("ignored", new ExprPart("0"))
			.post(recs);

    	client.commit(jmsg,
    		// 2. read last 10 days'
    		(code, data) -> {
    			AnsonMsg<AnQueryReq> j = client
    				.query(orcl, "b_reports", "r", -1, 0);

    			j.body(0)
    				.j("b_reprecords", "rec", "r.repId = rec.repId")
    				// .where(">", "r.stamp", "dateDiff(day, r.stamp, sysdate)");
    				
    				
					// ISSUE 2019.10.14 [Antlr4 visitor doesn't throw exception when parsing failed]
					// For a quoted full column name like "r"."stamp", in
					// .where(">", "decode(\"r\".\"stamp\", null, sysdate, r.stamp) - sysdate", "-0.1")
					// Antlr4.7.1/2 only report an error in console error output:
					// line 1:7 no viable alternative at input 'decode("r"'
					// This makes semantic-jserv won't report error until Oracle complain about sql error.
    				.where(">", "decode(r.stamp, null, sysdate, r.stamp) - sysdate", "-0.1");

    			client.commit(j,
    				(c, d) -> {
						AnResultset rs = (AnResultset) d.rs(0);
							rs.printSomeData(false, 2, "recId");
					},
					(c, err) -> {
						fail(String.format("code: %s, error: %s", c, err.msg()));
					});
    		},
    		(c, err) -> {
    			Utils.warn(err.msg());
				fail(String.format("code: %s, error: %s", c, err.msg()));
    		});
	}
	*/
}
