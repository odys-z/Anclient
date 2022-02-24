package io.oz.fpick.adapter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.adapter.OnSelectStateListener;
import com.vincent.filepicker.filter.entity.BaseFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;

import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.SyncingPage;
import io.oz.album.tier.AlbumResp;
import io.oz.albumtier.AlbumContext;

public abstract class BaseSynchronizer <T extends BaseFile, VH extends RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH> {

    protected boolean isNeedCamera;
    protected int mMaxNumber;
    protected int mCurrentNumber = 0;

    protected Context mContext;
    protected ArrayList<T> mList;
    protected OnSelectStateListener<T> mListener;

    protected AlbumContext singleton;

    protected SyncingPage synchPage;

    public BaseSynchronizer(Context ctx, ArrayList<T> list) {
        mContext = ctx;
        mList = list;
    }

    @SuppressLint("NotifyDataSetChanged")
    public void add(List<T> list) {
        mList.addAll(list);
        notifyDataSetChanged();
    }

    public void add(T file) {
        mList.add(file);
        notifyItemChanged(mList.size() - 1);
    }

    public void add(int index, T file) {
        mList.add(index, file);
        notifyItemChanged(index);
    }

    public List<T> getDataSet() { return (List<T>) mList; }

    @SuppressLint("NotifyDataSetChanged")
    public void refresh(List<T> list) {
        mList.clear();
        mList.addAll(list);
        notifyDataSetChanged();

        synchPage = new SyncingPage(0, Math.min(20, mList.size()));
        synchPage.taskNo = nextRandomInt();
        synchPage.device = singleton.photoUser.device;
        if (singleton.tier != null)
            startSynchQuery(synchPage);
    }

    void startSynchQuery(SyncingPage page) {
        singleton.tier.asyncQuerySyncs(mList, page,
                onSychnQueryRespons,
                (c, r, args) -> {
                    Log.e(singleton.clientUri, String.format(r, args == null ? "null" : args[0]));
                });
    }

    JProtocol.OnOk onSychnQueryRespons = (resp) -> {
        AlbumResp rsp = (AlbumResp) resp;
        if (synchPage.taskNo == rsp.syncing().taskNo && synchPage.end < mList.size()) {
//            Photo[] phts = rsp.photos(0);
//            for (int i = synchPage.start; i < synchPage.end && i - synchPage.start < phts.length; i++)
//                mList.get(i).synchFlag(phts[i - synchPage.start].syncFlag);
            // sequence order is guaranteed.
            HashMap<String, Object> phts = rsp.syncPaths();
            for (int i = synchPage.start; i < synchPage.end; i++) {
                T f = mList.get(i);
                if (phts.keySet().contains(f.fullpath())) {
                    f.synchFlag = 1;
                }
            }

            upateIcons();

            if (mList.size() >= synchPage.end) {
                synchPage.nextPage(Math.min(20, mList.size() - synchPage.end));
                startSynchQuery(synchPage);
            }
        }
    };

    void upateIcons() {
        ((Activity)mContext).runOnUiThread( () -> notifyDataSetChanged() );
    }

    public void setOnSelectStateListener(OnSelectStateListener<T> listener) {
        mListener = listener;
    }

    private static final Random RANDOM = new Random();
    public static int nextRandomInt() {
        return RANDOM.nextInt(1024 * 1024);
    }
}

