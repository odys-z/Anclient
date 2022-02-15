package io.oz.album.client;

import android.content.SharedPreferences;
import android.content.res.Resources;

import java.security.GeneralSecurityException;

import io.odysz.common.LangExt;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.AlbumApp;
import io.oz.R;

public class AlbumContext {

    public boolean needSetup() {
        return LangExt.isblank(jserv, "/", ".", "http://", "https://")
                || LangExt.isblank(photoUser.device, "/", ".")
                || LangExt.isblank(photoUser.uid);
    }

    public enum ConnState { Online, Disconnected, LoginFailed }

    protected static final boolean verbose = true;

    public final String clientUri = "album.an";
    public final ErrorCtx errCtx = new ErrorCtx() {
        String msg;
        AnsonMsg.MsgCode code;
        @Override
        public void onError(AnsonMsg.MsgCode c, String msg, Object ... obj) {
            code = c;
            try {
                this.msg = String.format(msg, obj);
            }catch (Exception e) {
                this.msg = msg;
            }
        }
    };

    String jserv;
    String jdocbase;

    public AlbumClientier tier;

    public SessionClient client;

    public PhotoUser photoUser;

    ConnState state;
    public ConnState state() { return state; }

    public AlbumContext() {
        state = ConnState.Disconnected;
        photoUser = new PhotoUser(null);
    }

    public void init(Resources resources, SharedPreferences sharedPref) {
        jdocbase = resources.getString(R.string.jserv_docbase);

        photoUser.uid = sharedPref.getString(AlbumApp.keys.usrid, "");
        photoUser.pswd = sharedPref.getString(AlbumApp.keys.pswd, "");
        jserv = sharedPref.getString(AlbumApp.keys.jserv, "");
        photoUser.device = sharedPref.getString(AlbumApp.keys.device, "");

        Clients.init(jserv + "/" + jdocbase, verbose);
    }

    AlbumContext login(String uid, String pswd, TierCallback onOk, JProtocol.OnError onErr) throws GeneralSecurityException {
        // uid = "ody";
        // pswd = "123456";
        if (LangExt.isblank(photoUser.device, ".", "/"))
            throw new GeneralSecurityException("Device Id is null.");

        Clients.init(jserv + "/" + jdocbase, verbose);

        Clients.loginAsync(uid, pswd,
        (client) -> {
            tier = new AlbumClientier(clientUri, client, errCtx);
            state = ConnState.Online;
            if (onOk != null)
                onOk.ok(tier);
        },
        // Design Note: since error context don't have unified error message box,
        // error context pattern is not applicable.
        // errCtx.onError(c, r, (Object)v);
        (c, r, v) -> {
            state = ConnState.LoginFailed;
            if (onErr != null)
                onErr.err(c, r, v);
        }, photoUser.device);
        return this;
    }

    public void login(TierCallback onOk, JProtocol.OnError onErr)
            throws GeneralSecurityException {
        login(photoUser.uid(), photoUser.pswd(), onOk, onErr);
    }

    public AlbumContext jserv(String newVal) {
        jserv = newVal;
        Clients.init(jserv + "/" + jdocbase, verbose);
        return this;
    }

    public String jserv() { return jserv; }
}
