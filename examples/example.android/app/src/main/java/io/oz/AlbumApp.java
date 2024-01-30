package io.oz;

import android.app.Application;

import io.oz.album.PrefKeys;
import io.oz.album.PrefsWrapper;

public class AlbumApp extends Application {

    public static PrefKeys keys;

    public static PrefsWrapper sharedPrefs = new PrefsWrapper();

    public AlbumApp() {
        super();
    }


}
