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
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;

import com.vincent.filepicker.filter.entity.AudioFile;

import java.util.ArrayList;

import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.R;
import io.oz.fpick.activity.AudioPickActivity;
import io.oz.fpick.activity.BaseActivity;

public class AudioPickAdapter extends PickAdaptor<AudioFile, AudioPickAdapter.AudioPickViewHolder> {

    public AudioPickAdapter(AudioPickActivity ctx, int max) {
        super(ctx, new ArrayList<>(), max);
    }

//    public AudioPickAdapter(BaseActivity ctx, ArrayList<AndroidFile> list, boolean needCamera, int max) {
//        super(ctx, list, max);
//        isNeedCamera = needCamera;
//    }
    public void onPlay(View v) {
        System.out.println("\n\nplay\n\n");
    }

    @NonNull
    @Override
    public AudioPickViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(mContext).inflate(R.layout.vw_layout_item_audio_pick, parent, false);
        AudioPickViewHolder holder= new AudioPickViewHolder(itemView);
        holder.setIsRecyclable ( true );
        return holder;
    }

    public void onBindViewHolder(@NonNull AudioPickViewHolder holder, int position) {
        final AudioFile file = (AudioFile) mList.get(position);

        visualHolderx(holder, file);

        holder.itemView.setOnLongClickListener((View view) -> {
            int index = isNeedCamera ? holder.getAbsoluteAdapterPosition() - 1 : holder.getAbsoluteAdapterPosition();
            AudioFile f = (AudioFile) mList.get(index);

            MediaPlayer mp = new MediaPlayer();

            try {
                mp.setDataSource(f.fullpath());
                mp.prepare();
                mp.setOnCompletionListener((MediaPlayer p) -> {
                    // swith icon
                    });
                mp.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
            return true;
        });

        //change itemview to mCbx
        holder.itemView.setOnClickListener(v -> {
            ShareFlag share = file.shareflag == null ? null : ShareFlag.valueOf(file.shareflag);
            if (!file.isSelected() && (ShareFlag.publish == share || ShareFlag.prv == share)) // revoke is not supported on devices
                return;

            if ( !file.isSelected() && isUpToMax() ) {
                ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
            }
            else {
                boolean old = file.setSelected(!file.isSelected(), shareSetting);
                if (old) {
                    file.shareflag(null);
                    mCurrentNumber--;
                    mSelections.remove(file);
                }
                else {
                    mSelections.add(file);
                    mCurrentNumber++;
                }
                visualSelect(!old, holder);
            }
            mContext.onselect(file);
        });

        holder.setIsRecyclable(true);
    }

    /*
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

        ShareFlag share = ShareFlag.valueOf(file.shareflag);

        holder.mTvDuration.setText(Util.getDurationString(file.getDuration()));
        if (ShareFlag.prv == share) {
            holder.mCbx.setSelected ( false );
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else if (ShareFlag.publish == share) {
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

            ShareFlag sync = ShareFlag.valueOf( mList.get(index).shareflag );
            if (ShareFlag.publish == sync || ShareFlag.pushing == sync)
                return;

            if (holder.mCbx.isSelected()) {
                holder.mCbx.setSelected(false);
                mCurrentNumber--;
                mList.get( index ).setSelected ( false, shareSetting );
            } else {
                holder.mCbx.setSelected(true);
                mCurrentNumber++;
                mList.get( index ).setSelected ( true, shareSetting );
            }

//            if (mListener != null) {
//                mListener.onSelectStateChanged(
//                        index,
//                        holder.mCbx.isSelected(),
//                        mList.get(holder.getAbsoluteAdapterPosition()),
//                        holder.animation);
//            }
        });

        holder.setIsRecyclable(true);
    }

    @Override
    public int getItemCount() {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }
    */

    @Override
    protected String mediaViewType() { return null; }

    @Override
    protected void visualHolder0(AudioPickViewHolder holder) { }

    @Override
    protected void visualHolderx(AudioPickViewHolder holder, AndroidFile file) {
        holder.mTvDuration.setText(Util.getDurationString(((AudioFile)file).getDuration()));
        holder.mTvTitle.setText(file.clientname());
        holder.mTvTitle.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
        if (holder.mTvTitle.getMeasuredWidth() >
                Util.getScreenWidth(mContext) - Util.dip2px(mContext, 10 + 32 + 10 + 48 + 10 * 2)) {
            holder.mTvTitle.setLines(2);
        } else {
            holder.mTvTitle.setLines(1);
        }

        ShareFlag share = file.shareflag == null ? null : ShareFlag.valueOf(file.shareflag);
        if (file.isSelected()) {
            holder.icAlbum.setVisibility(View.INVISIBLE);
            // holder.mCbx.setSelected(true);
            holder.icSynced.setVisibility(View.INVISIBLE);
            holder.animation.setVisibility(View.VISIBLE);
            holder.animation.setAlpha(1f);
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground();
            animationDrawable.start();
        }
        if (ShareFlag.prv == share) {
            // holder.mCbx.setSelected ( false );
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else if (ShareFlag.publish == share) {
            // holder.mCbx.setSelected(true);
            holder.icAlbum.setVisibility(View.INVISIBLE);
            holder.icSyncing.setVisibility(View.GONE);
            holder.icSynced.setVisibility(View.VISIBLE);
        }
        else {
            // holder.mCbx.setSelected(false);
            holder.icAlbum.setVisibility(View.GONE);
            holder.animation.setVisibility (View.INVISIBLE);
            holder.animation.setAlpha ( 0f );
            holder.icSynced.setVisibility(View.INVISIBLE);
        }
    }

    @Override
    protected void visualSelect(boolean selected, AudioPickViewHolder holder) {
        if (selected) {
            holder.animation.setVisibility ( View.VISIBLE );
            holder.animation.setAlpha ( 1f );
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
            Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
            animationDrawable.start ();
            a.start();
        }
        else {
            holder.animation.setVisibility ( View.GONE );
            holder.animation.setAlpha ( 0f );
        }
    }

    static class AudioPickViewHolder extends ViewHolder4Glide {
        private final ImageView icAlbum;
        private final ImageView icSynced;
        private final ImageView icSyncing;

        private final TextView mTvTitle;
        private final TextView mTvDuration;
        // private final ImageView mCbx;
        private final RelativeLayout animation;

        public AudioPickViewHolder(@NonNull View itemView) {
            super ( itemView );
            icAlbum = itemView.findViewById ( R.id.xiv_album_icon);
            icSyncing = itemView.findViewById ( R.id.xiv_syncing_icon);
            icSynced = itemView.findViewById ( R.id.xiv_synced_icon);

            mTvTitle = itemView.findViewById(R.id.tv_audio_title);
            mTvDuration = itemView.findViewById(R.id.tv_duration);
            // mCbx = itemView.findViewById(R.id.cbx);
            animation = itemView.findViewById ( R.id.animationAudio );
        }
    }
}
