package io.oz.album;

import static java.security.AccessController.getContext;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import io.oz.R;

/**
 * Assets downloader.
 */
public class AssetHelper {

    public static final String albumHome = "index.html";
    public static final String synchPage = "sync.html";

    static String jserv;
    static String homeroot;
//    Context ctx;

    /** Act: show help page */
    public static final int Act_Help = 1;
    /** Act: show landing page */
    public static final int Act_Landing = 2;
    /** Act: show album home page */
    public static final int Act_Album = 3;
    /** Act: show synchronizing report - not v 0.2.xx */
    public static final int Act_SyncReport = 4;

    public static void init(Context context, String jservroot, String webroot) {
        jserv = jservroot;
        homeroot = webroot;
    }

    public static String url4intent(Context ctx, int intent) {
        switch (intent) {
            case Act_Album:
                return ctx.getString(R.string.url_album, homeroot, albumHome);
            case Act_SyncReport:
                return ctx.getString(R.string.url_sync_report, jserv, synchPage);
            case Act_Help:
                return ctx.getString(R.string.url_help);
            case Act_Landing:
            default:
                return ctx.getString(R.string.url_landing);
        }
    }
}
