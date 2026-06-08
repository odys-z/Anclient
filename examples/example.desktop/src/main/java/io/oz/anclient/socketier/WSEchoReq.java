package io.oz.anclient.socketier;

import io.odysz.semantic.jserv.echo.EchoReq;

public class WSEchoReq extends EchoReq {
	public static class A {
		public static final String echo = "echo";
		/**
		 * Send me an ipc exception.
		 */
		public static final String x = "x";
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
