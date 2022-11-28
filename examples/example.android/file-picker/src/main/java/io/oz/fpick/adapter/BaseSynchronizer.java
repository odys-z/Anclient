package io.oz.fpick.adapter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.view.View;

import androidx.core.content.FileProvider;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;
import com.vincent.filepicker.adapter.OnSelectStateListener;
import com.vincent.filepicker.filter.entity.BaseFile;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;

import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.R;

public abstract class BaseSynchronizer <T extends BaseFile, VH extends RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH> {

    protected boolean isNeedCamera;
    protected int mMaxNumber;
    protected int mCurrentNumber = 0;

    public boolean isUpToMax () {
        return mCurrentNumber >= mMaxNumber;
    }

    public void setCurrentNumber(int number) {
        mCurrentNumber = number;
    }

    protected Context mContext;
    protected ArrayList<T> mList;
    protected OnSelectStateListener<T> mListener;

    protected AlbumContext singleton;

    protected PathsPage synchPage;

    public BaseSynchronizer(Context ctx, ArrayList<T> list) {
        this.singleton = AlbumContext.getInstance();
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

        synchPage = new PathsPage(0, Math.min(20, mList.size()));
        // synchPage.taskNo = nextRandomInt();
        synchPage.device = singleton.photoUser.device;
        if (singleton.tier != null)
            startSynchQuery(synchPage);
    }

    void startSynchQuery(PathsPage page) {
        singleton.tier.asynQueryDocs(mList, page,
                onSyncQueryResponse,
                (c, r, args) -> {
                    Log.e(singleton.clientUri, String.format(r, args == null ? "null" : args[0]));
                });
    }

    JProtocol.OnOk onSyncQueryResponse = (resp) -> {
        DocsResp rsp = (DocsResp) resp;
        if (// synchPage.taskNo == rsp.syncing().taskNo &&
            synchPage.end() < mList.size()) {
//            Photo[] phts = rsp.photos(0);
//            for (int i = synchPage.start; i < synchPage.end && i - synchPage.start < phts.length; i++)
//                mList.get(i).synchFlag(phts[i - synchPage.start].syncFlag);
            // sequence order is guaranteed.

            HashMap<String, String[]> phts = rsp.syncing().paths();
            for (int i = synchPage.start(); i < synchPage.end(); i++) {
                T f = mList.get((int)i);
                if (phts.containsKey(f.fullpath())) {
                    String[] inf = phts.get(f.fullpath());
                    f.syncFlag = inf[0];
                    f.shareflag = inf[1];
                    f.sharedate(inf[2]);
                }
            }

            updateIcons(synchPage);

            if (mList.size() >= synchPage.end()) {
                synchPage.nextPage(Math.min(20, mList.size() - synchPage.end()));
                startSynchQuery(synchPage);
            }
        }
    };

    void updateIcons(PathsPage synchPage) {
        ((Activity)mContext).runOnUiThread( () -> {
            try {
                notifyItemRangeChanged(synchPage.start(), synchPage.end());
            } catch (SemanticException e) {
                e.printStackTrace();
            }
        });
    }

    public void setOnSelectStateListener(OnSelectStateListener<T> listener) {
        mListener = listener;
    }

    private static final Random RANDOM = new Random();
    public static int nextRandomInt() {
        return RANDOM.nextInt(1024 * 1024);
    }

    /**
     * @param view the file view - not used currently
     * @param dataType "video/*" or "image/*"
     * @param path full path
     * @return false
     */
    private boolean startMediaViewer(View view, String dataType, String path) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        Uri uri;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            File f = new File(path);
            uri = FileProvider.getUriForFile(mContext, mContext.getApplicationContext().getPackageName() + ".provider", f);
        }
        else {
            uri = Uri.parse("file://" + path);
        }
        intent.setDataAndType(uri, dataType);
        if (Util.detectIntent(mContext, intent)) {
            mContext.startActivity(intent);
        }
        else {
            ToastUtil.getInstance(mContext).showToast(mContext.getString(R.string.vw_no_image_show_app));
        }
        return false;
    }

    /**
     * @param ctx the context
     * @param view the file view - not used currently
     * @param dataType "video/*" or "image/*"
     * @param path full path
     * @return false
     */
    protected static boolean startMediaViewer(Context ctx, View view, String dataType, String path) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        Uri uri;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            File f = new File(path);
            uri = FileProvider.getUriForFile(ctx, ctx.getApplicationContext().getPackageName() + ".provider", f);
        }
        else {
            uri = Uri.parse("file://" + path);
        }
        intent.setDataAndType(uri, dataType);
        if (Util.detectIntent(ctx, intent)) {
            ctx.startActivity(intent);
        }
        else {
            ToastUtil.getInstance(ctx).showToast(ctx.getString(R.string.vw_no_image_show_app));
        }
        return false;
    }

}

