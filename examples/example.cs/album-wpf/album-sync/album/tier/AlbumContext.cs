using album_sync.album.tier;
using anclient.net.jserv.tier;
using io.odysz.anclient;
using io.odysz.anson;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.oz.album;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace io.oz.album.tier
{
    public class PrefKeys
    {
        // public const string homeCate = "";
        // public const string home;

        //public const string jserv = "jserv";
        //public const string device = "device";
        //public const string usrid = "userid";
        //public const string pswd = "pswd";

        public const string kdevice = "device";
        public const string kserv = "jserv";
        public const string kport = "port";
        public const string klogid = "logid";

        // public const string login_summery;

        /** button key in prefs screen for registering device
        public const string bt_regist;
        public const string bt_login;
        */
    }

    public class AlbumContext
    {
        protected const bool verbose = true;

        public const string jdocbase  = "jserv-album";
        public const string albumHome = "dist/index.html";
        public const string synchPage = "dist/sync.html";
        
        static AlbumContext instance;

        //static AlbumContext() {
        //    // AnsonMsg.understandPorts(AlbumPort.album);
        //    // Anson.verbose = false;
        //}
        private string device;

        private string pswd;
        public AlbumContext Pswd(string pswd)
        {
            this.pswd = pswd;
            return this;
        }

        public static AlbumContext GetInstance()
        {
            if (instance == null)
                instance = new AlbumContext();
            return instance;
        }

        public bool needSetup()
        {
            return LangExt.isblank(jserv, new string[] { "/", ".", "http://", "https://" })
                    || LangExt.isblank(photoUser.device, "/", ".")
                    || LangExt.isblank(photoUser.uid);
        }

        public enum ConnState { Online, Disconnected, LoginFailed }


        public const string clientUri = "album.cs";

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


        string jserv;

        string port;

        string logid;

        public string homeName;

        public AlbumClientier tier;

        public SessionInf photoUser;

        ConnState state;
        public ConnState State() { return state; }

        public AlbumContext()
        {
            state = ConnState.Disconnected;
        }

        /// <summary>
        /// Init with preferences. Not login yet.
        /// </summary>
        /// <param name="execPath"></param>
        public static void init(string execPath)
        {
            /*
            homeName = sharedPref.getString(prefkeys.home, "");
            string uid = sharedPref.getString(prefkeys.usrid, "");
            string device = sharedPref.getString(prefkeys.device, "");
            photoUser = new SessionInf(null, uid);
            photoUser.device = device;
            pswd = sharedPref.getString(prefkeys.pswd, "");
            jserv = sharedPref.getString(prefkeys.jserv, "");

            AnClient.init(jserv + "/" + jdocbase, verbose);
            */

            try
            {
                // string execPath = AppDomain.CurrentDomain.BaseDirectory;
                if (File.Exists(Path.Combine(execPath, "device.xml")))
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(Path.Combine(execPath, "device.xml"));
                    XmlNodeList xnodes = doc.DocumentElement.SelectNodes("/configs/t[@id='preferences']/c");
                    foreach (XmlNode n in xnodes)
                    {
                        XmlNode k = n.ChildNodes[0];
                        XmlNode v = n.ChildNodes[1];
                        if (PrefKeys.kdevice.Equals(k.InnerText))
                            device = v.InnerText;
                        else if (PrefKeys.kserv.Equals(k.InnerText))
                            jserv = v.InnerText;
                        else if (PrefKeys.kport.Equals(k.InnerText))
                            port = v.InnerText.Trim();
                        else if (PrefKeys.klogid.Equals(k.InnerText))
                            logid = v.InnerText.Trim();
                    }

                    // turnOnDevice(true);
                }
                // else turnOnDevice(false);
            }
            catch (Exception) { }
        }


        AlbumContext login(string uid, string pswd, TierCallback onOk, JProtocol.OnError onErr)
        {
            if (LangExt.isblank(photoUser.device, new string[] { "\\.", "/", "\\?", ":" }))
                throw new Exception("Device Id is null.");

            AnClient.Init(jserv + "/" + jdocbase, verbose);

            AnClient.loginAsync(uid, pswd,
                (client) => {
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
                (c, r, v)-> {
                    state = ConnState.LoginFailed;
                    if (onErr != null)
                        onErr.err(c, r, v);
                }, photoUser.device);
                return this;
            }

    public void login(TierCallback onOk, JProtocol.OnError onErr)
            throws GeneralSecurityException
{
    login(photoUser.uid(), pswd, onOk, onErr);
}

JProtocol.OnOk onHeartbeat = ((resp)-> {
        if (state == ConnState.Disconnected)
            ; // how to notify?
state = ConnState.Online;
    });

JProtocol.OnError onLinkBroken = ((c, r, args)-> {
        state = ConnState.Disconnected;
    });

public AlbumContext jserv(String newVal)
{
    jserv = newVal;
    Clients.init(jserv + "/" + jdocbase, verbose);
    return this;
}

public String jserv() { return jserv; }
    }
}
