package io.oz.album;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.activity.VideoPickActivity;
import com.vincent.filepicker.filter.entity.BaseFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Objects;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.preference.PreferenceManager;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.transact.x.TransException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.PrefsContentActivity;
import io.oz.album.webview.VWebAlbum;
import io.oz.album.webview.WebAlbumAct;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.PickingMode;
import io.oz.fpick.activity.BaseActivity;

// import static com.vincent.filepicker.activity.ImagePickActivity.IS_NEED_CAMERA;
import static io.odysz.common.LangExt.isNull;
import static com.hbisoft.pickit.DeviceHelper.getMultiplePaths;
import static com.hbisoft.pickit.DeviceHelper.getPath;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_CAMERA;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static io.oz.album.webview.WebAlbumAct.Help_ActionName;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener, JProtocol.OnError {

    AlbumContext singl;

    /** Preference activity starter */
    ActivityResultLauncher<Intent> prefStarter;
    ActivityResultLauncher<Intent> pickMediaStarter;
    ActivityResultLauncher<Intent> pickFileStarter;
    ActivityResultLauncher<Intent> helpActStarter;

    TextView msgv;
    AndErrorCtx errCtx;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AlbumApp.keys = new PrefKeys();
        // ISSUE to be simplified
        AlbumApp.keys.homeCate = getString(R.string.key_home_cate);
        AlbumApp.keys.home = getString(R.string.key_home);
        AlbumApp.keys.device = getString(R.string.key_device);
        AlbumApp.keys.jserv = getString(R.string.jserv_key);
        AlbumApp.keys.homepage = getString(R.string.homepage_key);
        AlbumApp.keys.usrid = getString(R.string.userid_key);
        AlbumApp.keys.pswd = getString(R.string.pswd_key);

        AlbumApp.keys.login_summery = getString(R.string.key_login_summery);
        AlbumApp.keys.bt_regist = getString(R.string.key_regist);
        AlbumApp.keys.bt_login = getString(R.string.btn_login);

        singl = AlbumContext.getInstance(this);

        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String homeName = sharedPref.getString(AlbumApp.keys.home, "");
        String uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        String device = sharedPref.getString(AlbumApp.keys.device, "");
        String jserv = sharedPref.getString(AlbumApp.keys.jserv, "");
        String homepage = sharedPref.getString(AlbumApp.keys.homepage, "https://odys-z.github.io/Anclient");

        singl.init(homeName, uid, device, jserv);
        AssetHelper.init(this, jserv, homepage);

        setContentView(R.layout.welcome);
        msgv = findViewById(R.id.tv_status);
        errCtx = new AndErrorCtx().context(this);

        if (pickMediaStarter == null)
            pickMediaStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (singl.state() == AlbumContext.ConnState.Online) {
                            onMediasPicked(result);
                        }
                        else showMsg(R.string.msg_ignored_when_offline);
                    }
                });

        if (pickFileStarter == null)
            pickFileStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (singl.state() == AlbumContext.ConnState.Online) {
                            onFilesPicked(result);
                        }
                        else showMsg(R.string.msg_ignored_when_offline);
                    }
                });

        if (prefStarter == null)
            prefStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        showMsg(R.string.msg_device_uid, uid, device);
                        WebView wv = findViewById(R.id.wv_welcome);
                        wv.reload();
                    }
                });

        if (helpActStarter == null)
            helpActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    WebView wv = findViewById(R.id.wv_welcome);
                    wv.reload();
                });

        try {
            if (singl.needSetup())
                // settings are cleared
                startPrefsAct();
            else singl
                .pswd(sharedPref.getString(AlbumApp.keys.pswd, ""))
                .login( (client) -> {
                  // All WebView methods must be called on the same thread.
                  runOnUiThread( () -> {
                     final VWebAlbum webView = new VWebAlbum();
                     WebView wv = findViewById(R.id.wv_welcome);
                     wv.setWebViewClient(webView);
                     WebSettings webSettings = wv.getSettings();
                     webSettings.setJavaScriptEnabled(true);
                     webSettings.setDomStorageEnabled(true);
                     wv.loadUrl(AssetHelper.loadUrls(AssetHelper.Act_Album));
                  } ); },
                  (c, t, args) -> showMsg(R.string.t_login_failed, singl.photoUser.uid(), singl.jserv()));
        } catch (Exception e) {
            showMsg(R.string.t_login_failed, singl.photoUser.uid(), singl.jserv());
        }
    }

    /**
     * Note: Keep this method - will be implemented with UI elements in the future?
     * @param template string template, R.string.id
     * @param args for String.format()
     */
    void showMsg(int template, Object ... args) {
        runOnUiThread( () -> {
            String msg = String.format(getString(template), args);
            // not working:
            // Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_LONG);
            msgv.setText(msg);
            msgv.setVisibility(View.VISIBLE);
        });
    }

    void clearMsg() {
        runOnUiThread(() -> msgv.setVisibility(View.GONE));
    }

    void showProgress(int listIx, ArrayList<BaseFile> list, int blocks, DocsResp resp) {
        runOnUiThread(() -> {
            String msg = String.format(getString(R.string.msg_templ_progress),
                    listIx, list.size(), resp.doc.clientname(), (float) resp.blockSeq() / blocks * 100);
            msgv.setText(msg);
            msgv.setVisibility(View.VISIBLE);
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.menu_settings) {
            startPrefsAct();
            return true;
        }
        else if (id == R.id.menu_help) {
            startHelpAct(AssetHelper.Act_Help);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    protected void startPrefsAct() {
        clearMsg();
        prefStarter.launch(new Intent(WelcomeAct.this, PrefsContentActivity.class));
    }

    protected void onMediasPicked(@NonNull ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ArrayList<? extends SyncDoc> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else
                    singl.tier.asyVideos(list,
                            null,
                            (resp, v) -> showMsg(R.string.t_synch_ok, list.size()),
                            errCtx.prepare(msgv, R.string.msg_upload_failed));

                WebView wv = findViewById(R.id.wv_welcome);
                wv.reload();
            }
        } catch (TransException | IOException | AnsonException e) {
            e.printStackTrace();
            errCtx.prepare(msgv, R.string.msg_upload_failed)
                    .err(null, e.getMessage(), e.getClass().getName());
        }
    }

    void onFilesPicked(ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ClipData clipData = Objects.requireNonNull(data).getClipData();
                ArrayList<SyncDoc> paths;
                if (clipData != null) {
                    if (singl.verbose) for(int i = 0; i < clipData.getItemCount(); i++)
                        Utils.logi("[AlbumContext.verbose] URI: %s", clipData.getItemAt(i).getUri());
                    paths = getMultiplePaths(this, singl.photoUser.device, clipData);
                    if (singl.verbose) Utils.logi(paths);
                }
                else {
                    if (singl.verbose) {
                        Utils.logi("[AlbumContext.verbose] URI: %s\nPath: %s",
                                String.valueOf(data.getData()),
                                getPath(this, singl.photoUser.device, data.getData(), Build.VERSION.SDK_INT));
                        errCtx.prepare(msgv, R.string.msg_upload_failed)
                                .err(null, "URI: %s\nPath: %s",
                                        String.valueOf(data.getData()),
                                        getPath(this, singl.photoUser.device, data.getData(), Build.VERSION.SDK_INT).fullpath());
                    }
                    paths = new ArrayList<SyncDoc>(1);
                    paths.add( getPath(this, singl.photoUser.device, data.getData(), Build.VERSION.SDK_INT) );
                }

                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else {
                    verifyStoragePermissions(this);
                    singl.tier.asyVideos(paths,
                            null,
                            (resp, v) -> showMsg(R.string.t_synch_ok, paths.size()),
                            errCtx.prepare(msgv, R.string.msg_upload_failed));

                }

                WebView wv = findViewById(R.id.wv_welcome);
                wv.reload();
            }
        } catch (AnsonException | TransException | IOException e) {
            e.printStackTrace();
            errCtx.prepare(msgv, R.string.msg_upload_failed)
                    .err(null, e.getMessage(), e.getClass().getName());
        }
    }

    protected void startPicking(Class<? extends BaseActivity> act) {
        clearMsg();

        Intent intt = new Intent(this, act);
        intt.putExtra(IS_NEED_CAMERA, true);
        intt.putExtra(Constant.MAX_NUMBER, 99);
        intt.putExtra ( IS_NEED_FOLDER_LIST, true );
        intt.putExtra( Constant.PickingMode,
                singl.state() == AlbumContext.ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99 );

        pickMediaStarter.launch(intt);
    }

    /**
     * Start help activities, etc.
     * @param action
     */
    protected void startHelpAct(int action) {
        Intent intent = new Intent(this, WebAlbumAct.class);
        intent.putExtra(Help_ActionName, action);
        helpActStarter.launch(intent);
    }

    @Override
    public void onClick(@NonNull View v) {
        int id = v.getId();
        switch (id) {
            case R.id.btn_pick_image:
                // startImagePicking();
                startPicking(ImagePickActivity.class);
                break;
            case R.id.btn_pick_video:
                // startVideoPiking();
                startPicking(VideoPickActivity.class);
                break;
            case R.id.btn_pick_audio:
                // startAudioPiking();
                startPicking(AudioPickActivity.class);
                break;
            case R.id.btn_pick_file:
                // startPicking(NormalFilePickActivity.class);
                /*
                Intent intent4 = new Intent(this, NormalFilePickActivity.class);
                intent4.putExtra(Constant.MAX_NUMBER, 9);
                intent4.putExtra ( IS_NEED_FOLDER_LIST, true );
                intent4.putExtra(NormalFilePickActivity.SUFFIX,
                        new String[] {"xlsx", "xls", "doc", "dOcX", "ppt", ".pptx", "pdf"});
                startActivityForResult(intent4, Constant.REQUEST_CODE_PICK_FILE);
                 */
                //
                Intent intent;
                if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
                    intent = new Intent(Intent.ACTION_PICK, MediaStore.Video.Media.EXTERNAL_CONTENT_URI);
                } else {
                    intent = new Intent(Intent.ACTION_PICK, MediaStore.Video.Media.INTERNAL_CONTENT_URI);
                }
                //  In this example we will set the type to video
                intent.setType("application/*");
                intent.setAction(Intent.ACTION_GET_CONTENT);
                intent.putExtra("return-data", true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                pickFileStarter.launch(intent);
                break;
        }
    }

    @Override
    public void err(AnsonMsg.MsgCode ok, String msg, String... args) {
        runOnUiThread( () -> {
            msgv.setText(msg);
            msgv.setVisibility(View.VISIBLE);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
    };

    /**
     * Checks if the app has permission to write to device storage
     *
     * If the app does not has permission then the user will be prompted to grant permissions
     *
     * @param activity
     */
    public static void verifyStoragePermissions(Activity activity) {
        // Check if we have write permission
        int permission = ActivityCompat.checkSelfPermission(activity,
                Manifest.permission.WRITE_EXTERNAL_STORAGE);

        if (permission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            ActivityCompat.requestPermissions(
                    activity,
                    PERMISSIONS_STORAGE,
                    REQUEST_EXTERNAL_STORAGE
            );
        }
    }
}
