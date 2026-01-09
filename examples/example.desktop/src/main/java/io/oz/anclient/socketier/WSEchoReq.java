package io.oz.anclient.socketier;

import io.odysz.semantic.jserv.echo.EchoReq;

public class WSEchoReq extends EchoReq {
	static class A {
		static final String echo = "e";
		/**
		 * Send me an ipc exception.
		 */
		static final String x = "x";
	}

	public String echo;

	public WSEchoReq() {
		super();
	}

	public WSEchoReq(String msg) {
		super();
		this.echo = msg;
	}
}
