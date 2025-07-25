package io.oz.fpick.adapter;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

import android.content.Context;
import android.graphics.drawable.AnimationDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.vincent.filepicker.Util;

import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.activity.ImagePickActivity;
import com.vincent.filepicker.filter.entity.VideoFile;

import java.util.ArrayList;

import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.R;

/**
 * Created by Ody Zhou
 * Date: 15 Feb. 2022
 * Credits to Vincent Woo
 */
public class VideoPickAdapter extends PickAdaptor<VideoFile, VideoPickAdapter.VideoPickViewHolder> {
    public VideoPickAdapter(BaseActivity ctx, boolean needCamera, int max ) {
        this ( ctx, new ArrayList<>(), needCamera , max );
    }

    public VideoPickAdapter(BaseActivity ctx, ArrayList<AndroidFile> list, boolean needCamera, int max ) {
        super ( ctx , list, max );
        isNeedCamera = needCamera;
    }

    @NonNull
    @Override
    public VideoPickViewHolder onCreateViewHolder (@NonNull ViewGroup parent, int viewType ) {
        View itemView = LayoutInflater.from ( mContext ).inflate ( R.layout.vw_layout_item_video_pick, parent , false );
        ViewGroup.LayoutParams params = itemView.getLayoutParams ( );
        if ( params != null ) {
            WindowManager wm = (WindowManager) mContext.getSystemService ( Context.WINDOW_SERVICE );
            itemWidth = wm.getDefaultDisplay ( ).getWidth ( );
            params.height = itemWidth / ImagePickActivity.COLUMN_NUMBER;
        }
        VideoPickViewHolder videoViewHolder = new VideoPickViewHolder(itemView);

        videoViewHolder.setIsRecyclable (false);

        return videoViewHolder;
    }

    /*
    @Override
    public void onBindViewHolder (@NonNull final VideoPickViewHolder holder , final int position ) {
        if (isNeedCamera && position == 0) {
            visualHolder0(holder);
            return;
        }

        VideoFile file;
        if (isNeedCamera)
            file = mList.get ( position - 1 );
        else
            file = mList.get ( position );

        visaulHolderx(holder, file);

        RequestOptions options = new RequestOptions ( );
        Glide.with ( mContext )
             .load ( file.fullpath() )
             .apply ( options.centerCrop() )
             .transition ( withCrossFade() )
             .into ( holder.mIvThumbnail );

        holder.mIvThumbnail.setOnLongClickListener(
                (View view) -> startMediaViewer(mContext, "video/*", file.fullpath()));

        holder.mIvThumbnail.setOnClickListener((View h) -> {
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
    }
     */

    @Override
    protected void visualHolder0(VideoPickViewHolder holder) {
        holder.vAlbum.setVisibility ( View.VISIBLE );
        holder.vSynced.setVisibility ( View.INVISIBLE );
        // holder.mIvThumbnail.setVisibility ( View.INVISIBLE );
        holder.glideThumb.setVisibility ( View.INVISIBLE );
        // holder.mCbx.setVisibility ( View.GONE );
        holder.vShadow.setVisibility ( View.INVISIBLE );
    }

    @Override
    protected void visualHolderx(VideoPickViewHolder holder, AndroidFile file) {
        if (file == null) // shouldn't happen
            return;

        ShareFlag share = file.shareflag == null ? null : ShareFlag.valueOf(file.shareflag);
        if ( file.isSelected ( ) ) {
            // not synced but selected
            // holder.mCbx.setSelected ( true );
            holder.vShadow.setVisibility ( View.VISIBLE );

            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynced.setVisibility(View.GONE);

            holder.animation.setVisibility ( View.VISIBLE );
            holder.animation.setAlpha ( 1f );
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
            Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
            animationDrawable.start ();
            a.start();
        }
        else if (ShareFlag.pushing == share) {
            // holder.mCbx.setSelected ( false );
            holder.vShadow.setVisibility(View.GONE);
            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.VISIBLE);
            holder.vSynced.setVisibility(View.GONE);
        }
        else if (ShareFlag.publish == share) {
            // holder.mCbx.setSelected(true);
            holder.vShadow.setVisibility(View.GONE);
            holder.vAlbum.setVisibility(View.INVISIBLE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynced.setVisibility(View.VISIBLE);
        }
        else {
            // not synced and not selected
            // holder.mCbx.setSelected ( false );
            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynced.setVisibility(View.GONE);

            holder.animation.setVisibility ( View.GONE );
            holder.animation.setAlpha ( 0f );
            holder.vShadow.setVisibility ( View.INVISIBLE );
        }
        holder.mDuration.setText(Util.getDurationString(((VideoFile)file).getDuration()));
    }

    @Override
    protected void visualSelect(boolean selected, VideoPickViewHolder holder) {
        if (selected) {
            // not synced but selected
            // holder.mCbx.setSelected ( true );
            holder.vShadow.setVisibility ( View.VISIBLE );
            holder.vAlbum.setVisibility(View.GONE);

            holder.animation.setVisibility ( View.VISIBLE );
            holder.animation.setAlpha ( 1f );
            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
            Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
            animationDrawable.start ();
            a.start();
        }
        else {
            // not synced and not selected
            // holder.mCbx.setSelected ( false );
            holder.animation.setVisibility ( View.GONE );
            holder.animation.setAlpha ( 0f );
            holder.vShadow.setVisibility ( View.INVISIBLE );
        }
    }

    public void onBindViewHolder_del (@NonNull final VideoPickViewHolder holder , final int position ) {
        if ( isNeedCamera && position == 0 ) {
            holder.vAlbum.setVisibility ( View.VISIBLE );
            holder.vSynced.setVisibility ( View.INVISIBLE );
            // holder.mIvThumbnail.setVisibility ( View.INVISIBLE );
            holder.glideThumb.setVisibility ( View.INVISIBLE );
            // holder.mCbx.setVisibility ( View.GONE );
            holder.vShadow.setVisibility ( View.INVISIBLE );
        }
        else {
            holder.vSynced.setVisibility ( View.INVISIBLE );
            // holder.mIvThumbnail.setVisibility ( View.VISIBLE );
            holder.glideThumb.setVisibility ( View.VISIBLE );
            // holder.mCbx.setVisibility ( View.GONE );

            VideoFile file;
            if ( isNeedCamera ) {
                file = (VideoFile) mList.get ( position - 1 );
            }
            else {
                file = (VideoFile) mList.get ( position );
            }

            RequestOptions options = new RequestOptions ( );
            Glide.with ( mContext )
                .load ( file.fullpath() )
                .apply ( options.centerCrop() )
                .transition ( withCrossFade() )
                // .into ( holder.mIvThumbnail );
                .into ( holder.glideThumb );

            ShareFlag share = ShareFlag.valueOf(file.shareflag);
            if (ShareFlag.pushing == share) {
                // holder.mCbx.setSelected ( false );
                holder.vShadow.setVisibility(View.GONE);
                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.VISIBLE);
                holder.vSynced.setVisibility(View.GONE);
            }
            else if (ShareFlag.publish == share) {
                // holder.mCbx.setSelected(true);
                holder.vShadow.setVisibility(View.GONE);
                holder.vAlbum.setVisibility(View.INVISIBLE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynced.setVisibility(View.VISIBLE);
            }
            else if ( file.isSelected ( ) ) {
                // not synced but selected
                // holder.mCbx.setSelected ( true );
                holder.vShadow.setVisibility ( View.VISIBLE );

                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynced.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.VISIBLE );
                holder.animation.setAlpha ( 1f );
                AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
                Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
                animationDrawable.start ();
                a.start();
            }
            else {
                // not synced and not selected
                // holder.mCbx.setSelected ( false );
                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynced.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.GONE );
                holder.animation.setAlpha ( 0f );
                holder.vShadow.setVisibility ( View.INVISIBLE );
            }

            holder.glideThumb.setOnLongClickListener((View view)
                    -> startMediaViewer(mContext, "video/*", file.fullpath()));

            holder.glideThumb.setOnClickListener ((View view) -> {
                int index = isNeedCamera ? holder.getAdapterPosition ( ) - 1 : holder.getAdapterPosition ( );

                ShareFlag sync = ShareFlag.valueOf(mList.get(index).shareflag());
                if (ShareFlag.publish == sync || ShareFlag.pushing == sync)
                    return;

//                if ( !holder.mCbx.isSelected ( ) && isUpToMax ( ) ) {
//                    ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
//                    return;
//                }

//                if ( holder.vCbx.isSelected ( ) ) {
//                    holder.mShadow.setVisibility ( View.GONE );
//                    holder.mCbx.setSelected ( false );
//                    mCurrentNumber--;
//                    mList.get ( index ).setSelected ( false, shareSetting );
//                }
//                else {
//                    holder.mShadow.setVisibility ( View.VISIBLE );
//                    holder.mCbx.setSelected ( true );
//                    mCurrentNumber++;
//                    mList.get ( index ).setSelected ( true, shareSetting );
//                }

//                if ( mListener != null ) {
//                    mListener.onSelectStateChanged( index , holder.mCbx.isSelected ( ) , mList.get ( index ) , holder.animation );
//                }
            });

            holder.mDuration.setText(Util.getDurationString(file.getDuration()));

            holder.setIsRecyclable ( true );
        }
    }

    @Override
    protected String mediaViewType() { return "video/*"; }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    static class VideoPickViewHolder extends ViewHolder4Glide {
        private final ImageView vAlbum;
        private final ImageView vSynced;
        private final ImageView vSyncing;
        // private final ImageView mIvThumbnail;
        private final View vShadow;

        /** @deprecated visual effects that's not used */
        // private final ImageView mCbx;
        private final RelativeLayout animation;

        private final TextView mDuration;

        public VideoPickViewHolder(@NonNull View itemView) {
            super ( itemView );
            vAlbum = itemView.findViewById ( R.id.xiv_album_cmd);
            vSyncing = itemView.findViewById ( R.id.xiv_syncing_icon);
            vSynced = itemView.findViewById ( R.id.xiv_synced_icon);

            // mIvThumbnail = itemView.findViewById ( R.id.xiv_thumbnail );
            vShadow = itemView.findViewById ( R.id.x_shadow );
            // mCbx = itemView.findViewById ( R.id.x_check );
            animation = itemView.findViewById ( R.id.animationSquarevideo );
            mDuration = itemView.findViewById(R.id.txt_duration);
            // RelativeLayout mDurationLayout = (RelativeLayout) itemView.findViewById(R.id.layout_duration);
        }
    }

}
