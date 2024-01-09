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
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.Profiles;

public class AlbumContext {

    public boolean verbose = true;

    /**
     * Profiles loaded from server, not local config.
     */
    public Profiles profiles;
    public Policies policies;

    String jserv;

    public enum ConnState { Online, Disconnected, LoginFailed }

    static AlbumContext instance;

    public static final String jdocbase  = "jserv-album";

    public static final String clientUri = "album.and";

    public OnError errCtx;

    static {
        AnsonMsg.understandPorts(AlbumPort.album);
        Anson.verbose = false;
    }

    private String pswd;
    public String pswd() { return pswd; }
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
                || LangExt.isblank(userInf.device, "/", ".")
                || LangExt.isblank(userInf.uid());
    }


    @SuppressWarnings("deprecation")
	public PhotoSyntier tier;

    public SessionInf userInf;

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
     */
    public AlbumContext init(String family, String uid, String device, String jserv) {
        profiles = new Profiles(family);
        userInf = new SessionInf(null, uid);
        userInf.device = device;
        jserv = jserv;

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
    @SuppressWarnings("deprecation")
	AlbumContext login(String uid, String pswd, Clients.OnLogin onOk, OnError onErr)
            throws GeneralSecurityException, SemanticException, AnsonException, IOException {

    	/* 0.3.0 allowed
        if (LangExt.isblank(userInf.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("AlbumContext.photoUser.device Id is null. (call #init() first)");
        */

        Clients.init(jserv + "/" + jdocbase, verbose);

        tier = new PhotoSyntier(clientUri, userInf.device, errCtx)
				.asyLogin(uid, pswd, userInf.device,
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

    public void login(Clients.OnLogin onOk, OnError onErr)
            throws GeneralSecurityException, SemanticException, AnsonException, IOException {
        login(userInf.uid(), pswd, onOk, onErr);
    }

    OnOk onHeartbeat = ((resp) -> {
        if (state == ConnState.Disconnected)
            ; // how to notify?
        state = ConnState.Online;
    });

    OnError onLinkBroken = ((c, r, args) -> {
        state = ConnState.Disconnected;
        // TODO toast or change an icon, c: exSession r: heart link broken
    });

    public AlbumContext jserv(String newVal) {
        jserv = newVal;
        Clients.init(jserv + "/" + jdocbase, verbose);
        return this;
    }

    public String jserv() { return jserv; }

}
