package io.oz.album.client;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import androidx.preference.Preference;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;

import com.vincent.filepicker.ToastUtil;

import io.odysz.anson.Anson;
import io.odysz.common.LangExt;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.tier.AlbumResp;
import io.oz.albumtier.AlbumContext;
import io.oz.albumtier.PhotoSyntier;

/**
 */
public class PrefsContentActivity extends AppCompatActivity implements JProtocol.OnError {

    // static AlbumContext singleton = AlbumContext.getInstance(this);
    static AlbumContext singleton;

    static String oldUid;
    private AlbumPreferenceFragment prefFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (singleton == null) {
            // singleton = AlbumApp.singl;
            singleton = AlbumContext.getInstance(this);
            oldUid = null;
        } else oldUid = singleton.photoUser.uid();

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        // load settings fragment
        prefFragment = new AlbumPreferenceFragment(this);
        getSupportFragmentManager()
                .beginTransaction()
                .replace(android.R.id.content, prefFragment)
                .commit();
    }

    public void onLogin(View btn) {
        try {
            singleton.login(
                (client) -> {
                    // singleton.tier = (PhotoSyntier) tier;
                    updateSummery(prefFragment.summery, getString(R.string.login_succeed));
                    updateSummery(prefFragment.homepref, getString(R.string.devide_name, singleton.photoUser.device));

                    // load settings
                    Anson.verbose = false;
                    ((PhotoSyntier) singleton.tier).asyGetSettings(
                        (resp) -> {
                            singleton.homeName = ((AlbumResp) resp).profiles().home();
                            updateSummery(prefFragment.homepref, singleton.homeName);

                            SharedPreferences sharedPref =
                                    PreferenceManager.getDefaultSharedPreferences(this);
                            SharedPreferences.Editor editor = sharedPref.edit();
                            editor.putString(AlbumApp.keys.home, singleton.homeName);
                            editor.apply();
                        },
                        showErrSummary);
                },
                showErrSummary);
        } catch (Exception e) {
            Log.e(singleton.clientUri, e.getClass().getName() + e.getMessage());
            updateSummery(prefFragment.summery, getString(R.string.msg_pref_login_failed, e.getClass().getName(), e.getMessage()));
        }
    }

    /**
     * common function for error handling
     */
    JProtocol.OnError showErrSummary = (c, t, args) ->
        updateSummery(prefFragment.summery,
                      String.format(t, (Object[]) (args == null ? new String[]{"", ""} : args)));

    public void onRegisterDevice(View btn) {

        String dev = singleton.photoUser.device;
        if (LangExt.isblank(dev)) {
            ToastUtil.getInstance ( getApplicationContext() )
                    .showToast(io.oz.fpick.R.string.vprf_blank_device);
            return;
        }

        if (prefFragment.btnRegist != null) {
            prefFragment.cateHome.removePreference(prefFragment.btnRegist);
        }
        prefFragment.device.setEnabled(false);
        prefFragment.btnLogin.setEnabled(true);
    }

    /**
     * Set text into EditText's summery, running in ui thread.
     *
     * @param of of which summery to be updated
     * @param s  summery text
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

    @Override
    public void err(AnsonMsg.MsgCode ok, String msg, String... args) {
        this.showErrSummary.err(ok, msg, args);
    }
}