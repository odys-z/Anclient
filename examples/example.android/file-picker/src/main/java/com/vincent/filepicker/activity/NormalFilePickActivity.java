package com.vincent.filepicker.activity;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_FILE;

import android.os.Bundle;
import android.widget.ProgressBar;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerListItemDecoration;
import com.vincent.filepicker.filter.entity.Directory;
import com.vincent.filepicker.filter.entity.NormalFile;

import java.util.ArrayList;
import java.util.List;

import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.adapter.NormalFilePickAdapter;

/**
 * Created by Vincent Woo
 * Date: 2016/10/26
 * Time: 10:14
 */

public class NormalFilePickActivity extends BaseActivity {
    public static final int DEFAULT_MAX_NUMBER = 9;
    private RecyclerView mRecyclerView;
    private NormalFilePickAdapter mAdapter;
    private ArrayList<NormalFile> mSelectedList = new ArrayList<>();
    private List<Directory<NormalFile>> mAll;
    private ProgressBar mProgressBar;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_file_pick);

        mMaxNumber = getIntent().getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);

        mSuffix = new String[] {"xlsx", "xls", "doc", "docx", "ppt", "pptx", "pdf", "txt", "csv", "zip", "7z", "rar"};
        initView();
    }

    private void initView() {
        mRecyclerView = (RecyclerView) findViewById(R.id.rv_file_pick);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerListItemDecoration(this,
                LinearLayoutManager.VERTICAL, R.drawable.vw_divider_rv_file));

        NormalFilePickAdapter adapter = new NormalFilePickAdapter(this, mMaxNumber);
        linkAdapter(TYPE_FILE, adapter);
        mRecyclerView.setAdapter(adapter);

        mProgressBar = (ProgressBar) findViewById(R.id.pb_file_pick);
    }

    protected String[] permissions() { return storage_permissions; }

}
