package io.oz.albumtier;

import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.common.LangExt;
import io.odysz.jclient.Clients;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jsession.SessionInf;
import io.oz.album.AlbumPort;

/**
 * Alblum client context and singleton.
 * 
 * @author odys-z@github.com
 *
 */
public class AlbumSingletext {
   protected static final boolean verbose = true;

    public static final String jdocbase  = "jserv-album";
    public static final String albumHome = "dist/index.html";
    public static final String synchPage = "dist/sync.html";

    static AlbumSingletext instance;

    static {
        AnsonMsg.understandPorts(AlbumPort.album);
        Anson.verbose = false;
    }

    private String pswd;
    public AlbumSingletext pswd(String pswd) {
        this.pswd = pswd;
        return this;
    }

    public static AlbumSingletext getInstance() {
        if (instance == null)
            instance = new AlbumSingletext();
        return instance;
    }

    public boolean needSetup() {
        return LangExt.isblank(jserv, "/", ".", "http://", "https://")
                || LangExt.isblank(photoUser.device, "/", ".")
                || LangExt.isblank(photoUser.uid());
    }

    public enum ConnState { Online, Disconnected, LoginFailed }

    public final String clientUri = "album.and";
    public final ErrorCtx errCtx = new ErrorCtx();

    String jserv;

    public String homeName;

    public PhotoSyntier syntier;

    public SessionInf photoUser;

    ConnState state;
    public ConnState state() { return state; }

    public AlbumSingletext() {
        state = ConnState.Disconnected;
    }

    /**
     * Init with preferences. Not login yet.
     * public void init(PrefKeys prefkeys, SharedPreferences sharedPref)
     <pre>
        String family = sharedPref.getString(prefkeys.home, "");
        String uid = sharedPref.getString(prefkeys.usrid, "");
        String device = sharedPref.getString(prefkeys.device, "");
        String pswd = sharedPref.getString(prefkeys.pswd, "");
        String jserv = sharedPref.getString(prefkeys.jserv, "");
     </pre>
     * @param family org-id
     * @since maven 0.1.0, this package no longer depends on android sdk.
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

    AlbumSingletext login(String uid, String pswd, TierCallback onOk, JProtocol.OnError onErr)
            throws GeneralSecurityException {

        if (LangExt.isblank(photoUser.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("Device Id is null.");

        Clients.init(jserv + "/" + jdocbase, verbose);

        Clients.loginAsync(uid, pswd,
            (client) -> {
                client.closeLink();

                syntier = new PhotoSyntier(clientUri, client, photoUser.device, errCtx);
                client.openLink(clientUri, onHeartbeat, onLinkBroken, 19900); // 4 times failed in 3 min
                state = ConnState.Online;
                if (onOk != null)
                    onOk.ok(syntier);
            },
            // Design Note: since error context don't have unified error message box,
            // error context pattern of React is not applicable.
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
        login(photoUser.uid(), pswd, onOk, onErr);
    }

    JProtocol.OnOk onHeartbeat = ((resp) -> {
        if (state == ConnState.Disconnected)
            ; // how to notify?
        state = ConnState.Online;
    });

    JProtocol.OnError onLinkBroken = ((c, r, args) -> {
        state = ConnState.Disconnected;
    });

    public AlbumSingletext jserv(String newVal) {
        jserv = newVal;
        Clients.init(jserv + "/" + jdocbase, verbose);
        return this;
    }

    public String jserv() { return jserv; }
}
