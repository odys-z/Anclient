package io.odysz.jclient;

import io.odysz.anson.Anson;

public class AnclientSettings extends Anson {
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
