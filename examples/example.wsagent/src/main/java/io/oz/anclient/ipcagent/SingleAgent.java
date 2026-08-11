package io.oz.anclient.ipcagent;

import io.oz.anclient.app.DesktopSettings;

public class SingleAgent {
	public static final String ver = "0.2.0";
	
	static SingleAgent instance;
	
	public static SingleAgent getInstance() {
		if (instance == null)
			instance = new SingleAgent();
		return instance;
	}


	DesktopSettings settings;
	
	protected SingleAgent() { }

	SingleAgent settings(DesktopSettings settings) {
		this.settings = settings;
		return this;
	}

	public DesktopSettings settings() {
		return settings;
	}
	
//	public AnsonMsg<?> ver(AnsonMsg<?> msg) {
//		try { msg.version = ver;
//		} catch (Exception e) {}
//		return msg;
//	}
}
