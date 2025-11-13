package io.oz.fpick.activity;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_VIDEO;

import android.Manifest;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerGridItemDecoration;

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
//        if (template == null)
//            template = new ExpSyncDoc().shareflag(ShareFlag.publish.name());
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

    protected String[] permissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            return new String[]{Manifest.permission.READ_MEDIA_VIDEO};
        else
            return storage_permissions;
    }
}
