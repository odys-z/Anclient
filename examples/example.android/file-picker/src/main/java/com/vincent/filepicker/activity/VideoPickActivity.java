package com.vincent.filepicker.activity;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_VIDEO;

import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerGridItemDecoration;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

import io.odysz.common.Utils;
import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.adapter.VideoPickAdapter;

/**
 * Modified by Ody Zhou
 * 20 Feb, 2022
 *
 * Created by Vincent Woo
 * Date: 2016/10/21
 * Time: 14:02
 */

public class VideoPickActivity extends BaseActivity {
    public static final String THUMBNAIL_PATH = "FilePick";
    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";

    public static final int DEFAULT_MAX_NUMBER = 9;
    public static final int COLUMN_NUMBER = 3;
//    private int mMaxNumber;
//    private int mCurrentNumber = 0;
//    private RecyclerView mRecyclerView;
//    private VideoPickAdapter mAdapter;
//    private boolean isNeedCamera;
//    private boolean isTakenAutoSelected;
//    private ArrayList<VideoFile> mSelectedList = new ArrayList<>();
//    private List<Directory<VideoFile>> mAll;
//    private ProgressBar mProgressBar;

//    private TextView tv_count;
//    private TextView tv_folder;
//    private LinearLayout ll_folder;
//    private RelativeLayout rl_done;
//    private RelativeLayout tb_pick;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_video_pick);

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        mSuffix = new String[] {"avi", "mp4", "mpeg", "ogv", "ts", "webm", "3gp", "3g2"};

        mMaxNumber = getIntent().getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
        boolean isNeedCamera = getIntent().getBooleanExtra(IS_NEED_CAMERA, false);
        isTakenAutoSelected = getIntent().getBooleanExtra(IS_TAKEN_AUTO_SELECTED, true);

//        tv_count = (TextView) findViewById(R.id.tv_count);
//        tv_count.setText(mCurrentNumber + "/" + mMaxNumber);

        RecyclerView mRecyclerView = (RecyclerView) findViewById(R.id.rv_video_pick);
        GridLayoutManager layoutManager = new GridLayoutManager(this, COLUMN_NUMBER);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerGridItemDecoration(this));

        VideoPickAdapter adapter = new VideoPickAdapter(this, isNeedCamera, mMaxNumber);
        mRecyclerView.setAdapter(adapter);
        linkAdapter(TYPE_VIDEO, adapter);

//        copyFileToInternal(null);
//        getPdfList();

//        mAdapter.selectListener(new OnSelectStateListener<VideoFile>() {
//
//            @Override
//            public void OnSelectStateChanged (int position, boolean state , VideoFile file , View animation ) {
//                if (state) {
//                    mSelectedList.add(file);
//                    mCurrentNumber++;
//                    animation.setAlpha ( 1f );
//                    animation.setVisibility ( View.VISIBLE );
//
//                    AnimationDrawable animationDrawable = (AnimationDrawable)animation.getBackground ( );
//                    animationDrawable.start ();
//                } else {
//                    mSelectedList.remove(file);
//                    mCurrentNumber--;
//                    animation.setAlpha ( 0f );
//                    animation.setVisibility ( View.GONE );
//                }
//                tv_count.setText(mCurrentNumber + "/" + mMaxNumber);
//            }
//
//            @Override
//            public void onAudioStateChanged ( boolean state, VideoFile file, View animation ) { }
//
//            @Override
//            public void onFileStateChanged ( boolean state, VideoFile file, View animation ) { }
//        } );

//        mprogressbar = (progressbar) findviewbyid(r.id.pb_video_pick);
//        file folder = new file(getexternalcachedir().getabsolutepath() + file.separator + thumbnail_path);
//        if (!folder.exists()) {
//            mprogressbar.setvisibility(view.visible);
//        } else {
//            mprogressbar.setvisibility(view.gone);
//        }

//        rl_done = (relativelayout) findviewbyid(r.id.rl_done);
//        rl_done.setonclicklistener(new view.onclicklistener() {
//            @override
//            public void onclick(view v) {
//                intent intent = new intent();
//                // intent.putparcelablearraylistextra(constant.result_pick_video, mselectedlist);
//                intent.putparcelablearraylistextra(constant.result_abstract, mselectedlist);
//                setresult(result_ok, intent);
//                finish();
//            }
//        });
//
//        tb_pick = (RelativeLayout) findViewById(R.id.tb_pick);
//        ll_folder = (LinearLayout) findViewById(R.id.ll_folder);
//        if (isNeedFolderList) {
//            ll_folder.setVisibility(View.VISIBLE);
//            ll_folder.setOnClickListener(new View.OnClickListener() {
//                @Override
//                public void onClick(View v) {
//                    mFolderHelper.toggle(tb_pick);
//                }
//            });
//            tv_folder = (TextView) findViewById(R.id.tv_folder);
//            tv_folder.setText(getResources().getString(R.string.vw_all));
//
//            mFolderHelper.setFolderListListener(new FolderListAdapter.FolderListListener() {
//                @Override
//                public void onFolderListClick(Directory directory) {
//                    mFolderHelper.toggle(tb_pick);
//                    tv_folder.setText(directory.getName());
//
//                    if (TextUtils.isEmpty(directory.getPath())) { //All
//                        refreshVideoDirs(mAll);
//                    } else {
//                        for (Directory<VideoFile> dir : mAll) {
//                            if (dir.getPath().equals(directory.getPath())) {
//                                List<Directory<VideoFile>> list = new ArrayList<>();
//                                list.add(dir);
//                                refreshVideoDirs(list);
//                                break;
//                            }
//                        }
//                    }
//                }
//            });
//        }
    }

//    @Override
//    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
//        super.onActivityResult(requestCode, resultCode, data);
//        switch (requestCode) {
//            case Constant.REQUEST_CODE_TAKE_VIDEO:
//                if (resultCode == RESULT_OK) {
//                    Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
//                    File file = new File(mAdapter.mFilepath);
//                    Uri contentUri = Uri.fromFile(file);
//                    mediaScanIntent.setData(contentUri);
//                    sendBroadcast(mediaScanIntent);
//
//                    loadData();
//                }
//                break;
//        }
//    }

//    @Override
//    protected void refreshDirs(List<Directory<BaseFile>> directories) {
//        super.refreshDirs(directories);
//    }

//    private void loadData() {
//        FileFilterx.getVideos(this, new FilterResultCallback<VideoFile>() {
//            @Override
//            public void onResult(List<Directory<VideoFile>> directories) {
//                mProgressBar.setVisibility(View.GONE);
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
//                refreshVideoDirs(directories);
//            }
//        });
//    }

//    private void refreshVideoDirs(List<Directory<VideoFile>> directories) {
//        boolean tryToFindTaken = isTakenAutoSelected;
//
//        // if auto-select taken file is enabled, make sure requirements are met
//        if (tryToFindTaken && !TextUtils.isEmpty(mAdapter.mFilepath)) {
//            File takenFile = new File(mAdapter.mFilepath);
//            tryToFindTaken = !mAdapter.isUpToMax() && takenFile.exists(); // try to select taken file only if max isn't reached and the file exists
//        }
//
//        List<BaseFile> list = new ArrayList<>();
//        for (Directory<VideoFile> directory : directories) {
//            list.addAll(directory.getFiles());
//
//            // auto-select taken file?
//            if (tryToFindTaken) {
//                tryToFindTaken = findAndAddTaken(directory.getFiles());   // if taken file was found, we're done
//            }
//        }
//
//        for (VideoFile file : mSelectedList) {
//            int index = list.indexOf(file);
//            if (index != -1) {
//                list.get(index).setSelected(true);
//            }
//        }
//        mAdapter.refresh(list);
//    }
//
//    private boolean findAndAddTaken(List<VideoFile> list) {
//        for (VideoFile videoFile : list) {
//            if (videoFile.getPath().equals(mAdapter.mFilepath)) {
//                mSelectedList.add(videoFile);
//                mCurrentNumber++;
//                mAdapter.setCurrentNumber(mCurrentNumber);
//                tv_count.setText(mCurrentNumber + "/" + mMaxNumber);
//
//                return true;   // taken file was found and added
//            }
//        }
//        return false;    // taken file wasn't found
//    }

    private String copyFileToInternal(Uri fileUri) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            Cursor cursor = getContentResolver().query(MediaStore.Files.getContentUri("external"), new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE}, null, null);
            while(cursor.moveToFirst()) {
                String displayName = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME));
                long size = cursor.getLong(cursor.getColumnIndexOrThrow(OpenableColumns.SIZE));
                Utils.logi("%s, %s", displayName, size);
            }

//            String displayName = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME));
//            long size = cursor.getLong(cursor.getColumnIndexOrThrow(OpenableColumns.SIZE));
//
//            File file = new File(getFilesDir() + "/" + displayName);
//            try {
//                FileOutputStream fileOutputStream = new FileOutputStream(file);
//                InputStream inputStream = getContentResolver().openInputStream(fileUri);
//                byte buffers[] = new byte[1024];
//                int read;
//                while ((read = inputStream.read(buffers)) != -1) {
//                    fileOutputStream.write(buffers, 0, read);
//                }
//                inputStream.close();
//                fileOutputStream.close();
//                return file.getPath();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
        }
        return null;
    }

    /**
     * @deprecated  test only
     *
     * @return
     */
    protected ArrayList<String> getPdfList() {
        ArrayList<String> pdfList = new ArrayList<>();
        Uri collection;

        final String[] projection = new String[]{
                MediaStore.Files.FileColumns.DISPLAY_NAME,
                MediaStore.Files.FileColumns.DATE_ADDED,
                MediaStore.Files.FileColumns.DATA,
                MediaStore.Files.FileColumns.MIME_TYPE,
        };

        final String sortOrder = MediaStore.Files.FileColumns.DATE_ADDED + " DESC";

        final String selection = MediaStore.Files.FileColumns.MIME_TYPE + " = ?";

        final String mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension("pdf");
        final String[] selectionArgs = new String[]{mimeType};

        int v = Build.VERSION_CODES.JELLY_BEAN_MR2; // can multiple select

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            collection = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL);
        }else{
            collection = MediaStore.Files.getContentUri("external");
        }


        try (Cursor cursor = getContentResolver().query(collection, projection, selection, selectionArgs, sortOrder)) {
            assert cursor != null;

            if (cursor.moveToFirst()) {
                int columnData = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATA);
                int columnName = cursor.getColumnIndex(MediaStore.Files.FileColumns.DISPLAY_NAME);
                do {
                    pdfList.add((cursor.getString(columnData)));
                    Log.d("TAG", "getPdf: " + cursor.getString(columnData));
                    //you can get your pdf files
                } while (cursor.moveToNext());
            }
        }
        return pdfList;
    }
}
