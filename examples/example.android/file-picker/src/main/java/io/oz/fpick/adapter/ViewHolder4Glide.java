package io.oz.fpick.adapter;

import android.view.View;
import android.widget.ImageView;

import androidx.recyclerview.widget.RecyclerView;

import io.oz.fpick.R;

public class ViewHolder4Glide extends RecyclerView.ViewHolder {
    protected final ImageView glideThumb;
    public ViewHolder4Glide(View itemView) {
        super(itemView);
        glideThumb = itemView.findViewById (R.id.xiv_thumbnail);
    }
}
