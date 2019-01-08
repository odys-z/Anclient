package io.odysz.jclient;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.sql.SQLException;
import java.util.List;

import org.junit.Test;
import org.junit.jupiter.api.BeforeAll;

import io.odysz.common.Utils;
import io.odysz.module.rs.SResultset;
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
    	Utils.printCaller(false);
    	JHelper.printCaller(false);

   		Clients.init("http://localhost:8080/semantic.jserv");

    	SessionClient client = Clients.login("admin", "admin@admin");
    	JMessage<QueryReq> req = client.query("a_user", "u", "test", -1, -1);
    	// select userName uname, userId uid, roleName role from a_user u join a_roles r on u.roleId = r.roleId where u.userId = 'admin'
    	req.body(0).expr("userName", "uname")
    				.expr("userId", "uid")
    				.expr("roleName", "role")
    				.j("a_roles", "r", "u.roleId = r.roleId")
    				.where("=", "u.userId", "'admin'");
    	HttpServClient httpClient = new HttpServClient();
  		httpClient.post(Clients.servUrl(Port.query), req,
  				(code, obj) -> {
  					JHelper.logi(obj);
  					Object o = obj.get("rs");
  					@SuppressWarnings("unchecked")
					List<SResultset> rses = (List<SResultset>) o;
  					for (SResultset rs : rses) {
  						rs.printSomeData(false, 2, "uid", "uname", "role");
  						rs.beforeFirst();
  						while(rs.next()) {
  							String uid0 = rs.getString("uid");
  							assertTrue(uid0 != null);
  						}
  					}
  				});
    	client.logout();
    }
}
