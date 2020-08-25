package io.odysz.jclient;

import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.jclient.AnsonClient;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.ext.AnDatasetReq;
import io.odysz.semantic.ext.AnDatasetResp;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jserv.R.AnQueryReq;
import io.odysz.semantic.jserv.U.AnInsertReq;
import io.odysz.semantic.jserv.U.AnUpdateReq;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.sql.parts.condition.ExprPart;

/**
 * Unit test for sample App. 
 */
public class AnsonClientTest {
	private static String jserv = null;
	private static String pswd = null;
	private static String filename = "res/Sun_Yat-sen_2.jpg";
	
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

    	String sys = "sys-sqlite";
    	
    	client = Clients.login("admin", pswd);
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
  						getEcho("admin", roleId);

  						// function/semantics tests
  						testUpload(client);

  						// insert/load oracle reports
  						testORCL_Reports(client);
  					}
  				}
    		}, (code, err) -> {
  				fail(err.msg());
  				client.logout();
    	});
    }

	private void getEcho(String string, String roleId)
			throws SemanticException, IOException, SQLException, AnsonException {
		// AnDatasetReq req = new AnDatasetReq(null, "jserv-sample");
		AnDatasetReq req = new AnDatasetReq(null, "sys-sqlite");

		String t = "menu";
		AnsonHeader header = client.header();
		String[] act = AnsonHeader.usrAct("SemanticClientTest", "init", t,
				"test jclient.java loading menu from menu.sample");

		AnsonMsg<? extends AnsonBody> jmsg = client.userReq(Port.echo, act, req);
		jmsg.header(header);

		client.console(jmsg);
		
    	client.commit(jmsg, (code, data) -> {
			List<?> rses = ((AnDatasetResp)data).forest();
			Utils.logi(rses);;
    	});
	}

	static void testUpload(AnsonClient client)
			throws SemanticException, IOException, SQLException, AnsonException {
		Path p = Paths.get(filename);
		byte[] f = Files.readAllBytes(p);
		String b64 = AESHelper.encode64(f);

		AnsonMsg<? extends AnsonBody> jmsg = client.update(null, "a_users");
		AnUpdateReq upd = (AnUpdateReq) jmsg.body(0);
		upd.nv("nationId", "CN")
			.whereEq("userId", "admin")
			// .post(((UpdateReq) new UpdateReq(null, "a_attach")
			.post(AnUpdateReq.formatDelReq(null, null, "a_attaches")
					.whereEq("busiTbl", "a_users")
					.whereEq("busiId", "admin")
					.post((AnInsertReq.formatInsertReq(null, null, "a_attaches")
							.cols("attName", "busiId", "busiTbl", "uri")
							.nv("attName", "'s Portrait")
							// The parent pk can't be resulved, we must provide the value.
							// See https://odys-z.github.io/notes/semantics/best-practices.html#fk-ins-cate
							.nv("busiId", "admin")
							.nv("busiTbl", "a_users")
							.nv("uri", b64))));

		jmsg.header(client.header());

		client.console(jmsg);
		
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
	}

	private void testORCL_Reports(AnsonClient client)
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

	private static String randomVal() {
		double r = Math.random() * 100;
		return String.valueOf(r);
	}
}
