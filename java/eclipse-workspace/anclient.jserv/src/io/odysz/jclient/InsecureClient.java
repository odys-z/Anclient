package io.odysz.jclient;

import io.odysz.semantics.SessionInf;

/**
 * Anclient without session.
 * 
 * @author Ody
 */
public class InsecureClient extends SessionClient {

	public InsecureClient() {
		super(robotSsInf());
	}

	protected static SessionInf robotSsInf() {
		return new SessionInf("uid", "robot"); // mac?
	}

}
