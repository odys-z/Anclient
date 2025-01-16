/**
 * Created by Ody Zhou
 * Date: 15 Feb. 2022
 * Credits to Vincent Woo
 */
package io.oz.fpick.adapter;

import android.content.Context;
import android.graphics.drawable.AnimationDrawable;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.RelativeLayout;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.request.target.Target;
import com.vincent.filepicker.ToastUtil;

import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.activity.ImagePickActivity;
import com.vincent.filepicker.filter.entity.ImageFile;

import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;
import static io.odysz.common.LangExt.isblank;

public class ImagePickAdapter extends BaseSynchronizer<ImageFile, ImagePickAdapter.ImagePickViewHolder> {


    public ImagePickAdapter(ImagePickActivity ctx, boolean needCamera, int max) {
        this ( ctx, new ArrayList<>(), needCamera , max );
    }

    public ImagePickAdapter(BaseActivity ctx, ArrayList<ImageFile> list, boolean needCamera, int max) {
        super ( ctx , list, max );
        isNeedCamera = needCamera;
//        mMaxNumber = max;
    }

    @NonNull
    @Override
    public ImagePickViewHolder onCreateViewHolder (@NonNull ViewGroup parent, int viewType ) {
        View itemView = LayoutInflater.from ( mContext ).inflate ( R.layout.vw_layout_item_image_pick, parent, false );
        ViewGroup.LayoutParams params = itemView.getLayoutParams ( );
        if ( params != null ) {
            WindowManager wm = (WindowManager) mContext.getSystemService ( Context.WINDOW_SERVICE );
            DisplayMetrics displaymetrics = new DisplayMetrics();
            wm.getDefaultDisplay().getMetrics(displaymetrics);
            itemWidth = displaymetrics.widthPixels;
            params.height = itemWidth / ImagePickActivity.COLUMN_NUMBER;
        }
        ImagePickViewHolder imagePickViewHolder = new ImagePickViewHolder(itemView);

        // see https://github.com/wasabeef/recyclerview-animators/issues/85#issuecomment-235149939
        imagePickViewHolder.setIsRecyclable ( false );

        return imagePickViewHolder;
    }


    @Override
    public void onBindViewHolder (@NonNull final ImagePickViewHolder holder , final int position ) {
        if ( isNeedCamera && position == 0 ) {
            setHolder0(holder);
            return;
        }

        ImageFile file;
        int fx = isNeedCamera ? position - 1 : position;
        file = mList.get(fx);

        setHolderx(holder, file);

        Glide.with ( mContext )
                .load ( file.fullpath() )
                .apply(RequestOptions.diskCacheStrategyOf(DiskCacheStrategy.RESOURCE)
                        .centerCrop()
                        .error(R.drawable.vw_ic_synced))
                .transition ( withCrossFade() )
                .listener(glideListener)
                .into (holder.vImage);

        holder.vImage.setOnLongClickListener(
               (View view) -> startMediaViewer(mContext, "image/*", file.fullpath()));

        holder.vImage.setOnClickListener((View h) -> {
            ShareFlag share = ShareFlag.valueOf(file.shareflag);
            if (ShareFlag.publish == share || ShareFlag.prv == share) // revoke is not supported on devices
                return;

            if ( !file.isSelected() && isUpToMax() ) {
                ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
            }
            else {
                if (file.setSelected(!file.isSelected(), shareSetting)) {
                    mCurrentNumber--;
                    mSelections.remove(file);
                    holder.vShadow.setVisibility ( View.VISIBLE );
                    holder.mCbx.setSelected ( true );
                }
                else {
                    mSelections.add(file);
                    mCurrentNumber++;
                    holder.vShadow.setVisibility ( View.GONE );
                    holder.mCbx.setSelected ( false );
                }
            }
            mContext.onselect(file);
        });

        holder.setIsRecyclable ( true );
    }

    private void setHolder0(ImagePickViewHolder holder) {
        holder.vAlbum.setVisibility ( View.VISIBLE );
        holder.vSynpublic.setVisibility ( View.INVISIBLE );
        holder.vSynpriv.setVisibility ( View.INVISIBLE );
        holder.vImage.setVisibility ( View.INVISIBLE );
        holder.mCbx.setVisibility ( View.GONE );
        holder.vShadow.setVisibility ( View.INVISIBLE );
    }

    private void setHolderx(ImagePickViewHolder holder, ImageFile file) {
        if (isblank(file.shareflag))
            file.shareflag = ShareFlag.device.name();

        ShareFlag share = ShareFlag.valueOf(file.shareflag);

        if (ShareFlag.pushing == share) {
            holder.mCbx.setSelected ( false );
            holder.vShadow.setVisibility(View.GONE);
            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.VISIBLE);
            holder.vSynpublic.setVisibility(View.GONE);
            holder.vSynpriv.setVisibility(View.GONE);
        }
        else if (ShareFlag.publish == share) {
            holder.mCbx.setSelected(true);
            holder.vShadow.setVisibility(View.GONE);
            holder.vAlbum.setVisibility(View.INVISIBLE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynpublic.setVisibility(View.VISIBLE);
            holder.vSynpriv.setVisibility(View.GONE);
        }
        else if (ShareFlag.prv == share) {
            holder.mCbx.setSelected(true);
            holder.vShadow.setVisibility(View.GONE);
            holder.vAlbum.setVisibility(View.INVISIBLE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynpublic.setVisibility(View.GONE);
            holder.vSynpriv.setVisibility(View.VISIBLE);
        }
        else if ( file.isSelected ( ) ) {
            // not synced but selected
            holder.mCbx.setSelected ( true );
            holder.vShadow.setVisibility ( View.VISIBLE );

            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynpublic.setVisibility(View.GONE);
            holder.vSynpriv.setVisibility(View.GONE);

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
            holder.vAlbum.setVisibility(View.GONE);
            holder.vSyncing.setVisibility(View.GONE);
            holder.vSynpublic.setVisibility(View.GONE);
            holder.vSynpriv.setVisibility(View.GONE);

            holder.animation.setVisibility ( View.GONE );
            holder.animation.setAlpha ( 0f );
            holder.vShadow.setVisibility ( View.INVISIBLE );
        }
    }

    RequestListener glideListener = new RequestListener() {
        @Override
        public boolean onLoadFailed(@Nullable GlideException e, Object model, @NonNull Target target, boolean isFirstResource) {
            return false;
        }
        @Override
        public boolean onResourceReady(@NonNull Object resource, @NonNull Object model, Target target, @NonNull DataSource dataSource, boolean isFirstResource) {
            return false;
        }
    };
    public void onBindViewHolder_del (@NonNull final ImagePickViewHolder holder , final int position ) {
        if ( isNeedCamera && position == 0 ) {
            holder.vAlbum.setVisibility ( View.VISIBLE );
            holder.vSynpublic.setVisibility ( View.INVISIBLE );
            holder.vSynpriv.setVisibility ( View.INVISIBLE );
            holder.vImage.setVisibility ( View.INVISIBLE );
            holder.mCbx.setVisibility ( View.GONE );
            holder.vShadow.setVisibility ( View.INVISIBLE );
        }
        else {
            holder.vSynpublic.setVisibility ( View.INVISIBLE );
            holder.vImage.setVisibility ( View.VISIBLE );
            holder.mCbx.setVisibility ( View.GONE );

            ImageFile file;
            if ( isNeedCamera ) {
                file = mList.get ( position - 1 );
            }
            else {
                file = mList.get ( position );
            }

            Glide.with ( mContext )
                .load ( file.fullpath() )
                .apply(RequestOptions.diskCacheStrategyOf(DiskCacheStrategy.RESOURCE)
                        .centerCrop()
                        .error(R.drawable.vw_ic_synced))
                .transition ( withCrossFade() )
                .listener(new RequestListener() {
                    @Override
                    public boolean onLoadFailed(@Nullable GlideException e, Object model, @NonNull Target target, boolean isFirstResource) {
                        return false;
                    }
                    @Override
                    public boolean onResourceReady(@NonNull Object resource, @NonNull Object model, Target target, @NonNull DataSource dataSource, boolean isFirstResource) {
                        return false;
                    }
                })
                .into ( holder.vImage);

            if (isblank(file.shareflag))
                file.shareflag = ShareFlag.device.name();

            ShareFlag share = ShareFlag.valueOf(file.shareflag);
            if (ShareFlag.pushing == share) {
                holder.mCbx.setSelected ( false );
                holder.vShadow.setVisibility(View.GONE);
                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.VISIBLE);
                holder.vSynpublic.setVisibility(View.GONE);
                holder.vSynpriv.setVisibility(View.GONE);
            }
            else if (ShareFlag.publish == share) {
                holder.mCbx.setSelected(true);
                holder.vShadow.setVisibility(View.GONE);
                holder.vAlbum.setVisibility(View.INVISIBLE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynpublic.setVisibility(View.VISIBLE);
                holder.vSynpriv.setVisibility(View.GONE);
            }
            else if (ShareFlag.prv == share) {
                holder.mCbx.setSelected(true);
                holder.vShadow.setVisibility(View.GONE);
                holder.vAlbum.setVisibility(View.INVISIBLE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynpublic.setVisibility(View.GONE);
                holder.vSynpriv.setVisibility(View.VISIBLE);
            }
            else if ( file.isSelected ( ) ) {
                // not synced but selected
                holder.mCbx.setSelected ( true );
                holder.vShadow.setVisibility ( View.VISIBLE );

                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynpublic.setVisibility(View.GONE);
                holder.vSynpriv.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.VISIBLE );
                holder.animation.setAlpha ( 1f );
                AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
                Animation a = AnimationUtils.loadAnimation ( mContext, R.anim.rotate_animation );
                animationDrawable.start ();
                a.start();
            }
            else {
                // not synced and not selected
                holder.mCbx.setSelected ( false );
                holder.vAlbum.setVisibility(View.GONE);
                holder.vSyncing.setVisibility(View.GONE);
                holder.vSynpublic.setVisibility(View.GONE);
                holder.vSynpriv.setVisibility(View.GONE);

                holder.animation.setVisibility ( View.GONE );
                holder.animation.setAlpha ( 0f );
                holder.vShadow.setVisibility ( View.INVISIBLE );
            }

            holder.vImage.setOnLongClickListener(
                    (View view) -> startMediaViewer(mContext, "image/*", file.fullpath()));

            holder.vImage.setOnClickListener ((View view) -> {
                // int index = isNeedCamera ? holder.getAdapterPosition ( ) - 1 : holder.getAdapterPosition ( );
                int index = isNeedCamera ? holder.getAbsoluteAdapterPosition( ) - 1
                                         : holder.getAbsoluteAdapterPosition( );

                ShareFlag sync = ShareFlag.valueOf(mList.get(index).shareflag());
                if (ShareFlag.publish == sync || ShareFlag.pushing == sync)
                    return;

                if ( !holder.mCbx.isSelected ( ) && isUpToMax ( ) ) {
                    ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
                    return;
                }

                if ( holder.mCbx.isSelected ( ) ) {
                    holder.vShadow.setVisibility ( View.GONE );
                    holder.mCbx.setSelected ( false );
                    mCurrentNumber--;
                    mList.get ( index ).setSelected ( false, ShareFlag.prv );
                }
                else {
                    holder.vShadow.setVisibility ( View.VISIBLE );
                    holder.mCbx.setSelected ( true );
                    mCurrentNumber++;
                    mList.get ( index ).setSelected ( true, ShareFlag.prv );
                }

//                if ( mListener != null ) {
//                    mListener.onSelectStateChanged( index , holder.mCbx.isSelected ( ) , mList.get ( index ) , holder.animation );
//                }
            });

            holder.setIsRecyclable ( true );
        }
    }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    static class ImagePickViewHolder extends RecyclerView.ViewHolder {
        private final ImageView vAlbum;
        private final ImageView vSynpublic;

        private final ImageView vSynpriv;
        private final ImageView vSyncing;
        private final ImageView vImage;
        private final View vShadow;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        public ImagePickViewHolder ( View itemView ) {
            super ( itemView );
            vAlbum = itemView.findViewById(R.id.xiv_album_icon);
            vSyncing = itemView.findViewById(R.id.xiv_syncing_icon);
            vSynpublic = itemView.findViewById(R.id.xiv_synced_icon);
            vSynpriv = itemView.findViewById(R.id.xiv_synprv_icon);

            vImage = itemView.findViewById(R.id.xiv_thumbnail);
            vShadow = itemView.findViewById(R.id.x_shadow);
            mCbx        = itemView.findViewById(R.id.x_check);
            animation   = itemView.findViewById(R.id.animationSquare);
        }
    }
}
