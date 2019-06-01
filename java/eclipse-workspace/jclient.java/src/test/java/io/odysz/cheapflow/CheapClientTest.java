package io.odysz.cheapflow;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;

import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.cheapflow.CheapClient;
import io.odysz.jsample.cheap.CheapCode;
import io.odysz.module.rs.SResultset;
import io.odysz.semantic.jprotocol.JHeader;
import io.odysz.semantic.jprotocol.JProtocol.CRUD;
import io.odysz.semantic.jserv.U.UpdateReq;
import io.odysz.semantics.SemanticObject;
import io.odysz.semantics.x.SemanticException;
import io.odysz.sworkflow.CheapEvent;
import io.odysz.transact.x.TransException;

class CheapClientTest {
	static final String jserv = "http://localhost:8080/engcosts";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	@Test
	void test() throws SemanticException, SQLException, GeneralSecurityException {
		Utils.printCaller(false);
    	try {
    		Clients.init(jserv);
    		String pswd = System.getProperty("pswd");
    		SessionClient ssc = Clients.login("admin", pswd);
    		
    		UpdateReq newTaskDetail1 = UpdateReq
    				.formatReq(null, null, "task_details", CRUD.C)
    				.nv("remarks", "by java client 1")
//    				.post(UpdateReq
//    						.formatReq(null, null, "task_details", CRUD.C)
//    						.nv("remarks", "by java client 2"))
    				;

    		CheapClient cheap = new CheapClient(ssc);
    		String[] act = JHeader.usrAct("CheapClient Test", "start", "cheap",
				"test jclient.java starting wf " + wfId);
			cheap.start(wfId, "start", newTaskDetail1, act,
    			(c, dat) -> {
	    			// fail("Not yet implemented");
					try {
						// concurrency 1: ask current rights
						CheapEvent evt = new CheapEvent(dat);
						cheap.rights(wfId, evt.taskId(), evt.currentNodeId(), "admin", (c0, dat0) -> {
							Utils.logi("Rights:\n");
							((SemanticObject)dat0).print(System.out);
						});
	
						// concurrency 2: step the started task -> A
						String[] atc = JHeader.usrAct("CheapClient Test", "step", "cheap",
								"test t01.01 -> t01.02A ");
						cheap.step(wfId, evt.taskId(), cmdA, atc, (c1, dt) -> {
							assertEquals(CheapCode.ok, c1);
							try {
								CheapEvent ev2 = new CheapEvent((SemanticObject)dt);
								assertEquals("t01.02A", ev2.nextNodeId());
							} catch (Exception e) {
								e.printStackTrace();
								fail(e.getMessage());
							}
						});
	    			
						atc = JHeader.usrAct("CheapClient Test", "step", "cheap",
								"test t01.01 -> t01.02B ");
						cheap.step(wfId, evt.taskId(), cmdB, atc, (c1, dt) -> {
							assertEquals(CheapCode.ok, c1);
							try {
								CheapEvent ev2 = new CheapEvent((SemanticObject)dt);
								assertEquals("t01.02B", ev2.nextNodeId());
							} catch (Exception e) {
								e.printStackTrace();
								fail(e.getMessage());
							}
						});
						
						// concurrency 3, load flow
						cheap.loadFlow(wfId, evt.taskId(), act, (c1, dat1) -> {
							Utils.printCaller(false);
							SResultset insts = (SResultset) dat1.rs(0);
							SResultset currt = (SResultset) dat1.rs(1);
							Utils.logi((String) dat1.get("rs structure"));
							insts.printSomeData(false, 5, "sort", "nodeName", "handleTxt", "isCurrent", "instId", "taskId");
							currt.printSomeData(false, 5, "*");
						});
						
						// step t01.01
					} catch (TransException e) {
						e.printStackTrace();
					}
	    		},
    		(c, dat) -> {
    				dat.print(System.err);
    				fail(c + ": try use the db from semantic-workflow/test/res");
    			});
    		
//    		cheap.step(wfId, cmd3, act, (C, dt) -> {
//    			
//    		});

    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    		fail(io.getMessage());
    	}
    }

}
