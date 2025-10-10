package io.odysz.jclient;

import io.odysz.semantic.jsession.SessionInf;

public class InsecureClient extends AnsonClient {

	InsecureClient(String servRt, String conn) {
		super(robotSsInf());
	}

	private static SessionInf robotSsInf() {
		return new SessionInf("uid", "robot"); // mac?
	}

}
