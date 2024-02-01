package com.vincent.filepicker.activity;


import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_IMAGE;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerGridItemDecoration;

import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.adapter.ImagePickAdapter;

/**
 * Modified by Ody Zhou
 * Date 2022/02/11
 *
 * Created by Vincent Woo
 * Date: 2016/10/12
 * Time: 16:41
 */

public class ImagePickActivity extends BaseActivity {
    public static final String IS_NEED_CAMERA = "IsNeedCamera";
    public static final String IS_NEED_IMAGE_PAGER = "IsNeedImagePager";

    public static final int DEFAULT_MAX_NUMBER = 99;
    public static final int COLUMN_NUMBER = 3;

    private boolean isNeedCamera;
    private boolean isNeedImagePager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_image_pick);

        Intent intt = getIntent();
        mMaxNumber = intt.getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
        isNeedCamera = intt.getBooleanExtra(IS_NEED_CAMERA, false);
        isNeedImagePager = intt.getBooleanExtra(IS_NEED_IMAGE_PAGER, false);

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        mSuffix = new String[] {"avif", "bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "tiff", "webp"};
        initView();
    }

    private void initView() {
        RecyclerView mRecyclerView = findViewById(R.id.rv_image_pick);
        final GridLayoutManager layoutManager = new GridLayoutManager(this, COLUMN_NUMBER);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerGridItemDecoration(this));
        ImagePickAdapter adapter = new ImagePickAdapter(this, isNeedCamera, mMaxNumber);
        linkAdapter(TYPE_IMAGE, adapter);
        mRecyclerView.setAdapter(adapter);
    }

    protected String[] permissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return new String[]{Manifest.permission.READ_MEDIA_IMAGES,};
        } else {
            return storage_permissions;
        }
    }
}
