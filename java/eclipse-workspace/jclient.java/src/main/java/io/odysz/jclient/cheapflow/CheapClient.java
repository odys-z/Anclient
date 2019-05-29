package io.odysz.jclient.cheapflow;

import java.io.IOException;
import java.sql.SQLException;

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
	
	public void loadFlow(String wfId, String taskId, String[] act, SCallback onOk) throws SemanticException, SQLException, IOException {
		CheapReq req = new CheapReq(null)
				.loadFlow(wfId, taskId);

		String t = Req.load.name();

		JMessage<? extends JBody> jmsg = ssclient.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

    	ssclient.commit(jmsg, (code, data) -> {
//			SemanticObject e = (SemanticObject) data.get("evt");
			onOk.onCallback("ok", data);
    	});
	}

	/**Send a starting request to CheapServ.
	 * @param wfid
	 * @param act client action for logging user's finger print at server side, typically got with
	 * <pre>JHeader.usrAct("CheapClient Test", "start", t,
		"test jclient.java starting wf " + wfId);</pre>
	 * @param onOk
	 * @throws SemanticException
	 * @throws IOException
	 * @throws SQLException
	 */
	public void start(String wfid, String[] act, SCallback onOk) throws SemanticException, IOException, SQLException {
		CheapReq req = new CheapReq(null)
				.req(Req.start).wftype(wfid)
				.nodeDesc("Desc: bla")
				// .childTabl("task_details")
				// .newChildInstRow().childInsert("remarks", "client detail - 01")
				// .newChildInstRow().childInsert("remarks", "client detail - 02")
				;

		String t = Req.start.name();

		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		JMessage<? extends JBody> jmsg = ssclient.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
			SemanticObject e = (SemanticObject) data.get("evt");
			onOk.onCallback("ok", e);
    	});

	}

	/**Send a stepping command request to CheapServ.
	 * @param wfid
	 * @param cmd
	 * @param act client action for logging user's finger print at server side, typically got with
	 * <pre>JHeader.usrAct("CheapClient Test", "read", t,
		"test jclient.java querying rights " + wfId);</pre>
	 * @param onOk
	 * @throws SQLException
	 * @throws SemanticException
	 * @throws IOException
	 */
	public void step(String wfid, String cmd, String[] act, SCallback onOk)
			throws SQLException, SemanticException, IOException {
		CheapReq req = new CheapReq(null)
				.reqCmd(cmd)
				.wftype(wfid);

		String t = Req.cmd.name();

		JMessage<? extends JBody> jmsg = ssclient.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
			SemanticObject e = (SemanticObject) data.get("evt");
			onOk.onCallback("ok", e);
    	});

	}

	public void rights(String wfid, String taskId, String currentNodeId, String usrId, SCallback onOk)
			throws SQLException, SemanticException, IOException {
		CheapReq req = new CheapReq(null)
				.cmdsRight(currentNodeId, usrId, taskId)
				.wftype(wfid);

		String t = Req.rights.name();
		String[] act = JHeader.usrAct("", "read", t,
				"jclient.java querying rights " + wfId);

		JMessage<? extends JBody> jmsg = ssclient.userReq(t, Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
//			SemanticObject e = (SemanticObject) data.get("rights");
//			onOk.onCallback("ok", new SemanticObject().put("rights", e));
    		onOk.onCallback(code, data);
    	});

	
	}

}
