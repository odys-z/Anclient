package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt.f;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonField;
import io.odysz.semantics.SessionInf;

public class TestSettings extends Anson {

	@AnsonField(ignoreFrom=true)
	String agent_jar;

	String agent_json;

	String qtclient;

	int ipc_port;

	SessionInf ipc_session;

	public String wsUri() {
		return f("ws://127.0.0.1:%d/%s", ipc_port, WSAgent.ipc_path);
	}
}
