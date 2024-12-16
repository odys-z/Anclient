package io.oz.fpick.adapter;

import static io.odysz.common.LangExt.isNull;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import androidx.core.content.FileProvider;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.albumtier.AlbumContext;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;
import io.oz.syndoc.client.PhotoSyntier;
import io.oz.syndoc.client.PushingState;

import static io.odysz.common.LangExt.isblank;

public abstract class BaseSynchronizer <T extends AndroidFile, VH extends RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH> {

    public String mFilepath;

    protected boolean isNeedCamera;
    protected int mMaxNumber;
    protected int mCurrentNumber = 0;

    /** Prevent measuring for every item */
    protected int itemWidth = -1;


    public boolean isUpToMax () {
        return mCurrentNumber >= mMaxNumber;
    }

    public void setCurrentNumber(int number) {
        mCurrentNumber = number;
    }

    protected BaseActivity mContext;
    protected ArrayList<T> mList;
    protected BaseActivity.OnSelectStateListener mListener;

    protected AlbumContext singleton;

    protected PathsPage synchPage;

    /**
     * @param list resource list
     */
    public BaseSynchronizer(BaseActivity ctx, ArrayList<T> list) {
        this.singleton = AlbumContext.getInstance(ctx);
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

    public List<T> getDataSet() { return mList; }

    /**
     * Add file list to my list, then start asynchronize matching.
     * My list is used for feeding item holder used for buffered rendering (by Glide).
     * @param list local items
     */
    @SuppressLint("NotifyDataSetChanged")
    public void refreshSyncs(List<AndroidFile> list) {
        mList.clear();
        mList.addAll((Collection<? extends T>) list); // why this with performance cost?
        notifyDataSetChanged();

        synchPage = new PathsPage(0, Math.min(20, mList.size()));
        synchPage.device = singleton.userInf.device;

        try {
            mContext.onStartingJserv(0, 1);
            if (singleton.needLogin())
                singleton.login((c) -> startSynchQuery(synchPage), singleton.errCtx);
            else
                startSynchQuery(synchPage);
        } catch (GeneralSecurityException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exSession, e.getMessage());
        } catch (SemanticException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exSemantic, e.getMessage());
        } catch (IOException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exIo, e.getMessage());
        }
    }

    void startSynchQuery(PathsPage page)  {
         if (!isNull(singleton.tier))
            singleton.tier.asynQueryDocs(mList, page, onSyncQueryResponse,
                (c, r, args) -> { singleton.errCtx.err(c, r, args); });
    }

    /**
     * Query response handler, triggering query on following pages.
     */
    JProtocol.OnOk onSyncQueryResponse = (resp) -> {
        DocsResp rsp = (DocsResp) resp;
        PathsPage synchPage = ((DocsResp) resp).syncing();
        if (synchPage.end() <= mList.size()) {
            // sequence order is guaranteed.
            HashMap<String, String[]> phts = (HashMap<String, String[]>)rsp.syncing().paths();
            for (int i = synchPage.start(); i < synchPage.end(); i++) {
                T f = mList.get(i);
                if (phts.containsKey(f.fullpath())) {
                    // [sync-flag, share-falg, share-by, share-date]
                    String[] inf = phts.get(f.fullpath());
                    if (isNull(inf)) continue;

                    // Note for MVP 0.2.1, tolerate server side error. The file is found, can't be null
                    f.syncFlag = isblank(inf[0]) ? PushingState.priv : inf[0];

                    // f.shareFlag = inf[1];
                    f.shareby = (String) inf[2];
                    f.sharedate((String) inf[3]);
                }
            }

            updateIcons(synchPage);

            if (mList.size() > synchPage.end()) {
                synchPage.nextPage(Math.min(20, mList.size() - synchPage.end()));
                startSynchQuery(synchPage);
            }
            else mContext.onEndingJserv(null);
        }
        else mContext.onEndingJserv(null);
    };

    void updateIcons(PathsPage page) {
        ((Activity)mContext).runOnUiThread(new Runnable() {
            // avoid multiple page range in error
            int start;
            int size;
            {
                try {
                    start = page.start();
                    size = page.end() - page.start();
                } catch (SemanticException e) {
                    e.printStackTrace();
                    start = 0;
                    size = 20;
                }
            }
            @Override
            public void run() {
                notifyItemRangeChanged(start, size);
            }
        });
    }

    public void selectListener(BaseActivity.OnSelectStateListener listener) {
        mListener = listener;
    }

    /**
     * @param ctx the context
     * @param dataType "video/*" or "image/*"
     * @param path full path
     * @return false
     */
    protected static boolean startMediaViewer(Context ctx, String dataType, String path) {
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

