package io.oz.album;

import static com.hbisoft.pickit.DeviceHelper.getDocDescript;
import static com.hbisoft.pickit.DeviceHelper.getMultipleDocs;
import static io.odysz.common.LangExt.len;
import static io.odysz.common.LangExt.str;
import static io.oz.album.webview.WebAlbumAct.Web_PageName;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_CAMERA;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_FOLDER_LIST;
import static io.odysz.common.LangExt.isblank;
import static io.oz.albumtier.AlbumContext.*;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.documentfile.provider.DocumentFile;
import androidx.preference.PreferenceManager;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.activity.VideoPickActivity;

import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.Objects;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.DateFormat;
import io.odysz.common.Utils;
import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.transact.x.TransException;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.PrefsContentActivity;
import io.oz.album.webview.VWebAlbum;
import io.oz.album.webview.WebAlbumAct;
import io.oz.albumtier.AlbumContext;
import io.oz.albumtier.IFileProvider;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.PickingMode;
import io.oz.fpick.activity.BaseActivity;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener, JProtocol.OnError {

    AlbumContext singl;

    /**
     * Preference activity starter
     */
    ActivityResultLauncher<Intent> prefStarter;
    ActivityResultLauncher<Intent> pickMediaStarter;
    ActivityResultLauncher<Intent> pickFileStarter;
    ActivityResultLauncher<Intent> webHelpStarter;

    TextView msgv;
    AndErrorCtx errCtx;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AlbumApp.keys = new PrefKeys(this);

        singl = AlbumContext.getInstance(this);

        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        PrefsWrapper c = AlbumApp.sharedPrefs
                = PrefsWrapper.loadPrefs(getApplicationContext(), sharedPrefs, getString(R.string.url_landing));
        singl.init(c.homeName, c.uid, c.device, c.jserv());

        setContentView(R.layout.welcome);
        msgv = findViewById(R.id.tv_status);
        errCtx = new AndErrorCtx().context(this);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP)
            // Since API 21, https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory
            findViewById(R.id.btn_pick_file).setVisibility(View.GONE);

        if (pickMediaStarter == null)
            pickMediaStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                            if (singl.state() == ConnState.Online) {
                                onMediasPicked(result);
                            } else showMsg(R.string.msg_ignore_offline);
                        }
                        reloadAlbum();
                    });

        if (pickFileStarter == null)
            pickFileStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                            if (singl.state() == ConnState.Online) {
                                onFilesPicked(result);
                            } else showMsg(R.string.msg_ignore_offline);
                        }
                        reloadAlbum();
                    });

        if (prefStarter == null)
            prefStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                            showMsg(R.string.msg_device_uid, AlbumApp.sharedPrefs.uid, AlbumApp.sharedPrefs.device);
                        }
                        reloadAlbum();
                    });

        if (webHelpStarter == null)
            webHelpStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> reloadAlbum());

        try {
            if (singl.needSetup())
                // settings are cleared
                startPrefsAct();
            else {
                String pswd = AlbumApp.sharedPrefs.pswd();
                singl.pswd(pswd)
                     .login((client) -> {
                            runOnUiThread(() -> reloadAlbum());
                        },
                        (code, t, args) -> showMsg(R.string.t_login_failed, singl.userInf.uid(), singl.jserv()));
            }
        } catch (Exception e) {
            showMsg(R.string.t_login_failed, singl.userInf.uid(), singl.jserv());
        }
    }

    @Override
    public void onConfigurationChanged(@NotNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            findViewById(R.id.bar_home_actions).setVisibility(View.GONE);
        } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
            findViewById(R.id.bar_home_actions).setVisibility(View.VISIBLE);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    void reloadAlbum() {
        if (singl.tier == null || AlbumApp.sharedPrefs == null)
            return;

        WebView wv = findViewById(R.id.wv_welcome);
        reloadWeb(singl, wv, this, AssetHelper.Act_Album);
    }

    public static void reloadWeb(AlbumContext singl, WebView wv, Activity act, int webId) {
        if (singl == null || singl.tier == null || singl.tier.client() == null)
            return;

        SessionClient client = singl.tier.client();
        if (client == null)
            return;

        String pswd = singl.pswd();

        final VWebAlbum webView = new VWebAlbum();
        wv.setWebViewClient(webView);
        WebSettings webSettings = wv.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        wv.setWebViewClient(new WebViewClient() {
            public void onPageFinished(WebView view, String url) {
                if (!isblank(pswd)) {
                    String script = String.format("loadAlbum('%s', '%s');", client.ssInfo().uid(), pswd);
                    Utils.warn("\n[Load page script]: %s", script);
                    // https://www.techyourchance.com/communication-webview-javascript-android/
                    wv.evaluateJavascript(script, null);
                }
            }
        });
        String albumweb = AssetHelper.url4intent(act, webId);

        // E.g. albumweb = "http://192.168.0.3:8888/index.html?serv=info";
        if (singl.verbose) Utils.logi("\n\nLoading home page: %s", albumweb);
        wv.loadUrl(albumweb);
    }

    /**
     * Note: Keep this method - will be implemented with UI elements in the future?
     *
     * @param template string template, R.string.id
     * @param args     for String.format()
     */
    void showMsg(int template, Object... args) {
        runOnUiThread(() -> {
            String templ = getString(template);
            if (templ != null && len(args) > 0) {
                String msg = str(templ, args);
                msgv.setText(msg);
                msgv.setVisibility(View.VISIBLE);
            }
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
        } else if (id == R.id.menu_admin) {
            startHelpAct(AssetHelper.Act_Admin);
            return true;
        } else if (id == R.id.menu_help) {
            startHelpAct(AssetHelper.Act_Help);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    protected void startPrefsAct() {
        clearMsg();
        prefStarter.launch(new Intent(WelcomeAct.this, PrefsContentActivity.class));
    }

    /**
     * https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory
     * <p>
     * https://developer.android.com/training/data-storage/shared/documents-files#persist-permissions
     *
     * @param result
     */
    protected void onMediasPicked(@NonNull ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ArrayList<? extends SyncDoc> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else singl.tier
                        .fileProvider(new IFileProvider() {
                            private String saveFolder;

                            @Override
                            public long meta(SyncDoc f) throws IOException {
                                File file = new File(f.fullpath());
                                f.size = file.length();
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    BasicFileAttributes attr = Files.readAttributes(file.toPath(), BasicFileAttributes.class);

                                    FileTime d = attr.creationTime();
                                    f.cdate(d);
                                    saveFolder = DateFormat.formatYYmm(d);
                                } else {
                                    Date d = new Date(file.lastModified());
                                    f.cdate(d);
                                    saveFolder = DateFormat.formatYYmm(d);
                                }
                                return f.size;
                            }

                            @Override
                            public String saveFolder() {
                                return saveFolder;
                            }

                            @Override
                            public InputStream open(SyncDoc f) throws FileNotFoundException {
                                return new FileInputStream(f.fullpath());
                            }
                        }).asyVideos(list,
                                (r, rx, seq, total, rsp) -> showMsg(R.string.msg_templ_progress,
                                        r, rx, total, (float) seq / total * 100),
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
                ArrayList<AndroidFile> paths;
                if (clipData != null) {
                    if (singl.verbose) for (int i = 0; i < clipData.getItemCount(); i++)
                        Utils.logi("[AlbumContext.verbose] URI: %s", clipData.getItemAt(i).getUri());
                    paths = getMultipleDocs(this, singl.userInf.device, clipData);
                    if (singl.verbose) Utils.logi(paths);
                } else {
                    if (singl.verbose) {
                        Utils.logi("[AlbumContext.verbose] URI: %s\nPath: %s",
                                String.valueOf(data.getData()),
                                getDocDescript(this, singl.userInf.device, data.getData(), Build.VERSION.SDK_INT));
                        errCtx.prepare(msgv, R.string.msg_upload_failed)
                                .err(null, "URI: %s\nPath: %s",
                                        String.valueOf(data.getData()),
                                        getDocDescript(this, singl.userInf.device, data.getData(), Build.VERSION.SDK_INT).fullpath());
                    }
                    paths = new ArrayList<>(1);
                    paths.add(getDocDescript(this, singl.userInf.device, data.getData(), Build.VERSION.SDK_INT));
                }

                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else {
                    // verifyStoragePermissions(this);
                    // askDirectoriesPermissions(this);
                    singl.tier.fileProvider(new IFileProvider() {
                        private String saveFolder;
                        // https://developer.android.com/training/data-storage/shared/documents-files#examine-metadata
                        @Override
                        public long meta(SyncDoc f) {
                            Uri returnUri = ((AndroidFile) f).contentUri();
                            try (Cursor returnCursor = getContentResolver()
                                    .query(returnUri, null, null, null, null)) {
                                int nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                                int sizeIndex = returnCursor.getColumnIndex(OpenableColumns.SIZE);
                                returnCursor.moveToFirst();
                                f.clientname(returnCursor.getString(nameIndex));
                                f.size = returnCursor.getLong(sizeIndex);
                                f.mime = getContentResolver().getType(returnUri);

                                Date lastmodify = new Date(DocumentFile.fromSingleUri(getApplicationContext(), returnUri).lastModified());
                                f.cdate(lastmodify);
                                saveFolder = DateFormat.formatYYmm(lastmodify);
                                return f.size;
                            }
                        }

                        @Override
                        public String saveFolder() {
                                                 return saveFolder;
                                                                   }

                        // https://developer.android.com/training/data-storage/shared/documents-files#input_stream
                        @Override
                        public InputStream open(SyncDoc p) throws FileNotFoundException {
                            return getContentResolver().openInputStream(((AndroidFile) p).contentUri());
                        }
                    })
                    .asyVideos(paths,
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
        intt.putExtra(IS_NEED_FOLDER_LIST, true);
        intt.putExtra(Constant.PickingMode,
                singl.state() == ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99);

        pickMediaStarter.launch(intt);
    }

    /**
     * Start help activities, etc.
     */
    protected void startHelpAct(int action) {
        Intent intent = new Intent(this, WebAlbumAct.class);
        intent.putExtra(Web_PageName, action);
        webHelpStarter.launch(intent);
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
                // TODO: a simple synchronized files report, startPicking(NormalFilePickActivity.class);
                Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Video.Media.EXTERNAL_CONTENT_URI);

                //  In this example we will set the type to video
                intent.setType("application/*");
                intent.setAction(Intent.ACTION_GET_CONTENT);
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
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
        runOnUiThread(() -> {
            msgv.setText(msg);
            msgv.setVisibility(View.VISIBLE);
        });
    }
}
