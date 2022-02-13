package io.oz.album.client;

import android.content.SharedPreferences;
import android.content.res.Resources;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.AESHelper;
import io.odysz.common.Utils;
import io.odysz.jclient.Clients;
import io.odysz.jclient.HttpServClient;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.tier.ErrorAwaitHandler;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.jsession.AnSessionReq;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.R;

public class AlbumContext {
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

    public AlbumContext() {
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
        login(jserv, uid, pswd, (AlbumClientier tier) -> {this.tier = tier;});
    }

    AlbumContext login(String jserv, String uid, String pswd, TierCallback onOk) throws GeneralSecurityException, IOException, AnsonException, SemanticException {
        uid = "ody";
        pswd = "123456";
        Clients.loginAsync(uid, pswd,
        (client) -> {
            tier = new AlbumClientier(clientUri, client, errCtx);
            onOk.ok(tier);
        },
        (c, r, v) -> {
            try {
                errCtx.onError(c, r, (Object)v);
            } catch (SemanticException e) {
                e.printStackTrace();
            }
        });
        return this;
    }

    public void login(TierCallback onOk) throws GeneralSecurityException, IOException, AnsonException, SemanticException {
        login(jserv, photoUser.uid(), photoUser.pswd(), onOk);
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
