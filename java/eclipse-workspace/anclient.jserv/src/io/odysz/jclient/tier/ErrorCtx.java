package io.odysz.jclient.tier;

import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.JProtocol.OnError;

/**This type is used for keeping error handling consist with React TS version, 
 * which is the error handler provided by React context provide. It's the optimized
 * way of abstracting error handling.
 * 
 * @author ody
 *
 */
public class ErrorCtx implements OnError {
    public String msg = "";
	public MsgCode code = null;

	public String msg () { return msg; };

	@Override
	public void err(MsgCode code, String msg, String ... args) {
		this.code = code;
		this.msg = String.format(msg, args);
	}

	public ErrorCtx setSignal(String signal) { return this; };
	public ErrorCtx notifySignal() { return this; };
}
