package io.oz.album;

import static com.hbisoft.pickit.DeviceHelper.getDocDescript;
import static com.hbisoft.pickit.DeviceHelper.getMultipleDocs;
import static io.odysz.common.LangExt.bool;
import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.len;
import static io.odysz.common.LangExt.str;
import static io.oz.AlbumApp.prfConfig;
import static io.oz.album.webview.WebAlbumAct.Web_Intent_id;
import static io.oz.albumtier.AlbumContext.ConnState;
import static io.oz.albumtier.AlbumContext.verbose;
import static io.oz.fpick.activity.BaseActivity.IS_NEED_FOLDER_LIST;

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
import android.view.WindowManager;
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

import com.hbisoft.pickit.DeviceHelper;
import com.vincent.filepicker.Constant;

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

import io.odysz.anson.AnsonException;
import io.odysz.common.DateFormat;
import io.odysz.common.Utils;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.syn.Doclientier;
import io.odysz.jclient.syn.IFileProvider;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.AlbumApp;
import io.oz.R;
import io.oz.album.client.PrefsContentActivity;
import io.oz.album.webview.VWebAlbum;
import io.oz.album.webview.WebAlbumAct;
import io.oz.album.webview.WebViewJavaScriptInterface;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.PickingMode;
import io.oz.fpick.activity.AudioPickActivity;
import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.activity.ComfirmDlg;
import io.oz.fpick.activity.ImagePickActivity;
import io.oz.fpick.activity.VideoPickActivity;
import io.oz.syndoc.client.PhotoSyntier;

public class WelcomeAct extends AppCompatActivity implements View.OnClickListener, JProtocol.OnError {
    // for error:
    // Class 'WelcomeAct' must either be declared abstract or implement abstract method 'addMenuProvider(MenuProvider, LifecycleOwner, State)' in 'MenuHost',
    // delete the 'build' folder

    AlbumContext clientext;

    /**
     * Preference activity starter
     */
    ActivityResultLauncher<Intent> prefStarter;
    ActivityResultLauncher<Intent> pickMediaStarter;
    ActivityResultLauncher<Intent> pickFileStarter;
    ActivityResultLauncher<Intent> webHelpStarter;

    TextView msgv;
    AndErrorCtx errCtx;
    private boolean requiresFullscreen;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        clientext = AlbumContext.initWithErrorCtx(this);

        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        PrefsWrapper c = AlbumApp.prfConfig
                       = PrefsWrapper.loadPrefs(getApplicationContext(), sharedPrefs, getString(R.string.url_landing));
        clientext.init(c.homeName, c.uid, c.pswd, c.device, c.jserv());

        setContentView(R.layout.welcome);
        msgv = findViewById(R.id.tv_status);

        WebView wv = findViewById(R.id.wv_welcome);
        wv.addJavascriptInterface(new WebViewJavaScriptInterface(this, (String d) -> {
            if (bool(d)) {
                requiresFullscreen = true;
                findViewById(R.id.bar_home_actions).setVisibility(View.GONE);
                findViewById(R.id.tv_status).setVisibility(View.GONE);

                WindowManager.LayoutParams attrs = getWindow().getAttributes();
                attrs.flags |= WindowManager.LayoutParams.FLAG_FULLSCREEN;
                getWindow().setAttributes(attrs);

                if(this.getSupportActionBar() != null)
                    getSupportActionBar().hide();
            }
            else {
                requiresFullscreen = false;
                findViewById(R.id.bar_home_actions).setVisibility(View.VISIBLE);
                findViewById(R.id.tv_status).setVisibility(View.VISIBLE);

                WindowManager.LayoutParams attrs = getWindow().getAttributes();
                attrs.flags &= ~WindowManager.LayoutParams.FLAG_FULLSCREEN;
                getWindow().setAttributes(attrs);

                if(this.getSupportActionBar() != null)
                    getSupportActionBar().show();
            }
        }), "AndroidInterface");

        errCtx = new AndErrorCtx().context(this);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP)
            // Since API 21, https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory
            findViewById(R.id.btn_pick_file).setVisibility(View.GONE);

        if (pickMediaStarter == null)
            pickMediaStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (clientext.state() == ConnState.Online) {
                            onMediasPicked(result);
                        } else showStatus(R.string.msg_ignore_offline);
                    }
                    reloadAlbum();
                });

        if (pickFileStarter == null)
            pickFileStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        if (clientext.state() == ConnState.Online) {
                            onFilesPicked(result);
                        } else showStatus(R.string.msg_ignore_offline);
                    }
                    reloadAlbum();
                });

        if (prefStarter == null)
            prefStarter = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == AppCompatActivity.RESULT_OK) {
                        showStatus(R.string.msg_login_uid, c.uid, c.device);
                    }
                    reloadAlbum();
                });

        if (webHelpStarter == null)
            webHelpStarter = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> reloadAlbum());

        try {
            if (clientext.needSetup() || AlbumApp.prfConfig.needSetup())
                // settings are cleared
                startPrefsAct();
            else {
                clientext
                        .pswd(AlbumApp.prfConfig.pswd())
                        .jserv(AlbumApp.prfConfig.jserv());

                AlbumApp.login(clientext.pswd(),
                    (client) -> {
                        runOnUiThread(this::reloadAlbum);
                    },
                    (code, t, args) -> showStatus(R.string.t_login_failed, clientext.userInf.uid(),
                            AlbumApp.prfConfig.jserv()));
            }
        } catch (Exception e) {
            showStatus(R.string.t_login_failed, clientext.userInf.uid(), AlbumApp.prfConfig.jserv());
        }
    }

    @Override
    public void onConfigurationChanged(@NotNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        WindowManager.LayoutParams attrs = getWindow().getAttributes();

        if (!this.requiresFullscreen)
        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            attrs.flags |= WindowManager.LayoutParams.FLAG_FULLSCREEN;
            getWindow().setAttributes(attrs);

            findViewById(R.id.bar_home_actions).setVisibility(View.GONE);
            if(this.getSupportActionBar() != null)
                getSupportActionBar().hide();
        } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
            attrs.flags &= ~WindowManager.LayoutParams.FLAG_FULLSCREEN;
            getWindow().setAttributes(attrs);

            findViewById(R.id.bar_home_actions).setVisibility(View.VISIBLE);
            if(this.getSupportActionBar() != null)
                this.getSupportActionBar().show();
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    /**
     * Reload album via call js function.
     */
    void reloadAlbum() {
        if (clientext.tier == null || prfConfig == null)
            return;

        WebView wv = findViewById(R.id.wv_welcome);
//        wv.addJavascriptInterface(new WebViewJavaScriptInterface(this), "AndroidInterface");
        reloadWeb(clientext, wv, this, AssetHelper.Act_Album);
    }

    public static void reloadWeb(AlbumContext singl, WebView wv, Activity act, int webId) {
        if (singl == null || singl.tier == null || singl.tier.client == null)
            return;

        SessionClient client = singl.tier.client;
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
                    String script = f("loadAlbum('%s', '%s', {legacyPDF: true, platform: 'android'});",
                                      client.ssInfo().uid(), pswd);
                    Utils.warn("\n[Load page script]: %s", script);
                    // https://www.techyourchance.com/communication-webview-javascript-android/
                    wv.evaluateJavascript(script, null);
                }
            }
        });
        String albumweb = AssetHelper.url4intent(act, webId);

        // E.g. albumweb = "http://192.168.0.3:8888/index.html?serv=info";
        if (verbose) Utils.logi("\n\nLoading home page: %s", albumweb);
        wv.loadUrl(albumweb);
    }

    /**
     * Note: Keep this method - will be implemented with UI elements in the future?
     *
     * @param template string template, R.string.id
     * @param args     for String.format()
     */
    void showDlg(int template, Object... args) {
        String msg = getString(template);
        if (msg != null && len(args) > 0) {
            msg = str(msg, args);
        }
        new ComfirmDlg()
                .dlgMsg(0, 0)
                .msg(msg)
                .onOk((dialog, id) -> {
                    dialog.dismiss();
                })
                .showDlg(this, "")
                .live(8000);
    }
    void showStatus(int template, Object... args) {
        runOnUiThread(() -> {
            String templ = getString(template);
            if (templ != null && len(args) > 0) {
                String msg = str(templ, args);
                msgv.setText(msg);
                msgv.setVisibility(View.VISIBLE);
            }
        });
    }

    void showStatus(String msg) {
        runOnUiThread(() -> {
            if (msg != null && len(msg) > 0) {
                msgv.setText(msg);
                msgv.setVisibility(View.VISIBLE);
            }
        });
    }

    void clearStatus() {
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
        } else if (id == R.id.menu_help) {
            startHelpAct(AssetHelper.Act_Help);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    protected void startPrefsAct() {
        clearStatus();
        prefStarter.launch(new Intent(WelcomeAct.this, PrefsContentActivity.class));
    }

    /**
     * <a href="https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory">
     *     Grant accessing directory, Android Developer</a><br/>
     * <a href="https://developer.android.com/training/data-storage/shared/documents-files#persist-permissions">
     *     Persist permission, Android Developer</a>
     *
     * @param result user's selection
     */
    protected void onMediasPicked(@NonNull ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ArrayList<AndroidFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
                if (clientext.tier == null) {
                    clearStatus();
                    showDlg(R.string.txt_please_login);
                }
                else ((PhotoSyntier)clientext.tier
                        .fileProvider(new IFileProvider() {
                            // private String saveFolder;

                            @Override
                            public long meta(IFileDescriptor fd) throws IOException {
                                if (fd == null || !(fd instanceof AndroidFile))
                                    throw new IOException("Doc descriptor be a non-null AndroidFile instance.");

                                AndroidFile f = (AndroidFile) fd;
                                File file = new File(f.fullpath());
                                f.size = file.length();
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    BasicFileAttributes attr = Files.readAttributes(file.toPath(), BasicFileAttributes.class);

                                    FileTime d = attr.creationTime();
                                    f.cdate(d);
                                } else {
                                    Date d = new Date(file.lastModified());
                                    f.cdate(d);
                                }
                                return f.size;
                            }

                            @Override
                            public InputStream open(IFileDescriptor f) throws IOException {
                                // return Files.newInputStream(Paths.get(f.fullpath()));
                                return new FileInputStream(new File(f.fullpath()));
                            }
                        }))
                        .asyVideos(prfConfig.template(), list,
                                (r, rx, seq, total, rsp) -> showStatus(R.string.msg_templ_progress,
                                        r, rx, total, (float) seq / total * 100),
                                (resps) -> {
                                    clearStatus();
                                    int[] nums = Doclientier.parseErrorCodes(resps);
                                    showDlg(R.string.t_synch_ok, nums[0], nums[1], nums[2]); },
                                (c, err, args) -> {
                                    if (c == AnsonMsg.MsgCode.ext) {
                                        errCtx.prepare(msgv, R.string.msg_err_duplicate);
                                        err(null, getString(R.string.msg_err_duplicate), args); // show it
                                    }
                                    else {
                                        errCtx.prepare(msgv, R.string.msg_upload_failed);
                                        err(null, getString(R.string.msg_upload_failed), err, args == null ? null : args[0]); // show it
                                    }
                                });

                WebView wv = findViewById(R.id.wv_welcome);
                wv.reload();
            }
        } catch (AnsonException e) {
            e.printStackTrace();
            errCtx.prepare(msgv, R.string.msg_upload_failed)
                    .err(null, e.getMessage(), e.getClass().getName());
        }
    }

    void onFilesPicked(ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                DeviceHelper.init(errCtx);
                ClipData clipData = data.getClipData();
                ArrayList<IFileDescriptor> paths;

                if (clipData != null) {
                    if (verbose) for (int i = 0; i < clipData.getItemCount(); i++)
                        Utils.logi("[AlbumContext.verbose] URI: %s", clipData.getItemAt(i).getUri());
                    paths = getMultipleDocs(this, clientext.userInf.device, clipData);
                    if (verbose) Utils.logi(paths);
                } else {
                    if (verbose) {
                        Utils.logi("[AlbumContext.verbose] URI: %s\nPath: %s",
                                String.valueOf(data.getData()),
                                getDocDescript(this, clientext.userInf.device, data.getData(),
                                                       Build.VERSION.SDK_INT));
                        errCtx.prepare(msgv, R.string.msg_upload_failed)
                                .err(null, "URI: %s\nPath: %s",
                                    String.valueOf(data.getData()),
                                    getDocDescript(this, clientext.userInf.device,
                                                   data.getData(), Build.VERSION.SDK_INT).fullpath());
                    }
                    paths = new ArrayList<>(1);
                    paths.add(getDocDescript(this, clientext.userInf.device, data.getData(), Build.VERSION.SDK_INT));
                }

                if (clientext.tier == null) {
                    clearStatus();
                    showDlg(R.string.txt_please_login);
                }
                else {
                    ((PhotoSyntier)clientext.tier
                        .fileProvider(new IFileProvider() {
                            // private String saveFolder;
                            // https://developer.android.com/training/data-storage/shared/documents-files#examine-metadata
                            @Override
                            public long meta(IFileDescriptor fd) throws IOException {
                                if (fd == null || !(fd instanceof AndroidFile))
                                    throw new IOException("Doc descriptor be a non-null AndroidFile instance.");

                                AndroidFile f = (AndroidFile) fd;
                                Uri returnUri = f.contentUri();

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

                                    if (isblank(f.folder()))
                                        f.folder(DateFormat.formatYYmm(lastmodify));
                                    return f.size;
                                }
                            }
                            // https://developer.android.com/training/data-storage/shared/documents-files#input_stream
                            @Override
                            public InputStream open(IFileDescriptor p) throws FileNotFoundException {
                                return getContentResolver().openInputStream(((AndroidFile) p).contentUri());
                            }
                        }))
                        .asyVideos(prfConfig.template(),
                            paths,
                            (r, rx, seq, total, rsp) -> showStatus(
                                    R.string.msg_templ_progress,
                                    r, rx, total, (float) seq / total * 100),
                            (resps) -> {
                                    // clearStatus();
                                    int[] nums = Doclientier.parseErrorCodes(resps);
                                    showDlg(R.string.t_synch_ok, nums[0], nums[1], nums[2]);
                                    if (nums[0] > 0)
                                        clearStatus();
                            },
                            (c, err, args) -> {
                                if (c == AnsonMsg.MsgCode.ext) {
                                    errCtx.prepare(msgv, R.string.msg_err_duplicate);
                                    err(null, getString(R.string.msg_err_duplicate), args); // show it
                                }
                                else {
                                    errCtx.prepare(msgv, R.string.msg_upload_failed);
                                    err(null, getString(R.string.msg_upload_failed), args); // show it
                                }
                            });
                }

                WebView wv = findViewById(R.id.wv_welcome);
                wv.reload();
            }
        } catch (AnsonException | IOException e) {
            e.printStackTrace();
            errCtx.prepare(msgv, R.string.msg_upload_failed)
                    .err(null, e.getMessage(), e.getClass().getName());
        }
    }

    protected void startPickMedia(Class<? extends BaseActivity> act) {
        clearStatus();

        Intent intt = new Intent(this, act);
        intt.putExtra(Constant.MAX_NUMBER, 99);
        intt.putExtra(IS_NEED_FOLDER_LIST, true);
        intt.putExtra(Constant.PickingMode,
                clientext.state() == ConnState.Disconnected ?
                        PickingMode.disabled : PickingMode.limit99);

        prfConfig.currentTemplate = new ExpSyncDoc()
                .share(clientext.userInf.uid(), ShareFlag.publish.name(), new Date())
                .device(clientext.userInf.device);

        pickMediaStarter.launch(intt);
    }

    /**
     * Start help activities, etc.
     */
    protected void startHelpAct(int action) {
        Intent intent = new Intent(this, WebAlbumAct.class);
        intent.putExtra(Web_Intent_id, action);
        webHelpStarter.launch(intent);
    }

    @Override
    public void onClick(@NonNull View v) {
        int id = v.getId();
        if (id == R.id.btn_pick_image)
            startPickMedia(ImagePickActivity.class);
        else if (id == R.id.btn_pick_video)
            startPickMedia(VideoPickActivity.class);
        else if (id == R.id.btn_pick_audio)
            startPickMedia(AudioPickActivity.class);
        else if (id == R.id.btn_pick_file) {
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

            // Notes MVP:
            // file picking currently has no such an activity like ImagePickAdapter, hence no getTemplate() implementateion
            // prfConfig.using(act);
            prfConfig.currentTemplate = new ExpSyncDoc()
                    .share(clientext.userInf.uid(), ShareFlag.prv.name(), new Date())
                    .device(clientext.userInf.device);

            pickFileStarter.launch(intent);
        }
    }

    @Override
    public void err(AnsonMsg.MsgCode ok, String msg, String... args) {
        runOnUiThread(() -> {
            String m = msg;
            try { m = f(msg, (Object[])args); } catch (Exception e) {}
            msgv.setText(m);
            msgv.setVisibility(View.VISIBLE);
        });
    }
}
