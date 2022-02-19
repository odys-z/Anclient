package io.odysz.jclient.tier;

import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;

/**This type is used for keeping error handling consist with React TS version, 
 * which is the error handler provided by React context provide. It's the optimized
 * way of abstracting error handling.
 * 
 * @author ody
 *
 */
public interface ErrorCtx {

	public default String msg () { return ""; };

	public default void onError(MsgCode code, AnsonResp obj) {
		// throw new SemanticException(obj.msg());
	}

	public default void onError(MsgCode code, String msg, Object ...args) {
		// throw new SemanticException(msg, args);
	}

	public default ErrorCtx setSignal(String signal) { return this; };
	public default ErrorCtx notifySignal() { return this; };
}
