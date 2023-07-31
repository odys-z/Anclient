package io.oz.albumtier;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.LangExt;
import io.odysz.jclient.Clients;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.Profiles;

public class AlbumContext {
    public boolean verbose = true;
    public Profiles profiles;
    public Plicies policies;

    public enum ConnState { Online, Disconnected, LoginFailed }

    static AlbumContext instance;

    public static final String jdocbase  = ""; // jserv-album

    public final String clientUri = "album.and";

    public OnError errCtx; // = new AndErrorCtx();

    static {
        AnsonMsg.understandPorts(AlbumPort.album);
        Anson.verbose = false;
    }

    private String pswd;
    public AlbumContext pswd(String pswd) {
        this.pswd = pswd;
        return this;
    }

    public static AlbumContext getInstance(OnError err) {
        if (instance == null)
            instance = new AlbumContext();

        if (err != null)
            instance.errCtx = err;

        return instance;
    }

    public boolean needSetup() {
        return LangExt.isblank(jserv, "/", ".", "http://", "https://")
                || LangExt.isblank(photoUser.device, "/", ".")
                || LangExt.isblank(photoUser.uid());
    }

    String jserv;

//    public String homeName;

    public PhotoSyntier tier;

    public SessionInf photoUser;

    ConnState state;
    public ConnState state() { return state; }

    public AlbumContext() {
        state = ConnState.Disconnected;
    }

	public AlbumContext(ErrorCtx ctx) {
		this.errCtx = ctx;
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
    public AlbumContext init(String family, String uid, String device, String jserv) {
    	/*
        homeName = sharedPref.getString(prefkeys.home, "");
        String uid = sharedPref.getString(prefkeys.usrid, "");
        String device = sharedPref.getString(prefkeys.device, "");
        photoUser = new SessionInf(null, uid);
        photoUser.device = device;
        */
        profiles = new Profiles(family);
        photoUser = new SessionInf(null, uid);
        photoUser.device = device;
        this.jserv = jserv;

        Clients.init(jserv + "/" + jdocbase, verbose);
        
        return this;
    }

    /**
     * Call {@link PhotoSyntier#login(String, String, String)} to login.
     * @param uid
     * @param pswd
     * @param onOk
     * @param onErr
     * @return this
     * @throws GeneralSecurityException
     * @throws SemanticException
     * @throws AnsonException
     * @throws IOException
     */
    AlbumContext login(String uid, String pswd, OnLogin onOk, OnError onErr)
            throws GeneralSecurityException, SemanticException, AnsonException, IOException {

        if (LangExt.isblank(photoUser.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("AlbumContext.photoUser.device Id is null. (call #init() first)");

        // state = ConnState.LoginFailed;

        Clients.init(jserv + "/" + jdocbase, verbose);

        tier = (PhotoSyntier) new PhotoSyntier(clientUri, photoUser.device, errCtx)
				.asyLogin(uid, pswd, photoUser.device,
                (client) -> {
				    state = ConnState.Online;
				    client.openLink(clientUri, onHeartbeat, onLinkBroken, 19900); // 4 times failed in 3 min (FIXME too long)
				    onOk.ok(client);
                },
                (c, r, args) -> {
                    state = ConnState.LoginFailed;
                    onErr.err(c, r, args);
                } );
        return this;
    }

    public void login(OnLogin onOk, OnError onErr)
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
