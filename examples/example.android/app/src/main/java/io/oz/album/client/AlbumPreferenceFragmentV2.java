package io.oz.album.client;

import static io.oz.album.client.PrefsContentActivity.singleton;

import android.os.Bundle;
import android.text.InputType;
import android.widget.AutoCompleteTextView;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.preference.EditTextPreference;
import androidx.preference.Preference;
import androidx.preference.PreferenceCategory;
import androidx.preference.PreferenceFragmentCompat;
import androidx.preference.PreferenceManager;

import io.odysz.common.LangExt;
import io.odysz.semantics.SessionInf;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.albumtier.AlbumContext;

/**
 * <h4>Preference Fragment</h4>
 * <a href='https://stackoverflow.com/a/15612006/7362888'>
 * This class shouldn't have a constructor,</a> to prevent exception when restore state (turn over screen).
 */
public class AlbumPreferenceFragmentV2 extends PreferenceFragmentCompat {
    /**
     * Pref key: AlbumApp.keys.jserv
     */
    AutoCompleteTextView txtJserv;
    Preference btnTestConn;

    Preference btnLogin;
    Preference summery;
    Preference homepref;
    EditTextPreference device;
    Preference btnRegist;
    PreferenceCategory cateHome;

    EditTextPreference pswd;

    @Override
    public void onCreatePreferences(@Nullable Bundle savedInstanceState, @Nullable String rootKey) {
        addPreferencesFromResource(R.xml.prefv2);

        bindPref2Val(findPreference(AlbumApp.keys.jserv));

        bindPref2Val(findPreference(AlbumApp.keys.home));
        bindPref2Val(findPreference(AlbumApp.keys.device));
        bindPref2Val(findPreference(AlbumApp.keys.usrid));
        bindPref2Val(findPreference(AlbumApp.keys.pswd));

        cateHome  = findPreference(AlbumApp.keys.homeCate);
        btnRegist = findPreference(AlbumApp.keys.bt_regist);
        btnLogin  = findPreference(AlbumApp.keys.bt_login);
        device    = findPreference(AlbumApp.keys.device);
        pswd      = findPreference(AlbumApp.keys.pswd);

        pswd.setSummary("");
        pswd.setOnBindEditTextListener(editText ->
                editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD));

        homepref = findPreference(AlbumApp.keys.home);
        String devid = singleton.photoUser.device;
        if (!LangExt.isblank(devid)) {
            homepref.setSummary(AlbumContext.getInstance(null).profiles.home);
            findPreference(AlbumApp.keys.device).setEnabled(false);
            cateHome.removePreference(btnRegist);
            device.setSummary(getString(R.string.device_name, devid));
        }
        else {
            findPreference(AlbumApp.keys.device).setEnabled(true);
            device.setSummary(R.string.msg_only_once);

            btnLogin.setEnabled(false);
        }
        summery = findPreference(AlbumApp.keys.login_summery);
    }

    static void bindPref2Val(@NonNull Preference preference) {
        if (preference == null)
            return;
        preference.setOnPreferenceChangeListener(prefsListener);

        prefsListener.onPreferenceChange(preference,
                PreferenceManager
                        .getDefaultSharedPreferences(preference.getContext())
                        .getString(preference.getKey(), ""));
    }

    /**
     * A preference value change listener that updates the preference's summary
     * to reflect its new value.
     */
    private static final Preference.OnPreferenceChangeListener prefsListener =
        (preference, newValue) -> {
            String stringValue = newValue.toString();
            String k = preference.getKey();
            if (k.equals(AlbumApp.keys.jserv)) {
                singleton.jserv(stringValue);
                preference.setSummary(stringValue);
            }
            else if (AlbumApp.keys.pswd.equals(k)) {
                singleton.pswd(stringValue);
                preference.setSummary("");
            }
            else if (AlbumApp.keys.usrid.equals(k)) {
                String device = singleton.photoUser.device;
                singleton.photoUser = new SessionInf(singleton.photoUser.ssid(), stringValue);
                singleton.photoUser.device = device;
                preference.setSummary(stringValue);
            }
            else if (AlbumApp.keys.device.equals(k)) {
                singleton.photoUser.device = stringValue;
                preference.setSummary(stringValue);
            }
            else if (AlbumApp.keys.home.equals(k)) {
                singleton.profiles.home(stringValue);
                preference.setSummary(stringValue);
            }
            return true;
        };
}
