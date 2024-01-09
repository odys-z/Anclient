package io.oz.album;

import static java.security.AccessController.getContext;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import io.oz.AlbumApp;
import io.oz.R;

/**
 * Assets downloader.
 */
public class AssetHelper {

    public static final String albumHome = "index.html";
    public static final String adminHome = "admin.html";
    public static final String synchPage = "sync.html";

    // static String jserv;

    /**
     * Inited by {@link #init(Context, String, String)}.
     */
    // static String homeroot;
//    Context ctx;

    /** Act: show help page */
    public static final int Act_Help = 1;
    /** Act: show landing page */
    public static final int Act_Landing = 2;
    /** Act: show album home page */
    public static final int Act_Album = 3;
    /** Act: show synchronizing report - not v 0.2.xx */
    public static final int Act_SyncReport = 4;
    /** Act: show admin page */
    public static final int Act_Admin = 5;

//    /**
//     * Init {@link #jserv}
//     *
//     * @param context
//     * @param jservroot
//     */
//    public static void init(Context context, String jservroot) {
//        jserv = jservroot;
//    }

//    public static void webroot(String url) {
//        AlbumApp.config.homepage = url;
//    }


    /**
     * Get web page url.
     * @param ctx
     * @param intent
     * @return intent: return =<br>
     * {@link #Act_Album}: {@link #homepage},<br>
     * {@link #Act_Admin}: {@link #adminHome}
     */
    public static String url4intent(Context ctx, int intent) {
        switch (intent) {
            case Act_Album:
                return ctx.getString(R.string.url_album, AlbumApp.config.homepage, albumHome);
            case Act_Admin:
                return ctx.getString(R.string.url_admin, AlbumApp.config.homepage, adminHome);
            case Act_SyncReport:
                return ctx.getString(R.string.url_sync_report, AlbumApp.config.jserv, synchPage);
            case Act_Help:
                return ctx.getString(R.string.url_help);
            case Act_Landing:
            default:
                return ctx.getString(R.string.url_landing);
        }
    }
}
