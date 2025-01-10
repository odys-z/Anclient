package io.oz.fpick.activity;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_AUDIO;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.Constant;
import com.vincent.filepicker.DividerListItemDecoration;
import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;

import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.R;
import io.oz.fpick.adapter.AudioPickAdapter;

/**
 * Credits to Vincent Woo
 */

public class AudioPickActivity extends BaseActivity implements IProgressBarAct {
    public static final String IS_NEED_RECORDER = "IsNeedRecorder";
    public static final String IS_TAKEN_AUTO_SELECTED = "IsTakenAutoSelected";

    public static final int DEFAULT_MAX_NUMBER = 9;
    private int mMaxNumber;
    private int mCurrentNumber = 0;
    private boolean isNeedRecorder;
//    private boolean isTakenAutoSelected;

    private TextView tv_count;

    public AudioPickActivity () {
        super();
        if (template == null)
            template = new ExpSyncDoc().shareflag(ShareFlag.prv.name());
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vw_activity_audio_pick);

        mMaxNumber = getIntent().getIntExtra(Constant.MAX_NUMBER, DEFAULT_MAX_NUMBER);
        isNeedRecorder = getIntent().getBooleanExtra(IS_NEED_RECORDER, false);
        isTakenAutoSelected = getIntent().getBooleanExtra(IS_TAKEN_AUTO_SELECTED, true);

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        mSuffix = new String[] {"aac", "mid", "midi", "mp3", "oga", "opus", "wav", "weba", "3g2"};

        initView();
    }

    @Override
    protected String[] permissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return new String[] { Manifest.permission.READ_MEDIA_AUDIO, };
        } else {
            return storage_permissions;
        }
    }

    private void initView() {
        tv_count = (TextView) findViewById(R.id.tv_count);
        tv_count.setText(mCurrentNumber + "/" + mMaxNumber);

        RecyclerView mRecyclerView = (RecyclerView) findViewById(R.id.rv_audio_pick);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        mRecyclerView.setLayoutManager(layoutManager);
        mRecyclerView.addItemDecoration(new DividerListItemDecoration(this,
                LinearLayoutManager.VERTICAL, R.drawable.vw_divider_rv_file));
        AudioPickAdapter adapter = new AudioPickAdapter(this, mMaxNumber);
        linkAdapter(TYPE_AUDIO, adapter);
        mRecyclerView.setAdapter(adapter);

        if (isNeedRecorder) {
            RelativeLayout rl_rec_aud = (RelativeLayout) findViewById(R.id.rl_rec_aud);
            rl_rec_aud.setVisibility(View.VISIBLE);
            rl_rec_aud.setOnClickListener(v -> {
                Intent intent = new Intent(MediaStore.Audio.Media.RECORD_SOUND_ACTION);
                if (Util.detectIntent(AudioPickActivity.this, intent)) {
                    startActivityForResult(intent, Constant.REQUEST_CODE_TAKE_AUDIO);
                } else {
                    ToastUtil.getInstance(AudioPickActivity.this).showToast(getString(R.string.vw_no_audio_app));
                }
            });
        }
    }

}
