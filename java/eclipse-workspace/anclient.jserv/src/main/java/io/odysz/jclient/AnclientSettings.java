package io.odysz.jclient;

import io.odysz.anson.Anson;

/**
 * <pre>
 * { "type": "io.odysz.reflect.AnsonAst",
	  "dataAnclass": "io.odysz.jclient.AnclientSettings",
	  "baseAnclass": "io.odysz.anson.Anson",
	  "fields" : {
		"market_id"  : {"dataAnclass": "string"},
		"market_name": {"dataAnclass": "string"},
		"sysuri": {"dataAnclass": "string"},
		"synuri": {"dataAnclass": "string"},
		"jserv" : {"dataAnclass": "string"},
		"org"   : {"dataAnclass": "string"},
		"domain": {"dataAnclass": "string"},
		"device": {"dataAnclass": "string"},
		"admin" : {"dataAnclass": "string"},
		"domain_token" : {"dataAnclass": "string"},
		"regiserv"     : {"dataAnclass": "string"},
		"centralPswd"  : {"dataAnclass": "string"},
		"temp_dir"     : {"dataAnclass": "string"}
	  },
	  "ctorsemantics": [
		{ "base": {} }
	  ]
	}
 * </pre>
 */
public class AnclientSettings extends Anson {
	/**
	 * Not used in docsync.jserv and album.jserv, but can
	 * not ignored since the fields is need here by synode.py3 0.8.0.
	 */
	public String market_id;

	/**
	 * Not used in docsync.jserv and album.jserv, but can
	 * not ignored since the fields is need here by synode.py3 0.8.0.
	 */
	public String market_name;

    public String sysuri;
    public String synuri;
    public String jserv;
    public String jprotocolpath;
    /** @deprecated */
    public boolean readonly_test;
    public String domain;
    public String admin;
    public String domain_token;
    public String regiserv;
    public String regiprotopath;
    public String centralPswd;
    
    public AnclientSettings(String jprotocol_rootpath) {
    	jprotocolpath = jprotocol_rootpath;
    }

    public AnclientSettings() {
    	this(null);
    }
}
