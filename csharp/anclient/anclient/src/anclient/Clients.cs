using io.odysz.anclient;
using io.odysz.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantics.x;
using System;
using System.IO;
using static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody>;

namespace io.odysz.anclient
{
    class Clients
    {
		public const bool console = true;

		public static string servRt;

		/// <summary> DB connection ID. same in connects.xml/t/C/id at server side.
		/// </summary> 
		private static String conn;


		/// <summary>Initialize configuration.
		/// </summary>
		/// <param>servRoot</param>
		public static void init(String servRoot)
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
		public static AnsonClient login(String uid, String pswdPlain)
		{
            byte[] iv = AESHelper.getRandom();
            String iv64 = AESHelper.Encode64(iv);
            if (uid == null || pswdPlain == null)
                throw new SemanticException("user id and password can not be null.");
            String tk64 = AESHelper.Encrypt(uid, pswdPlain, iv);

            // formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
            // AnsonMsg<? extends AnsonBody> reqv11 = new AnsonMsg<AnQueryReq>(Port.session);;
            AnsonMsg<AnSessionReq> reqv11 = (AnsonMsg<AnSessionReq>) AnSessionReq.formatLogin(uid, tk64, iv64);

            AnsonClient[] inst = new AnsonClient[1];

            HttpServClient httpClient = new HttpServClient();
            String url = servUrl(new Port(Port.session));
            httpClient.post(url, reqv11, (code, msg) => {
                        if (AnsonMsg<AnsonBody>.MsgCode.ok == (int)code) {
                            // create a logged in client
                            inst[0] = new AnsonClient(((AnSessionResp) msg).ssInf);

                        if (Clients.console) // Utils.logi(msg.ToString());
                            Console.WriteLine(msg.ToString());
                        }
                        else throw new SemanticException(
                                "loging failed\ncode: {}\nerror: {}",
                                code, ((AnsonResp) msg).msg());
            } );
            if (inst[0] == null)
                throw new IOException("HttpServClient return null client.");
            return inst[0];
        }
	
        /**Helper for generate serv url (with configured server root and db connection ID).
         * @param port
         * @return url, e.g. http://localhost:8080/query.serv?conn=null
         */
        static String servUrl(IPort port)
        {
            return String.Format("{0:S}/{1:S}?conn={2:S}", servRt, port.url, conn);
        }

    }
}
