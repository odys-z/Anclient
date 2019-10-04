package io.odysz.jclient;

import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.jsample.protocol.Samport;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.ext.AnDatasetReq;
import io.odysz.semantic.ext.AnDatasetResp;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Unit test for simple App. 
 */
public class AnsonClientTest {
	private static String jserv = null;
	private static String pswd = null;
	private static String filename = "src/test/res/Sun_Yat-sen_2.jpg";
	
	private AnsonClient client;

	@BeforeAll
	public static void init() {
		Utils.printCaller(false);
		jserv = System.getProperty("jserv");
		if (jserv == null)
			fail("\nTo test AnsonClient, you need start a jsample server and define @jserv like this to run test:\n" +
				"-Djserv=http://localhost:8080/doc-base\n" +
				"In Eclipse, it is defined in:\n" +
				"Run -> Debug Configurations ... -> Junit [your test case name] -> Arguments");
   		pswd = System.getProperty("pswd");
   		if (pswd == null)
			fail("\nTo test Jclient.java, you need to configure user 'admin' and it's password at jsample server, then define @pswd like this to run test:\n" +
				"-Dpswd=*******");

    	Clients.init(jserv);
    }

    @Test
    public void queryTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException, AnsonException {
    	Utils.printCaller(false);
    	JHelper.printCaller(false);

    	String sys = "sys-sqlite";
    	
    	client = Clients.loginV11("admin", pswd);
    	AnsonMsg<AnQueryReq> req = client.query(sys,
    			"a_users", "u",
    			-1, -1); // don't paging

    	req.body(0)
    		.expr("userName", "uname")
    		.expr("userId", "uid")
    		.expr("r.roleId", "role")
    		.j("a_roles", "r", "u.roleId = r.roleId")
    		.where("=", "u.userId", "'admin'");

    	client.commit(req, (code, data) -> {
				List<AnResultset> rses = (List<AnResultset>) data.rs();
  				for (AnResultset rs : rses) {
  					rs.printSomeData(true, 2, "uid", "uname", "role");
  					rs.beforeFirst();
  					while(rs.next()) {
  						String uid0 = rs.getString("uid");
  						assertEquals("admin", uid0);
  								
  						String roleId = rs.getString("role");
  						getMenu("admin", roleId);
//  						
//  						// function/semantics tests
//  						testUpload(client);
//  						
//  						// insert/load oracle reports
//  						testReports(client);
  					}
  				}
    		}, (code, err) -> {
  				fail(err.msg());
  				client.logout();
    	});
    }

	private void getMenu(String string, String roleId)
			throws SemanticException, IOException, SQLException, AnsonException {
		// AnDatasetReq req = new AnDatasetReq(null, "jserv-sample");
		AnDatasetReq req = new AnDatasetReq(null, "sys-sqlite");

		String t = "menu";
		AnsonHeader header = client.header();
		String[] act = AnsonHeader.usrAct("SemanticClientTest", "init", t,
				"test jclient.java loading menu from menu.sample");

		AnsonMsg<? extends AnsonBody> jmsg = client.userReq(Samport.menu, act, req);
		jmsg.header(header);

		client.console(jmsg);
		
    	client.commit(jmsg, (code, data) -> {
			List<?> rses = ((AnDatasetResp)data).forest();
			Utils.logi(rses);;
    	});
	}

//	static void testUpload(SessionClient client) throws SemanticException, IOException, SQLException {
//		Path p = Paths.get(filename);
//		byte[] f = Files.readAllBytes(p);
//		String b64 = AESHelper.encode64(f);
//
//		JMessage<? extends JBody> jmsg = client.update(null, "a_users");
//		UpdateReq upd = (UpdateReq) jmsg.body(0);
//		upd.nv("nationId", "CN")
//			.whereEq("userId", "admin")
//			// .post(((UpdateReq) new UpdateReq(null, "a_attach")
//			.post(UpdateReq.formatDelReq(null, null, "a_attaches", CRUD.D)
//					.whereEq("busiTbl", "a_users")
//					.whereEq("busiId", "admin")
//					.post((InsertReq.formatReq(null, null, "a_attaches")
//							.nv("attName", "'s Portrait")
//							// The parent pk can't be resulved, we must provide the value.
//							// See https://odys-z.github.io/notes/semantics/best-practices.html#fk-ins-cate
//							.nv("busiId", "admin")
//							.nv("busiTbl", "a_users")
//							.nv("uri", b64))));
//
//		jmsg.header(client.header());
//
//		client.console(jmsg);
//		
//    	client.commit(jmsg,
//    		(code, data) -> {
//				if (MsgCode.ok.eq(code))
//					Utils.logi(code);
//				else Utils.warn(data.toString());
//    		},
//    		(c, err) -> {
//				fail(String.format("code: %s, error: %s", c, err.error()));
//    		});
//	}

	private void testReports(SessionClient client)
			throws SemanticException, IOException, SQLException {
		String orcl = "orcl.alarm-report";

		// 1. generate a report
		InsertReq recs = InsertReq.formatReq(orcl, null, "b_reprecords")
				.cols(new String[] {"deviceId", "val"});

		for (int i = 0; i < 20; i++) {
			ArrayList<Object[]> row = new ArrayList<Object[]> ();
			row.add(new String[] {"deviceId", String.format("d00%2s", i)});
			row.add(new Object[] {"val", new ExprPart(randomVal())});
			recs.valus(row);
		}
		
		JMessage<? extends JBody> jmsg = client.insert(orcl, "b_reports");
		InsertReq rept = ((InsertReq) jmsg.body(0));
		rept.cols(new String[] {"areaId", "ignored"} )
			.nv("areaId", "US")
			.nv("ignored", new ExprPart("0"))
			.post(recs);

    	client.commit(jmsg,
    		// 2. read last 10 days'
    		(code, data) -> {
    			JMessage<QueryReq> j = client
    				.query(orcl, "b_reports", "r", -1, 0);

    			j.body(0)
    				.j("b_reprecords", "rec", "r.repId = rec.repId")
    				// .where(">", "r.stamp", "dateDiff(day, r.stamp, sysdate)");
    				.where(">", "decode(\"r\".\"stamp\", null, sysdate, \"r\".\"stamp\") - sysdate", "-0.1");

    			client.commit(j,
    				(c, d) -> {
						SResultset rs = (SResultset) d.rs(0);
							rs.printSomeData(false, 2, "recId");
					},
					(c, err) -> {
						fail(String.format("code: %s, error: %s", c, err.error()));
					});
    		},
    		(c, err) -> {
    			Utils.warn(err.error());
				fail(String.format("code: %s, error: %s", c, err.error()));
    		});
	}

	private static String randomVal() {
		double r = Math.random() * 100;
		return String.valueOf(r);
	}
}
