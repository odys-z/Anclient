package io.odysz.jclient.cheapflow;

import java.io.IOException;
import java.sql.SQLException;

import io.odysz.common.Utils;
import io.odysz.jclient.SessionClient;
import io.odysz.jsample.cheap.CheapReq;
import io.odysz.jsample.protocol.Samport;
import io.odysz.semantic.jprotocol.JBody;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantics.x.SemanticException;
import io.odysz.sworkflow.EnginDesign.Req;

public class CheapClient {
	static final String jserv = "http://localhost:8080/semantic.jserv";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	private SessionClient ssclient;

	public CheapClient(SessionClient ssclient) {
		this.ssclient = ssclient;
	}

	public void start(String wfid, SCallback onOk) throws SemanticException, IOException, SQLException {
		CheapReq req = new CheapReq(null, "jserv-sample")
				.req(Req.start).wftype(wfid)
				.nodeDesc("Desc: bla")
				.childTabl("task_details")
				.newChildInstRow().childInsert("remarks", "client detail - 01")
				.newChildInstRow().childInsert("remarks", "client detail - 02");

		String t = Req.start.name();
		String[] act = JHeader.usrAct("CheapClient Test", "start", t,
				"test jclient.java starting wf " + wfId);

		JMessage<? extends JBody> jmsg = ssclient.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
			String e = (String) data.get("evt");
			Utils.logi(e);
    	});

	}

	public void step(String wfid, String cmd, SCallback onOk) {
		
	}

	public void step3(String wfid, String cmd, SCallback onOk) {
		
	}

}
