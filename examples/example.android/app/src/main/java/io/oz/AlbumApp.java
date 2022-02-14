package io.oz;

import android.app.Application;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.oz.album.AlbumPort;
import io.oz.album.client.AlbumContext;

public class AlbumApp extends Application {
    public static AlbumContext singl = new AlbumContext();

    public AlbumApp() {
        super();
        AnsonMsg.understandPorts(AlbumPort.album);
    }
}
