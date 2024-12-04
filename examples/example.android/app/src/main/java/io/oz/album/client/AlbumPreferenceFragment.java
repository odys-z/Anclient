package io.oz.album.client;

import static io.odysz.common.LangExt.eq;
import static io.oz.album.client.PrefsContentActivity.buff_device;
import static io.oz.album.client.PrefsContentActivity.buff_devname;
import static io.oz.album.client.PrefsContentActivity.singleton;

import android.os.Bundle;
import android.text.InputType;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.EditTextPreference;
import androidx.preference.ListPreference;
import androidx.preference.Preference;
import androidx.preference.PreferenceCategory;
import androidx.preference.PreferenceFragmentCompat;

import io.odysz.common.LangExt;
import io.odysz.semantics.SessionInf;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.fpick.activity.ComfirmDlg;

/**
 * <h4>Preference Fragment</h4>
 * <a href='https://stackoverflow.com/a/15612006/7362888'>
 * This class shouldn't have a constructor,</a> to prevent exception when restore state (turn over screen).
 */
public class AlbumPreferenceFragment extends PreferenceFragmentCompat {
    /**
     * Pref key: AlbumApp.keys.jserv
     */
    ListPreference listJserv;
    Preference btnLogin;
    EditTextPreference device;
    /** Preference category: device info */
    PreferenceCategory prefcateDev;
    Preference btnRegistDev;
    EditTextPreference pswd;

    EditTextPreference userid;
    /** Suppress dialog, etc. */
    boolean initing;
    @Override
    public void onCreatePreferences(@Nullable Bundle savedInstanceState, @Nullable String rootKey) {
        initing = true;
        addPreferencesFromResource(R.xml.prefv);

        prefcateDev  = findPreference(AlbumApp.keys.devCate);
        btnRegistDev = findPreference(AlbumApp.keys.bt_regist);
        btnLogin     = findPreference(AlbumApp.keys.bt_login);
        listJserv    = findPreference(AlbumApp.keys.jserv);
        device       = findPreference(AlbumApp.keys.device);
        pswd         = findPreference(AlbumApp.keys.pswd);
        userid       = findPreference(AlbumApp.keys.usrid);

        // bindPref2Val(listJserv);
        listJserv.setEntries(AlbumApp.sharedPrefs.jservlist.entries);
        listJserv.setEntryValues(AlbumApp.sharedPrefs.jservlist.entVals);
        AlbumApp.sharedPrefs.selectDefaultJserv(listJserv);
        listJserv.setOnPreferenceChangeListener(prefsListener);
//        PrefsWrapper sharedPrefs = PrefsWrapper
//                .loadPrefs(getContext(), this.getPreferenceManager().getSharedPreferences(), getString(R.string.url_landing));

//        if (listJserv.getTitle() == null) {
//            listJserv.setTitle(AlbumApp.sharedPrefs.jservlist.entry());
//            listJserv.setSummary(AlbumApp.sharedPrefs.jservlist.entryVal());
//        }

        /*
        AnPrefEntries jservlist = AlbumApp.sharedPrefs
                .loadPrefs(getContext(), this.getPreferenceManager().getSharedPreferences(), getString(R.string.url_landing))
                .jservlist;
        if (jservlist.ix < 0) {
            jservlist.ix = 0;
        }
        jservlist.select(singleton, jservlist.ix);
        ((ListPreference)listJserv).setValueIndex(jservlist.ix);
        listJserv.setTitle(jservlist.entry());
        listJserv.setSummary(jservlist.entryVal());
         */

        // bindPref2Val(device);
        device.setOnPreferenceChangeListener(prefsListener);
        prefsListener.onPreferenceChange(device, AlbumApp.sharedPrefs.device);

        // bindPref2Val(findPreference(AlbumApp.keys.usrid));
        userid.setOnPreferenceChangeListener(prefsListener);
        prefsListener.onPreferenceChange(userid, AlbumApp.sharedPrefs.uid);

        // bindPref2Val(pswd);
        pswd.setOnPreferenceChangeListener(prefsListener);
        prefsListener.onPreferenceChange(pswd, AlbumApp.sharedPrefs.pswd());

        pswd.setSummary("");
        pswd.setOnBindEditTextListener(editText ->
                editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD));

        String devid = singleton.userInf.device;
        if (!LangExt.isblank(devid)) {
            findPreference(AlbumApp.keys.device).setEnabled(false);
            findPreference(AlbumApp.keys.restoreDev).setEnabled(false);
            prefcateDev.removePreference(findPreference(AlbumApp.keys.restoreDev));
            prefcateDev.removePreference(btnRegistDev);
            device.setSummary(getString(R.string.device_name, devid));
        }
        else {
            findPreference(AlbumApp.keys.device).setEnabled(true);
            device.setSummary(R.string.msg_only_once);
        }
        initing = false;
    }

    /**
     * A preference value change listener that updates the preference's summary
     * to reflect its new value.
     */
    private final Preference.OnPreferenceChangeListener prefsListener =
        (preference, newValue) -> {
            String stringValue = newValue.toString();
            String k = preference.getKey();
            if (k.equals(AlbumApp.keys.jserv)) {
                AnPrefEntries jservlist = AlbumApp.sharedPrefs.jservlist;
                jservlist.select(singleton, stringValue);
                preference.setTitle(jservlist.entry());
                preference.setSummary(jservlist.entryVal());
            }
            else if (AlbumApp.keys.pswd.equals(k)) {
                singleton.pswd(stringValue);
                preference.setSummary("");
            }
            else if (AlbumApp.keys.usrid.equals(k)) {
                String device = singleton.userInf.device;
                singleton.userInf = new SessionInf(singleton.userInf.ssid(), stringValue).device(device);
                preference.setSummary(stringValue);
            }
            else if (AlbumApp.keys.device.equals(k)) {
                if (eq(stringValue, buff_devname) && !initing) {
                    new ComfirmDlg(null)
                        .dlgMsg(0, 0)
                        .msg(getString(R.string.msg_repace_devname, buff_devname, buff_device))
                        .onOk((dialog, id) -> {
                            dialog.dismiss();
                            // replace old name with new Id
                            buff_device  = null;
                        })
                        .showDlg(getActivity(), "FIXME")
                        .live(3000);
                }
                else {
                    buff_devname = stringValue;
                    buff_device  = null;
                }

                preference.setTitle(buff_device == null ?
                    stringValue : String.format("%s [%s]", stringValue, buff_device));
            }
            else if (AlbumApp.keys.home.equals(k)) {
                singleton.profiles.home(stringValue);
                preference.setSummary(stringValue);
            }
            return true;
        };
}
