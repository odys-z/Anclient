package io.odysz.jclient.cheapflow;

import java.io.IOException;
import java.sql.SQLException;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.AnsonClient;
import io.odysz.jsample.cheap.CheapReq;
import io.odysz.jsample.protocol.Samport;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.JProtocol.SCallbackV11;
import io.odysz.semantic.jserv.U.AnUpdateReq;
import io.odysz.semantics.x.SemanticException;
import io.odysz.sworkflow.EnginDesign.Req;

public class CheapClient {
//	static final String jserv = "http://localhost:8080/engcosts";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	private AnsonClient ssclient;

	public CheapClient(AnsonClient ssclient) {
		this.ssclient = ssclient;
	}
	
	public void loadFlow(String wfId, String taskId, String[] act, SCallbackV11 onOk)
			throws SemanticException, SQLException, IOException, AnsonException {
		CheapReq req = new CheapReq(null)
				.loadFlow(wfId, taskId);

//		String t = Req.load.name();

		AnsonMsg<? extends AnsonBody> jmsg = ssclient.userReq(Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

    	ssclient.commit(jmsg, (code, data) -> {
//			SemanticObject e = (SemanticObject) data.get("evt");
			onOk.onCallback(MsgCode.ok, data);
    	});
	}

	/**Send a starting request to CheapServ.
	 * @param wfid
	 * @param instDescpt 
	 * @param posts
	 * @param act client action for logging user's finger print at server side, typically got with
	 * <pre>JHeader.usrAct("CheapClient Test", "start", t,
		"test jclient.java starting wf " + wfId);</pre>
	 * @param onOk
	 * @throws SemanticException
	 * @throws IOException
	 * @throws SQLException
	 * @throws AnsonException 
	 */
	public void start(String wfid, String instDescpt, AnUpdateReq posts, String[] act,
			SCallbackV11 onOk, SCallbackV11 onErr) throws SemanticException, IOException, SQLException, AnsonException {
		CheapReq req = new CheapReq(null)
				.req(Req.start).wftype(wfid)
				.nodeDesc(instDescpt)
				.post(posts)
				// .newChildInstRow().childInsert("remarks", "client detail - 01")
				// .newChildInstRow().childInsert("remarks", "client detail - 02")
				;

//		String t = Req.start.name();

		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		// FIXME This is wrong, must using CheapReq!
		AnsonMsg<? extends AnsonBody> jmsg = ssclient.userReq(Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg,
    		(code, data) -> {
    			// SemanticObject e = (SemanticObject) data.get("evt");
    			onOk.onCallback(MsgCode.ok, data);
    		},
    		onErr);
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
	 * @throws AnsonException 
	 */
	public void step(String wfid, String taskId, String cmd, String[] act, SCallbackV11 onOk)
			throws SQLException, SemanticException, IOException, AnsonException {
		CheapReq req = new CheapReq(null)
				.wftype(wfid)
				.req(Req.cmd)
				.reqCmd(cmd)
				.taskId(taskId)
				;

//		String t = Req.cmd.name();

		AnsonMsg<? extends AnsonBody> jmsg = ssclient.userReq(Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
			// SemanticObject e = (SemanticObject) data.get("evt");
			onOk.onCallback(MsgCode.ok, data);
    	});

	}

	public void rights(String wfid, String taskId, String currentNodeId, String usrId, SCallbackV11 onOk)
			throws SQLException, SemanticException, IOException, AnsonException {
		CheapReq req = new CheapReq(null)
				.cmdsRight(currentNodeId, usrId, taskId)
				.wftype(wfid);

		String t = Req.rights.name();
		String[] act = AnsonHeader.usrAct("", "read", t,
				"jclient.java querying rights " + wfId);

		AnsonMsg<? extends AnsonBody> jmsg = ssclient.userReq(Samport.cheapflow, act, req);
		jmsg.header(ssclient.header());

		ssclient.console(jmsg);
		
    	ssclient.commit(jmsg, (code, data) -> {
//			SemanticObject e = (SemanticObject) data.get("rights");
//			onOk.onCallback("ok", new SemanticObject().put("rights", e));
    		onOk.onCallback(code, data);
    	});

	
	}

}
