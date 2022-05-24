package io.odysz.jclient.tier;

public class ErrorAwaitHandler implements ErrorCtx {

	String signal;

	@Override
	public ErrorCtx setSignal(String signal) {
		this.signal = signal;
		return this;
	}
	
	public ErrorCtx notifySignal() {
		this.signal.notify();
		return this;
	}

}
