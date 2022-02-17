package io.oz.album;

import static com.vincent.filepicker.activity.AudioPickActivity.IS_NEED_RECORDER;
import static com.vincent.filepicker.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static com.vincent.filepicker.activity.ImagePickActivity.IS_NEED_CAMERA;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.activity.NormalFilePickActivity;
import com.vincent.filepicker.activity.VideoPickActivity;
import com.vincent.filepicker.filter.entity.AudioFile;
import com.vincent.filepicker.filter.entity.ImageFile;
import com.vincent.filepicker.filter.entity.NormalFile;
import com.vincent.filepicker.filter.entity.VideoFile;

import java.io.IOException;
import java.util.ArrayList;

import io.odysz.anson.x.AnsonException;
import io.odysz.semantics.x.SemanticException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.AlbumClientier;
import io.oz.albumtier.AlbumContext;
import io.oz.album.client.PrefsContentActivity;
import io.oz.albumtier.PrefKeys;
import io.oz.fpick.PickingMode;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener {
    AlbumContext singl;

    /** Preference activity starter */
    ActivityResultLauncher<Intent> prefActStarter;

    ActivityResultLauncher<Intent> imgPickActStarter;

    TextView msgv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AlbumApp.keys = new PrefKeys();
        AlbumApp.keys.homeCate = getString(R.string.key_home_cate);
        AlbumApp.keys.home = getString(R.string.key_home);
        AlbumApp.keys.device = getString(R.string.key_device);
        AlbumApp.keys.jserv = getString(R.string.jserv_key);
        AlbumApp.keys.usrid = getString(R.string.userid_key);
        AlbumApp.keys.pswd = getString(R.string.pswd_key);

        AlbumApp.keys.login_summery = getString(R.string.key_login_summery);
        AlbumApp.keys.bt_regist = getString(R.string.key_regist);

        singl = AlbumApp.singl;
        // singl.init(getResources(), PreferenceManager.getDefaultSharedPreferences(this));
        singl.init(getResources(), AlbumApp.keys, PreferenceManager.getDefaultSharedPreferences(this));

        setContentView(R.layout.welcome);
        msgv = (TextView) findViewById(R.id.tv_status);

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

        if (prefActStarter == null)
            prefActStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        Intent data = result.getData();
                        Log.d("jserv-root", data == null ? "null" : data.getAction());
                    }
                    SharedPreferences sharedPreferences =
                            PreferenceManager.getDefaultSharedPreferences(this /* Activity context */);
                    String name = sharedPreferences.getString(AlbumApp.keys.jserv, "");
                    Log.d(singl.clientUri + "/jserv-uri", name);
                });

        try {
            if (singl.needSetup())
                // settings are cleared
                startPrefsAct();
            else singl.login(
                (AlbumClientier tier) -> { },
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
                ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_IMAGE);
                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else
                    singl.tier.asyncPhotos(list, singl.photoUser,
                        (resp) -> {
                            showMsg(R.string.t_synch_ok, list.size());
                        },
                        (c, r, args) -> {
                            showMsg(R.string.t_login_failed, singl.photoUser.uid(), singl.jserv());
                        });
            }
        } catch (SemanticException | IOException | AnsonException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onClick(@NonNull View v) {
        int id = v.getId();
        switch (id) {
            case R.id.btn_pick_image:
                startImagePicking();
                break;
            case R.id.btn_pick_video:
                Intent intent2 = new Intent(this, VideoPickActivity.class);
                intent2.putExtra(IS_NEED_CAMERA, true);
                intent2.putExtra(Constant.MAX_NUMBER, 9);
                intent2.putExtra ( IS_NEED_FOLDER_LIST, true );
                startActivityForResult(intent2, Constant.REQUEST_CODE_PICK_VIDEO);
                break;
            case R.id.btn_pick_audio:
                Intent intent3 = new Intent(this, AudioPickActivity.class);
                intent3.putExtra(IS_NEED_RECORDER, true);
                intent3.putExtra(Constant.MAX_NUMBER, 9);
                intent3.putExtra ( IS_NEED_FOLDER_LIST, true );
                startActivityForResult(intent3, Constant.REQUEST_CODE_PICK_AUDIO);
                break;
            case R.id.btn_pick_file:
                Intent intent4 = new Intent(this, NormalFilePickActivity.class);
                intent4.putExtra(Constant.MAX_NUMBER, 9);
                intent4.putExtra ( IS_NEED_FOLDER_LIST, true );
                intent4.putExtra(NormalFilePickActivity.SUFFIX,
                        new String[] {"xlsx", "xls", "doc", "dOcX", "ppt", ".pptx", "pdf"});
                startActivityForResult(intent4, Constant.REQUEST_CODE_PICK_FILE);
                break;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch (requestCode) {
            case Constant.REQUEST_CODE_PICK_IMAGE:
                if (resultCode == RESULT_OK) {
                    ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_IMAGE);
                    try {
                        // shouldn't reach here
                        if (singl.client != null)
                            singl.tier.syncPhotos(list, singl.photoUser);
                        else showMsg(R.string.msg_ignored_when_offline);
                    } catch (IOException e) {
                        e.printStackTrace();
                    } catch (AnsonException e) {
                        e.printStackTrace();
                    } catch (SemanticException e) {
                        e.printStackTrace();
                    }
                }
                break;
            case Constant.REQUEST_CODE_PICK_VIDEO:
                if (resultCode == RESULT_OK) {
                    ArrayList<VideoFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_VIDEO);
                    StringBuilder builder = new StringBuilder();
                    for (VideoFile file : list) {
                        String path = file.getPath();
                        builder.append(path + "\n");
                    }
//                    mTvResult.setText(builder.toString());
                }
                break;
            case Constant.REQUEST_CODE_PICK_AUDIO:
                if (resultCode == RESULT_OK) {
                    ArrayList<AudioFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_AUDIO);
                    StringBuilder builder = new StringBuilder();
                    for (AudioFile file : list) {
                        String path = file.getPath();
                        builder.append(path + "\n");
                    }
//                    mTvResult.setText(builder.toString());
                }
                break;
            case Constant.REQUEST_CODE_PICK_FILE:
                if (resultCode == RESULT_OK) {
                    ArrayList<NormalFile> list = data.getParcelableArrayListExtra(Constant.RESULT_PICK_FILE);
                    StringBuilder builder = new StringBuilder();
                    for (NormalFile file : list) {
                        String path = file.getPath();
                        builder.append(path + "\n");
                    }
//                    mTvResult.setText(builder.toString());
                }
                break;
        }
    }
}
