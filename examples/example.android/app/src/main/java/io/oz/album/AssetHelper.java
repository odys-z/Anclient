package io.oz.album;

import android.content.Context;

import io.oz.R;

/**
 * Assets downloader.
 */
public class AssetHelper {

    public static final String albumHome = "dist/index.html";
    public static final String synchPage = "dist/sync.html";

    static String jserv;
    static Context ctx;

    /** Act: show help page */
    public static final int Act_Help = 1;
    /** Act: show landing page */
    public static final int Act_Landing = 2;
    /** Act: show album home page */
    public static final int Act_Album = 3;
    /** Act: show synchronizing report */
    public static final int Act_SyncReport = 4;

    public static void init(Context context, String jservroot) {
        jserv = jservroot;
        ctx = context;
    }

    public static String loadUrls(int intent) {
        switch (intent) {
            case Act_Album:
                return ctx.getString(R.string.url_album, jserv, albumHome);
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
