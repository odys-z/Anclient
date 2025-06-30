package io.oz.album.client;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.strof;
import static io.odysz.common.LangExt.isblank;
import static io.oz.AlbumApp.prfConfig;
import static io.oz.album.client.PrefsContentActivity.buff_device;
import static io.oz.album.client.PrefsContentActivity.buff_devname;
import static io.oz.album.client.PrefsContentActivity.singleton;

import android.os.Bundle;
import android.text.InputType;

import androidx.annotation.Nullable;
import androidx.preference.EditTextPreference;
import androidx.preference.ListPreference;
import androidx.preference.Preference;
import androidx.preference.PreferenceCategory;
import androidx.preference.PreferenceFragmentCompat;

import io.odysz.semantics.SessionInf;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.PrefsWrapper;
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
    Preference btnRestoreDev;
    EditTextPreference pswd;

    EditTextPreference userid;
    /** Suppress dialog, etc. */
    boolean initing;
    @Override
    public void onCreatePreferences(@Nullable Bundle savedInstanceState, @Nullable String rootKey) {
        initing = true;
        addPreferencesFromResource(R.xml.prefv);

        prefcateDev  = findpref(R.string.key_dev_cate);
        btnRegistDev = findpref(R.string.key_regist);
        btnRestoreDev= findpref(R.string.key_dev_restore);
        btnLogin     = findpref(R.string.btn_login);
        listJserv    = findpref(R.string.jserv_key);
        device       = findpref(R.string.key_device);
        pswd         = findpref(R.string.pswd_key);
        userid       = findpref(R.string.userid_key);

        // bindPref2Val(listJserv);
        listJserv.setEntries(AlbumApp.prfConfig.jservlist.entries);
        listJserv.setEntryValues(AlbumApp.prfConfig.jservlist.entVals);
        AlbumApp.prfConfig.selectDefaultJserv(listJserv);
        listJserv.setOnPreferenceChangeListener(prefsListener);

        // bindPref2Val(device);
        device.setOnPreferenceChangeListener(prefsListener);
        prefsListener.onPreferenceChange(device, AlbumApp.prfConfig.device);

        userid.setText(AlbumApp.prfConfig.uid);
        userid.setSummary(AlbumApp.prfConfig.uid);
        userid.setOnPreferenceChangeListener((p, v) -> {
            String str = v == null ? "" : v.toString();
            prfConfig.uid = str;
            singleton.userInf.uid(str);
            String device = singleton.userInf.device;
            singleton.userInf = new SessionInf(singleton.userInf.ssid(), str).device(device);
            p.setSummary(str);
            return true;
        });

        pswd.setText(AlbumApp.prfConfig.pswd());
        pswd.setSummary(AlbumApp.prfConfig.pswd().replaceAll(".", "*"));
        pswd.setOnPreferenceChangeListener((p, v) -> {
                String str = v == null ? "" : v.toString();
                prfConfig.pswd = str;
                singleton.pswd(str);
                p.setSummary(strof(str, "*"));
                return true;
        });

        pswd.setOnBindEditTextListener(editText ->
                editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD));

        String devid = singleton.userInf.device;
        String devname = singleton.device.devname;
        if (!isblank(devid)) {
            btnRegistDev.setEnabled(false);
            btnRestoreDev.setVisible(false);
            prefcateDev.removePreference(btnRegistDev);
            device.setSummary(getString(R.string.device_name, f("%s [%s]", devname, devid)));
        }
        else {
            ((Preference)findpref(R.string.key_device)).setEnabled(true);
            device.setSummary(R.string.msg_only_once);
        }
        initing = false;
    }

    <T> T findpref(int pid) { return (T)findPreference(getString(pid)); }

    /**
     * Is eq(getString(strk), k)?
     * @param strk
     * @param k
     * @return
     */
    boolean eqk(int strk, String k) { return eq(getString(strk), k); }

    /**
     * A preference value change listener that updates the preference's summary
     * to reflect its new value.
     */
    private final Preference.OnPreferenceChangeListener prefsListener =
        (preference, newValue) -> {
            String stringValue = newValue == null ? "" : newValue.toString();
            String k = preference.getKey();
            if (eqk(R.string.jserv_key, k)) {
                AnPrefEntries jservlist = AlbumApp.prfConfig.jservlist;
                jservlist.select(stringValue);
                preference.setTitle(jservlist.entry());
                preference.setSummary(jservlist.entryVal());

                singleton.jserv(stringValue);
            }
            else if (eqk(R.string.key_device, k)) {
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
            else if (eqk(R.string.key_home, k)) {
                singleton.profiles.home(stringValue);
                preference.setSummary(stringValue);
            }
            return true;
        };
}
