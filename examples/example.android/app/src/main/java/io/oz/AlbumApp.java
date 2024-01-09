package io.oz;

import static io.odysz.common.LangExt.isNull;

import android.app.Application;
import android.content.SharedPreferences;

import io.oz.album.PrefKeys;

public class AlbumApp extends Application {

    public static PrefKeys keys;

    /**
     * Wrapper of shared preference, for wrapping unstructured data for business layer,
     * a data wrapper for avoid manage local preferences everywhere.
     */
    public static class Config {
        public String homeName;
        public String jserv;
        public String uid;
        public String device;
        public String homepage;
    }

    public static Config config = new Config();

    public AlbumApp() {
        super();
    }

    static public Config localConfig(SharedPreferences sharedPref, String... landingUrl) {
        config.homeName = sharedPref.getString(AlbumApp.keys.home, "");
        config.uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        config.device = sharedPref.getString(AlbumApp.keys.device, "");
        config.jserv = sharedPref.getString(AlbumApp.keys.jserv, "");
        if (!isNull(landingUrl))
            config.homepage = sharedPref.getString(AlbumApp.keys.homepage, landingUrl[0]);
        return config;
    }
}
