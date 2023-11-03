package io.oz.album.client;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.eq;
import static io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import static io.oz.albumtier.AlbumContext.clientUri;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.DialogFragment;
import androidx.preference.Preference;
import androidx.preference.PreferenceManager;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.io.IOException;
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
import io.oz.albumtier.PhotoSyntier;
import io.oz.albumtier.Plicies;

/**
 * @since 0.3.0
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
        PhotoSyntier.asyPing(clientUri,
            (m) -> {
                confirm(R.string.msg_conn_ok, 3000);
            },
            (c, m, a) -> {
                new ComfirmDlg(this)
                        .dlgMsg(R.string.msg_conn_err, 0)
                        .onOk((dialog, id) -> {
                            dialog.dismiss();
                        })
                        .showDlg(this, "")
                        .live(5000);
            });
    }

    public void onAddJserv(View btn) {
        IntentIntegrator intentIntegrator = new IntentIntegrator(this);
        intentIntegrator.initiateScan();
    }

    /**
     * On qr-scanning results.
     * @param requestCode
     * @param resultCode
     * @param data
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        IntentResult intentResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (intentResult != null) {
            String content = intentResult.getContents();
            if (content != null) {
                String format  = intentResult.getFormatName();
                if (eq(format, getString(R.string.qrformat))) {
                    if (jsvEnts.insert(content)) {
                        prefFragment.lstJserv.setEntries(jsvEnts.entries);
                        prefFragment.lstJserv.setEntryValues(jsvEnts.entVals);

                        prefFragment.lstJserv.setValue(jsvEnts.entVals[0]);
                        prefFragment.lstJserv.setTitle(jsvEnts.entries[0]);

                        try {
                            SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
                            sharedPref.edit().putString(AlbumApp.keys.jserv, jsvEnts.toBlock());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                    else err(MsgCode.exGeneral, getString(R.string.unknown_qrcontent));
                }
                else err(MsgCode.exGeneral, getString(R.string.unknown_qrformat, format));
            }
        }
        else
            super.onActivityResult(requestCode, resultCode, data);
    }

    public void onLogin(View btn) {
        if (isblank(singleton.pswd())) {
            // updateSummery(prefFragment.pswd, "");
            // updateSummery(prefFragment.summery, getString(R.string.err_empty_pswd));
            confirm(R.string.err_empty_pswd, 5000);
            // updateSummery(prefFragment.pswd, getString(R.string.pswd_title));
            // confirm(R.string.pswd_title, 5000);
            return;
        }
        try {
          singleton.login(
            (client) -> {
                // updateSummery(prefFragment.summery, getString(R.string.login_succeed));
                confirm(R.string.login_succeed, 3000);

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
                    // showErrSummary);
                    showErrConfirm);
            },
            // showErrSummary);
            showErrConfirm);
        } catch (Exception e) {
            Log.e(clientUri, e.getClass().getName() + e.getMessage());
            updateSummery(prefFragment.summery, getString(R.string.err_pref_login, e.getClass().getName(), e.getMessage()));
        }
    }

    /**
     * common function for error handling
     * @deprecated replaced wity {@link io.oz.album.client.widgets.ComfirmDlg}
     */
    JProtocol.OnError showErrSummary = (c, t, args) ->
        updateSummery(prefFragment.summery,
                      String.format(t, (Object[]) (args == null ? new String[]{"", ""} : args)));

    JProtocol.OnError showErrConfirm = (c, t, args) ->
            // confirm(String.format(t, (Object[]) (args == null ? new String[]{"", ""} : args)), 5000);
            confirm(R.string.app_name, 5000);

    public void onRegisterDevice(View btn) {
        String dev = singleton.userInf.device;
        if (LangExt.isblank(dev)) {
//            new ComfirmDlg(this)
//                    .dlgMsg(R.string.msg_blank_device, 0)
//                    .onOk((dialog, id) -> {
//                    })
//                    .showDlg(this, "device");
            confirm(R.string.msg_blank_device, 3000);
            return;
        }

        if (singleton.tier.verifyDeviceId(dev)) {
            // passed

            if (prefFragment.btnRegistDev != null) {
                prefFragment.prefcateDev.removePreference(prefFragment.btnRegistDev);
            }
            prefFragment.device.setEnabled(false);
        }
        else {
            // failed
//            DialogFragment _dlg = new ComfirmDlg(this)
//                    .dlgMsg(R.string.msg_device_uid, 0)
//                    .onOk((dialog, id) -> {
//                    })
//                    .showDlg(this, "device");
            confirm(R.string.msg_device_uid, 0);
        }
    }

    public void onRestoreDev(View btn) {
    }


    ////////////////// TODO side task: new confirm dialog pattern /////////////////////////

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
    void confirm(int msgid, int live, int... msgOk) {
        new ComfirmDlg(this)
                .dlgMsg(msgid, msgOk == null ? 0 : msgOk[0])
                .onOk((dialog, id) -> {
                    dialog.dismiss();
                })
                .showDlg(this, "")
                .live(live);
    }


}