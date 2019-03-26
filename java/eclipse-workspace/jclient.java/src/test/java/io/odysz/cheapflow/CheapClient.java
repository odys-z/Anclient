package io.odysz.cheapflow;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.JProtocol.SCallback;
import io.odysz.semantics.x.SemanticException;

class CheapClient {
	static final String jserv = "http://localhost:8080/semantic.jserv";

	static final String wfId = "t01";
	static final String cmdA = "t01.01.stepA";
	static final String cmdB = "t01.01.stepB";
	static final String cmd3 = "t01.02.go03";

	@BeforeAll
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

	private void start(SessionClient ssc, String wfid, SCallback onOk) {
		// TODO Auto-generated method stub
		
	}

	private void step(SessionClient ssc, String wfid, String cmd, SCallback onOk) {
		// TODO Auto-generated method stub
		
	}

	private void step3(SessionClient ssc, String wfid, String cmd, SCallback onOk) {
		// TODO Auto-generated method stub
		
	}

}
