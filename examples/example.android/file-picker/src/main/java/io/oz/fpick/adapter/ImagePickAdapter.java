/**
 * Created by Ody Zhou
 * Date: 15 Feb. 2022
 * Credits to Vincent Woo
 */
package io.oz.fpick.adapter;

import static io.odysz.common.LangExt.isblank;

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

import androidx.annotation.NonNull;

import com.vincent.filepicker.filter.entity.ImageFile;

import java.util.ArrayList;

import io.odysz.semantic.tier.docs.ShareFlag;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
import io.oz.fpick.activity.ImagePickActivity;

public class ImagePickAdapter extends PickAdaptor<ImageFile, ImagePickAdapter.ImagePickViewHolder> {


    public ImagePickAdapter(ImagePickActivity ctx, boolean needCamera, int max) {
        this(ctx, new ArrayList<>(), needCamera, max);
    }

    public ImagePickAdapter(BaseActivity ctx, ArrayList<AndroidFile> list, boolean needCamera, int max) {
        super(ctx, list, max);
        isNeedCamera = needCamera;
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


    /*
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

        holder.setIsRecyclable ( true );
    }
     */

    @Override
    protected void visualHolder0(ImagePickViewHolder holder) {
        holder.cmd0.setVisibility ( View.VISIBLE );
        holder.vSynpublic.setVisibility ( View.INVISIBLE );
        holder.vSynpriv.setVisibility ( View.INVISIBLE );
        holder.glideThumb.setVisibility ( View.INVISIBLE );
        // holder.mCbx.setVisibility ( View.GONE );
        holder.vShadow.setVisibility ( View.INVISIBLE );
    }

    @Override
    protected void visualHolderx(ImagePickViewHolder holder, AndroidFile file) {
//        if (isblank(file.shareflag))
//            file.shareflag = ShareFlag.device.name();

        ShareFlag share = file.shareflag == null ? null : ShareFlag.valueOf(file.shareflag);

        holder.cmd0.setVisibility(View.GONE);
        holder.vShadow.setVisibility(View.GONE);
        holder.vSynpublic.setVisibility(View.GONE);
        holder.vSyncing.setVisibility(View.GONE);
        holder.vSynpriv.setVisibility(View.GONE);
        holder.glideThumb.setVisibility ( View.VISIBLE );

        if (!file.isSelected())
            if (ShareFlag.pushing == share) {
                holder.vSyncing.setVisibility(View.VISIBLE);
            }
            else if (ShareFlag.publish == share) {
                holder.vSynpublic.setVisibility(View.VISIBLE);
            }
            else if (ShareFlag.prv == share) {
                holder.vSynpriv.setVisibility(View.VISIBLE);
            }

        visualSelect(file.isSelected(), holder);
    }

    @Override
    protected void visualSelect(boolean selected, ImagePickViewHolder holder) {
        if (selected) {
            // not synced but selected
            // holder.mCbx.setSelected ( true );
            holder.vShadow.setVisibility ( View.VISIBLE );

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

//    RequestListener glideListener = new RequestListener() {
//        @Override
//        public boolean onLoadFailed(@Nullable GlideException e, Object model, @NonNull Target target, boolean isFirstResource) {
//            return false;
//        }
//        @Override
//        public boolean onResourceReady(@NonNull Object resource, @NonNull Object model, Target target, @NonNull DataSource dataSource, boolean isFirstResource) {
//            return false;
//        }
//    };

    @Override
    protected String mediaViewType() {
        return "image/*";
    }

    @Override
    public int getItemCount () {
        return isNeedCamera ? mList.size ( ) + 1 : mList.size ( );
    }

    static class ImagePickViewHolder extends ViewHolder4Glide {
        private final ImageView cmd0;
        private final ImageView vSynpublic;

        private final ImageView vSynpriv;
        private final ImageView vSyncing;
        // private final ImageView vImage;
        private final View vShadow;
        // private final ImageView mCbx;
        private final RelativeLayout animation;

        public ImagePickViewHolder ( View itemView ) {
            super ( itemView );
            cmd0 = itemView.findViewById(R.id.xiv_album_cmd);
            vSyncing = itemView.findViewById(R.id.xiv_syncing_icon);
            vSynpublic = itemView.findViewById(R.id.xiv_synced_icon);
            vSynpriv = itemView.findViewById(R.id.xiv_synprv_icon);

            // vImage = itemView.findViewById(R.id.xiv_thumbnail);
            vShadow = itemView.findViewById(R.id.x_shadow);
            // mCbx        = itemView.findViewById(R.id.x_check);
            animation   = itemView.findViewById(R.id.animationSquare);
        }
    }
}
