package io.oz;

import android.app.Application;

import io.oz.albumtier.AlbumContext;
import io.oz.albumtier.PrefKeys;

public class AlbumApp extends Application {
    public static AlbumContext singl = AlbumContext.getInstance();

    public static PrefKeys keys;

    public AlbumApp() {
        super();
    }
}
