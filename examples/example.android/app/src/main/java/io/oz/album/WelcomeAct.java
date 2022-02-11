package io.oz.album;

import static com.vincent.filepicker.activity.AudioPickActivity.IS_NEED_RECORDER;
import static com.vincent.filepicker.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static com.vincent.filepicker.activity.ImagePickActivity.IS_NEED_CAMERA;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
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
import io.odysz.common.LangExt;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantics.IUser;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.client.AlbumClientier;
import io.oz.album.client.AlbumTier;
import io.oz.webview.R;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener {
    String jserv;

    IUser photoUser;
    /** local working dir */
    String local;

    static SessionClient client;

    static ErrorCtx errCtx;

    String clientUri;
    AlbumClientier tier;

    /** Preference activity starter */
    private ActivityResultLauncher<Intent> startPrefs;

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        clientUri = getResources().getString(R.string.client_uri);
        jserv = getResources().getString(R.string.jserv);
        if (LangExt.isblank(jserv))
            startPrefsAct();
        else Clients.init(jserv);

        try {
            client = Clients.login("ody", "123456");
        } catch (SemanticException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        tier = new AlbumClientier(clientUri, client, errCtx);

        setContentView(R.layout.welcome);
    }

    private void startPrefsAct() {
        if (startPrefs == null)
            startPrefs = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        Intent data = result.getData();
                        Log.i(clientUri + "/jserv-root", data.getAction());
                    }
                    SharedPreferences sharedPreferences =
                            PreferenceManager.getDefaultSharedPreferences(this /* Activity context */);
                    jserv = sharedPreferences.getString("key_gallery_name", "");
                    Log.i(clientUri + "/jserv-root/name", jserv);
                }
        );
        startPrefs.launch(new Intent(WelcomeAct.this, SettingsPrefActivity.class));
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        switch (id) {
            case R.id.btn_pick_image:
                Intent intent1 = new Intent(this, ImagePickActivity.class);
                intent1.putExtra(IS_NEED_CAMERA, true);
                intent1.putExtra(Constant.MAX_NUMBER, 9);
                intent1.putExtra ( IS_NEED_FOLDER_LIST, true );
                startActivityForResult(intent1, Constant.REQUEST_CODE_PICK_IMAGE);
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
//                    StringBuilder builder = new StringBuilder();
//                    for (ImageFile file : list) {
//                        String path = file.getPath();
//                        builder.append(path + "\n");
//                    }
//                    mTvResult.setText(builder.toString());
                    try {
                        tier.syncPhotos(list);
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
