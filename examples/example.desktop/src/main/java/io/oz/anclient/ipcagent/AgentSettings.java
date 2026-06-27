package io.oz.anclient.ipcagent;

import io.odysz.jsample.SampleSettings;

public class AgentSettings extends SampleSettings {
	String[] whitelist;
	public int wsport;
	public int wstimeout;
	public String[] tiers;

	public AgentSettings() {
		wstimeout = 60000;
	}
	
	public static AgentSettings check(String srcwebinf, String string) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * Get the jserv to the target (current?) synode.
	 * @return jserv
	 */
	public String synodeJserv() {
		return null;
	}

}
