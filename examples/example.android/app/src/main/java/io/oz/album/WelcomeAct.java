package io.oz.album;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.activity.NormalFilePickActivity;
import com.vincent.filepicker.activity.VideoPickActivity;
import com.vincent.filepicker.filter.entity.BaseFile;

import java.io.IOException;
import java.util.ArrayList;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;
import io.odysz.anson.x.AnsonException;
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
import static io.oz.fpick.activity.BaseActivity.IS_NEED_CAMERA;
import static io.oz.fpick.activity.BaseActivity.SUFFIX;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static io.oz.album.webview.WebAlbumAct.Help_ActionName;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener, JProtocol.OnError {

    AlbumContext singl;

    /** Preference activity starter */
    ActivityResultLauncher<Intent> prefActStarter;

    // ActivityResultLauncher<Intent> imgPickActStarter;

    // ActivityResultLauncher<Intent> vidPickActStarter;

    // ActivityResultLauncher<Intent> audPickActStarter;

    ActivityResultLauncher<Intent> pickActStarter;

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

        // singl.init(getResources(), AlbumApp.keys, PreferenceManager.getDefaultSharedPreferences(this));
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String homeName = sharedPref.getString(AlbumApp.keys.home, "");
        String uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        String device = sharedPref.getString(AlbumApp.keys.device, "");
        String jserv = sharedPref.getString(AlbumApp.keys.jserv, "");
        String homepage = sharedPref.getString(AlbumApp.keys.homepage, "192.168.101.5:8888");

        singl.init(homeName, uid, device, jserv);
        AssetHelper.init(this, jserv, homepage);

        setContentView(R.layout.welcome);
        msgv = findViewById(R.id.tv_status);
        errCtx = new AndErrorCtx().context(this);

//        //
//        if (imgPickActStarter == null)
//            imgPickActStarter = registerForActivityResult(
//                new ActivityResultContracts.StartActivityForResult(),
//                result -> {
//                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
//                        if (singl.state() == AlbumContext.ConnState.Online) {
//                            onImagePicked(result);
//                        }
//                        else showMsg(R.string.msg_ignored_when_offline);
//                    }
//                });
//
//        if (vidPickActStarter == null)
//            vidPickActStarter = registerForActivityResult(
//                    new ActivityResultContracts.StartActivityForResult(),
//                    result -> {
//                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
//                            if (singl.state() == AlbumContext.ConnState.Online) {
//                                    onVideoPicked(result);
//                            }
//                            else showMsg(R.string.msg_ignored_when_offline);
//                        }
//                    });
//
//        if (audPickActStarter == null)
//            audPickActStarter = registerForActivityResult(
//                    new ActivityResultContracts.StartActivityForResult(),
//                    result -> {
//                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
//                            if (singl.state() == AlbumContext.ConnState.Online) {
//                                onImagePicked(result);
//                            }
//                            else showMsg(R.string.msg_ignored_when_offline);
//                        }
//                    });

        if (pickActStarter == null)
            pickActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (singl.state() == AlbumContext.ConnState.Online) {
                            onFilesPicked(result);
                        }
                        else showMsg(R.string.msg_ignored_when_offline);
                    }
                });

        if (prefActStarter == null)
            prefActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {

                        // SharedPreferences sharePrefs =
                        //        PreferenceManager.getDefaultSharedPreferences(this /* Activity context */);
                        // String name = sharePrefs.getString(AlbumApp.keys.usrid, "");
                        // String device = sharePrefs.getString(AlbumApp.keys.device, "");
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
            else
                singl.pswd(sharedPref.getString(AlbumApp.keys.pswd, ""))
                     .login(
                        (client) -> {
                          // All WebView methods must be called on the same thread.
                          runOnUiThread( () -> {
                            final VWebAlbum webView = new VWebAlbum();
                            WebView wv = findViewById(R.id.wv_welcome);
                            wv.setWebViewClient(webView);
                            WebSettings webSettings = wv.getSettings();
                            webSettings.setJavaScriptEnabled(true);
                            webSettings.setDomStorageEnabled(true);
                            wv.loadUrl(AssetHelper.loadUrls(AssetHelper.Act_Album));
                          } );
                        },
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
        prefActStarter.launch(new Intent(WelcomeAct.this, PrefsContentActivity.class));
    }

//    protected void startImagePicking() {
//        clearMsg();
//
//        Intent imgIntent = new Intent(this, ImagePickActivity.class);
//        imgIntent.putExtra(IS_NEED_CAMERA, true);
//        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
//        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
//        imgIntent.putExtra( Constant.PickingMode,
//                    singl.state() == AlbumContext.ConnState.Disconnected ?
//                    PickingMode.disabled : PickingMode.limit99 );
//
//        imgPickActStarter.launch(imgIntent);
//    }

    protected void onFilesPicked(@NonNull ActivityResult result) {
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

//    protected void onImagePicked(@NonNull ActivityResult result) {
//        try {
//            Intent data = result.getData();
//            if (data != null) {
//                ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//                if (singl.tier == null)
//                    showMsg(R.string.txt_please_login);
//                else
//                    singl.tier.asyVideos(list,
//                   null,
//                        (resp, v) -> showMsg(R.string.t_synch_ok, list.size()),
//                        errCtx.prepare(msgv, R.string.msg_upload_failed));
//            }
//        } catch (TransException | IOException | AnsonException e) {
//            e.printStackTrace();
//            errCtx.prepare(msgv, R.string.msg_upload_failed)
//                  .err(null, e.getMessage(), e.getClass().getName());
//        }
//    }

//    protected void startVideoPiking() {
//        clearMsg();
//
//        Intent imgIntent = new Intent(this, VideoPickActivity.class);
//        imgIntent.putExtra(IS_NEED_CAMERA, true);
//        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
//        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
//        imgIntent.putExtra( Constant.PickingMode,
//                singl.state() == AlbumContext.ConnState.Disconnected ?
//                        PickingMode.disabled : PickingMode.limit99 );
//
//        vidPickActStarter.launch(imgIntent);
//    }

//    protected void onVideoPicked(@NonNull ActivityResult result) {
//        Intent data = result.getData();
//        if (data != null) {
//            ArrayList<BaseFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//            if (singl.tier == null)
//                showMsg(R.string.txt_please_login);
//            else {
//                try {
//                    singl.tier.asyVideos(list,
//                            (rows, rx, seq, total, resp) -> showProgress(rx, list, total, (DocsResp) resp),
//                            (doc, resp) -> showMsg(R.string.t_synch_ok, list.size()),
//                            errCtx.prepare(msgv, R.string.vw_no_video_play_app));
//                } catch (TransException | IOException e) {
//                    e.printStackTrace();
//                    errCtx.prepare(msgv, R.string.msg_upload_failed)
//                            .err(null, e.getMessage(), e.getClass().getName());
//                }
//            }
//        }
//    }

//    protected void startAudioPiking() {
//        clearMsg();
//
//        Intent imgIntent = new Intent(this, AudioPickActivity.class);
//        imgIntent.putExtra(IS_NEED_CAMERA, true);
//        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
//        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
//        imgIntent.putExtra( Constant.PickingMode,
//                singl.state() == AlbumContext.ConnState.Disconnected ?
//                        PickingMode.disabled : PickingMode.limit99 );
//
//        audPickActStarter.launch(imgIntent);
//    }

    protected void startPicking(Class<? extends BaseActivity> act, String ... suffices) {
        clearMsg();

        Intent imgIntent = new Intent(this, act);
        imgIntent.putExtra(IS_NEED_CAMERA, true);
        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
        imgIntent.putExtra( Constant.PickingMode,
                singl.state() == AlbumContext.ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99 );
        if (!isNull(suffices))
            imgIntent.putExtra(SUFFIX, suffices);

        pickActStarter.launch(imgIntent);
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
                /*
                Intent intent4 = new Intent(this, NormalFilePickActivity.class);
                intent4.putExtra(Constant.MAX_NUMBER, 9);
                intent4.putExtra ( IS_NEED_FOLDER_LIST, true );
                intent4.putExtra(NormalFilePickActivity.SUFFIX,
                        new String[] {"xlsx", "xls", "doc", "dOcX", "ppt", ".pptx", "pdf"});
                startActivityForResult(intent4, Constant.REQUEST_CODE_PICK_FILE);
                 */
                startPicking(NormalFilePickActivity.class,
                        new String[] {"xlsx", "xls", "doc", "docx", "ppt", ".pptx", "pdf", "txt", "csv", "zip", "7z", "rar"});
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

//    @Override
//    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
//        super.onActivityResult(requestCode, resultCode, data);
//        switch (requestCode) {
//            case Constant.REQUEST_CODE_PICK_IMAGE:
//                // shouldn't reach here
//                if (resultCode == RESULT_OK) {
//                    ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//                    try {
//                        if (singl.tier != null)
//                            // singl.tier.syncVideos(list, singl.photoUser, null, null);
//                            singl.tier.syncVideos(list, null, null, singl.errCtx);
//                        else showMsg(R.string.msg_ignored_when_offline);
//                    } catch (IOException | AnsonException | TransException e) {
//                        e.printStackTrace();
//                    }
//                }
//                break;
//            case Constant.REQUEST_CODE_PICK_VIDEO:
//                // shouldn't reach here
//                if (resultCode == RESULT_OK) {
//                    ArrayList<VideoFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//                    StringBuilder builder = new StringBuilder();
//                    for (VideoFile file : list) {
//                        String path = file.getPath();
//                        builder.append(path + "\n");
//                    }
//                }
//                break;
//            case Constant.REQUEST_CODE_PICK_AUDIO:
//                // shouldn't reach here
//                if (resultCode == RESULT_OK) {
//                    ArrayList<AudioFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//                    StringBuilder builder = new StringBuilder();
//                    for (AudioFile file : list) {
//                        String path = file.getPath();
//                        builder.append(path + "\n");
//                    }
//                }
//                break;
//            case Constant.REQUEST_CODE_PICK_FILE:
//                if (resultCode == RESULT_OK) {
//                    ArrayList<NormalFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_FILE);
//                    StringBuilder builder = new StringBuilder();
//                    for (NormalFile file : list) {
//                        String path = file.getPath();
//                        builder.append(path + "\n");
//                    }
////                    mTvResult.setText(builder.toString());
//                }
//                break;
//        }
//    }
}
