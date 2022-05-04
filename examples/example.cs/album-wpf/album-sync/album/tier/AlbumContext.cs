using album_sync.album.tier;
using anclient.net.jserv.tier;
using io.odysz.anclient;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Windows;
using static io.odysz.semantic.jprotocol.AnsonMsg;
using static io.oz.album.tier.AlbumContext;

namespace io.oz.album.tier
{
    public class PrefKeys
    {
        public const string device = "device";
        public const string jserv = "jserv";
        public const string port = "port";
        public const string logid = "logid";
    }

    class LoginHandler : OnLogin, JProtocol.OnError
    {
        public void err(MsgCode code, string msg, string[] args = null)
        {
            AlbumContext.GetInstance().State(ConnState.LoginFailed);
            AlbumContext.GetInstance().onError(code, msg, args);
        }

        /*
        public void ok(AnsonResp resp)
        {
            AlbumContext.GetInstance().loggedIn = true;
            AlbumContext.GetInstance().client = client;

                (SessionClient client) =>
                {
                    client.closeLink();

                    tier = new AlbumClientier(clientUri, client, errCtx);

                    client.openLink(clientUri, onHeartbeat, onLinkBroken, 19900); // 4 fails in 3 min
                            state = ConnState.Online;
                            if (onOk != null)
                                onOk.ok(tier);
                },
                // Design Note: since error context don't have unified error message box,
                // error context pattern of React is not applicable.
                // errCtx.onError(c, r, (Object)v);
                (MsgCode c, string r, object v) => {
                    state = ConnState.LoginFailed;
                    if (onErr != null)
                        onErr.err(c, r, v);
                }, photoUser.device);
        }
        */

        /// <summary>
        /// On login
        /// </summary>
        /// <param name="client"></param>
        public void ok(SessionClient client)
        {
            client.closeLink();
            AlbumClientier tier = new AlbumClientier(AlbumContext.clientUri, client, AlbumContext.GetInstance());
            client.openLink(AlbumContext.clientUri, heartbeatHandler, heartbeatHandler, 19900); // 4 fails in 3 min
            AlbumContext.GetInstance().State(ConnState.Online);

            // if (onOk != null) onOk.ok(tier);
        }

        HeartbeatHandler heartbeatHandler = new HeartbeatHandler();

    }

    internal class HeartbeatHandler : JProtocol.OnOk, JProtocol.OnError
    {
        public HeartbeatHandler()
        {
        }

        public void err(MsgCode code, string msg, string[] args = null)
        {
            if (AlbumContext.GetInstance().State() == ConnState.Disconnected)
                ; // how to notify?
            AlbumContext.GetInstance().State(ConnState.Online);
        }

        public void ok(AnsonResp resp)
        {
            AlbumContext.GetInstance().State(ConnState.Disconnected);
        }
    }

    public class AlbumContext : ErrorCtx
    {
        static AlbumContext instance;
        public static AlbumContext GetInstance()
        {
            if (instance == null)
                instance = new AlbumContext();
            return instance;
        }

        public SessionClient client { get; set; }
        public bool loggedIn { get; internal set; }

        protected bool verbose = true;

        public const string clientUri = "album.cs";
        public const string jdocbase  = "jserv-album";
        public const string albumHome = "dist/index.html";
        public const string synchPage = "dist/sync.html";

        public string jserv {
            get { return Preferences.jserv; }
            set {  Preferences.jserv = value; } 
        }
        
        public string pswd;
        public AlbumContext Pswd(string pswd)
        {
            this.pswd = pswd;
            return this;
        }


        public bool needSetup()
        {
            return LangExt.isblank(jserv, new string[] { "/", ".", "http://", "https://" })
                    || LangExt.isblank(photoUser.device, "/", ".")
                    || LangExt.isblank(photoUser.uid);
        }

        public enum ConnState { Online, Disconnected, LoginFailed }

        /*
        public const ErrorCtx errCtx = new ErrorCtx()
        {
            string msg;
            AnsonMsg.MsgCode code;

            public override void err(AnsonMsg.MsgCode c, string msg)
            {
                code = c;
                this.msg = msg;
            }
        };
        */

        public string homeName;

        public AlbumClientier tier;

        public SessionInf photoUser;

        ConnState state;
        public ConnState State() { return state; }
        public AlbumContext State(ConnState state) {
            this.state = state;
            return this;
        }

        public AlbumContext()
        {
            state = ConnState.Disconnected;

            // jserv = Preferences.jserv;
            Assert.IsNotNull(jserv);
        }

        AlbumContext login(string uid, string pswd, TierCallback onLogin, JProtocol.OnError onErr)
        {
            if (LangExt.isblank(photoUser.device, new string[] { "\\.", "/", "\\?", ":" }))
                throw new Exception("Device Id is null.");

            AnClient.Init(jserv + "/" + jdocbase, verbose);

            LoginHandler callback = new LoginHandler();
            AnClient.Login(uid, pswd, photoUser.device, callback, callback);

            /*
                (SessionClient client) =>
                {
                    client.closeLink();

                    tier = new AlbumClientier(clientUri, client, errCtx);

                    client.openLink(clientUri, onHeartbeat, onLinkBroken, 19900); // 4 times failed in 3 min
                            state = ConnState.Online;
                            if (onOk != null)
                                onOk.ok(tier);
                },
                // Design Note: since error context don't have unified error message box,
                // error context pattern of React is not applicable.
                // errCtx.onError(c, r, (Object)v);
                (MsgCode c, string r, object v) => {
                    state = ConnState.LoginFailed;
                    if (onErr != null)
                        onErr.err(c, r, v);
                }, photoUser.device);
            */
            return this;
        }

        public void login(TierCallback onOk, JProtocol.OnError onErr)
        {
            login(photoUser.uid, pswd, onOk, onErr);
        }

        /*
        JProtocol.OnOk onHeartbeat = ((resp) => {
                if (state == ConnState.Disconnected)
                    ; // how to notify?
            state = ConnState.Online;
        });

        JProtocol.OnError onLinkBroken = ((c, r, args) => {
                state = ConnState.Disconnected;
        });
        */

        public AlbumContext Jserv(string newVal)
        {
            jserv = newVal;
            AnClient.Init(jserv + "/" + jdocbase, verbose);
            return this;
        }

        #region ErrorCtx
        public override void onError(MsgCode code, string msg, string[] args = null)
        {
            MessageBox.Show(msg, "Error: " + code.Name(), MessageBoxButton.OK, MessageBoxImage.Error);
        }

        #endregion
    }
}
