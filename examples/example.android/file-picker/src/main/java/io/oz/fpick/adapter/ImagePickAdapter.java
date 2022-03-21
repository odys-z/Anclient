package io.oz.fpick.adapter;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

import android.content.Context;
import android.graphics.drawable.AnimationDrawable;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.RelativeLayout;

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
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.filter.entity.BaseFile;
import com.vincent.filepicker.filter.entity.ImageFile;

import java.util.ArrayList;

import io.oz.fpick.R;

/**
 * Created by Ody Zhou
 * Date: 15 Feb. 2022
 *
 * Credits to Vincent Woo
 */

public class ImagePickAdapter extends BaseSynchronizer<ImageFile, ImagePickAdapter.ImagePickViewHolder> {
    public String mFilepath;
    public Uri mImageUri;

    public ImagePickAdapter(Context ctx, boolean needCamera, boolean isNeedImagePager, int max ) {
        this ( ctx, new ArrayList<ImageFile> ( ), needCamera , isNeedImagePager , max );
    }

    public ImagePickAdapter(Context ctx, ArrayList<ImageFile> list, boolean needCamera, boolean needImagePager , int max ) {
        super ( ctx , list );
        isNeedCamera = needCamera;
        mMaxNumber = max;
    }

    @NonNull
    @Override
    public ImagePickViewHolder onCreateViewHolder (@NonNull ViewGroup parent, int viewType ) {
        View itemView = LayoutInflater.from ( mContext ).inflate ( R.layout.vw_layout_item_image_pick , parent , false );
        ViewGroup.LayoutParams params = itemView.getLayoutParams ( );
        if ( params != null ) {
            WindowManager wm = (WindowManager) mContext.getSystemService ( Context.WINDOW_SERVICE );
            int width = wm.getDefaultDisplay().getWidth();
            params.height = width / ImagePickActivity.COLUMN_NUMBER;
        }
        ImagePickViewHolder imagePickViewHolder = new ImagePickViewHolder( itemView );
        imagePickViewHolder.setIsRecyclable ( false );

        return imagePickViewHolder;
    }

    @Override
    public void onBindViewHolder ( final ImagePickViewHolder holder , final int position ) {
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

            ImageFile file;
            if ( isNeedCamera ) {
                file = mList.get ( position - 1 );
            }
            else {
                file = mList.get ( position );
            }

            // RequestOptions options = new RequestOptions ( );
            Glide.with ( mContext )
                    .load ( file.getPath ( ) )
                    .apply(RequestOptions.diskCacheStrategyOf(DiskCacheStrategy.RESOURCE)
                            .centerCrop()
                            .error(R.drawable.vw_ic_synced))
                    .transition ( withCrossFade ( ) )
                    .listener(new RequestListener() {
                        @Override
                        public boolean onLoadFailed(@Nullable GlideException e, Object model, Target target, boolean isFirstResource) {
                            return false;
                        }
                        @Override
                        public boolean onResourceReady(Object resource, Object model, Target target, DataSource dataSource, boolean isFirstResource) {
                            return false;
                        }
                    })
                    .into ( holder.mIvThumbnail );
            // holder.mIvThumbnail.setImageURI(Uri.parse(file.getPath()));

            if (file.synchFlag == BaseFile.Synchronizing) {
                holder.mCbx.setSelected ( false );
                holder.mShadow.setVisibility(View.GONE);
                holder.icAlbum.setVisibility(View.GONE);
                holder.icSyncing.setVisibility(View.VISIBLE);
                holder.icSynced.setVisibility(View.GONE);
            }
            else if (file.synchFlag == BaseFile.Synchronized) {
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
//                intent.setDataAndType(uri, "image/*");
//                if (Util.detectIntent(mContext, intent)) {
//                    mContext.startActivity(intent);
//                }
//                else {
//                    ToastUtil.getInstance(mContext).showToast(mContext.getString(R.string.vw_no_image_show_app));
//                }
//                return false;
                return startMediaViewer(mContext, view, "image/*", file.getPath());
            });

            holder.mIvThumbnail.setOnClickListener ((View view) -> {
                int index = isNeedCamera ? holder.getAdapterPosition ( ) - 1 : holder.getAdapterPosition ( );

                int sync = mList.get(index).synchFlag;
                if ( sync == BaseFile.Synchronized || sync == BaseFile.Synchronizing)
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
        }

    }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    class ImagePickViewHolder extends RecyclerView.ViewHolder {
        private final ImageView icAlbum;
        private final ImageView icSynced;
        private final ImageView icSyncing;
        private final ImageView mIvThumbnail;
        private final View mShadow;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        public ImagePickViewHolder ( View itemView ) {
            super ( itemView );
            icAlbum = (ImageView) itemView.findViewById ( R.id.xiv_album_icon);
            icSyncing = (ImageView) itemView.findViewById ( R.id.xiv_syncing_icon);
            icSynced = (ImageView) itemView.findViewById ( R.id.xiv_synced_icon);

            mIvThumbnail = (ImageView) itemView.findViewById ( R.id.xiv_thumbnail );
            mShadow = itemView.findViewById ( R.id.x_shadow );
            mCbx = (ImageView) itemView.findViewById ( R.id.x_check );
            animation = itemView.findViewById ( R.id.animationSquare );
        }
    }
}
