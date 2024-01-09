package io.oz.album.client;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.LangExt.len;
import static io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import static io.oz.AlbumApp.keys;
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
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.Preference;
import androidx.preference.PreferenceManager;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Objects;

import io.odysz.anson.Anson;
import io.odysz.common.LangExt;
import io.odysz.module.rs.AnResultset;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.AssetHelper;
import io.oz.album.client.widgets.ComfirmDlg;
import io.oz.album.tier.AlbumResp;
import io.oz.album.tier.Profiles;
import io.oz.albumtier.AlbumContext;
import io.oz.albumtier.PhotoSyntier;
import io.oz.albumtier.Policies;

/**
 * @since 0.3.0
 */
public class PrefsContentActivity extends AppCompatActivity implements JProtocol.OnError {
    static AlbumContext singleton;

    /** uid in preference */
    static String oldUid;
    final AlbumPreferenceFragment prefFragment = new AlbumPreferenceFragment();

    /** jserv url options */
    static public AnPrefEntries jsvEnts;

    /** Buffered device id for registering or applying when user loading old names or updating
     * TextEdit. The device name is intended to be a new one if {@link #buff_devname} is null.
     */
    static String buff_device;

    /** @see #buff_device */
    static String buff_devname;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (singleton == null) {
            singleton = AlbumContext.getInstance(this);
            oldUid = null;
        }
        else oldUid = singleton.userInf.uid();

        SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        String anstr = sharedPref.getString(keys.jserv, "");
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

    void errorDlg(String msg, int live) {
        new ComfirmDlg(this)
                .dlgMsg(0, 0)
                .msg(msg)
                .onOk((dialog, id) -> {
                    dialog.dismiss();
                })
                .showDlg(this, "")
                .live(live);
    }

    public void onAddJserv(View btn) {
        IntentIntegrator intentIntegrator = new IntentIntegrator(this);
        intentIntegrator.initiateScan();
    }

    /**
     * On qr-scanning results.
     * For content format, see {@link AnPrefEntries#insert(String)}
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
                        prefFragment.lstJserv.setSummary(jsvEnts.entVals[0]);

                        try {
                            SharedPreferences sharedPref = this.getPreferences(Context.MODE_PRIVATE);
                            sharedPref.edit().putString(keys.jserv, jsvEnts.toBlock());
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
            confirm(R.string.err_empty_pswd, 3000);
            return;
        }
        try {
          singleton.login(
            (client) -> {
                // load settings
                Anson.verbose = false;
                singleton.tier.asyGetSettings(
                    (resp) -> {
                        Profiles prf = ((AlbumResp) resp).profiles();
                        singleton.profiles = prf;
                        singleton.policies = new Policies(prf);

                        // update summery?
                        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
                        SharedPreferences.Editor editor = sharedPref.edit();
                        editor.putString(keys.home, prf.home);
                        editor.putString(keys.homepage, prf.webroot);
                        editor.apply();

                        AlbumApp.localConfig(sharedPref);

                        confirm(R.string.login_succeed, 3000);
                    },
                    showErrConfirm);
            },
            showErrConfirm);
        } catch (Exception e) {
            Log.e(clientUri, e.getClass().getName() + e.getMessage());
            showErrConfirm.err(MsgCode.exGeneral,
                getString(R.string.err_pref_login, e.getClass().getName(), e.getMessage()));
        }
    }

    /**
     * common function for error handling
     */
    JProtocol.OnError showErrConfirm = (c, t, args) ->
            errorDlg(String.format("Code: %s\n%s", c, String.format(t, args == null ? null : args)), 5000);

    /**
     * when succeed, deep write preference: device
     * @param btn
     */
    public void onRegisterDevice(View btn) {
        if (LangExt.isblank(buff_devname)) {
            confirm(R.string.msg_blank_device, 3000);
            return;
        }

        if (singleton.tier.verifyDeviceId(buff_device, buff_devname)) {
            // passed
            if (prefFragment.btnRegistDev != null) {
                prefFragment.prefcateDev.removePreference(prefFragment.findPreference(AlbumApp.keys.restoreDev));
                prefFragment.prefcateDev.removePreference(prefFragment.btnRegistDev);
            }

            // write through
            singleton.tier.asyRegisterDevice(buff_device, buff_devname,
                (resp) -> {
                    buff_device = ((DocsResp)resp).device().id;
                    singleton.userInf.device(buff_device);

                    runOnUiThread(()-> prefFragment.device.setEnabled(false));

                    SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
                    SharedPreferences.Editor editor = sharedPref.edit();
                    editor.putString(keys.device, buff_device);
                    editor.apply();
                });
        }
        else {
            confirm(R.string.msg_device_uid, 0);
        }
    }

    /**
     * Shallow wirth preference: device
     * @param btn
     */
    public void onRestoreDev(View btn) {
        if (singleton.state() != AlbumContext.ConnState.Online) {
            confirm(R.string.msg_log4device, 5000);
            return;
        }

        try {
            singleton.tier.asyAvailableDevices( (resp) -> {
                try {
                    final String[] oldevId = ((AnResultset)resp.rs(0)).toArr("device").toArray(new String[] {});
                    final String[] oldevnm = ((AnResultset)resp.rs(0)).toArr("devname").toArray(new String[] {});
                    if (len(oldevId) <= 0) {
                        confirm(R.string.msg_no_used_dev, 3000);
                        return;
                    }

                    runOnUiThread(() -> {
                        AlertDialog.Builder builder = new AlertDialog.Builder(this);
                        String uname = (String) resp.data().get("owner-name");
                        String org   = (String) resp.data().get("org");
                        String dev_usedby = getString(R.string.dev_usedby, uname, org);
                        builder.setTitle(dev_usedby)
                            .setNegativeButton("Cancel", (dialog, which) -> { })
                            .setSingleChoiceItems(oldevnm, 0, (dialog, which) -> {
                                buff_device  = oldevId[which];
                                buff_devname = oldevnm[which];
                                updateTitle(prefFragment.findPreference(keys.device),
                                        String.format("%s [%s]", buff_devname, buff_device));
                                updateSummery(prefFragment.findPreference(keys.device), dev_usedby);
                                dialog.dismiss();
                            });

                        AlertDialog dialog = builder.create();
                        dialog.show();
                    });
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                } });
        } catch (IOException | SemanticException e) {
            errorDlg(e.getMessage(), 0);
        }
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

    void updateTitle(Preference of, String s) {
        runOnUiThread(() -> of.setTitle(s));
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
        errorDlg(String.format(msg, (Object[]) (args == null ? new String[]{"", ""} : args)), 0 );
    }

    void confirm(int msgid, int live, int... msgOk) {
        new ComfirmDlg(this)
                .dlgMsg(msgid, isNull(msgOk) ? 0 : msgOk[0])
                .onOk((dialog, id) -> {
                    dialog.dismiss();
                })
                .showDlg(this,  "")
                .live(live);
    }
}