package io.oz.fpick.activity;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_VIDEO;

import android.Manifest;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerGridItemDecoration;

import java.util.ArrayList;

import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.R;
import io.oz.fpick.adapter.VideoPickAdapter;

/**
 * Created by Ody Zhou
 * 20 Feb, 2022
 *
 * Credits to Vincent Woo
 */

public class VideoPickActivity extends BaseActivity {
    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";

    public static final int DEFAULT_MAX_NUMBER = 9;
    public static final int COLUMN_NUMBER = 3;

    public VideoPickActivity () {
        super();
        if (template == null)
            template = new ExpSyncDoc().shareflag(ShareFlag.publish.name());
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_video_pick);

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        mSuffix = new String[] {"avi", "mp4", "mpeg", "ogv", "ts", "webm", "3gp", "3g2"};

        int maxitems = getIntent().getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
        boolean isNeedCamera = getIntent().getBooleanExtra(IS_NEED_CAMERA, false);
        isTakenAutoSelected = getIntent().getBooleanExtra(IS_TAKEN_AUTO_SELECTED, true);

        RecyclerView mRecyclerView = findViewById(R.id.rv_video_pick);
        GridLayoutManager layoutManager = new GridLayoutManager(this, COLUMN_NUMBER);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerGridItemDecoration(this));

        VideoPickAdapter adapter = new VideoPickAdapter(this, isNeedCamera, maxitems);
        mRecyclerView.setAdapter(adapter);
        linkAdapter(TYPE_VIDEO, adapter);

    }

    /**
     * @deprecated  test only
     *
     * @return
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            collection = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL);
        }else{
            collection = MediaStore.Files.getContentUri("external");
        }


        try (Cursor cursor = getContentResolver().query(collection, projection, selection, selectionArgs, sortOrder)) {
            assert cursor != null;

            if (cursor.moveToFirst()) {
                int columnData = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATA);
                do {
                    pdfList.add((cursor.getString(columnData)));
                    Log.d("TAG", "getPdf: " + cursor.getString(columnData));
                    //you can get your pdf files
                } while (cursor.moveToNext());
            }
        }
        return pdfList;
    }
     */

    protected String[] permissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            return new String[]{Manifest.permission.READ_MEDIA_VIDEO};
        else
            return storage_permissions;
    }
}
