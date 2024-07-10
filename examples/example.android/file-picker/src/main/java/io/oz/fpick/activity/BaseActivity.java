/**
 * Created by Ody
 *
 * Credits to Vincent Woo
 */
package io.oz.fpick.activity;

import android.content.Intent;
import android.graphics.drawable.AnimationDrawable;
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
import androidx.fragment.app.FragmentActivity;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.FolderListHelper;
import com.vincent.filepicker.filter.entity.Directory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.PickingMode;
import io.oz.fpick.R;
import io.oz.fpick.adapter.BaseSynchronizer;
import io.oz.fpick.filter.FileFilterx;
import pub.devrel.easypermissions.AfterPermissionGranted;
import pub.devrel.easypermissions.AppSettingsDialog;
import pub.devrel.easypermissions.EasyPermissions;

public abstract class BaseActivity extends FragmentActivity
        implements EasyPermissions.PermissionCallbacks, JProtocol.OnError, IProgressBarAct {

    public interface OnSelectStateListener {
        void onSelectStateChanged(int position, boolean state, AndroidFile file, View animation );
    }

    // public static final String SUFFIX = "Suffix";
    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";
    public static final String IS_NEED_CAMERA = "IsNeedCamera";

    private static final int RC_READ_EXTERNAL_STORAGE = 123;
//    private static final String TAG = BaseActivity.class.getName();
    public  static final String IS_NEED_FOLDER_LIST = "isNeedFolderList";

    protected FolderListHelper mFolderHelper;
    protected boolean isNeedFolderList;

    public ArrayList<AndroidFile> mSelectedList = new ArrayList<>();
    private BaseSynchronizer mAdapter;
    /** file pattern */
    protected String[] mSuffix;
    protected FileFilterx filefilter;
    protected List<Directory<AndroidFile>> mAll;
    protected boolean isTakenAutoSelected;

    PickingMode pickmode = PickingMode.disabled;
    protected int fileType;
    private int mCurrentNumber = 0;
    protected int mMaxNumber;
    private TextView tv_count;
    private TextView tv_folder;
    private LinearLayout ll_folder;
    private RelativeLayout rl_done;
    private RelativeLayout tb_pick;

    protected void linkAdapter(int adaptye, BaseSynchronizer adapter) {
        this.fileType = adaptye;
        tv_count = findViewById(R.id.tv_count);
        tv_count.setText(mCurrentNumber + "/" + mMaxNumber);

        mAdapter = adapter;

        mAdapter.selectListener((position, state, file, animation) -> {
            if (state) {
                mSelectedList.add(file);
                mCurrentNumber++;
                animation.setAlpha ( 1f );
                animation.setVisibility ( View.VISIBLE );

                AnimationDrawable animationDrawable = (AnimationDrawable) animation.getBackground ();
                // Animation a = AnimationUtils.loadAnimation ( getApplicationContext (),R.anim.rotate_animation );
                animationDrawable.start ();
            } else {
                mSelectedList.remove(file);
                mCurrentNumber--;
                animation.setAlpha ( 0f );
                animation.setVisibility ( View.GONE );
            }
            tv_count.setText(mCurrentNumber + "/" + mMaxNumber);
        });

        rl_done = findViewById(R.id.rl_done);
        rl_done.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent();
                intent.putParcelableArrayListExtra(Constant.RESULT_Abstract, mSelectedList);
                setResult(RESULT_OK, intent);
                finish();
            }
        });

        if (pickmode == PickingMode.disabled) {
            mMaxNumber = 0;
            rl_done.setVisibility(View.GONE);
        }
        else {
            mMaxNumber = 99;
            rl_done.setVisibility(View.VISIBLE);
        }

        tb_pick = findViewById(R.id.tb_pick);
        ll_folder = findViewById(R.id.ll_folder);
        if (isNeedFolderList) {
            ll_folder.setVisibility(View.VISIBLE);
            ll_folder.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    mFolderHelper.toggle(tb_pick);
                }
            });
            tv_folder = (TextView) findViewById(R.id.tv_folder);
            tv_folder.setText(getResources().getString(R.string.vw_all));

            mFolderHelper.setFolderListListener(directory -> {
                mFolderHelper.toggle(tb_pick);
                tv_folder.setText(directory.getName());

                if (TextUtils.isEmpty(directory.getPath())) //All
                    loadirs(mAll);
                else
                    for (Directory<AndroidFile> dir : mAll)
                        if (dir.getPath().equals(directory.getPath())) {
                            List<Directory<AndroidFile>> list = new ArrayList<>();
                            list.add(dir);
                            loadirs(list);
                            break;
                        }
            });
        }
    }

    void permissionGranted() {
        loadData(fileType, mSuffix);
    }

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
                loadirs(directories);
            });
        filefilter.filter(this, suffix);
    }

    protected void loadirs(List<Directory<AndroidFile>> directories) {
        List<AndroidFile> list = mergeDirs(directories, isTakenAutoSelected);

        // max number is limited
        for (AndroidFile file : mSelectedList) {
            int index = list.indexOf(file);
            if (index != -1) {
                list.get(index).setSelected(true);
            }
        }
        mAdapter.refreshSyncs(list);
    }

    private List<AndroidFile> mergeDirs(List<Directory<AndroidFile>> directories, boolean tryToFindTakenImage) {
        // boolean tryToFindTakenImage = isTakenAutoSelected;
        if (tryToFindTakenImage && !TextUtils.isEmpty(mAdapter.mFilepath)) {
            File takenImageFile = new File(mAdapter.mFilepath);
            // try to select taken image only if max isn't reached and the file exists
            tryToFindTakenImage = !mAdapter.isUpToMax() && takenImageFile.exists();
        }

        List<AndroidFile> lst = new ArrayList<>();
        for (Directory<AndroidFile> directory : directories) {
            List<AndroidFile> l = directory.getFiles();
            lst.addAll(l);

            // auto-select taken images?
            if (tryToFindTakenImage) {
                // if taken image was found, we're done
                markTakenFiles(l);
            }
        }
        return lst;
    }

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
        // Forward results to EasyPermissions
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    /**
     * Read external storage file
     */
    @AfterPermissionGranted(RC_READ_EXTERNAL_STORAGE)
    private void readExternalStorage() {
        boolean isGranted = EasyPermissions.hasPermissions(this, "android.permission.READ_EXTERNAL_STORAGE");
        if (isGranted) {
            permissionGranted();
        } else {
            EasyPermissions.requestPermissions(this, getString(R.string.vw_rationale_storage),
                    RC_READ_EXTERNAL_STORAGE, "android.permission.READ_EXTERNAL_STORAGE");
        }
    }

    @Override
    public void onPermissionsGranted(int requestCode, List<String> perms) {
        // Log.d(TAG, "onPermissionsGranted:" + requestCode + ":" + perms.size());
        // Utils.logi("onPermissionsGranted: %s : %s", requestCode, perms.size());
        permissionGranted();
    }

    @Override
    public void onPermissionsDenied(int requestCode, List<String> perms) {
        // Log.d(TAG, "onPermissionsDenied:" + requestCode + ":" + perms.size());
        // Utils.logi("onPermissionsDenied: %s : %s", requestCode, perms.size());

        // If Permission permanently denied, ask user again
        if (EasyPermissions.somePermissionPermanentlyDenied(this, perms)) {
            new AppSettingsDialog.Builder(this).build().show();
        } else {
            finish();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == AppSettingsDialog.DEFAULT_SETTINGS_REQ_CODE) {
            // Do something after user returned from app settings screen, like showing a Toast.
            if (EasyPermissions.hasPermissions(this, "android.permission.READ_EXTERNAL_STORAGE")) {
                permissionGranted();
            } else {
                finish();
            }
        }
    }

    public void onBackClick(View view) {
        finish();
    }

    @Override
    public void err(AnsonMsg.MsgCode c, String msg, String... args) {
        runOnUiThread( () -> {
            String m = String.format("Error: type: %s, args: %s", msg, args);
            Toast.makeText(getApplicationContext(), m, Toast.LENGTH_LONG).show();
        } );
    }

    @Override
    public void onStartingJserv(int of, int all) {
        ProgressBar b = (ProgressBar) findViewById(R.id.pb_video_pick);
        if (b != null) runOnUiThread(() -> b.setVisibility(View.VISIBLE));
    }

    @Override
    public void onEndingJserv(String resName) {
        ProgressBar b = (ProgressBar) findViewById(R.id.pb_video_pick);
        if (b != null) runOnUiThread(() -> b.setVisibility(View.GONE));
    }
}
