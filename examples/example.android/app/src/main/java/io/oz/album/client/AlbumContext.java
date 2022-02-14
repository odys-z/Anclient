package io.oz.album.client;

import android.content.SharedPreferences;
import android.content.res.Resources;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantics.x.SemanticException;
import io.oz.R;

public class AlbumContext {
    public enum ConnState { Online, Disconnected, LoginFailed };

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

    public void init(Resources resources, SharedPreferences sharedPref) throws GeneralSecurityException, IOException, AnsonException, SemanticException {
        jdocbase = resources.getString(R.string.jserv_docbase);

        String uid = sharedPref.getString(PrefsContentActivity.key_usrid, "");
        String pswd = sharedPref.getString(PrefsContentActivity.key_pswd, "");
        photoUser.uid = uid;
        photoUser.pswd = pswd;

        Clients.init(jserv + "/" + jdocbase, verbose);
        jserv = sharedPref.getString(PrefsContentActivity.key_jserv, "");
    }

    AlbumContext login(String jserv, String uid, String pswd, TierCallback onOk, JProtocol.OnError onErr) throws GeneralSecurityException, IOException, AnsonException, SemanticException {
        uid = "ody";
        pswd = "123456";
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
        } );
        return this;
    }

    public void login(TierCallback onOk, JProtocol.OnError onErr) throws GeneralSecurityException, IOException, AnsonException, SemanticException {
        login(jserv, photoUser.uid(), photoUser.pswd(), onOk, onErr);
    }

    public void mustLogin(boolean b) {
    }

    public AlbumContext jserv(String newVal) {
        jserv = newVal;
        Clients.init(jserv + "/" + jdocbase, verbose);
        return this;
    }

    public String jserv() { return jserv; }
}
