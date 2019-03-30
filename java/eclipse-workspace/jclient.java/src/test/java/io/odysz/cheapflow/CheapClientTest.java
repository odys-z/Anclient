package io.odysz.cheapflow;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.jupiter.api.Test;

import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.cheapflow.CheapClient;
import io.odysz.semantics.x.SemanticException;

class CheapClientTest {
	static final String jserv = "http://localhost:8080/semantic.jserv";

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
    		
    		CheapClient cheap = new CheapClient(ssc);
    		cheap.start(wfId, (c, dat) -> {
    			// fail("Not yet implemented");
    		});
    		

    		cheap.step(wfId, cmdA, (c, dt) -> {
    			
    		});
    		
    		cheap.step3(wfId, cmd3, (c, dt) -> {
    			
    		});
    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    	}
    }

}
