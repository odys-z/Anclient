package io.oz;

import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;

import androidx.preference.PreferenceManager;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.PrefKeys;
import io.oz.album.PrefsWrapper;
import io.oz.album.tier.AlbumResp;
import io.oz.albumtier.AlbumContext;

public class AlbumApp extends Application {

    public static PrefKeys keys;

    public static PrefsWrapper sharedPrefs = new PrefsWrapper();
    public static Context context;

    public AlbumApp() {
        super();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        context = getApplicationContext();
    }

    /**
     * Compound handling of login and settings updating.
     */
    public static void login(JProtocol.OnOk onOk, JProtocol.OnError onErr)
            throws GeneralSecurityException, IOException, SemanticException {
        AlbumContext clientext = AlbumContext.getInstance();
        clientext.pswd(sharedPrefs.pswd()).login((client) -> {
            if (context != null) {
                // load settings
                Anson.verbose = AlbumContext.verbose;
                clientext.tier.asyGetSettings(
                    (resp) -> {
                        clientext.profiles = ((AlbumResp) resp).profiles();
                        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(context);
                        sharedPrefs.policy2Prefs(sharedPref, clientext.profiles);

                        clientext.jserv(sharedPrefs.jserv());
                        if (onOk != null)
                            onOk.ok(resp);
                    },
                    onErr);
            }
            else if (AlbumContext.verbose)
                Utils.warn("####################\n[AlbumContext.verbose] Application logged in without updating settings.");
        }, onErr);
    }
}
