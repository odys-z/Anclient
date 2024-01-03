package io.oz.album;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.activity.VideoPickActivity;
import com.vincent.filepicker.filter.entity.BaseFile;
import com.vincent.filepicker.filter.entity.ImageFile;

import java.io.IOException;
import java.util.ArrayList;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;
import io.odysz.anson.x.AnsonException;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.transact.x.TransException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.PrefsContentActivity;
import io.oz.album.webview.WebAlbumAct;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.PickingMode;

import static com.vincent.filepicker.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static com.vincent.filepicker.activity.ImagePickActivity.IS_NEED_CAMERA;
import static io.oz.album.webview.WebAlbumAct.Act_Help;
import static io.oz.album.webview.WebAlbumAct.Web_ActionName;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener {
    AlbumContext singl;

    /** Preference activity starter */
    ActivityResultLauncher<Intent> prefActStarter;

    ActivityResultLauncher<Intent> imgPickActStarter;

    ActivityResultLauncher<Intent> vidPickActStarter;

    ActivityResultLauncher<Intent> audPickActStarter;

    ActivityResultLauncher<Intent> webActStarter;

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
        AlbumApp.keys.usrid = getString(R.string.userid_key);
        AlbumApp.keys.pswd = getString(R.string.pswd_key);

        AlbumApp.keys.login_summery = getString(R.string.key_login_summery);
        AlbumApp.keys.bt_regist = getString(R.string.key_regist);
        AlbumApp.keys.bt_login = getString(R.string.btn_login);

        // singl = AlbumApp.singl;
        singl = AlbumContext.getInstance();

        // singl.init(getResources(), AlbumApp.keys, PreferenceManager.getDefaultSharedPreferences(this));
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        String homeName = sharedPref.getString(AlbumApp.keys.home, "");
        String uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        String device = sharedPref.getString(AlbumApp.keys.device, "");
        String jserv = sharedPref.getString(AlbumApp.keys.jserv, "");

        singl.init(homeName, uid, device, jserv);

        setContentView(R.layout.welcome);
        msgv = findViewById(R.id.tv_status);
        errCtx = new AndErrorCtx().context(this);

        //
        if (imgPickActStarter == null)
            imgPickActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (singl.state() == AlbumContext.ConnState.Online) {
                            onImagePicked(result);
                        }
                        else showMsg(R.string.msg_ignored_when_offline);
                    }
                });

        if (vidPickActStarter == null)
            vidPickActStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                            if (singl.state() == AlbumContext.ConnState.Online) {
                                    onVideoPicked(result);
                            }
                            else showMsg(R.string.msg_ignored_when_offline);
                        }
                    });

        if (audPickActStarter == null)
            audPickActStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                            if (singl.state() == AlbumContext.ConnState.Online) {
                                onImagePicked(result);
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
                    }
                });

        if (webActStarter == null)
            webActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> { });

        try {
            if (singl.needSetup())
                // settings are cleared
                startPrefsAct();
            else
                singl.pswd(sharedPref.getString(AlbumApp.keys.pswd, ""))
                     .login(
                        (tier) -> { },
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
            startWebAct(Act_Help);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    protected void startPrefsAct() {
        clearMsg();
        prefActStarter.launch(new Intent(WelcomeAct.this, PrefsContentActivity.class));
    }

    protected void startImagePicking() {
        clearMsg();

        Intent imgIntent = new Intent(this, ImagePickActivity.class);
        imgIntent.putExtra(IS_NEED_CAMERA, true);
        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
        imgIntent.putExtra( Constant.PickingMode,
                    singl.state() == AlbumContext.ConnState.Disconnected ?
                    PickingMode.disabled : PickingMode.limit99 );

        imgPickActStarter.launch(imgIntent);
    }

    protected void onImagePicked(@NonNull ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else
                    /*
                    singl.tier.asyncPhotosUp(list, singl.photoUser,
                        null,
                        (resp, v) -> showMsg(R.string.t_synch_ok, list.size()),
                        (c, r, args) -> showMsg(R.string.msg_upload_failed, (Object[]) args));
                     */
                    singl.tier.asyVideos(list,
                       null,
                            (resp, v) -> showMsg(R.string.t_synch_ok, list.size()),
                            errCtx.prepare(msgv, R.string.msg_upload_failed));
            }
        } catch (TransException | IOException | AnsonException e) {
            e.printStackTrace();
            // showMsg(R.string.msg_upload_failed, e.getClass().getName(), e.getMessage());
            errCtx.prepare(msgv, R.string.msg_upload_failed)
                  .err(null, e.getMessage(), e.getClass().getName());
        }
    }

    protected void startVideoPiking() {
        clearMsg();

        Intent imgIntent = new Intent(this, VideoPickActivity.class);
        imgIntent.putExtra(IS_NEED_CAMERA, true);
        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
        imgIntent.putExtra( Constant.PickingMode,
                singl.state() == AlbumContext.ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99 );

        vidPickActStarter.launch(imgIntent);
    }

    protected void onVideoPicked(@NonNull ActivityResult result) {
        Intent data = result.getData();
        if (data != null) {
            ArrayList<BaseFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
            if (singl.tier == null)
                showMsg(R.string.txt_please_login);
            else
                /*
                singl.tier.asyncPhotosUp(list, singl.photoUser,
                        (rx, rows, bx, total, resp) -> showProgress(rx, list, bx, (DocsResp) resp),
                        (doc, resp) -> showMsg(R.string.t_synch_ok, list.size()),
                        (c, r, args) -> showMsg(R.string.t_login_failed, singl.photoUser.uid(), singl.jserv()));
                 */ {
                try {
                    singl.tier.asyVideos(list,
                            (rows, rx, seq, total, resp) -> showProgress(rx, list, total, (DocsResp) resp),
                            (doc, resp) -> showMsg(R.string.t_synch_ok, list.size()),
                            errCtx.prepare(msgv, R.string.vw_no_video_play_app));
                } catch (TransException | IOException e) {
                    e.printStackTrace();
                    errCtx.prepare(msgv, R.string.msg_upload_failed)
                            .err(null, e.getMessage(), e.getClass().getName());
                }
            }
        }
    }

    protected void startAudioPiking() {
        clearMsg();

        Intent imgIntent = new Intent(this, AudioPickActivity.class);
        imgIntent.putExtra(IS_NEED_CAMERA, true);
        imgIntent.putExtra(Constant.MAX_NUMBER, 99);
        imgIntent.putExtra ( IS_NEED_FOLDER_LIST, true );
        imgIntent.putExtra( Constant.PickingMode,
                singl.state() == AlbumContext.ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99 );

        audPickActStarter.launch(imgIntent);
    }

    protected void startWebAct(int action) {
        Intent intent = new Intent(this, WebAlbumAct.class);
        intent.putExtra(Web_ActionName, action);
        webActStarter.launch(intent);
    }

//    protected void onAudioPicked(@NonNull ActivityResult result) {
//        try {
//        Intent data = result.getData();
//        if (data != null) {
//            ArrayList<BaseFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
//            if (singl.tier == null)
//                showMsg(R.string.txt_please_login);
//            else
//                singl.tier.asyncPhotos(list, singl.photoUser,
//                        (resp) -> {
//                            showMsg(R.string.t_synch_ok, list.size());
//                        },
//                        (c, r, args) -> {
//                            showMsg(R.string.msg_upload_failed, args);
//                        });
//            }
//        } catch (SemanticException | IOException | AnsonException e) {
//            e.printStackTrace();
//            showMsg(R.string.msg_upload_failed, e.getClass().getName(), e.getMessage());
//        }
//    }

    @Override
    public void onClick(@NonNull View v) {
        int id = v.getId();
        switch (id) {
            case R.id.btn_pick_image:
                startImagePicking();
                break;
            case R.id.btn_pick_video:
                startVideoPiking();
                break;
            case R.id.btn_pick_audio:
                startAudioPiking();
                break;
                /*
            case R.id.btn_pick_file:
                Intent intent4 = new Intent(this, NormalFilePickActivity.class);
                intent4.putExtra(Constant.MAX_NUMBER, 9);
                intent4.putExtra ( IS_NEED_FOLDER_LIST, true );
                intent4.putExtra(NormalFilePickActivity.SUFFIX,
                        new String[] {"xlsx", "xls", "doc", "dOcX", "ppt", ".pptx", "pdf"});
                startActivityForResult(intent4, Constant.REQUEST_CODE_PICK_FILE);
                break;
                 */
        }
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
