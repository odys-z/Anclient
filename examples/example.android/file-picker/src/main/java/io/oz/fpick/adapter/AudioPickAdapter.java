/**
 * Created by Ody Zhou
 * Date: 23 Feb. 2022
 *
 * Credits to Vincent Woo
 */
package io.oz.fpick.adapter;

import android.graphics.drawable.AnimationDrawable;
import android.media.MediaPlayer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;
import com.vincent.filepicker.activity.AudioPickActivity;
import com.vincent.filepicker.filter.entity.AudioFile;

import java.util.ArrayList;

import io.odysz.semantic.tier.docs.SyncDoc;
import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
//import io.oz.jserv.docsync.SyncFlag;

public class AudioPickAdapter extends BaseSynchronizer<AudioFile, AudioPickAdapter.AudioPickViewHolder> {
    public AudioPickAdapter(BaseActivity ctx, ArrayList<AudioFile> list, int max) {
        super(ctx, list);
        mMaxNumber = max;
    }

    public AudioPickAdapter(AudioPickActivity ctx, int max) {
        super(ctx, new ArrayList<>());
        mMaxNumber = max;
    }

    @NonNull
    @Override
    public AudioPickViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(mContext).inflate(R.layout.vw_layout_item_audio_pick, parent, false);
        AudioPickViewHolder holder= new AudioPickViewHolder(itemView);
        holder.setIsRecyclable ( true );
        return holder;
    }

    @Override
    public void onBindViewHolder(@NonNull AudioPickViewHolder holder, int position) {
        final AudioFile file = mList.get(position);

        holder.mTvTitle.setText(file.clientname());
        holder.mTvTitle.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
        if (holder.mTvTitle.getMeasuredWidth() >
                Util.getScreenWidth(mContext) - Util.dip2px(mContext, 10 + 32 + 10 + 48 + 10 * 2)) {
            holder.mTvTitle.setLines(2);
        } else {
            holder.mTvTitle.setLines(1);
        }

        holder.mTvDuration.setText(Util.getDurationString(file.getDuration()));
        if (SyncDoc.SyncFlag.priv.equals(file.syncFlag)) {
            holder.mCbx.setSelected ( false );
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else if (SyncDoc.SyncFlag.publish.equals(file.syncFlag) || SyncDoc.SyncFlag.hub.equals(file.syncFlag)) {
            holder.mCbx.setSelected(true);
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else if (file.isSelected()) {
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.mCbx.setSelected(true);
            holder.animation.setVisibility (View.VISIBLE);
            holder.animation.setAlpha ( 1f );
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
            animationDrawable.start();
        } else {
            holder.mCbx.setSelected(false);
            holder.icAlbum.setVisibility(View.GONE);
            holder.animation.setVisibility (View.INVISIBLE);
            holder.animation.setAlpha ( 0f );
            holder.icSynced.setVisibility(View.INVISIBLE);
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
                mListener.onSelectStateChanged(
                        index,
                        holder.mCbx.isSelected(),
                        mList.get(holder.getAbsoluteAdapterPosition()),
                        holder.animation);
            }
        });
    }

    @Override
    public int getItemCount() {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    static class AudioPickViewHolder extends RecyclerView.ViewHolder {
        private final ImageView icAlbum;
        private final ImageView icSynced;
        private final ImageView icSyncing;

        private final TextView mTvTitle;
        private final TextView mTvDuration;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        private TextView mDuration;
        private RelativeLayout mDurationLayout;

        public AudioPickViewHolder(@NonNull View itemView) {
            super ( itemView );
            icAlbum = itemView.findViewById ( R.id.xiv_album_icon);
            icSyncing = itemView.findViewById ( R.id.xiv_syncing_icon);
            icSynced = itemView.findViewById ( R.id.xiv_synced_icon);

            mTvTitle = itemView.findViewById(R.id.tv_audio_title);
            mTvDuration = itemView.findViewById(R.id.tv_duration);
            mCbx = itemView.findViewById(R.id.cbx);
            animation = itemView.findViewById ( R.id.animationAudio );
        }
    }
}
