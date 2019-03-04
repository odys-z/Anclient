package io.odysz.jclient;

import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertEquals;

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
import io.odysz.semantic.jserv.R.QueryReq;
import io.odysz.semantics.x.SemanticException;

/**
 * Unit test for simple App. 
 */
public class SemantiClientTest {
	private SessionClient client;

	@BeforeAll
	public void init() {
		Utils.printCaller(false);
	}
   
    @Test
    public void SemanticLoginTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException {
    	try {
    		Clients.init("http://localhost:8080/jserv-sample");
    		Clients.login("admin", "admin@admin");
    	} catch (IOException io) {
    		Utils.warn("loging failed: %s", io.getMessage());
    	}
    }

    @Test
    public void SemanticQueryTest() throws IOException,
    		SemanticException, SQLException, GeneralSecurityException {
    	Utils.printCaller(false);
    	JHelper.printCaller(false);

   		Clients.init("http://localhost:8080/jserv-sample");

    	client = Clients.login("admin", "admin@admin");
    	JMessage<QueryReq> req = client.query("inet", "a_user", "u", "test", -1, -1); // TODO test conn = null
    	// select userName uname, userId uid, roleName role from a_user u join a_roles r on u.roleId = r.roleId where u.userId = 'admin'
    	req.body(0).expr("userName", "uname")
    				.expr("userId", "uid")
    				.expr("r.roleId", "role")
    				.j("a_roles", "r", "u.roleId = r.roleId")
    				.where("=", "u.userId", "'admin'");
    	client.commit(req, (code, data) -> {
    		  	@SuppressWarnings("unchecked")
				List<SResultset> rses = (List<SResultset>) data.get("rs");
  				for (SResultset rs : rses) {
  					rs.printSomeData(true, 2, "uid", "uname", "role");
  					rs.beforeFirst();
  					while(rs.next()) {
  						String uid0 = rs.getString("uid");
  						assertEquals("admin", uid0);
  								
  						String roleId = rs.getString("role");
  						getMenu("admin", roleId);
  					}
  				}
    		}, (code, err) -> {
  				fail(err.getString("error"));
  				client.logout();
    	});
    }



	private void getMenu(String string, String roleId) {
		// TODO Auto-generated method stub
		
	}
}
