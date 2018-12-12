package io.odysz.jclient;

import java.io.IOException;
import java.sql.SQLException;

import io.odysz.semantics.x.SemanticException;

/**
 * @author ody
 *
 */
public class SemantiClient {
	public static enum Req { query, update, insert, delete, userData };

	/**Interface with {@link #onCallback(String, Object)} for called on events happen,
	 * e.g. on success when an http post request finished. */
	@FunctionalInterface
	public interface IjCallback {
		void onCallback(String code, Object Data) throws IOException, SQLException, SemanticException;
	}

}
