package io.oz.album.client;

import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.preference.Preference;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;

import io.odysz.semantic.jsession.SessionInf;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.albumtier.AlbumContext;

/**
 */
public class PrefsContentActivity extends AppCompatActivity {

    static AlbumContext singleton = AlbumContext.getInstance();

    static String oldUid;
    private AlbumPreferenceFragment prefFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (singleton == null) {
            singleton = AlbumApp.singl;
            oldUid = null;
        }
        else oldUid = singleton.photoUser.uid();

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        // load settings fragment
        prefFragment = new AlbumPreferenceFragment(this);
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
            updateSummery(prefFragment.summery, getString(R.string.msg_pref_login_failed, e.getClass().getName(), e.getMessage()));
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
        runOnUiThread(() -> of.setSummary(s));
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
        }
        return super.onOptionsItemSelected(item);
    }

//    /**
//     * A preference value change listener that updates the preference's summary
//     * to reflect its new value.
//     */
//    private static final Preference.OnPreferenceChangeListener prefsListener
//            = new Preference.OnPreferenceChangeListener() {
//        @Override
//        public boolean onPreferenceChange(@NonNull Preference preference, @NonNull Object newValue) {
//            String stringValue = newValue.toString();
//            String k = preference.getKey();
//            if (k.equals(AlbumApp.keys.jserv)) {
//                singleton.jserv(stringValue);
//                preference.setSummary(stringValue);
//            }
//            else if (AlbumApp.keys.pswd.equals(k)) {
//                singleton.pswd(stringValue);
//                preference.setSummary("");
//            }
//            else if (AlbumApp.keys.usrid.equals(k)) {
//                String device = singleton.photoUser.device;
//                singleton.photoUser = new SessionInf(singleton.photoUser.ssid(), stringValue);
//                singleton.photoUser.device = device;
//                preference.setSummary(stringValue);
//            }
//            else if (AlbumApp.keys.device.equals(k)) {
//                singleton.photoUser.device = stringValue;
//                preference.setSummary(stringValue);
//            }
//            return true;
//        }
//    };
}