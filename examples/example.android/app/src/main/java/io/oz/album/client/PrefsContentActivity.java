package io.oz.album.client;

import android.os.Bundle;
import android.preference.Preference;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import io.oz.AlbumApp;
import io.oz.R;

/**
 */
public class PrefsContentActivity extends AppCompatActivity {

    public static String key_jserv;
    public static String key_usrid;
    public static String key_pswd;

    static AlbumContext mono;

    static String oldUid;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (mono == null) {
            mono = ((AlbumApp) getApplication()).singl;
            oldUid = null;
        }
        else oldUid = mono.photoUser.uid;

       key_jserv = getString(R.string.jserv_key);
       key_usrid = getString(R.string.userid_key);
       key_pswd = getString(R.string.pswd_key);

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        // load settings fragment
        getFragmentManager().beginTransaction().replace(android.R.id.content, new MainPreferenceFragment()).commit();

    }
    public void onLogin(View btn) {
        try {
            mono.login((tier) -> {
                mono.tier = tier;
                updateSummery(MainPreferenceFragment.summery, "Login successfully!");
            },
            (c, t, args) -> {
                updateSummery(MainPreferenceFragment.summery, String.format(t,
                            args == null ? new String[]{"", ""} : args));
            });
        } catch (Exception e) {
            Log.e(mono.clientUri, e.getClass().getName() + e.getMessage());
            updateSummery(MainPreferenceFragment.summery, "Login failed!\nDetails: " + e.getMessage());
        }
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

    public static class MainPreferenceFragment extends PreferenceFragment {
        static Preference summery;

        @Override
        public void onCreate(final Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            addPreferencesFromResource(R.xml.pref);

            bindPreferenceSummaryToValue(findPreference(key_jserv));

            summery = findPreference(getString(R.string.key_login_summery));
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
        }
        return super.onOptionsItemSelected(item);
    }

    private static void bindPreferenceSummaryToValue(Preference preference) {
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
        public boolean onPreferenceChange(Preference preference, Object newValue) {
            String stringValue = newValue.toString();
            String k = preference.getKey();
            preference.setSummary(stringValue);
            if (k.equals(key_jserv)) {
                mono.jserv(stringValue);
            }
            else if (PrefsContentActivity.key_pswd.equals(k)) {
                mono.photoUser.pswd = stringValue;
                mono.mustLogin(true);
            }
            else if (PrefsContentActivity.key_usrid.equals(k)) {
                mono.photoUser.uid = stringValue;
                if (PrefsContentActivity.oldUid == null || !PrefsContentActivity.oldUid.equals(stringValue))
                    mono.mustLogin(true);
            }
            return true;
        }
    };
}