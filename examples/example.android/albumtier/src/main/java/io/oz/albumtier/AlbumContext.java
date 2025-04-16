package io.oz.albumtier;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.LangExt.mustnonull;

import java.io.IOException;
import java.security.GeneralSecurityException;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantics.SessionInf;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.peer.Profiles;
import io.oz.album.peer.SynDocollPort;
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

    /** To be localized */
    public static final String sysuri = "/album/sys";

    public static final String synuri = "/album/syn";

    public OnError errCtx;

    static {
        AnsonMsg.understandPorts(SynDocollPort.docoll);
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
     * @since 0.7.1
     */
    public static AlbumContext initWithErrorCtx(OnError err) {
        if (instance == null)
            instance = new AlbumContext();

        if (err != null)
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

    /** When this is null, means not logged in */
	public PhotoSyntier tier;

    public SessionInf userInf;

    ConnState state;
    public ConnState state() { return state; }

    public AlbumContext() {
        state = ConnState.Disconnected;
        device = new Device();
    }

	public AlbumContext(ErrorCtx ctx) {
		this.errCtx = ctx;
        device = new Device();
	}

	/**
     * Init with preferences. Not login yet.
     */
    public AlbumContext init(String family, String uid, String pswd, String device, String jservroot) {
        profiles = new Profiles(family);
        userInf = new SessionInf(null, uid);
        userInf.device = device;
        this.pswd = pswd;
        this.device.id = device;
        this.device.synode0 = device;
        this.device.devname = f("%s[%s]", device, userInf.userName());

        jserv = jservroot;
        // Clients.init(String.format("%s/%s", jservroot, jdocbase), false);
        Clients.init(jservroot, false);

        try {
            tier = new PhotoSyntier(sysuri, synuri, new ErrorCtx() {
                @Override
                public void err(AnsonMsg.MsgCode code, String msg, String ... args) {
                    try {
                        msg = f("Error handler is null. Caught error: %s", f(msg, (Object[])args));
                    }
                    catch (Exception e) {}
                    mustnonull(errCtx, msg);

                    errCtx.err(code, msg, args);
                } });
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
            throws AnsonException {

    	/* 0.3.0 allowed
        if (LangExt.isblank(userInf.device, "\\.", "/", "\\?", ":"))
            throw new GeneralSecurityException("AlbumContext.photoUser.device Id is null. (call #init() first)");
        */
        Clients.init(jserv, verbose);

		tier.asyLogin(uid, pswd, userInf.device,
                (client) -> {
				    state = ConnState.Online;
				    client.openLink(sysuri, onHeartbeat, onLinkBroken, 19900); // 4 times failed in 3 min (FIXME too long)
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
        Clients.init(jserv, verbose);
        return this;
    }

    public Device device;
    public AlbumContext device(Device d) {
        this.device = d;
        return this;
    }

    public AlbumContext device(String id, String... devname) {
        this.device = new Device(id, id, devname);
        this.userInf.device(id);
        return this;
    }


    public AlbumContext devname(String name) {
        if (device == null)
			device = new Device(userInf.device, name);
        return this;
    }

}
