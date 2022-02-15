package io.oz.album.client;

import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.preference.EditTextPreference;
import androidx.preference.PreferenceFragmentCompat;
import androidx.preference.Preference;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceCategory;
import androidx.preference.PreferenceManager;

import io.odysz.common.LangExt;
import io.oz.AlbumApp;
import io.oz.R;

/**
 */
public class PrefsContentActivity extends AppCompatActivity {

    static AlbumContext singleton;

    static String oldUid;
    private MainPreferenceFragment prefFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (singleton == null) {
            singleton = AlbumApp.singl;
            oldUid = null;
        }
        else oldUid = singleton.photoUser.uid;

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        // load settings fragment
        prefFragment = new MainPreferenceFragment();
        getSupportFragmentManager().beginTransaction().replace(android.R.id.content, prefFragment).commit();
    }

    public void onLogin(View btn) {
        try {
            singleton.login((tier) -> {
                singleton.tier = tier;
                updateSummery(prefFragment.summery, getString(R.string.login_succeed));
                updateSummery(prefFragment.homepref, getString(R.string.devide_name, singleton.photoUser.device));
            },
            (c, t, args) -> {
                updateSummery(prefFragment.summery, String.format(t,
                            args == null ? new String[]{"", ""} : args));
            });
        } catch (Exception e) {
            Log.e(singleton.clientUri, e.getClass().getName() + e.getMessage());
            updateSummery(prefFragment.summery, "Login failed!\nDetails: " + e.getMessage());
        }
    }

    public void onRegisterDevice(View btn) {
        if (prefFragment.btnRegist != null) {
            prefFragment.cateHome.removePreference(prefFragment.btnRegist);
        }
        prefFragment.device.setEnabled(false);
    }

    /**
     * Set text into EditText's summery, running in ui thread.
     * @param of of which summery to be updated
     * @param s summery text
     */
    void updateSummery(Preference of, String s) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() { of.setSummary(s); }
        } );
    }

    public static class MainPreferenceFragment extends PreferenceFragmentCompat {
        Preference summery;
        Preference homepref;
        EditTextPreference device;
        Preference btnRegist;
        PreferenceCategory cateHome;

        @Override
//        public void onCreate(final Bundle savedInstanceState) {
        public void onCreatePreferences(@Nullable Bundle savedInstanceState, @Nullable String rootKey) {
            // super.onCreatePreferences(savedInstanceState, rootKey);
            addPreferencesFromResource(R.xml.pref);

            bindPref2Val(findPreference(AlbumApp.keys.home));
            bindPref2Val(findPreference(AlbumApp.keys.device));
            bindPref2Val(findPreference(AlbumApp.keys.jserv));
            bindPref2Val(findPreference(AlbumApp.keys.usrid));
            bindPref2Val(findPreference(AlbumApp.keys.pswd));

            cateHome = (PreferenceCategory)findPreference(AlbumApp.keys.homeCate);
            btnRegist = findPreference(AlbumApp.keys.bt_regist);
            device = findPreference(AlbumApp.keys.device);

            EditTextPreference pswd = findPreference(AlbumApp.keys.pswd);
            pswd.setOnBindEditTextListener(editText ->
                    editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD));

            homepref = findPreference(AlbumApp.keys.home);
            if (! LangExt.isblank(singleton.photoUser.device)) {
                homepref.setSummary(getString(R.string.devide_name, singleton.photoUser.device));
                findPreference(AlbumApp.keys.device).setEnabled(false);
                cateHome.removePreference(btnRegist);
                device.setSummary(getString(R.string.devide_name, singleton.photoUser.device));
            }
            else {
                findPreference(AlbumApp.keys.device).setEnabled(true);
                device.setSummary(R.string.txt_only_once);
            }
            summery = findPreference(AlbumApp.keys.login_summery);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
        }
        return super.onOptionsItemSelected(item);
    }

    static void bindPref2Val(@NonNull Preference preference) {
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
    private static final Preference.OnPreferenceChangeListener prefsListener
            = new Preference.OnPreferenceChangeListener() {
        @Override
        public boolean onPreferenceChange(@NonNull Preference preference, @NonNull Object newValue) {
            String stringValue = newValue.toString();
            String k = preference.getKey();
            preference.setSummary(stringValue);
            if (k.equals(AlbumApp.keys.jserv)) {
                singleton.jserv(stringValue);
            }
            else if (AlbumApp.keys.pswd.equals(k)) {
                singleton.photoUser.pswd = stringValue;
            }
            else if (AlbumApp.keys.usrid.equals(k)) {
                singleton.photoUser.uid = stringValue;
            }
            else if (AlbumApp.keys.device.equals(k)) {
                singleton.photoUser.device = stringValue;
            }
            return true;
        }
    };
}