package io.oz.album;

import android.content.Context;

import io.oz.AlbumApp;
import io.oz.R;

public class AssetHelper {

    public static final String albumHome = "webview.html";
    public static final String adminHome = "admin.html";
    public static final String synchPage = "sync.html";

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
    public static final int Act_HelpDevice = 6;

    /**
     * Get web page url.
     * @param ctx
     * @param intent
     * @return intent: return =<br>
     * {@link #Act_Album}: {@link #albumHome},<br>
     * {@link #Act_Admin}: {@link #adminHome}, ...
     */
    public static String url4intent(Context ctx, int intent) {
        switch (intent) {
            case Act_Album:
                return ctx.getString(R.string.url_album, AlbumApp.prfConfig.albumroot, albumHome);
            case Act_Admin:
                return ctx.getString(R.string.url_admin, AlbumApp.prfConfig.albumroot, adminHome);
            case Act_SyncReport:
                return ctx.getString(R.string.url_sync_report, AlbumApp.prfConfig.jserv(0), synchPage);
            case Act_Help:
                return ctx.getString(R.string.url_help);
            case Act_HelpDevice:
                return ctx.getString(R.string.url_help_devid);
            case Act_Landing:
            default:
                return ctx.getString(R.string.url_landing);
        }
    }
}
