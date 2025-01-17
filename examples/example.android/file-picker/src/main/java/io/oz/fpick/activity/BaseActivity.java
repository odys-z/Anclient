/**
 * Created by Ody
 * Credits to Vincent Woo
 */
package io.oz.fpick.activity;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.str;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.FolderListHelper;
import com.vincent.filepicker.filter.entity.Directory;
import com.vincent.filepicker.filter.entity.ImageFile;

import java.util.ArrayList;
import java.util.List;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsException;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.PickingMode;
import io.oz.fpick.R;
import io.oz.fpick.adapter.BaseSynchronizer;
import io.oz.fpick.filter.FileFilterx;

/**
 * @since 0.3.0, no longer uses easypermissions, as per the similar reports.
 * <a href="https://github.com/googlesamples/easypermissions/issues/231">[1]</a>,
 * <a href='https://github.com/googlesamples/easypermissions/issues/233'>[2]</a> and the close decision.
 *
 * <h4>Debug Memo:</h4>
 *
 * For Andoriod Studio complains errors like
 * <pre>
 *     Class must either be declared abstract or implement abstract method
 *     addMenuProvider (MenuProvider, LifecycleOwner, State) in MenuHost
 * </pre>
 *
 * see <a href="https://stackoverflow.com/questions/50714060/errors-in-the-ide-but-project-running-successfully">
 * Errors in the IDE but project Running Successfully</a>
 */
public abstract class BaseActivity extends FragmentActivity
        implements JProtocol.OnError, IProgressBarAct {

    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";
    public static final String IS_NEED_CAMERA = "IsNeedCamera";

    private static final int RC_READ_EXTERNAL_STORAGE = 123;
    public  static final String IS_NEED_FOLDER_LIST = "isNeedFolderList";

    protected static ExpSyncDoc template;

    public static ExpSyncDoc getTemplate () throws DocsException {
        if (template == null)
            throw new DocsException(0, "Template must be initialized by subclasses.");
        return template;
    }

    protected FolderListHelper mFolderHelper;
    protected boolean isNeedFolderList;

    private BaseSynchronizer<?, ?> mAdapter;
    /** file pattern */
    protected String[] mSuffix;
    protected FileFilterx filefilter;
    protected List<Directory<AndroidFile>> mAll;
    protected boolean isTakenAutoSelected;

    PickingMode pickmode = PickingMode.disabled;
    protected int fileType;
    private TextView tv_count;
    private TextView tv_folder;
    private LinearLayout ll_folder;
    private RelativeLayout rl_done;
    private RelativeLayout tb_pick;

    protected void linkAdapter(int adaptye, BaseSynchronizer<?, ?> adapter) {
        this.fileType = adaptye;
        mAdapter = adapter;

        tv_count = findViewById(R.id.tv_count);
        tv_count.setText(mAdapter.allowingTxt());

        rl_done = findViewById(R.id.rl_done);
        rl_done.setOnClickListener(v -> {
            Intent intent = new Intent();
            intent.putParcelableArrayListExtra(Constant.RESULT_Abstract, mAdapter.selections());
            setResult(RESULT_OK, intent);
            finish();
        });

        if (pickmode == PickingMode.disabled)
            rl_done.setVisibility(View.GONE);
        else
            rl_done.setVisibility(View.VISIBLE);

        tb_pick = findViewById(R.id.tb_pick);
        ll_folder = findViewById(R.id.ll_folder);
        if (isNeedFolderList) {
            ll_folder.setVisibility(View.VISIBLE);
            ll_folder.setOnClickListener(v -> mFolderHelper.toggle(tb_pick));
            tv_folder = findViewById(R.id.tv_folder);
            tv_folder.setText(getResources().getString(R.string.vw_all));

            mFolderHelper.setFolderListListener(directory -> {
                mFolderHelper.toggle(tb_pick);
                tv_folder.setText(directory.getName());

                if (TextUtils.isEmpty(directory.getPath())) //All
                    mAdapter.loadirs(mAll);
                else
                    for (Directory<AndroidFile> dir : mAll)
                        if (dir.getPath().equals(directory.getPath())) {
                            List<Directory<AndroidFile>> list = new ArrayList<>();
                            list.add(dir);
                            mAdapter.loadirs(list);
                            break;
                        }
            });
        }
    }

    void permissionGranted() {
        loadData(fileType, mSuffix);
    }


    /**
     * <p>Load files according to the directory list.</p>
     *
     * This method will trigger callback handling in {@link io.oz.fpick.filter.FileLoaderCallbackx},
     * by calling {@link FileFilterx#filter(FragmentActivity, String...)}.
     *
     * @param t
     * @param suffix
     */
    protected void loadData(int t, String[] suffix) {
        if (filefilter == null)
            filefilter = new FileFilterx(t, directories -> {
                // Refresh folder list
                if (isNeedFolderList) {
                    // FIXME performance issue
                    ArrayList<Directory> list = new ArrayList<>();
                    Directory all = new Directory();
                    all.setName(getResources().getString(R.string.vw_all));
                    list.add(all);
                    list.addAll(directories);
                    mFolderHelper.fillData(list);
                }

                mAll = directories;
                mAdapter.loadirs(directories);
            });
        filefilter.filter(this, suffix);
    }

    /*
     * mAdapter.mFilepath is never be set a value?
    protected boolean markTakenFiles(List<AndroidFile> list) {
        for (AndroidFile imageFile : list) {
            if (imageFile.fullpath().equals(mAdapter.mFilepath)) {
                mSelectedList.add(imageFile);
                mCurrentNumber++;
                mAdapter.setCurrentNumber(mCurrentNumber);
                tv_count.setText(mCurrentNumber + "/" + mMaxNumber);

                return true;   // taken image was found and added
            }
        }
        return false;    // taken image wasn't found
    }
     */

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AlbumContext.getInstance(this); // set error context

        Intent intt = getIntent();
        isNeedFolderList = intt.getBooleanExtra(IS_NEED_FOLDER_LIST, false);
        isTakenAutoSelected = intt.getBooleanExtra(IS_TAKEN_AUTO_SELECTED, true);
        pickmode = (PickingMode) intt.getSerializableExtra(Constant.PickingMode);

        if (isNeedFolderList) {
            mFolderHelper = new FolderListHelper();
            mFolderHelper.initFolderListView(this);
        }
    }

    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        readExternalStorage();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED)
            permissionGranted();
    }

    /**
     * Read external storage file
     */
    private void readExternalStorage() {
        for (String p : permissions())
            if (ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_DENIED) {
                ActivityCompat.requestPermissions(this, permissions(), RC_READ_EXTERNAL_STORAGE);
                return;
            }

        permissionGranted();
    }

    public static String[] storage_permissions = {
            // Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE
    };

    @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
    public static String[] storage_permissions_33 = {
            Manifest.permission.READ_MEDIA_IMAGES,
            Manifest.permission.READ_MEDIA_AUDIO,
            Manifest.permission.READ_MEDIA_VIDEO
    };
    protected String[] permissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return storage_permissions_33;
        } else {
            return storage_permissions;
        }
    }

    public void onBackClick(View view) {
        finish();
    }

    @Override
    public void err(AnsonMsg.MsgCode c, String msg, String... args) {
        runOnUiThread( () -> {
            // TODO report errors in a user's dialog...
            String m = f("Error: type: %s, args: %s", msg, str(args));
            Toast.makeText(getApplicationContext(), m, Toast.LENGTH_LONG).show();
        } );
    }

    /**
     * Show progress bar.
     * @param of current index
     * @param all all blocks
     */
    @Override
    public void onStartingJserv(int of, int all) {
        ProgressBar b = findViewById(R.id.pb_video_pick);
        if (b != null) runOnUiThread(() -> b.setVisibility(View.VISIBLE));
    }

    @Override
    public void onEndingJserv(String resName) {
        ProgressBar b = findViewById(R.id.pb_video_pick);
        if (b != null) runOnUiThread(() -> b.setVisibility(View.GONE));
    }

    public void onselect(AndroidFile file) {
        tv_count.setText(mAdapter.allowingTxt());
    }
}
