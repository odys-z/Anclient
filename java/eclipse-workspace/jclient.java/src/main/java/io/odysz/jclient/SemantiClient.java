package io.odysz.jclient;

import java.io.IOException;

import io.odysz.semantics.SemanticObject;
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
		void onCallback(String code, SemanticObject Data) throws IOException, SemanticException;
	}

	public static SemantiClient query(String port, String t) {
		
		return new SemantiClient();
	}
	
	public void commit(IjCallback callback)
			throws SemanticException, IOException {
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient
		// TODO import HttpClient

		callback.onCallback("ok", new SemanticObject());
	}
}
