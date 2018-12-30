package io.odysz.jclient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import org.junit.Test;

import io.odysz.common.Utils;
import io.odysz.semantics.x.SemanticException;

/**
 * Unit test for simple App.
 */
public class SemantiClientTest {
   
    @Test
    public void SemanticTest() throws SemanticException, IOException {
    	Clients.login("admin", "123456").query("query", "echo", -1, -1)
    		.commit((code, obj) -> {
    			OutputStream os = new ByteArrayOutputStream();
    			obj.json(os);
    			Utils.logi(os.toString());
    		});
    }

}
