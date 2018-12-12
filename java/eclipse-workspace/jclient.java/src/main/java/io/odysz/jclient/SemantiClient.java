package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;

import io.odysz.semantics.x.SemanticException;

/**
 * For how to use lambda expressions, see {@link #testAsych(IrCallback)}.
 * @author ody
 *
 */
public class SemantiClient {
	/**Interface with {@link #onCallback(String, Object)} for called on events happen,
	 * e.g. on success when an http post request finished. */
	@FunctionalInterface
	public interface IjCallback {
		void onCallback(String code, Object Data) throws IOException, SQLException, SemanticException;
	}
	
	public static enum Req { query, update, insert, delete, userData };
	

}
