package io.oz.album.client;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.eq;
import static io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import androidx.activity.result.ActivityResultLauncher;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.DialogFragment;
import androidx.preference.Preference;
import androidx.preference.PreferenceManager;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.util.Objects;

import io.odysz.anson.Anson;
import io.odysz.common.LangExt;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.widgets.ComfirmDlg;
import io.oz.album.tier.AlbumResp;
import io.oz.album.tier.Profiles;
import io.oz.albumtier.AlbumContext;
import io.oz.albumtier.Plicies;

/**
 */
public class PrefsContentActivityV2 extends AppCompatActivity implements JProtocol.OnError {
    static AlbumContext singleton;

    /** uid in preference */
    static String oldUid;
    final AlbumPreferenceFragmentV2 prefFragment = new AlbumPreferenceFragmentV2();

    static public AnPrefEntries jsvEnts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (singleton == null) {
            singleton = AlbumContext.getInstance(this);
            oldUid = null;
        }
        else oldUid = singleton.userInf.uid();

        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        String anstr = sharedPref.getString(AlbumApp.keys.jserv, "");
        jsvEnts = isblank(anstr)
                ? new AnPrefEntries(
                getResources().getStringArray(R.array.jserv_entries),
                getResources().getStringArray(R.array.jserv_entvals) )
                : (AnPrefEntries) Anson.fromJson(anstr);

        Objects.requireNonNull(getSupportActionBar()).setDisplayHomeAsUpEnabled(true);
        getSupportFragmentManager()
                .beginTransaction()
                .replace(android.R.id.content, prefFragment)
                .commit();

        //https://issuetracker.google.com/issues/146166988/resources
        // this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LOCKED);
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    public void onTestConn(View btn) {
        DialogFragment _dlg = new ComfirmDlg()
                .dlgMsg(R.string.txt_test_connect)
                .onOk((dialog, id) -> {
                    System.out.println(id);
                })
                .showDlg(this, "test-conn");
    }

    ActivityResultLauncher<Intent> addJservStarter;
    public void onAddJserv(View btn) {
//        if (addJservStarter == null)
//            addJservStarter = registerForActivityResult(
//                new ActivityResultContracts.StartActivityForResult(),
//                result -> {
//                    Intent data = result.getData();
//                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
//                        String jsv = data.getStringExtra(AddJservActivity.Result_Jserv);
//
//                    }
//                    // reloadAlbum();
//                });
//        Intent intt = new Intent(this, AddJservActivity.class);
//        addJservStarter.launch(intt);
        IntentIntegrator intentIntegrator = new IntentIntegrator(this);
        intentIntegrator.initiateScan();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        IntentResult intentResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (intentResult != null) {
            String content = intentResult.getContents();
            if (content != null) {
                String format  = intentResult.getFormatName();
                if (eq(format, getString(R.string.qrformat))) {
                    jsvEnts.insert(content);
                    prefFragment.lstJserv.setEntries(jsvEnts.entries);
                    prefFragment.lstJserv.setEntryValues(jsvEnts.entVals);

                    prefFragment.lstJserv.setValue(jsvEnts.entVals[0]);
                    prefFragment.lstJserv.setTitle(jsvEnts.entries[0]);
                }
                else err(MsgCode.exGeneral, getString(R.string.unknown_qrformat, format));
            }
        }
        else
            super.onActivityResult(requestCode, resultCode, data);
    }

    public void onLogin(View btn) {
        if (isblank(singleton.pswd())) {
            updateSummery(prefFragment.pswd, "");
            updateSummery(prefFragment.summery, getString(R.string.err_empty_pswd));
            updateSummery(prefFragment.pswd, getString(R.string.pswd_title));
            return;
        }
        try {
          singleton.login(
            (client) -> {
                updateSummery(prefFragment.summery, getString(R.string.login_succeed));
                // updateSummery(prefFragment.homepref, getString(R.string.device_name, singleton.userInf.device));

                // load settings
                Anson.verbose = false;
                singleton.tier.asyGetSettings(
                    (resp) -> {
                        Profiles prf = ((AlbumResp) resp).profiles();
                        singleton.profiles = prf;
                        singleton.policies = new Plicies(prf);

                        // updateSummery(prefFragment.homepref, prf.home);

                        SharedPreferences sharedPref =
                                PreferenceManager.getDefaultSharedPreferences(this);
                        SharedPreferences.Editor editor = sharedPref.edit();
                        editor.putString(AlbumApp.keys.home, prf.home);
                        editor.putString(AlbumApp.keys.homepage, prf.webroot);
                        editor.apply();
                    },
                    showErrSummary);
            },
            showErrSummary);
        } catch (Exception e) {
            Log.e(AlbumContext.clientUri, e.getClass().getName() + e.getMessage());
            updateSummery(prefFragment.summery, getString(R.string.err_pref_login, e.getClass().getName(), e.getMessage()));
        }
    }

    /**
     * common function for error handling
     */
    JProtocol.OnError showErrSummary = (c, t, args) ->
        updateSummery(prefFragment.summery,
                      String.format(t, (Object[]) (args == null ? new String[]{"", ""} : args)));

    public void onRegisterDevice(View btn) {
        String dev = singleton.userInf.device;
        if (LangExt.isblank(dev)) {
            new ComfirmDlg()
                .dlgMsg(R.string.msg_blank_device)
                .onOk((dialog, id) -> {
                })
                .showDlg(this, "device");
            return;
        }

        if (singleton.tier.verifyDeviceId(dev)) {
            // passed

            if (prefFragment.btnRegistDev != null) {
                prefFragment.prefcateDev.removePreference(prefFragment.btnRegistDev);
            }
            prefFragment.device.setEnabled(false);
            prefFragment.btnLogin.setEnabled(true);
        }
        else {
            // failed
            DialogFragment _dlg = new ComfirmDlg()
                    .dlgMsg(R.string.msg_device_uid)
                    .onOk((dialog, id) -> {
                    })
                    .showDlg(this, "device");
        }
    }

    public void onRestoreDev(View btn) {
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
    public void err(MsgCode c, String msg, String... args) {
        this.showErrSummary.err(c, msg, args);
    }
}