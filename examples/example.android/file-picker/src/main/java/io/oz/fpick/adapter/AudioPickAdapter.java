package io.oz.fpick.adapter;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

import android.graphics.drawable.AnimationDrawable;
import android.media.MediaPlayer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.request.target.Target;
import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.filter.entity.AudioFile;
import com.vincent.filepicker.filter.entity.BaseFile;

import java.util.ArrayList;

import io.oz.fpick.R;

/**
 * Created by Ody Zhou
 * Date: 23 Feb. 2022
 *
 * Credits to Vincent Woo
 */
public class AudioPickAdapter extends BaseSynchronizer<AudioFile, AudioPickAdapter.AudioPickViewHolder> {

    public AudioPickAdapter(AudioPickActivity ctx, int max) {
        super(ctx, new ArrayList<>());
        mMaxNumber = max;
    }

    @NonNull
    @Override
    public AudioPickViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(mContext).inflate(R.layout.vw_layout_item_audio_pick, parent, false);
        AudioPickViewHolder holder = new AudioPickViewHolder(itemView);
        holder.setIsRecyclable ( true );
        return holder;
    }

    @Override
    public void onBindViewHolder(@NonNull AudioPickViewHolder holder, int position) {
        final AudioFile file = mList.get(position);

        holder.mTvTitle.setText(file.getName());
        holder.mTvTitle.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
        if (holder.mTvTitle.getMeasuredWidth() >
                Util.getScreenWidth(mContext) - Util.dip2px(mContext, 10 + 32 + 10 + 48 + 10 * 2)) {
            holder.mTvTitle.setLines(2);
        } else {
            holder.mTvTitle.setLines(1);
        }

        holder.mTvDuration.setText(Util.getDurationString(file.getDuration()));
        if (file.synchFlag == BaseFile.Synchronizing) {
            holder.mCbx.setSelected ( false );
            // holder.icAlbum.setVisibility(View.GONE);
            holder.icSyncing.setVisibility(View.VISIBLE);
            holder.icSynced.setVisibility(View.GONE);
        }
        else if (file.synchFlag == BaseFile.Synchronized) {
            holder.mCbx.setSelected(true);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else if (file.isSelected()) {
            holder.mCbx.setSelected(true);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.GONE);
            holder.animation.setVisibility ( View.VISIBLE );
            holder.animation.setAlpha ( 1f );
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
//            Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
            animationDrawable.start();
        }
        else {
            holder.mCbx.setSelected(false);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.GONE);
            holder.animation.setVisibility ( View.INVISIBLE );
            holder.animation.setAlpha ( 0f );
        }

        holder.itemView.setOnLongClickListener((View view) -> {
            int index = isNeedCamera ? holder.getAbsoluteAdapterPosition() - 1 : holder.getAbsoluteAdapterPosition();
            AudioFile f = mList.get(index);

            MediaPlayer mp = new MediaPlayer();

            try {
                mp.setDataSource(f.fullpath());
                mp.prepare();
                mp.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
            return true;
        });

        //change itemview to mCbx
        holder.itemView.setOnClickListener(v -> {
            int index = holder.getAbsoluteAdapterPosition();

            int sync = mList.get(index).synchFlag;
            if ( sync == BaseFile.Synchronized || sync == BaseFile.Synchronizing)
                return;

            if (!v.isSelected() && isUpToMax()) {
                ToastUtil.getInstance(mContext).showToast(R.string.vw_up_to_max);
                return;
            }

            if (holder.mCbx.isSelected()) {
                holder.mCbx.setSelected(false);
                mCurrentNumber--;
                mList.get( index ).setSelected ( false );
            } else {
                holder.mCbx.setSelected(true);
                mCurrentNumber++;
                mList.get( index ).setSelected ( true );
            }

            if (mListener != null) {
                mListener.onAudioStateChanged (holder.mCbx.isSelected(), mList.get(holder.getAdapterPosition()),holder.animation);
            }
        });
    }

    @Override
    public int getItemCount() {
        // return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
        return mList.size();
    }

    class AudioPickViewHolder extends RecyclerView.ViewHolder {
        // private final ImageView icAlbum;
        private final ImageView icSynced;
        private final ImageView icSyncing;

        private TextView mTvTitle;
        private TextView mTvDuration;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        private TextView mDuration;
        private RelativeLayout mDurationLayout;

        public AudioPickViewHolder(@NonNull View itemView) {
            super ( itemView );
            icSyncing = (ImageView) itemView.findViewById(R.id.xiv_syncing_icon);
            icSynced = (ImageView) itemView.findViewById(R.id.xiv_synced_icon);

            mTvTitle = (TextView) itemView.findViewById(R.id.tv_audio_title);
            mTvDuration = (TextView) itemView.findViewById(R.id.tv_duration);
            mCbx = (ImageView) itemView.findViewById(R.id.cbx);
            animation = itemView.findViewById ( R.id.animationAudio );
        }
    }
}
