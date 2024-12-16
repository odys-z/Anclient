package io.oz.albumtier;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.isNull;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.meta.TableMeta;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.peer.AlbumPort;
import io.oz.album.peer.Profiles;
import io.oz.syndoc.client.PhotoSyntier;

/**
 * Album client context.
 */
public class AlbumContext {

    public static boolean verbose = false;

    /**
     * Profiles loaded from server, not local config.
     */
    public Profiles profiles;

    /**
     * <p>Design Notes:</p>
     * Since AlbumContext is designed not to depends on Android packages and using jserv is a must,
     * this value is designed to be use as a variable without being persisted, and without a get method.
     */
    String jserv;

    public boolean needLogin() {
        return tier != null && state() == AlbumContext.ConnState.Online;
    }

    public enum ConnState { Online, Disconnected, LoginFailed }

    static AlbumContext instance;

    public static final String jdocbase  = "jserv-album";

    /** To be localized */
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

    /**
     * @param err can be ignored if no error message to show
     * @return single instance
     */
    public static AlbumContext getInstance(OnError err) {
        if (instance == null)
            instance = new AlbumContext();

//        if (!isNull(err))
//            instance.errCtx = err[0];
//        else
//            instance.errCtx = null;
        instance.errCtx = err;

        return instance;
    }

    /**
     * Needing setting user info.
     * This method need to be called together with pref wrapper's checking jserv.
     * @return true if user info is empty.
     * @since 0.3.0
     * @see #jserv
     * jserv design notes
     */
    public boolean needSetup() {
        return isblank(jserv, "/", ".", "http://", "https://")
                || isblank(userInf.device, "/", ".")
                || isblank(userInf.uid());
    }

	public PhotoSyntier tier;
	// public PhotoSyntierDel tierdel;

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
    public AlbumContext init(String family, String uid, String device, String jservroot) {
        profiles = new Profiles(family);
        userInf = new SessionInf(null, uid);
        userInf.device = device;
        jserv = jservroot;
        Clients.init(String.format("%s/%s", jservroot, jdocbase), false);

        try {
            tier = new PhotoSyntier(new TableMeta(null), clientUri, errCtx);
        } catch (SemanticException | IOException e) {
            throw new RuntimeException(e);
        }
        return this;
    }

    /**
     * Call {@link PhotoSyntier#login(String, String, String)} to login.
     *
     * <p><b></b>Note:</b><br>
     * For Android client, don't call this directly. Call App's login instead.</p>
     * @return this
     */
	AlbumContext login(String uid, String pswd, Clients.OnLogin onOk, OnError onErr)
            throws SemanticException, AnsonException, IOException {

    	/* 0.3.0 allowed
        if (LangExt.isblank(userInf.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("AlbumContext.photoUser.device Id is null. (call #init() first)");
        */
        Clients.init(String.format("%s/%s", jserv, jdocbase), verbose);

        // tier = new PhotoSyntier(new TableMeta(null), clientUri, errCtx)
		tier.asyLogin(uid, pswd, userInf.device,
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

    /**
     * Set jserv-root to {@link Clients}.
     * @param root new value
     * @return this
     */
    public AlbumContext jserv(String root) {
        jserv = root;
        Clients.init(String.format("%s/%s", jserv, jdocbase), verbose);
        return this;
    }
}
