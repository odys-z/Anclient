package io.odysz.cheapflow;

import static org.junit.Assert.fail;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.cheapflow.CheapClient;
import io.odysz.semantic.jprotocol.JHeader;
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

	@SuppressWarnings("unchecked")
	@Test
	void test() throws SemanticException, SQLException, GeneralSecurityException {
		Utils.printCaller(false);
    	try {
    		Clients.init(jserv);
    		String pswd = System.getProperty("pswd");
    		SessionClient ssc = Clients.login("admin", pswd);
    		
    		CheapClient cheap = new CheapClient(ssc);
    		String[] act = JHeader.usrAct("CheapClient Test", "start", "cheap",
				"test jclient.java starting wf " + wfId);
    		cheap.start(wfId, act,
    			(c, dat) -> {
	    			// fail("Not yet implemented");
					try {
						// concurrency 1: ask current rights
						CheapEvent evt = new CheapEvent(dat);
						cheap.rights(wfId, evt.taskId(), evt.currentNodeId(), "admin", (c0, dat0) -> {
							((SemanticObject)dat0).print(System.out);
						});
	
						// concurrency 2: step the started task
	//					String[] atc = JHeader.usrAct("CheapClient Test", "step", "cheap",
	//							"test jclient.java stepping wf " + wfId);
	//					cheap.step(wfId, cmdA, atc, (c1, dt) -> {
	//					});
	    			
						// concurrency 3, load flow
						cheap.loadFlow(wfId, evt.taskId(), act, (c1, dat1) -> {
							ArrayList<String[]> l = (ArrayList<String[]>) dat1.get("data");
							for (String[] row : l) {
								Utils.logi(row);
							}
						});
					} catch (TransException e) {
						e.printStackTrace();
					}
	    		},
    		(c, dat) -> {
    				dat.print(System.err);
    				fail(c + ": try use the db from semantic-workflow/test/res");
    			});
    		
//    		cheap.step(wfId, cmd3, act, (c, dt) -> {
//    			
//    		});

    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    		fail(io.getMessage());
    	}
    }

}
