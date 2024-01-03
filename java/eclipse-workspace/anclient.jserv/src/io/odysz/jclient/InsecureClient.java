package io.odysz.jclient;

import io.odysz.semantics.SessionInf;

public class InsecureClient extends SessionClient {

	public InsecureClient(String servRt) {
		super(robotSsInf());
	}

	protected static SessionInf robotSsInf() {
		return new SessionInf("uid", "robot"); // mac?
	}

}
