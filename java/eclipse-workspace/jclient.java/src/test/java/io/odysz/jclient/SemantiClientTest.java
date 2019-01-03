package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.Test;
import org.junit.jupiter.api.BeforeAll;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JHelper;
import io.odysz.semantic.jprotocol.JMessage;
import io.odysz.semantic.jprotocol.JMessage.Port;
import io.odysz.semantic.jserv.R.QueryReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Unit test for simple App.
 */
public class SemantiClientTest {
	@BeforeAll
	public void init() {
		Utils.printCaller(false);
	}
   
    @Test
    public void SemanticLoginTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException {
    	try {
    		Clients.init("http://localhost:8080/semantic.jserv");
    		Clients.login("admin", "admin@admin");
    	} catch (IOException io) {
    		Utils.warn("network failed");
    	}
    }

    @Test
    public void SemanticQueryTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException {
   		Clients.init("http://localhost:8080/semantic.jserv");

    	SessionClient client = Clients.login("admin", "admin@admin");
    	JMessage<QueryReq> req = client.query("query", "echo", -1, -1);
    	HttpServClient httpClient = new HttpServClient();
  		httpClient.post(Clients.servUrl(Port.query), req,
  				(code, obj) -> { JHelper.logi(obj); });
    	client.logout();
    }
}
