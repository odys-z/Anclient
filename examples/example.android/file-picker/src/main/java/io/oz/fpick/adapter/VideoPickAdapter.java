package io.oz.fpick.adapter;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.AnimationDrawable;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
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
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.filter.entity.VideoFile;

import java.util.ArrayList;

import io.oz.jserv.sync.SyncFlag;
import io.oz.fpick.R;

/**
 * Created by Ody Zhou
 * Date: 15 Feb. 2022
 *
 * Credits to Vincent Woo
 */

public class VideoPickAdapter extends BaseSynchronizer<VideoFile, VideoPickAdapter.VideoPickViewHolder> {
//    private boolean isNeedCamera;
//    private int mMaxNumber;
//    private int mCurrentNumber = 0;
    public String mFilepath;

    public Uri mVideoUri;

    public VideoPickAdapter(Context ctx, boolean needCamera, int max ) {
        this ( ctx, new ArrayList<VideoFile> ( ), needCamera , max );
    }

    public VideoPickAdapter(Context ctx, ArrayList<VideoFile> list, boolean needCamera, int max ) {
        super ( ctx , list );
        isNeedCamera = needCamera;
        mMaxNumber = max;
    }

    @NonNull
    @Override
    public VideoPickViewHolder onCreateViewHolder (@NonNull ViewGroup parent, int viewType ) {
        View itemView = LayoutInflater.from ( mContext ).inflate ( R.layout.vw_layout_item_video_pick, parent , false );
        ViewGroup.LayoutParams params = itemView.getLayoutParams ( );
        if ( params != null ) {
            WindowManager wm = (WindowManager) mContext.getSystemService ( Context.WINDOW_SERVICE );
            int width = wm.getDefaultDisplay ( ).getWidth ( );
            params.height = width / ImagePickActivity.COLUMN_NUMBER;
        }
        VideoPickViewHolder videoViewHolder = new VideoPickViewHolder ( itemView );
        videoViewHolder.setIsRecyclable ( false );

        return videoViewHolder;
    }

    @Override
    public void onBindViewHolder ( final VideoPickViewHolder holder , final int position ) {
        if ( isNeedCamera && position == 0 ) {
            holder.icAlbum.setVisibility ( View.VISIBLE );
            holder.icSynced.setVisibility ( View.INVISIBLE );
            holder.mIvThumbnail.setVisibility ( View.INVISIBLE );
            holder.mCbx.setVisibility ( View.GONE );
            holder.mShadow.setVisibility ( View.INVISIBLE );
        }
        else {
            holder.icSynced.setVisibility ( View.INVISIBLE );
            holder.mIvThumbnail.setVisibility ( View.VISIBLE );
            holder.mCbx.setVisibility ( View.GONE );

            VideoFile file;
            if ( isNeedCamera ) {
                file = mList.get ( position - 1 );
            }
            else {
                file = mList.get ( position );
            }

            RequestOptions options = new RequestOptions ( );
            Glide.with ( mContext )
                    .load ( file.getPath ( ) )
                    .apply ( options.centerCrop ( ) )
                    .transition ( withCrossFade ( ) )
                    .into ( holder.mIvThumbnail );

            // if (file.synchFlag == BaseFile.Synchronizing) {
            if (SyncFlag.pushing.equals(file.syncFlag)) {
                holder.mCbx.setSelected ( false );
                holder.mShadow.setVisibility(View.GONE);
                holder.icAlbum.setVisibility(View.GONE);
                holder.icSyncing.setVisibility(View.VISIBLE);
                holder.icSynced.setVisibility(View.GONE);
            }
            // else if (file.synchFlag == BaseFile.Synchronized) {
            else if (SyncFlag.publish.equals(file.syncFlag)) {
                holder.mCbx.setSelected(true);
                holder.mShadow.setVisibility(View.GONE);
                holder.icAlbum.setVisibility(View.INVISIBLE);
                holder.icSyncing.setVisibility(View.GONE);
                holder.icSynced.setVisibility(View.VISIBLE);
            }
            else if ( file.isSelected ( ) ) {
                // not synced but selected
                holder.mCbx.setSelected ( true );
                holder.mShadow.setVisibility ( View.VISIBLE );

                holder.icAlbum.setVisibility(View.GONE);
                holder.icSyncing.setVisibility(View.GONE);
                holder.icSynced.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.VISIBLE );
                holder.animation.setAlpha ( 1f );
                AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
                Animation a = AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
                animationDrawable.start ();
                a.start();
            }
            else {
                // not synced and not selected
                holder.mCbx.setSelected ( false );
                holder.icAlbum.setVisibility(View.GONE);
                holder.icSyncing.setVisibility(View.GONE);
                holder.icSynced.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.GONE );
                holder.animation.setAlpha ( 0f );
                holder.mShadow.setVisibility ( View.INVISIBLE );
            }

            holder.mIvThumbnail.setOnLongClickListener((View view) -> {
                return startMediaViewer(mContext, view, "video/*", file.getPath());
//                Intent intent = new Intent(Intent.ACTION_VIEW);
//                Uri uri;
//                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
//                    intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
//                    File f = new File(file.getPath());
//                    uri = FileProvider.getUriForFile(mContext, mContext.getApplicationContext().getPackageName() + ".provider", f);
//                }
//                else {
//                    uri = Uri.parse("file://" + file.getPath());
//                }
//                // intent.setDataAndType(uri, "video/mp4");
//                intent.setDataAndType(uri, "video/*");
//                if (Util.detectIntent(mContext, intent)) {
//                    mContext.startActivity(intent);
//                }
//                else {
//                    ToastUtil.getInstance(mContext).showToast(mContext.getString(R.string.vw_no_video_play_app));
//                }
//                return false;
            });

            holder.mIvThumbnail.setOnClickListener ((View view) -> {
                int index = isNeedCamera ? holder.getAdapterPosition ( ) - 1 : holder.getAdapterPosition ( );

                String sync = mList.get(index).syncFlag;
                // if ( sync == BaseFile.Synchronized || sync == BaseFile.Synchronizing)
                if ( SyncFlag.publish.equals(sync) || SyncFlag.pushing.equals(sync) )
                    return;

                if ( !holder.mCbx.isSelected ( ) && isUpToMax ( ) ) {
                    ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
                    return;
                }

                if ( holder.mCbx.isSelected ( ) ) {
                    holder.mShadow.setVisibility ( View.GONE );
                    holder.mCbx.setSelected ( false );
                    mCurrentNumber--;
                    mList.get ( index ).setSelected ( false );
                }
                else {
                    holder.mShadow.setVisibility ( View.VISIBLE );
                    holder.mCbx.setSelected ( true );
                    mCurrentNumber++;
                    mList.get ( index ).setSelected ( true );
                }

                if ( mListener != null ) {
                    mListener.OnSelectStateChanged ( index , holder.mCbx.isSelected ( ) , mList.get ( index ) , holder.animation );
                }
            });

            holder.mDuration.setText(Util.getDurationString(file.getDuration()));
        }
    }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    class VideoPickViewHolder extends RecyclerView.ViewHolder {
        private final ImageView icAlbum;
        private final ImageView icSynced;
        private final ImageView icSyncing;
        private final ImageView mIvThumbnail;
        private final View mShadow;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        private TextView mDuration;
        private RelativeLayout mDurationLayout;

        public VideoPickViewHolder(@NonNull View itemView) {
            super ( itemView );
            icAlbum = (ImageView) itemView.findViewById ( R.id.xiv_album_icon);
            icSyncing = (ImageView) itemView.findViewById ( R.id.xiv_syncing_icon);
            icSynced = (ImageView) itemView.findViewById ( R.id.xiv_synced_icon);

            mIvThumbnail = (ImageView) itemView.findViewById ( R.id.xiv_thumbnail );
            mShadow = itemView.findViewById ( R.id.x_shadow );
            mCbx = (ImageView) itemView.findViewById ( R.id.x_check );
            animation = itemView.findViewById ( R.id.animationSquarevideo );
            mDuration = (TextView) itemView.findViewById(R.id.txt_duration);
            mDurationLayout = (RelativeLayout) itemView.findViewById(R.id.layout_duration);
        }
    }

    public boolean isUpToMax () {
        return mCurrentNumber >= mMaxNumber;
    }

    public void setCurrentNumber ( int number ) {
        mCurrentNumber = number;
    }
}
