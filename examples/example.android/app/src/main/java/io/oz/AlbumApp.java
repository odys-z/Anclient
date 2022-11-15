package io.oz;

import android.app.Application;

import io.oz.album.PrefKeys;
import io.oz.albumtier.AlbumContext;

public class AlbumApp extends Application {
    public static AlbumContext singl = AlbumContext.getInstance();

    public static PrefKeys keys;

    public AlbumApp() {
        super();
    }
}
