//package com.vincent.filepicker.activity;
//
//import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_IMAGE;
//
//import android.content.Intent;
//import android.os.Bundle;
//import android.text.TextUtils;
//import android.util.Log;
//import android.view.View;
//import android.widget.TextView;
//import android.widget.Toast;
//
//import androidx.annotation.NonNull;
//import androidx.annotation.Nullable;
//import androidx.fragment.app.FragmentActivity;
//
//import com.vincent.filepicker.FolderListHelper;
//import com.vincent.filepicker.filter.entity.Directory;
//
//import java.io.File;
//import java.util.ArrayList;
//import java.util.List;
//
//import io.odysz.semantic.jprotocol.AnsonMsg;
//import io.odysz.semantic.jprotocol.JProtocol;
//import io.oz.albumtier.AlbumContext;
//import io.oz.fpick.AndroidFile;
//import io.oz.fpick.R;
//import io.oz.fpick.adapter.BaseSynchronizer;
//import io.oz.fpick.filter.FileFilterx;
//import pub.devrel.easypermissions.AfterPermissionGranted;
//import pub.devrel.easypermissions.AppSettingsDialog;
//import pub.devrel.easypermissions.EasyPermissions;
//
///**
// * Created by Vincent Woo
// * Date: 2016/10/12
// * Time: 16:21
// */
//
//public abstract class BaseActivity extends FragmentActivity implements EasyPermissions.PermissionCallbacks, JProtocol.OnError {
//    public static final String SUFFIX = "Suffix";
//    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";
//
//    private static final int RC_READ_EXTERNAL_STORAGE = 123;
//    private static final String TAG = BaseActivity.class.getName();
//    public  static final String IS_NEED_FOLDER_LIST = "isNeedFolderList";
//
//    protected FolderListHelper mFolderHelper;
//    protected boolean isNeedFolderList;
//
//    public ArrayList<AndroidFile> mSelectedList = new ArrayList<AndroidFile>();
//    protected BaseSynchronizer mAdapter;
//    protected FileFilterx filefilter;
//    protected List<Directory<AndroidFile>> mAll;
//    protected boolean isTakenAutoSelected;
//
//    private int mCurrentNumber = 0;
//    protected int mMaxNumber;
//    private TextView tv_count;
//
////    abstract void permissionGranted();
//    void permissionGranted() {
//        loadData(TYPE_IMAGE);
//    }
//
//    protected void loadData(int t, String... suffix) {
//        if (filefilter == null)
//            filefilter = new FileFilterx(t, directories -> {
//                // Refresh folder list
//                if (isNeedFolderList) {
//                    ArrayList<Directory> list = new ArrayList<>();
//                    Directory all = new Directory();
//                    all.setName(getResources().getString(R.string.vw_all));
//                    list.add(all);
//                    list.addAll(directories);
//                    mFolderHelper.fillData(list);
//                }
//
//                mAll = directories;
//                refreshDirs(directories);
//            });
//        filefilter.filter(this, suffix);
//    }
//
//    protected void refreshDirs(List<Directory<AndroidFile>> directories) {
//        boolean tryToFindTakenImage = isTakenAutoSelected;
//
//        // if auto-selecting taken files is enabled, make sure requirements are met
//        if (tryToFindTakenImage && !TextUtils.isEmpty(mAdapter.mFilepath)) {
//            File takenImageFile = new File(mAdapter.mFilepath);
//            tryToFindTakenImage = !mAdapter.isUpToMax() && takenImageFile.exists(); // try to select taken image only if max isn't reached and the file exists
//        }
//
//        List<AndroidFile> list = new ArrayList<>();
//        for (Directory<AndroidFile> directory : directories) {
//            List<AndroidFile> l = directory.getFiles();
//            list.addAll(l);
//
//            // auto-select taken images?
//            if (tryToFindTakenImage) {
//                // findAndAddTakenImage(directory.getFiles());   // if taken image was found, we're done
//                findAndAddTakenFiles(l);
//            }
//        }
//
//        // So that's why max number is 9?
//        for (AndroidFile file : mSelectedList) {
//            int index = list.indexOf(file);
//            if (index != -1) {
//                list.get(index).setSelected(true);
//            }
//        }
//        mAdapter.refresh(list);
//    }
//
//    private boolean findAndAddTakenFiles(List<AndroidFile> list) {
//        for (AndroidFile imageFile : list) {
//            if (imageFile.fullpath().equals(mAdapter.mFilepath)) {
//                mSelectedList.add(imageFile);
//                mCurrentNumber++;
//                mAdapter.setCurrentNumber(mCurrentNumber);
//                tv_count.setText(mCurrentNumber + "/" + mMaxNumber);
//
//                return true;   // taken image was found and added
//            }
//        }
//        return false;    // taken image wasn't found
//    }
//    @Override
//    protected void onCreate(@Nullable Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//
//        AlbumContext.getInstance(this); // set error context
//
//        isNeedFolderList = getIntent().getBooleanExtra(IS_NEED_FOLDER_LIST, false);
//        isTakenAutoSelected = getIntent().getBooleanExtra(IS_TAKEN_AUTO_SELECTED, true);
//        if (isNeedFolderList) {
//            mFolderHelper = new FolderListHelper();
//            mFolderHelper.initFolderListView(this);
//        }
//    }
//
//    @Override
//    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
//        super.onPostCreate(savedInstanceState);
//        readExternalStorage();
//    }
//
//    @Override
//    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
//        // Forward results to EasyPermissions
//        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
//    }
//
//    /**
//     * Read external storage file
//     */
//    @AfterPermissionGranted(RC_READ_EXTERNAL_STORAGE)
//    private void readExternalStorage() {
//        boolean isGranted = EasyPermissions.hasPermissions(this, "android.permission.READ_EXTERNAL_STORAGE");
//        if (isGranted) {
//            permissionGranted();
//        } else {
//            EasyPermissions.requestPermissions(this, getString(R.string.vw_rationale_storage),
//                    RC_READ_EXTERNAL_STORAGE, "android.permission.READ_EXTERNAL_STORAGE");
//        }
//    }
//
//    @Override
//    public void onPermissionsGranted(int requestCode, List<String> perms) {
//        Log.d(TAG, "onPermissionsGranted:" + requestCode + ":" + perms.size());
//        permissionGranted();
//    }
//
//    @Override
//    public void onPermissionsDenied(int requestCode, List<String> perms) {
//        Log.d(TAG, "onPermissionsDenied:" + requestCode + ":" + perms.size());
//        // If Permission permanently denied, ask user again
//        if (EasyPermissions.somePermissionPermanentlyDenied(this, perms)) {
//            new AppSettingsDialog.Builder(this).build().show();
//        } else {
//            finish();
//        }
//    }
//
//    @Override
//    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
//        super.onActivityResult(requestCode, resultCode, data);
//
//        if (requestCode == AppSettingsDialog.DEFAULT_SETTINGS_REQ_CODE) {
//            // Do something after user returned from app settings screen, like showing a Toast.
//            if (EasyPermissions.hasPermissions(this, "android.permission.READ_EXTERNAL_STORAGE")) {
//                permissionGranted();
//            } else {
//                finish();
//            }
//        }
//    }
//
//    public void onBackClick(View view) {
//        finish();
//    }
//
//    @Override
//    public void err(AnsonMsg.MsgCode c, String msg, String... args) {
//        runOnUiThread( () -> {
//            String m = String.format("Error: type: %s, args: %s", msg, args);
//            Toast.makeText(getApplicationContext(), m, Toast.LENGTH_LONG).show();
//        } );
//    }
//}
