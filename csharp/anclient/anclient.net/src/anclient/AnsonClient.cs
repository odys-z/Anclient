using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jserv.R;
using io.odysz.semantic.jserv.U;
using io.odysz.semantic.jsession;
using io.odysz.semantics.x;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    public class AnsonClient
    {
        public SessionInf ssInf { get; }

		private List<string[]> urlparas;

		private AnsonHeader header;

        /// <summary>Session login response from server.</summary>
        /// <paramref name="sessionInfo"></paramref>
        public AnsonClient(SessionInf sessionInfo)
		{
			this.ssInf = sessionInfo;
		}

		/// <summary>Format a query request object, including all information for
		/// construct a "select" statement.</summary>
		/// <paramref name="conn">connection id</paramref>
		/// @param tbl main table, (sometimes function category), e.g. "e_areas"
		/// @param alias from table alias, e.g. "a"
		/// @param page -1 for no paging at server side.
		/// @param size
		/// @param funcId current function ID
		/// @return formatted query object.
		public AnsonMsg query(string conn, string tbl, string alias,
				int page, int size, string funcId = null) 
		{

			AnsonMsg msg = new AnsonMsg((IPort)new Port(Port.query), null);

            AnsonHeader header = new AnsonHeader(ssInf.ssid, ssInf.uid);
            if (funcId != null && funcId.Length > 0)
                header.UsrAct(funcId, "query", "R", "test");

            msg.Header(header);

            AnQueryReq itm = AnQueryReq.formatReq(conn, msg, tbl, alias);
            msg.Body(itm);
            itm.Page(page, size);

            return msg;
        }

        public AnsonMsg Update(string conn, string tbl, string[] act = null)
        {

            AnUpdateReq itm = AnUpdateReq.FormatUpdateReq(conn, null, tbl);
            AnsonMsg jmsg = UserReq(new Port(Port.update), act, itm);

            AnsonHeader header = new AnsonHeader(ssInf.ssid, ssInf.uid);
            if (act != null && act.Length > 0)
                header.act(act);
            
            return jmsg.Header(header)
                        ;//.Body(itm);
        }

        public AnsonMsg UserReq(IPort port, string[] act, AnsonBody req)
        {
            if (ssInf == null)
                throw new SemanticException("SessionClient can not visit jserv without session information.");

            AnsonMsg  jmsg = new AnsonMsg(port, null);

            if (act != null)
                Header().act(act);
            jmsg.Header(header);
            jmsg.Body(req);

            return jmsg;
        }

        public AnsonMsg Insert(string conn, string tbl, string[] act = null)
        {
            AnInsertReq itm = AnInsertReq.formatInsertReq(conn, null, tbl);
            AnsonMsg jmsg = UserReq(new Port(Port.insert), act, itm);

            AnsonHeader header = new AnsonHeader(ssInf.ssid, ssInf.uid);
            if (act != null && act.Length > 0)
                header.act(act);

            return jmsg.Header(header)
                        .Body(itm);
        }

        public AnsonHeader Header()
        {
            if (header == null)
                header = new AnsonHeader(ssInf.ssid, ssInf.uid);
            return header;
        }

        public AnsonClient urlPara(string pname, string pv)
        {
            if (urlparas == null)
                urlparas = new List<string[]>();
            urlparas.Add(new string[] { pname, pv });
            return this;
        }

        /**Print Json Request (no request sent to server)
         * @param req 
         * @return this object
         * @throws SQLException 
         */
        public AnsonClient Console(AnsonMsg req)
        {
            if(Clients.console) {
                try
                {
                    System.Console.Out.WriteLine(req.ToString());
                }
                catch (Exception ex) { System.Console.WriteLine(ex.ToString()); }
            }
            return this;
        }

        /// <summary>
        /// Submit transaction requist to jserv. This method is synchronized - not returned until callbacks been called.
        /// </summary>
        /// <param name="req"></param>
        /// <param name="onOk"></param>
        /// <param name="onErr"></param>
        public void Commit(AnsonMsg req, Action<MsgCode, AnsonMsg> onOk, Action<MsgCode, AnsonResp> onErr = null)
        {
            #pragma warning disable CS4014
            // Because this call is not awaited, execution of the current method continues before the call is completed
            Commit_async(req, onOk, onErr);
            #pragma warning restore CS4014
        }
        public async Task Commit_async(AnsonMsg req, Action<MsgCode, AnsonMsg> onOk, Action<MsgCode, AnsonResp> onErr = null)
        {
            HttpServClient httpClient = new HttpServClient();
            AnsonMsg msg = await httpClient.Post(Clients.ServUrl((Port)req.port), req);
            MsgCode code = msg.code;

            if (Clients.console)
            {
                System.Console.Out.WriteLine(msg.ToString());
            }
            if (MsgCode.ok == code.code)
            {
                onOk(code, msg);
            }
            else
            {
                if (onErr != null)
                    onErr(code, (AnsonResp)msg.Body(0));
                else System.Console.Error.WriteLine("code: {0}\nerror: {1}",
                    code, msg.ToString());
            }
        }

	    public void Logout() { }
    }
}