package io.oz.album;

import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.isblank;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;

import androidx.preference.ListPreference;

import java.io.IOException;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonField;
import io.odysz.anson.AnsonException;
import io.odysz.common.LangExt;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.oz.R;
import io.oz.album.client.AnPrefEntries;
import io.oz.album.peer.Profiles;
import io.oz.albumtier.AlbumContext;

/**
 * Wrapper of shared preference, for wrapping unstructured data for business layer,
 * a data wrapper for avoid manage local preferences everywhere.
 * <h5>Small Argument</h5>
 * <p>Unstructured data, e. g. local configurations like {@link SharedPreferences} can be quick shift
 * into a way of violating OOP principals of encapsulation, by accessing a data copy everywhere.</p>
 * @since 0.3.0
 * @since 0.4.0 this data also manages uploading file's template, e.g. share-flag and folder.
 *
 * Data type for saving preferences in Android. See
 * <a href='https://odys-z.github.io/docsync/issues.html#android-preferenceedit-saves-violate-oop-encapsulation-principle'>
 *     the issue with PreferenceEdit</a>.
 * <p>Do not confused with {@link io.oz.album.peer.Profiles}.</p>
 */
public class PrefsWrapper extends Anson {
    public String homeName;

    /** Anson string for load and save {@link SharedPreferences} */
    public AnPrefEntries jservlist;
    public String uid;
    public String device;
    public String devname;
    public String albumroot;
    public String pswd;

    /** key to persist preference */
    private static final String json_k = "json";

    private String landingUrl;


    /**
     * Options' template for an uploading doc's, such as share-flags, etc.
     */
//    @AnsonField(ignoreFrom = true, ignoreTo = true)
    ExpSyncDoc currentTemplate;

    static public PrefsWrapper loadPrefs(Context ctx, SharedPreferences sharedPref, String... landingUrl) {

        PrefsWrapper config = null;
        try {
            config = (PrefsWrapper) Anson.fromJson(sharedPref.getString(json_k,
                    "{\"type\":\"io.oz.album.PrefsWrapper\"}"));
            config.sharedpref = sharedPref;

            if (config.jservlist == null) {
                Resources r = ctx.getResources();
                config.jservlist = new AnPrefEntries(
                                r.getStringArray(R.array.jserv_entries),
                                r.getStringArray(R.array.jserv_entvals));
            }
        } catch (AnsonException e) {
            Resources r = ctx.getResources();
            config = new PrefsWrapper(sharedPref);
            config.jservlist = new AnPrefEntries(
                    r.getStringArray(R.array.jserv_entries),
                    r.getStringArray(R.array.jserv_entvals));
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (isblank(config.albumroot) && !isNull(landingUrl))
            config.albumroot = landingUrl[0];

        else
            config.albumroot = ctx.getResources().getString(R.string.url_landing);

        return config;
    }

    public void policy2Prefs(SharedPreferences sharedPref, Profiles profiles) {
        albumroot  = profiles.webnode;
        landingUrl = profiles.home;

        persist();
    }

    /**
     * Write jservs list through shared preferences.
     *
     * @param anlist
     * @return this
     */
    public PrefsWrapper jservs(AnPrefEntries anlist) {
        this.jservlist = anlist;
        return this;
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
        return pswd == null ? "" : pswd;
    }

    public PrefsWrapper device(AlbumContext singleton) {
        device = singleton.device.id;
        devname = singleton.device.devname;
        return this;
    }

    public boolean needSetup() {
        return LangExt.isblank(jserv(), "/", ".", "http://", "https://", "https?://localhost");
    }

    public PrefsWrapper selectDefaultJserv(ListPreference listJserv) {
        if (jservlist.ix < 0) {
            jservlist.ix = 0;
        }

        AlbumContext.initWithErrorCtx(null).jserv(jservlist.select(jservlist.ix));

        listJserv.setValueIndex(jservlist.ix);
        listJserv.setTitle(jservlist.entry());
        listJserv.setSummary(jservlist.entryVal());
        return this;
    }

    public ExpSyncDoc template() {
        return currentTemplate;
    }

    @AnsonField(ignoreTo = true, ignoreFrom = true)
    SharedPreferences sharedpref;


    /** For Anson deserialization, don't delete */
    public PrefsWrapper() { }

    public PrefsWrapper(SharedPreferences sharedPref) {
        this.sharedpref = sharedPref;
    }

    public PrefsWrapper persist() {
        if (sharedpref != null) {
            SharedPreferences.Editor editor = sharedpref.edit();
            try {
                editor.putString(json_k, toBlock());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            editor.apply();
        }
        return this;
    }
}
