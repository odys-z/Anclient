using io.odysz.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantics.x;
using System;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    public class Clients
    {
		public const bool console = true;

		public static string servRt;

		/// <summary> DB connection ID. same in connects.xml/t/C/id at server side.
		/// </summary>
		private static string conn;


		/// <summary>Initialize configuration.
		/// </summary>
		/// <param>servRoot</param>
		public static void Init(string servRoot)
		{
			servRt = servRoot;
			conn = null; // client can't control engine connect. configured in workflow-meta.xml
		}

		/// <summary>Login and return a client instance (with session managed by jserv).
		/// </summary>
		/// <paramref name="uid"/>
		/// <param name="pswdPlain">password in plain</param>
		/// <return> null if failed, a SessionClient instance if login succeed.</return>
		/// <throws> SQLException the request makes server generate wrong SQL.</throws>
		/// @throws SemanticException Request can not parsed correctly
		/// @throws GeneralSecurityException  other error
		/// @throws Exception, most likely the network failed
		public static AnsonClient Login(string uid, string pswdPlain, Action<int, AnSessionResp> onlogin = null, Action<int, AnsonResp> onerror = null)
		{
            byte[] iv = AESHelper.getRandom();
            string iv64 = AESHelper.Encode64(iv);
            if (uid == null || pswdPlain == null)
                throw new SemanticException("user id and password can not be null.");
            string tk64 = AESHelper.Encrypt(uid, pswdPlain, iv);

            // formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
            // AnsonMsg<? extends AnsonBody> reqv11 = new AnsonMsg<AnQueryReq>(Port.session);;
            AnsonMsg reqv11 = AnSessionReq.formatLogin(uid, tk64, iv64);

            AnsonClient[] inst = new AnsonClient[1];

            HttpServClient httpClient = new HttpServClient();
            string url = ServUrl(new Port(Port.session));
            httpClient.Post(url, reqv11, (code, msg) => {
                    if (MsgCode.ok == code.code) {
                        // create a logged in client
                        inst[0] = new AnsonClient(((AnSessionResp) msg.Body()[0]).ssInf);
                        if (onlogin != null)
                            onlogin(code.code, (AnSessionResp)msg.Body()[0]);

                            if (Clients.console)
                                Console.WriteLine(msg.ToString());
                }
                                else throw new SemanticException(
                                        "loging failed\ncode: {0}\nerror: {1}",
                                        code, ((AnSessionResp) msg.Body()[0]).Msg());
            } );
            return inst[0];
        }

        /**Helper for generate serv url (with configured server root and db connection ID).
         * @param port
         * @return url, e.g. http://localhost:8080/query.serv?conn=null
         */
        public static string ServUrl(Port port)
        {
            return string.Format("{0:S}/{1:S}?conn={2:S}", servRt, port.Url(), conn);
        }

    }
}
