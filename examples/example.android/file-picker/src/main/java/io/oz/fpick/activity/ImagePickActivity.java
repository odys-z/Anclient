package io.oz.fpick.activity;


import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_IMAGE;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerGridItemDecoration;

import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.R;
import io.oz.fpick.adapter.ImagePickAdapter;

/**
 * Created by Ody Zhou
 * Date 2022/02/11
 *
 * <p>Credits to Vincent Woo</p>
 *
 * <h6>Debug memo:</h6>
 *
 * For Andoriod Studio complains errors like
 * <pre>
 *     Class must either be declared abstract or implement abstract method
 *     addMenuProvider (MenuProvider, LifecycleOwner, State) in MenuHost
 * </pre>
 *
 * see <a href="https://stackoverflow.com/questions/50714060/errors-in-the-ide-but-project-running-successfully">
 *     Errors in IDE, StackOverflow</a>.
 * Say, delete build.
 */
public class ImagePickActivity extends BaseActivity {
    public static final String IS_NEED_CAMERA = "IsNeedCamera";

    public static final int DEFAULT_MAX_NUMBER = 99;
    public static final int COLUMN_NUMBER = 3;

    private boolean isNeedCamera;

    public ImagePickActivity () {
        super();
        if (template == null)
            template = new ExpSyncDoc().shareflag(ShareFlag.publish.name());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_image_pick);

        Intent intt = getIntent();
        int maxitems = intt.getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
        isNeedCamera = intt.getBooleanExtra(IS_NEED_CAMERA, false);
        // boolean isNeedImagePager = intt.getBooleanExtra(IS_NEED_IMAGE_PAGER, false);

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        mSuffix = new String[] {"avif", "bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "tif", "tiff", "webp"};
        initView(maxitems);
    }

    private void initView(int maxnum) {
        RecyclerView mRecyclerView = findViewById(R.id.rv_image_pick);
        final GridLayoutManager layoutManager = new GridLayoutManager(this, COLUMN_NUMBER);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerGridItemDecoration(this));
        ImagePickAdapter adapter = new ImagePickAdapter(this, isNeedCamera, maxnum);
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
