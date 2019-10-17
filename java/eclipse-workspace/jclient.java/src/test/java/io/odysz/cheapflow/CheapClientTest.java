package io.odysz.cheapflow;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.jclient.AnsonClient;
import io.odysz.jclient.Clients;
import io.odysz.jclient.cheapflow.CheapClient;
import io.odysz.jsample.cheap.CheapCode;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.jprotocol.AnsonHeader;
import io.odysz.semantic.jserv.U.AnInsertReq;
import io.odysz.semantics.x.SemanticException;
import io.odysz.sworkflow.CheapEvent;
import io.odysz.sworkflow.CheapResp;
import io.odysz.transact.x.TransException;

class CheapClientTest {
	static final String jserv = "http://localhost:8080/engcosts";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	@Test
	void test() throws SemanticException, SQLException, GeneralSecurityException, AnsonException {
		Utils.printCaller(false);
    	try {
    		Clients.init(jserv);
    		String pswd = System.getProperty("pswd");
    		AnsonClient ssc = Clients.loginV11("admin", pswd);
    		
    		// create 3 task details
    		AnInsertReq newTaskDetail1 = (AnInsertReq) AnInsertReq
    				.formatInsertReq(null, null, "task_details")
    				.nv("remarks", "by java client 1")
    				.post(AnInsertReq
    						.formatInsertReq(null, null, "task_details")
    						.nv("remarks", "by java client 2"))
    				.post(AnInsertReq
    						.formatInsertReq(null, null, "task_details")
    						.nv("remarks", "by java client 3"));

    		CheapClient cheap = new CheapClient(ssc);
    		String[] act = AnsonHeader.usrAct("CheapClient Test", "start", "cheap",
				"test jclient.java starting wf " + wfId);
			cheap.start(wfId, "start", newTaskDetail1, act,
    			(c, dat) -> {
	    			// fail("Not yet implemented");
					try {
						// concurrency 1: ask current rights
						// CheapEvent evt = new CheapEvent(dat);
						CheapEvent evt = ((CheapResp)dat).event();
						cheap.rights(wfId, evt.taskId(), evt.currentNodeId(), "admin", (c0, dat0) -> {
							Utils.logi("Rights:\n%s", dat0);
							// ((SemanticObject)dat0).print(System.out);
						});
	
						// concurrency 2: step the started task -> A
						String[] atc = AnsonHeader.usrAct("CheapClient Test", "step", "cheap",
								"test t01.01 -> t01.02A ");
						cheap.step(wfId, evt.taskId(), cmdA, atc, (c1, dt) -> {
							assertEquals(CheapCode.ok, c1);
							try {
								// CheapEvent ev2 = new CheapEvent(dt);
								CheapEvent ev2 = ((CheapResp)dt).event();
								assertEquals("t01.02A", ev2.nextNodeId());
							} catch (Exception e) {
								e.printStackTrace();
								fail(e.getMessage());
							}
						});
	    			
						atc = AnsonHeader.usrAct("CheapClient Test", "step", "cheap",
								"test t01.01 -> t01.02B ");
						cheap.step(wfId, evt.taskId(), cmdB, atc, (c1, dt) -> {
							assertEquals(CheapCode.ok, c1);
							try {
								// CheapEvent ev2 = new CheapEvent(dt);
								CheapEvent ev2 = ((CheapResp)dt).event();
								assertEquals("t01.02B", ev2.nextNodeId());
							} catch (Exception e) {
								e.printStackTrace();
								fail(e.getMessage());
							}
						});
						
						// concurrency 3, load flow
						cheap.loadFlow(wfId, evt.taskId(), act, (c1, dat1) -> {
							Utils.printCaller(false);
							CheapResp data = (CheapResp) dat1;
							AnResultset insts = (AnResultset) data.rs(0);
							AnResultset currt = (AnResultset) data.rs(1);
							Utils.logi(data.rsInfo());
							insts.printSomeData(false, 5, "sort", "nodeName", "handleTxt", "isCurrent", "instId", "taskId");
							currt.printSomeData(false, 5, "*");
						});
						
						// step t01.01
					} catch (TransException e) {
						e.printStackTrace();
					}
	    		},
    		(c, dat) -> {
    				// dat.print(System.err);
    				Utils.warn(dat.toString());
    				fail(c + ": try use the db from semantic-workflow/test/res");
    			});
    		
//    		cheap.step(wfId, cmd3, act, (C, dt) -> {
//    		});

    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    		fail(io.getMessage());
    	}
    }

}
