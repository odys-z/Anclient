package io.oz.album;

import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;
import static io.oz.AlbumApp.context;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;

import androidx.preference.ListPreference;
import androidx.preference.PreferenceManager;

import java.io.IOException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.LangExt;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.AnPrefEntries;
import io.oz.album.tier.Profiles;
import io.oz.albumtier.AlbumContext;

/**
 * Wrapper of shared preference, for wrapping unstructured data for business layer,
 * a data wrapper for avoid manage local preferences everywhere.
 * <h5>Small Argument</h5>
 * <p>Unstructured data, e. g. local configurations like {@link SharedPreferences} can be quick shift
 * int a way of violating OOP principals of encapsulation, by accessing a data copy everywhere.</p>
 * @since 0.3.0
 */
public class PrefsWrapper {
    public String homeName;

    /** Anson string for load and save {@link SharedPreferences} */
    public AnPrefEntries jservlist;
    public String uid;
    public String device;
    public String albumroot;
    private String pswd;

    private String landingUrl;

    static public PrefsWrapper loadPrefs(Context ctx, SharedPreferences sharedPref, String... landingUrl) {
        PrefsWrapper config = new PrefsWrapper();
        config.homeName = sharedPref.getString(AlbumApp.keys.home, "");
        config.uid      = sharedPref.getString(AlbumApp.keys.usrid, "");
        config.pswd     = sharedPref.getString(AlbumApp.keys.pswd, "");
        config.device   = sharedPref.getString(AlbumApp.keys.device, "");

        try{
            String jservs = sharedPref.getString(AlbumApp.keys.jserv, "");
            if (!isblank(jservs))
                config.jservlist = (AnPrefEntries) Anson.fromJson(jservs);
            else {
                Resources r = ctx.getResources();
                config.jservlist = new AnPrefEntries(
                        r.getStringArray(R.array.jserv_entries),
                        r.getStringArray(R.array.jserv_entvals));
            }
        } catch (AnsonException e) {
            Resources r = ctx.getResources();
            config.jservlist = new AnPrefEntries(
                    r.getStringArray(R.array.jserv_entries),
                    r.getStringArray(R.array.jserv_entvals));
        } catch (Exception e) {
            e.printStackTrace();
            // TODO wring string from preference and no message to user?
        }

        if (isblank(config.albumroot) && !isNull(landingUrl))
            config.albumroot = sharedPref.getString(AlbumApp.keys.homepage, landingUrl[0]);
        else
            config.albumroot = ctx.getResources().getString(R.string.url_landing);

        return config;
    }

    public void policy2Prefs(SharedPreferences sharedPref, Profiles profiles) {
        albumroot  = profiles.webroot;
        landingUrl = profiles.home;

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(AlbumApp.keys.home, profiles.home);
        editor.putString(AlbumApp.keys.homepage, profiles.webroot);
        editor.apply();
    }

    /**
     * Write jservs list through shared preferences.
     *
     * @param anlist
     * @return this
     */
    public PrefsWrapper jservs(AnPrefEntries anlist) {
        this.jservlist = anlist;
        try {
            SharedPreferences pref = PreferenceManager.getDefaultSharedPreferences(AlbumApp.context);
            SharedPreferences.Editor editor = pref.edit();
            editor.putString(AlbumApp.keys.jserv, anlist.toBlock());
            editor.apply();
            // singleton.jserv(jservlist.entryVal());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return this;
    }

    /**
     * Read jservs list, if null, load from shared preference.
     * @param sharepref
     * @return jservs' list
     */
    public AnPrefEntries jservs(SharedPreferences sharepref) {
        String jservs = sharepref.getString(AlbumApp.keys.jserv, "");
        if (isNull(jservlist) && !isblank(jservs))
            jservlist = (AnPrefEntries) Anson.fromJson(jservs);
        return this.jservlist;
    }

    public AnPrefEntries jservs() {
        return this.jservlist;
    }

    /**
     * Get jservs[index = 0]
     * @return jserv
     */
    public String jserv(int ... index) {
        if (isNull(jservlist)) return "";
        if (isNull(index))
            return jservlist.ix < 0 ? jservlist.entVals[0] : jservlist.entVals[jservlist.ix];
        else
            return jservlist.entVals[index[0]];
    }

    public String pswd() {
        return pswd;
    }

    public PrefsWrapper device(SharedPreferences pref, String dev) {
        SharedPreferences.Editor editor = pref.edit();
        editor.putString(AlbumApp.keys.device, dev);
        editor.apply();
        return this;
    }

    public boolean needSetup() {
        return LangExt.isblank(jserv(), "/", ".", "http://", "https://", "https?://localhost");
    }

    public PrefsWrapper selectDefaultJserv(ListPreference listJserv) {
        if (jservlist.ix < 0) {
            jservlist.ix = 0;
        }

        jservlist.select(AlbumContext.getInstance(), jservlist.ix);
        listJserv.setValueIndex(jservlist.ix);
        listJserv.setTitle(jservlist.entry());
        listJserv.setSummary(jservlist.entryVal());
        return this;
    }
}
