package com.vincent.filepicker.adapter;

import android.content.Context;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import io.oz.albumtier.AlbumContext;

/**
 * Modified by Ody Zhou
 *
 * Created by Vincent Woo
 * Date: 2016/10/14
 * Time: 15:42
 */

public abstract class BaseAdapter<T, VH extends RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH> {
    public class SyncingPage {
        public int start;
        public int end;

        public SyncingPage(int begin, int afterLast) {
            start = begin;
            end = afterLast;
        }

        public SyncingPage nextPage(int size) {
            start = end;
            end += size;
            return this;
        }
    }

    protected Context mContext;
    protected ArrayList<T> mList;
    protected OnSelectStateListener<T> mListener;

    protected AlbumContext singleton;

    protected SyncingPage synchPage;

    public BaseAdapter(Context ctx, ArrayList<T> list) {
        mContext = ctx;
        mList = list;
    }

    public void add(List<T> list) {
        mList.addAll(list);
        notifyDataSetChanged();
    }

    public void add(T file) {
        mList.add(file);
        notifyDataSetChanged();
    }

    public void add(int index, T file) {
        mList.add(index, file);
        notifyDataSetChanged();
    }

    public void refresh(List<T> list) {
        mList.clear();
        mList.addAll(list);
        notifyDataSetChanged();
    }

    public void refresh(T file) {
        mList.clear();
        mList.add(file);
        notifyDataSetChanged();
    }

    public List<T> getDataSet() {
        return mList;
    }

    public void setOnSelectStateListener(OnSelectStateListener<T> listener) {
        mListener = listener;
    }
}
