using Sharpen;

namespace io.odysz.semantic.ext
{
	/// <summary>
	/// CRUD read service extension: dataset.<br />
	/// This port use a configure file (dataset.xml) as data definition.
	/// </summary>
	/// <remarks>
	/// CRUD read service extension: dataset.<br />
	/// This port use a configure file (dataset.xml) as data definition.
	/// The client request (
	/// <see cref="DatasetReq"/>
	/// ) provide configure key and parameter, the port answer with queried results.
	/// </remarks>
	/// <author>odys-z@github.com</author>
	[System.Serializable]
	public class Dataset : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.ext.AnDatasetReq
		>
	{
		public Dataset()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.dataset)
		{
		}

		private const long serialVersionUID = 1L;

		protected internal static io.odysz.semantic.jsession.ISessionVerifier verifier;

		protected internal static io.odysz.transact.sql.Transcxt st;

		internal static io.odysz.semantic.jprotocol.IPort p = io.odysz.semantic.jprotocol.AnsonMsg.Port
			.dataset;

		internal static io.odysz.semantic.jprotocol.JOpts _opts = new io.odysz.semantic.jprotocol.JOpts
			();

		static Dataset()
		{
			st = io.odysz.semantic.jserv.JSingleton.defltScxt;
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			io.odysz.common.Utils.logi("---------- query (ds.jserv11) get ----------");
			resp.setCharacterEncoding("UTF-8");
			try
			{
				string conn = msg.body(0).conn();
				verifier.verify(msg.header());
				io.odysz.semantic.jprotocol.AnsonResp rs = dataset(conn, msg);
				resp.getWriter().write(io.odysz.semantic.jserv.helper.Html.rs((io.odysz.module.rs.AnResultset
					)rs.rs(0)));
			}
			catch (java.sql.SQLException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			catch (io.odysz.transact.x.TransException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			catch (io.odysz.semantic.jserv.x.SsException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			finally
			{
				resp.flushBuffer();
			}
		}

		/// <exception cref="System.IO.IOException"/>
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			resp.setCharacterEncoding("UTF-8");
			io.odysz.common.Utils.logi("========== query (ds.jserv11) post ==========");
			try
			{
				string conn = msg.body(0).conn();
				io.odysz.semantic.jprotocol.AnsonResp rs = dataset(conn, msg);
				write(resp, ok(rs));
			}
			catch (io.odysz.semantics.x.SemanticException e)
			{
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSemantic, e.Message
					));
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exTransct, e.Message
					));
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exGeneral, e.Message
					));
			}
			finally
			{
				resp.flushBuffer();
			}
		}

		/// <param name="msgBody"/>
		/// <returns>
		/// {code: "ok", port:
		/// <see cref="AnsonMsg#Port"/>
		/// .query, rs: [
		/// <see cref="SResultset"/>
		/// , ...]}
		/// </returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		protected internal virtual io.odysz.semantic.jprotocol.AnsonResp dataset(string conn
			, io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq> msgBody
			)
		{
			io.odysz.semantic.ext.AnDatasetReq msg = msgBody.body()[0];
			// List<SemanticObject> ds = DatasetCfg.loadStree(conn, msg.sk, msg.page(), msg.size(), msg.sqlArgs);		
			io.odysz.module.rs.AnResultset ds = io.odysz.semantic.DA.DatasetCfg.select(conn, 
				msg.sk, msg.page(), msg.size(), msg.sqlArgs);
			// Shall be moved to Protocol?
			io.odysz.semantic.ext.AnDatasetResp respMsg = new io.odysz.semantic.ext.AnDatasetResp
				();
			respMsg.rs(ds, ds.total());
			return respMsg;
		}
	}
}
