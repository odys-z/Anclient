package io.oz.anclient.ipcagent;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;

public class IPCException extends AnsonException {

	private static final long serialVersionUID = 1L;
	
	MsgCode subcode;

	public IPCException(MsgCode code, String template, Object... args) {
		super(0, template, args);
		this.subcode = code;
	}

}
