package io.oz;

import static io.odysz.common.LangExt.isNull;

import android.app.Application;
import android.content.SharedPreferences;

import io.oz.album.PrefKeys;
import io.oz.album.PrefsWrapper;

public class AlbumApp extends Application {

    public static PrefKeys keys;

    public static PrefsWrapper config = new PrefsWrapper();

    public AlbumApp() {
        super();
    }

    static public PrefsWrapper localConfig(SharedPreferences sharedPref, String... landingUrl) {
        config.homeName = sharedPref.getString(AlbumApp.keys.home, "");
        config.uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        config.device = sharedPref.getString(AlbumApp.keys.device, "");
        config.jserv = sharedPref.getString(AlbumApp.keys.jserv, "");
        if (!isNull(landingUrl))
            config.homepage = sharedPref.getString(AlbumApp.keys.homepage, landingUrl[0]);
        return config;
    }
}
