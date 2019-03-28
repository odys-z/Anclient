package io.odysz.cheapflow;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.Before;
import org.junit.jupiter.api.Test;

import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jsample.cheap.CheapReq;
import io.odysz.jsample.protocol.Samport;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;
import io.odysz.sworkflow.EnginDesign.Req;

class CheapClient {
	static final String jserv = "http://localhost:8080/semantic.jserv";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	@Before
	public static void init() {
		Utils.printCaller(false);
	}
	@Test
	void test() throws SemanticException, SQLException, GeneralSecurityException {
		// fail("Not yet implemented");
    	try {
    		// Clients.init("http://localhost:8080/jserv-sample");
    		Clients.init(jserv);
    		String pswd = System.getProperty("pswd");
    		SessionClient ssc = Clients.login("admin", pswd);
    		
    		start(ssc, wfId, (c, dat) -> {
    			
    		});
    		

    		step(ssc, wfId, cmdA, (c, dt) -> {
    			
    		});
    		
    		step3(ssc, wfId, cmd3, (c, dt) -> {
    			
    		});
    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    	}
    }

	private void start(SessionClient client, String wfid, SCallback onOk) throws SemanticException, IOException, SQLException {
		CheapReq req = new CheapReq(null, "jserv-sample")
				.req(Req.start).wftype(wfid)
				.nodeDesc("Desc: bla")
				.childTabl("task_details")
				.newChildInstRow().childInsert("remarks", "client detail - 01")
				.newChildInstRow().childInsert("remarks", "client detail - 02");

		String t = Req.start.name();
		String[] act = JHeader.usrAct("CheapClient Test", "start", t,
				"test jclient.java starting wf " + wfId);

		JMessage<? extends JBody> jmsg = client.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(client.header());

		client.console(jmsg);
		
    	client.commit(jmsg, (code, data) -> {
			SemanticObject rs = (SemanticObject) data.get("evt");
			rs.print(System.out);
    	});

	}

	private void step(SessionClient ssc, String wfid, String cmd, SCallback onOk) {
		
	}

	private void step3(SessionClient ssc, String wfid, String cmd, SCallback onOk) {
		
	}

}
