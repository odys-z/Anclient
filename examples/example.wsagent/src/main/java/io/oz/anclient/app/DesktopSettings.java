package io.oz.anclient.app;

import io.odysz.anson.AnsonField;
import io.odysz.jclient.AnclientSettings;

/**
 * desktop-settings.ast.json
 * <pre>
 * { "type": "io.odysz.reflect.AnsonAst",
 *    "dataAnclass": "io.oz.anclient.DesktopSettings",
 *    "baseAnclass": "io.odysz.anson.Anson",
 *    "fields" : {
 *       "sysuri": {"dataAnclass": "string"},
 *       "synuri": {"dataAnclass": "string"},
 *       "temp_dir"   : {"dataAnclass": "string"},
 *       "java_path"  : {"dataAnclass": "string"},
 *       "doctier_jar": {"dataAnclass": "string"},
 *       "wsagent_jar": {"dataAnclass": "string"},
 *       "synode_id"  : {"dataAnclass": "string"},
 *       "synode_vol" : {"dataAnclass": "string"},
 *       "syn_jserv"  : {"dataAnclass": "string"},
 *       "domain"     : {"dataAnclass": "string"},
 *       "admin"      : {"dataAnclass": "string"},
 *       "token"      : {"dataAnclass": "string"},
 *       "wsagent_settings": {"dataAnclass": "string"},
 *       "wshost": {"dataAnclass": "string"},
 *       "wsport": {"dataAnclass": "int"}
 *   },
 *   "ctorsemantics": [ ]
 * }</pre>
 */
public class DesktopSettings extends AnclientSettings {
	/** For reload each time re-login to a synode */
	@AnsonField(ignoreFrom=true)
	public String json_path;

	public String device;
	public String sysuri;
	public String synuri;
	public String java_path;
	public String doctier_jar;
	public String wsagent_jar;
	/** Of the local synode, not the targeting synode. */
	public String synode_id;
	public String synode_vol;
	public String synode_jserv;
	public String domain;
	public String admin;
	public String token;
	public String wshost;
	public int wsport;

	public int wstimeout;
	public String[] ipc_tiers;

	public DesktopSettings() {
		wstimeout = 60000;
	}
}
