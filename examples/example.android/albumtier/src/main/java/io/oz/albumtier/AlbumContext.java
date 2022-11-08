package io.oz.albumtier;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.LangExt;
import io.odysz.jclient.Clients;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jsession.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.AlbumPort;

public class AlbumContext {
    public enum ConnState { Online, Disconnected, LoginFailed }

    public static final String jdocbase  = "jserv-album";
    public static final String albumHome = "dist/index.html";
    public static final String synchPage = "dist/sync.html";
    public static boolean verbose = true;

    static AlbumContext instance;

    public final String clientUri = "album.and";
    public final ErrorCtx errCtx = new ErrorCtx();

    static {
        AnsonMsg.understandPorts(AlbumPort.album);
        Anson.verbose = true;
    }

    private String pswd;
    public AlbumContext pswd(String pswd) {
        this.pswd = pswd;
        return this;
    }

    public static AlbumContext getInstance() {
        if (instance == null)
            instance = new AlbumContext();
        return instance;
    }

    public boolean needSetup() {
        return LangExt.isblank(jserv, "/", ".", "http://", "https://")
                || LangExt.isblank(photoUser.device, "/", ".")
                || LangExt.isblank(photoUser.uid());
    }

    String jserv;

    public String homeName;

    public PhotoSyntier tier;

    // private SessionClient client;

    public SessionInf photoUser;

    ConnState state;
    public ConnState state() { return state; }

    public AlbumContext() {
        state = ConnState.Disconnected;
    }

    /**
     * Init with preferences. Not login yet.
     * @since maven 0.1.0, this package no longer depends on android sdk.
     * public void init(PrefKeys prefkeys, SharedPreferences sharedPref)
     <pre>
        homeName = sharedPref.getString(prefkeys.home, "");
        String uid = sharedPref.getString(prefkeys.usrid, "");
        String device = sharedPref.getString(prefkeys.device, "");
        photoUser = new SessionInf(null, uid);
        photoUser.device = device;
        pswd = sharedPref.getString(prefkeys.pswd, "");
        jserv = sharedPref.getString(prefkeys.jserv, "");
     </pre>
     */
    public void init(String family, String uid, String device, String jserv) {
    	/*
        homeName = sharedPref.getString(prefkeys.home, "");
        String uid = sharedPref.getString(prefkeys.usrid, "");
        String device = sharedPref.getString(prefkeys.device, "");
        photoUser = new SessionInf(null, uid);
        photoUser.device = device;
        */
        homeName = family;
        photoUser = new SessionInf(null, uid);
        photoUser.device = device;
        this.jserv = jserv;

        Clients.init(jserv + "/" + jdocbase, verbose);
    }

    AlbumContext login(String uid, String pswd, OnOk onOk, OnError onErr)
            throws GeneralSecurityException, SemanticException, AnsonException, IOException {

        if (LangExt.isblank(photoUser.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("Device Id is null.");

        Clients.init(jserv + "/" + jdocbase, verbose);

        tier = (PhotoSyntier) new PhotoSyntier(clientUri, photoUser.device, errCtx)
				.login(uid, photoUser.device, pswd);

        /*
        Clients.loginAsync(uid, pswd,
            (client) -> {
                client.closeLink();

                tier = new PhotoSyntier(clientUri, client, photoUser.device, errCtx);
                client.openLink(clientUri, onHeartbeat, onLinkBroken, 19900); // 4 times failed in 3 min
                state = ConnState.Online;
                if (onOk != null)
                    onOk.ok(tier);
            },
            // Design Note: since error context don't have unified error message box,
            // error context pattern of React is not applicable.
            // errCtx.onError(c, r, (Object)v);
            (c, r, v) -> {
                state = ConnState.LoginFailed;
                if (onErr != null)
                    onErr.err(c, r, v);
            }, photoUser.device);
        */
        return this;
    }

    public void login(OnOk onOk, OnError onErr)
            throws GeneralSecurityException, SemanticException, AnsonException, IOException {
        login(photoUser.uid(), pswd, onOk, onErr);
    }

    OnOk onHeartbeat = ((resp) -> {
        if (state == ConnState.Disconnected)
            ; // how to notify?
        state = ConnState.Online;
    });

    OnError onLinkBroken = ((c, r, args) -> {
        state = ConnState.Disconnected;
    });

    public AlbumContext jserv(String newVal) {
        jserv = newVal;
        Clients.init(jserv + "/" + jdocbase, verbose);
        return this;
    }

    public String jserv() { return jserv; }
}
