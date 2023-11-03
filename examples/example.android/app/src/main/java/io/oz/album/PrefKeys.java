package io.oz.album;

/**
 * The contract between string.xml items and app constants.
 *
 * <h3>How is it working</h3>
 * 1. App main Activity load Prefkeys' members from string.xml;<br>
 * 2. AlbumContext, the singlton, use these keys to receive values from persisted preference.
 * <h3>Details</h3>
 * In android, it's said it's wrong to use constants of code in resource.
 * <p>Prefkeys is used as a bridge for finding preferences with a string constant as the key.
 * This string value is configured in string.xml, for preference's layout key.</p>
 * <p>However, Albumtier is independent of package resource, but needing persisted value from
 * shared preferences. Those preference key can only be provided from package resource.</p>
 *
 */
public class PrefKeys {
    public String homeCate;
    public String home;
    public String jserv;
    public String homepage;
    public String device;
    public String devCate;
    public String restoreDev;
    public String usrid;
    public String pswd;

    public String login_summery;

    /** button key in prefs screen for registering device */
    public String bt_regist;
    public String bt_login;
}
