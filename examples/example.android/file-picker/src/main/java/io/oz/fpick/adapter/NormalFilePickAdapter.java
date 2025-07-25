/**
 * Created by Ody Zhou
 * Credits to Vincent Woo
 */

//package io.oz.fpick.adapter;
//
//import android.graphics.drawable.AnimationDrawable;
//import android.view.LayoutInflater;
//import android.view.View;
//import android.view.ViewGroup;
//import android.view.animation.AnimationUtils;
//import android.widget.ImageView;
//import android.widget.RelativeLayout;
//import android.widget.TextView;
//
//import androidx.annotation.NonNull;
//import androidx.recyclerview.widget.RecyclerView;
//
//import com.vincent.filepicker.ToastUtil;
//import com.vincent.filepicker.Util;
//import com.vincent.filepicker.filter.entity.NormalFile;
//
//import java.util.ArrayList;
//
//import io.oz.fpick.R;
//import io.oz.fpick.activity.BaseActivity;
//import io.oz.fpick.activity.NormalFilePickActivity;
//
///**
// * Not used for Android 10.
// */
//public class NormalFilePickAdapter extends BaseSynchronizer<NormalFile, NormalFilePickAdapter.NormalFilePickViewHolder> {
//    // private int mMaxNumber;
//    // private int mCurrentNumber = 0;
//
//    public NormalFilePickAdapter(NormalFilePickActivity ctx, int max) {
//        this(ctx, new ArrayList<NormalFile>(), max);
//    }
//
//    public NormalFilePickAdapter(BaseActivity ctx, ArrayList<NormalFile> list, int max) {
//        super(ctx, list);
//        mMaxNumber = max;
//    }
//
//    @NonNull
//    @Override
//    public NormalFilePickViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
//        View itemView = LayoutInflater.from(mContext).inflate(R.layout.vw_layout_item_normal_file_pick, parent, false);
//        NormalFilePickViewHolder holder = new NormalFilePickViewHolder(itemView);
//        holder.setIsRecyclable ( true );
//        return holder;
//    }
//
//    @Override
//    public void onBindViewHolder(final NormalFilePickViewHolder holder, final int position) {
//        final NormalFile file = mList.get(position);
//
//        holder.mTvTitle.setText(Util.extractFileNameWithSuffix(file.fullpath()));
//        holder.mTvTitle.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED);
//        if (holder.mTvTitle.getMeasuredWidth() >
//                Util.getScreenWidth(mContext) - Util.dip2px(mContext, 10 + 32 + 10 + 48 + 10 * 2)) {
//            holder.mTvTitle.setLines(2);
//        } else {
//            holder.mTvTitle.setLines(1);
//        }
//
//        if (file.isSelected()) {
//            holder.mCbx.setSelected(true);
//            holder.animation.setVisibility ( View.VISIBLE );
//            holder.animation.setAlpha ( 1f );
//            AnimationDrawable animationDrawable = (AnimationDrawable) holder.animation.getBackground ( );
//            AnimationUtils.loadAnimation ( mContext,R.anim.rotate_animation );
//            animationDrawable.start ();
//
//        } else {
//            holder.mCbx.setSelected(false);
//            holder.animation.setVisibility ( View.INVISIBLE );
//            holder.animation.setAlpha ( 0f );
//        }
//
//        if (file.fullpath().endsWith("xls") || file.fullpath().endsWith("xlsx")) {
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_excel);
//        } else if (file.fullpath().endsWith("doc") || file.fullpath().endsWith("docx")){
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_word);
//        } else if (file.fullpath().endsWith("ppt") || file.fullpath().endsWith("pptx")){
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_ppt);
//        } else if (file.fullpath().endsWith("pdf")){
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_pdf);
//        } else if (file.fullpath().endsWith("txt")){
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_txt);
//        } else {
//            holder.mIvIcon.setImageResource(R.drawable.vw_ic_file);
//        }
//
//        //change itemview to mCbx
//        holder.itemView.setOnClickListener(v -> {
//            if (!v.isSelected() && isUpToMax()) {
//                ToastUtil.getInstance(mContext).showToast(R.string.vw_up_to_max);
//                return;
//            }
//
//            if (v.isSelected()) {
//                holder.mCbx.setSelected(false);
//                mCurrentNumber--;
//            } else {
//                holder.mCbx.setSelected(true);
//                mCurrentNumber++;
//            }
//
//            mList.get(holder.getAdapterPosition()).setSelected(holder.mCbx.isSelected());
//
//            if (mListener != null) {
//                mListener.onSelectStateChanged(holder.getAdapterPosition(), holder.mCbx.isSelected(), mList.get(holder.getAdapterPosition()),holder.animation);
//            }
//        });
//    }
//
//    @Override
//    public int getItemCount() {
//        return mList.size();
//    }
//
//    static class NormalFilePickViewHolder extends RecyclerView.ViewHolder {
//        private final ImageView mIvIcon;
//        private final TextView mTvTitle;
//        private final ImageView mCbx;
//        private final RelativeLayout animation;
//        public NormalFilePickViewHolder(View itemView) {
//            super(itemView);
//            mIvIcon = itemView.findViewById(R.id.ic_file);
//            mTvTitle = itemView.findViewById(R.id.tv_file_title);
//            mCbx = itemView.findViewById(R.id.cbx);
//            animation = itemView.findViewById ( R.id.animationFile );
//        }
//    }
//}
