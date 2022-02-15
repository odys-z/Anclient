package io.oz.fpick.adapter;

import static com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions.withCrossFade;

import android.annotation.SuppressLint;
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
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.activity.ImagePickActivity;
import com.vincent.filepicker.adapter.BaseAdapter;
import com.vincent.filepicker.filter.entity.ImageFile;

import java.util.ArrayList;

import io.oz.fpick.R;

/**
 * Modified by Ody Zhou
 * Date: 15 Feb. 2022
 *
 * Created by Vincent Woo
 * Date: 2016/10/13
 * Time: 16:07
 */

public class ImagePickAdapter extends BaseAdapter<ImageFile, ImagePickAdapter.ImagePickViewHolder> {
    private boolean isNeedImagePager;
    private boolean isNeedCamera;
    private int mMaxNumber;
    private int mCurrentNumber = 0;
    public String mImagePath;
    public Uri mImageUri;

    public ImagePickAdapter(Context ctx , boolean needCamera , boolean isNeedImagePager , int max ) {
        this ( ctx , new ArrayList<ImageFile> ( ) , needCamera , isNeedImagePager , max );
    }

    public ImagePickAdapter(Context ctx , ArrayList<ImageFile> list , boolean needCamera , boolean needImagePager , int max ) {
        super ( ctx , list );
        isNeedCamera = needCamera;
        mMaxNumber = max;
        isNeedImagePager = needImagePager;
    }

    @NonNull
    @Override
    public ImagePickViewHolder onCreateViewHolder ( ViewGroup parent , int viewType ) {
        View itemView = LayoutInflater.from ( mContext ).inflate ( R.layout.vw_layout_item_image_pick , parent , false );
        ViewGroup.LayoutParams params = itemView.getLayoutParams ( );
        if ( params != null ) {
            WindowManager wm = (WindowManager) mContext.getSystemService ( Context.WINDOW_SERVICE );
            int width = wm.getDefaultDisplay ( ).getWidth ( );
            params.height = width / ImagePickActivity.COLUMN_NUMBER;
        }
        ImagePickViewHolder imagePickViewHolder = new ImagePickViewHolder ( itemView );
        imagePickViewHolder.setIsRecyclable ( false );
        return imagePickViewHolder;
    }

    @Override
    public void onBindViewHolder ( final ImagePickViewHolder holder , @SuppressLint("RecyclerView") final int position ) {
        if ( isNeedCamera && position == 0 ) {
            holder.imgMore.setVisibility ( View.VISIBLE );
            holder.mIvThumbnail.setVisibility ( View.INVISIBLE );
            holder.mCbx.setVisibility ( View.GONE );
            holder.mShadow.setVisibility ( View.INVISIBLE );
        }
        else {
            holder.imgMore.setVisibility ( View.INVISIBLE );
            holder.mIvThumbnail.setVisibility ( View.VISIBLE );
            holder.mCbx.setVisibility ( View.GONE );

            ImageFile file;
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
//                    .transition(new DrawableTransitionOptions().crossFade(500))
                    .into ( holder.mIvThumbnail );

            if ( file.isSelected ( ) ) {
                holder.mCbx.setSelected ( true );
                holder.mShadow.setVisibility ( View.VISIBLE );
                holder.animation.setVisibility ( View.VISIBLE );
                holder.animation.setAlpha ( 1f );
                AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
                Animation a= AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
//                    animation.startAnimation ( animationDrawable );
                animationDrawable.start ();
            }
            else {
                holder.mCbx.setSelected ( false );
                holder.animation.setVisibility ( View.GONE );
                holder.animation.setAlpha ( 0f );
                holder.mShadow.setVisibility ( View.INVISIBLE );
            }

                holder.mIvThumbnail.setOnClickListener ( new View.OnClickListener ( ) {
                    @Override
                    public void onClick ( View view ) {
                        if ( !holder.mCbx.isSelected ( ) && isUpToMax ( ) ) {
                            ToastUtil.getInstance ( mContext ).showToast ( R.string.vw_up_to_max );
                            return;
                        }

                        int index = isNeedCamera ? holder.getAdapterPosition ( ) - 1 : holder.getAdapterPosition ( );

                        if ( holder.mCbx.isSelected ( ) ) {
                            holder.mShadow.setVisibility ( View.GONE );
                            holder.mCbx.setSelected ( false );
                            mCurrentNumber--;
                            mList.get ( index ).setSelected ( false );
//                                holder.animation.setAlpha ( 0f );
                        }
                        else {
                            holder.mShadow.setVisibility ( View.VISIBLE );
                            holder.mCbx.setSelected ( true );
                            mCurrentNumber++;
                            mList.get ( index ).setSelected ( true );
//                                holder.animation.setAlpha ( 1f );
//                                final Animation a = AnimationUtils.loadAnimation ( mContext , R.anim.rotate_animation );
//                                holder.animation.startAnimation ( a );
                        }

                        if ( mListener != null ) {
                            mListener.OnSelectStateChanged ( index , holder.mCbx.isSelected ( ) , mList.get ( index ) , holder.animation );
                        }
                    }
                } );

//            }
        }
    }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    class ImagePickViewHolder extends RecyclerView.ViewHolder {
        private final ImageView imgMore;
        private final ImageView mIvThumbnail;
        private final View mShadow;
        private final ImageView mCbx;
        private final RelativeLayout animation;

        public ImagePickViewHolder ( View itemView ) {
            super ( itemView );
            imgMore = (ImageView) itemView.findViewById ( R.id.xiv_more_icon );
            mIvThumbnail = (ImageView) itemView.findViewById ( R.id.iv_thumbnail );
            mShadow = itemView.findViewById ( R.id.shadow );
            mCbx = (ImageView) itemView.findViewById ( R.id.cbx );
            animation = itemView.findViewById ( R.id.animationSquare );
        }
    }

    public boolean isUpToMax () {
        return mCurrentNumber >= mMaxNumber;
    }

    public void setCurrentNumber ( int number ) {
        mCurrentNumber = number;
    }
}
