using io.odysz.anson;
using io.odysz.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantics.x;
using System;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;
using static io.odysz.semantic.jprotocol.JProtocol;

namespace io.odysz.anclient
{
    public interface OnLogin {
        void ok(SessionClient client);
    }

    public class AnClient
    {
        public static bool verbose = false;
		public const bool console = true;

		public static string servRt;

        /// <summary> DB connection ID. same in connects.xml/t/C/id at server side.
        /// </summary>
        // private static string conn;

		/// <summary>Initialize configuration.
		/// </summary>
		/// <param>servRoot</param>
		public static void Init(string servRoot)
		{
            // c# problem - must use the assembly name for consturcting object instance
			// JSONAnsonListener.setAssembly(Assembly.GetExecutingAssembly().GetName().Name);
			JSONAnsonListener.setAssembly("anclient.net");

			servRt = servRoot;
		}

        /// <summary>
        /// Login and return a client instance (with session managed by jserv).
        /// </summary>
        /// <param name="uid"></param>
        /// <paramref name="pswdPlain">password in plain</param>
        /// <param name="device"></param>
        /// <param name="onlogin"></param>
        /// <param name="err"></param>
        /// <throws>SQLException the request makes server generate wrong SQL.</throws>
        /// <throws>SemanticException Request can not parsed correctly</throws> 
        /// <throws>GeneralSecurityException  other error</throws> 
        /// <throws>Exception, most likely the network failed</throws> 
        /// <return>null if failed, a SessionClient instance if login succeed.</return>
		public static async Task<SessionClient> Login(string uid, string pswdPlain, string device = null, OnLogin onlogin = null, OnError err = null)
		{
            byte[] iv = AESHelper.getRandom();
            string iv64 = AESHelper.Encode64(iv);
            if (uid == null || pswdPlain == null)
                throw new SemanticException("user id and password can not be null.");

            // string tk64 = AESHelper.Encrypt("-----------" + uid, pswdPlain, iv);
            string tk64 = AESHelper.Encrypt(uid, pswdPlain, iv);

            // formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
            // AnsonMsg<? extends AnsonBody> reqv11 = new AnsonMsg<AnQueryReq>(Port.session);;
            AnsonMsg reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64, device);

            string url = ServUrl(new Port(Port.session));
            HttpServClient httpClient = new HttpServClient();

            SessionClient[] inst = new SessionClient[1];
            AnsonMsg msg = await httpClient.Post(url, reqv11).ConfigureAwait(false);
            MsgCode code = msg.code;

            if (code != null && MsgCode.ok == code.code) {
                // create a logged in client
                inst[0] = new SessionClient(((AnSessionResp) msg.Body()[0]).ssInf);
                if (onlogin != null)
                    // onlogin.ok(new SessionClient(((AnSessionResp)msg.Body()[0]).ssInf));
                    onlogin.ok(inst[0]);

                if (AnClient.console)
                    Console.WriteLine(msg.ToString());
            }
            else if (err != null)
                err.err(new MsgCode(code.code), ((AnsonResp)msg.Body(0)).Msg());
            else throw new SemanticException(
                    "loging failed\ncode: {0}\nerror: {1}",
                    code, ((AnsonResp) msg.Body()[0]).Msg());
            return inst[0];
        }

        /// <summary>Helper for generate serv url (with configured server root and db connection ID).</summary>
        /// <paramref name="port"></paramref>
        /// <return>url, e.g. http://localhost:8080/query.serv </return> 
        public static string ServUrl(IPort port)
        {
            return string.Format("{0:S}/{1:S}", servRt, port.Url());
        }

    }
}
