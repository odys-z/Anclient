package io.oz;

import android.app.Application;
import android.content.res.Resources;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.oz.album.AlbumPort;
import io.oz.album.client.AlbumContext;

public class AlbumApp extends Application {
    public static AlbumContext singl = new AlbumContext();

    public static class keys {
        public static String homeCate;
        public static String home;
        public static String device;
        public static String jserv;
        public static String usrid;
        public static String pswd;

        public static String login_summery;
        public static String bt_regist;
    }
    public AlbumApp() {
        super();
        AnsonMsg.understandPorts(AlbumPort.album);


    }
}
