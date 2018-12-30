package io.odysz.jclient;

import io.odysz.semantics.SemanticObject;

public class InsecureClient extends SessionClient {

	InsecureClient(String servRt, String conn) {
		super(robotSsInf(), servRt, conn);
	}

	private static SemanticObject robotSsInf() {
		return new SemanticObject()
				.put("uid", "robot"); // mac?
	}

}
