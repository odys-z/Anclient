package io.odysz.jclient;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;

import org.junit.Test;
import org.junit.jupiter.api.BeforeAll;

import io.odysz.common.Utils;
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
    public void SemanticTest() throws IOException, SemanticException, SQLException, GeneralSecurityException {
//    	Clients.login("admin", "123456")
//    		.query("query", "echo", -1, -1)
//    		.commit((code, obj) -> {
//    			OutputStream os = new ByteArrayOutputStream();
//    			obj.json(os);
//    			Utils.logi(os.toString());
//    		});
    	try {
    		Clients.init("http://localhost:8080/semantic.jserv");
    		Clients.login("admin", "admin@admin");
    	} catch (IOException io) {
    		Utils.warn("network failed");
    	}
    }

}
