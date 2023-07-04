package io.oz.fpick.adapter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.view.View;

import androidx.core.content.FileProvider;
import androidx.recyclerview.widget.RecyclerView;

import com.vincent.filepicker.ToastUtil;
import com.vincent.filepicker.Util;
import com.vincent.filepicker.filter.entity.BaseFile;

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
import io.oz.fpick.R;
import io.oz.fpick.activity.BaseActivity;

public abstract class BaseSynchronizer <T extends BaseFile, VH extends RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH> {

    public String mFilepath;

    protected boolean isNeedCamera;
    protected int mMaxNumber;
    protected int mCurrentNumber = 0;

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
     * @param ctx
     * @param list resource list
     */
    public BaseSynchronizer(BaseActivity ctx, ArrayList<T> list) {
        this.singleton = AlbumContext.getInstance(null);
        mContext = ctx;
        mList = list;
    }

    public BaseSynchronizer(BaseActivity act) {
        this(act, new ArrayList<>());
        this.singleton = AlbumContext.getInstance(act);
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
     * Add file list to my list, then start asynchronized matching.
     * My list is used for feeding item holder used for buffered rendering (by Glide).
     * @param list
     */
    @SuppressLint("NotifyDataSetChanged")
    public void refreshSyncs(List<BaseFile> list) {
        mList.clear();
        mList.addAll((Collection<? extends T>) list); // why this with performance cost?
        notifyDataSetChanged();

        synchPage = new PathsPage(0, Math.min(20, mList.size()));
        synchPage.device = singleton.photoUser.device;

        try {
            mContext.onStartingJserv(0, 1);
            if (singleton.tier != null && singleton.state() == AlbumContext.ConnState.Online)
                startSynchQuery(synchPage);
            else {
            singleton.login((r) -> startSynchQuery(synchPage),
                    // (c, r, args) -> { Log.e(singleton.clientUri, String.format(r, args == null ? "null" : args[0])); }
                    singleton.errCtx);
            }
        } catch (GeneralSecurityException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exSession, e.getMessage());
        } catch (SemanticException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exSemantic, e.getMessage());
        } catch (IOException e) {
            singleton.errCtx.err(AnsonMsg.MsgCode.exIo, e.getMessage());
        }
    }

    void startSynchQuery(PathsPage page) {
        singleton.tier.asynQueryDocs(mList, page, onSyncQueryResponse,
            (c, r, args) -> {
                // Log.e(singleton.clientUri, String.format(r, args == null ? "null" : args[0]));
                singleton.errCtx.err(c, r, args);
            });
    }

    /**
     * Query response handler, triggering query on following pages.
     */
    JProtocol.OnOk onSyncQueryResponse = (resp) -> {
        DocsResp rsp = (DocsResp) resp;
        if (synchPage.end() <= mList.size()) {
            // sequence order is guaranteed.
            // [sync-flag, share-falg, share-by, share-date]
            HashMap<String, String[]> phts = rsp.syncing().paths();
            for (int i = synchPage.start(); i < synchPage.end(); i++) {
                T f = mList.get(i);
                if (phts.containsKey(f.fullpath())) {
                    String[] inf = phts.get(f.fullpath());
                    // TODO f.parseFlags(inf);
                    f.syncFlag = inf[0];
                    f.shareflag = inf[1];
                    f.shareby = inf[2];
                    f.sharedate(inf[3]);
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

    void updateIcons(PathsPage synpage) {
        ((Activity)mContext).runOnUiThread( () -> {
            try {
                notifyItemRangeChanged(synpage.start(), synpage.end());
            } catch (SemanticException e) {
                e.printStackTrace();
            }
        });
    }

    public void selectListener(BaseActivity.OnSelectStateListener listener) {
        mListener = listener;
    }

//    private static final Random RANDOM = new Random();
//    public static int nextRandomInt() {
//        return RANDOM.nextInt(1024 * 1024);
//    }

    /**
     * @param view the file view - not used currently
     * @param dataType "video/*" or "image/*"
     * @param path full path
     * @return false
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
     */

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

