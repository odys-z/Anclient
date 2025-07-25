//package io.oz.fpick.activity;
//
//import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_FILE;
//
//import android.os.Bundle;
//
//import androidx.annotation.Nullable;
//import androidx.recyclerview.widget.LinearLayoutManager;
//import androidx.recyclerview.widget.RecyclerView;
//
//import com.vincent.filepicker.Constant;
//import com.vincent.filepicker.DividerListItemDecoration;
//
//import io.odysz.semantic.tier.docs.ExpSyncDoc;
//import io.odysz.semantic.tier.docs.ShareFlag;
//import io.oz.fpick.R;
//import io.oz.fpick.adapter.NormalFilePickAdapter;
//
///**
// * Credits Vincent Woo
// */
//
//public class NormalFilePickActivity extends BaseActivity {
//    public static final int DEFAULT_MAX_NUMBER = 9;
//
//    public NormalFilePickActivity () {
//        super();
//        if (template == null)
//            template = new ExpSyncDoc().shareflag(ShareFlag.prv.name());
//    }
//
//    @Override
//    protected void onCreate(@Nullable Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//        setContentView(R.layout.vw_activity_file_pick);
//
//        mMaxNumber = getIntent().getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
//
//        mSuffix = new String[] {"xlsx", "xls", "doc", "docx", "ppt", "pptx", "pdf", "txt", "csv", "zip", "7z", "rar"};
//        initView();
//    }
//
//    private void initView() {
//        RecyclerView mRecyclerView = findViewById(R.id.rv_file_pick);
//        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
//        mRecyclerView.setLayoutManager(layoutManager);
//        mRecyclerView.addItemDecoration(new DividerListItemDecoration(this,
//                LinearLayoutManager.VERTICAL, R.drawable.vw_divider_rv_file));
//
//        NormalFilePickAdapter adapter = new NormalFilePickAdapter(this, mMaxNumber);
//        linkAdapter(TYPE_FILE, adapter);
//        mRecyclerView.setAdapter(adapter);
//    }
//
//    protected String[] permissions() { return storage_permissions; }
//
//}
