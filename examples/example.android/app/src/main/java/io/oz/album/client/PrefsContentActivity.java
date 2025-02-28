package io.oz.album.client;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.len;
import static io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import static io.oz.AlbumApp.prfConfig;
import static io.oz.albumtier.AlbumContext.sysuri;

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

import io.odysz.common.LangExt;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.peer.AlbumResp;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.activity.ComfirmDlg;

/**
 * @since 0.3.0
 */
public class PrefsContentActivity extends AppCompatActivity implements JProtocol.OnError {
    static AlbumContext singleton;

    /** uid in preference */
    static String oldUid;
    final AlbumPreferenceFragment prefFragment = new AlbumPreferenceFragment();

    /**
     * Buffered device id for registering or applying when user loading old names or updating
     * TextEdit. The device name is intended to be a new one if {@link #buff_devname} is null.
     */
    static String buff_device;

    /** @see #buff_device */
    static String buff_devname;

    /**
     * Modified singlet.jservs
     * null for clean
     */
//    private AnPrefEntries jsvEntsDirty;
//    protected AnPrefEntries jsvEntsDirty(SharedPreferences sharedPrefs) {
//        if (jsvEntsDirty == null)
//            jsvEntsDirty = AlbumApp.sharedPrefs.jservs(sharedPrefs);
//        return jsvEntsDirty;
//    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (singleton == null) {
            singleton = AlbumContext.getInstance(this);
            oldUid = null;
        }
        else oldUid = singleton.userInf.uid();

        Objects.requireNonNull(getSupportActionBar()).setDisplayHomeAsUpEnabled(true);
        getSupportFragmentManager()
                .beginTransaction()
                .replace(android.R.id.content, prefFragment)
                .commit();

        // SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        // jsvEntsDirty = AlbumApp.sharedPrefs.jservs(sharedPrefs);

        // https://issuetracker.google.com/issues/146166988/resources
        // this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LOCKED);
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    public void onTestConn(View btn) {
        singleton.tier.asyPing(
            (m) -> {
                confirm(R.string.msg_conn_ok, 3000);
            },
            (c, m, a) -> {
                new ComfirmDlg()
                        // .dlgMsg(R.string.msg_conn_err, f("details: ", m, a), 0)
                        .dlgMsg(f("%s\ncode: %s\n%s", getString(R.string.msg_conn_err), c.name(), m), 0)
                        .onOk((dialog, id) -> {
                            dialog.dismiss();
                        })
                        .showDlg(this, "")
                        .live(8000);
            });
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
                    AnPrefEntries jsvEnts = prfConfig.jservs(); //jsvEntsDirty;
                    if (jsvEnts.insert(content)) {
                        prefFragment.listJserv.setEntries(jsvEnts.entries);
                        prefFragment.listJserv.setEntryValues(jsvEnts.entVals);

                        prefFragment.listJserv.setValue(jsvEnts.entryVal());
                        prefFragment.listJserv.setTitle(jsvEnts.entry());
                        prefFragment.listJserv.setSummary(jsvEnts.entryVal());

                        // Have clients using temporary jserv root.
                        singleton.jserv(jsvEnts.entryVal());
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
        else if (isblank(singleton.userInf.uid())) {
            confirm(R.string.err_empty_uid, 3000);
            return;
        }
        try {
            AlbumApp.login(singleton.pswd(), (resp) -> {
                // AlbumApp.prfConfig.jservs(prfConfig.jservs());
                // confirm(R.string.login_succeed, 3000);
                prfConfig.persist();
                confirmFormat(R.string.login_succeed, 3000, ((AlbumResp)resp).profiles().webroot);
            }, showErrConfirm);
        } catch (Exception e) {
            Log.e(sysuri, e.getClass().getName() + e.getMessage());
            showErrConfirm.err(MsgCode.exGeneral,
                getString(R.string.err_pref_login, e.getClass().getName(), e.getMessage()));
        }
    }

    /**
     * when succeed, deep write preference: device
     * @param btn clicked button
     */
    public void onRegisterDevice(View btn) {
        if (LangExt.isblank(buff_devname)) {
            confirm(R.string.msg_blank_device, 3000);
            return;
        }

        if (singleton.tier.client == null) {
            confirm(R.string.msg_login_required, 3000);
            return;
        }

        singleton.tier.asyRegisterDevice(buff_device, buff_devname,
            (resp) -> {
                String devid = ((DocsResp)resp).device().id;
                if (isblank(devid)) {
                    // still wrong at sever side
                    errorDlg(getString(R.string.msg_dev_err_null_id, buff_devname), 0);
                    return ;
                }
                buff_device = devid;
                singleton.device(buff_device, buff_devname);
                AlbumApp.prfConfig.device(buff_device).persist();

                runOnUiThread(()-> prefFragment.device.setEnabled(false));

                if (prefFragment.btnRegistDev != null) {
                    // Preference btnrest = prefFragment.findPreference(keys.restoreDev);
                    Preference btnrest = prefFragment.findpref(R.string.key_restore_dev);
                    if (btnrest != null) // too quick the UI events are happening
                        prefFragment.prefcateDev.removePreference(btnrest);

                    prefFragment.prefcateDev.removePreference(prefFragment.btnRegistDev);
                    prefFragment.btnRegistDev = null;
                }
            }, showErrConfirm);
    }

    /**
     * @param btn clicked button
     */
    public void onRestoreDev(View btn) {
        if (singleton.state() != AlbumContext.ConnState.Online || singleton.userInf == null) {
            confirm(R.string.msg_log4device, 5000);
            return;
        }

        try {
            singleton.tier.asyAvailableDevices( (resp) -> {
                try {
                    final String[] oldevId = resp.rs(0).toArr("device").toArray(new String[] {});
                    final String[] oldevnm = resp.rs(0).toArr("devname").toArray(new String[] {});
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
                                updateTitle(
                                        // prefFragment.findPreference(keys.device),
                                        prefFragment.findpref(R.string.key_device),
                                        String.format("%s [%s]", buff_devname, buff_device));

                                // updateSummery(prefFragment.findPreference(keys.device), dev_usedby);
                                updateSummery(prefFragment.findpref(R.string.key_device), dev_usedby);
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

    /**
     * Set text into EditText's summery, running in ui thread.
     *
     * @param p of which summery to be updated
     * @param s  summery text
     */
    void updateSummery(Preference p, String s) { runOnUiThread(() -> p.setSummary(s)); }

    void updateTitle(Preference p, String s) { runOnUiThread(() -> p.setTitle(s)); }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
        }
        return super.onOptionsItemSelected(item);
    }

    //////////////////////////////// new confirm dialog pattern ////////////////////////////////////

    /**
     * common function for error handling
     */
    JProtocol.OnError showErrConfirm = (c, t, args) ->
            errorDlg(String.format("Code: %s\n%s", c, String.format(t, (Object[])args)), 5000);

    @Override
    public void err(MsgCode c, String msg, String... args) {
        errorDlg(String.format(msg, (Object[]) (args == null ? new String[]{"", ""} : args)), 0 );
    }

    void errorDlg(String msg, int live) {
        new ComfirmDlg()
                .dlgMsg(0, 0)
                .msg(msg)
                .onOk((dialog, id) -> {
                    dialog.dismiss();
                })
                .showDlg(this, "")
                .live(live);
    }

    void confirm(int msgid, int live, int... msgOk) {
        ComfirmDlg.confirm(this, msgid, live, msgOk);
    }

    void confirmFormat(int strid, int live, Object... formatArgs) {
        ComfirmDlg.confirmFormat(this, strid, live, formatArgs);
    }
}