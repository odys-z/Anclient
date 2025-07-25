//package io.odysz.jclient.tier;
//
//import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
//
//public class ErrorAwaitHandler extends ErrorCtx {
//
//	String signal;
//
//	@Override
//	public ErrorCtx setSignal(String signal) {
//		this.signal = signal;
//		return this;
//	}
//	
//	public ErrorCtx notifySignal() {
//		this.signal.notify();
//		return this;
//	}
//
//	@Override
//	public void err(MsgCode ok, String msg, String... args) {
//	}
//
//}
