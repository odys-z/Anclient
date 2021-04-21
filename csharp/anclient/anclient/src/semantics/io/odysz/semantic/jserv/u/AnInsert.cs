using Sharpen;

namespace io.odysz.semantic.jserv.U
{
	/// <summary>CRUD insertion service.</summary>
	/// <author>odys-z@github.com</author>
	[System.Serializable]
	public class AnInsert : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.jserv.U.AnInsertReq
		>
	{
		public AnInsert()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.query)
		{
		}

		protected internal static io.odysz.semantic.jsession.ISessionVerifier verifier;

		protected internal static io.odysz.semantic.DATranscxt st;

		static AnInsert()
		{
			//	@Override
			//	public void init() throws ServletException {
			//		super.init();
			//		p = Port.query;
			//	}
			st = io.odysz.semantic.jserv.JSingleton.defltScxt;
			verifier = io.odysz.semantic.jserv.JSingleton.getSessionVerifier();
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.U.AnInsertReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			io.odysz.common.Utils.logi("---------- squery (r.serv11) get ----------");
			try
			{
				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
				io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> res;
				io.odysz.semantic.jserv.U.AnInsertReq q = msg.body(0);
				if (io.odysz.semantic.jprotocol.JProtocol.CRUD.C.Equals(q.a()))
				{
					res = inst(q, usr);
				}
				else
				{
					throw new io.odysz.semantics.x.SemanticException("%s only handling a=i. Please update client!"
						, p.name());
				}
				resp.getWriter().write(io.odysz.semantic.jserv.helper.Html.map(res));
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
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.U.AnInsertReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			io.odysz.common.Utils.logi("========== squery (r.serv11) post ==========");
			try
			{
				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
				io.odysz.semantic.jserv.U.AnInsertReq q = msg.body(0);
				q.validate();
				io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> res = 
					null;
				if (io.odysz.semantic.jprotocol.JProtocol.CRUD.C.Equals(q.a()))
				{
					res = inst((io.odysz.semantic.jserv.U.AnInsertReq)q, usr);
				}
				else
				{
					throw new io.odysz.semantics.x.SemanticException("i.serv only handling a=i. Please update client!"
						);
				}
				write(resp, res, msg.opts());
			}
			catch (io.odysz.semantic.jserv.x.SsException e)
			{
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSession, e.Message
					));
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

		/// <summary>
		/// Handle insert request, generate
		/// <see cref="io.odysz.transact.sql.Insert"/>
		/// statement,
		/// then commit and return results.
		/// </summary>
		/// <param name="msg"/>
		/// <param name="usr"/>
		/// <returns>results</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		private io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> inst(io.odysz.semantic.jserv.U.AnInsertReq msg, io.odysz.semantics.IUser usr)
		{
			io.odysz.transact.sql.Insert upd = st.insert(msg.mtabl, usr);
			string[] cols = msg.cols();
			if (cols == null || cols.Length == 0)
			{
				throw new io.odysz.semantics.x.SemanticException("Can't insert %s values without columns sepecification."
					, msg.mtabl);
			}
			io.odysz.semantics.SemanticObject res = (io.odysz.semantics.SemanticObject)upd.cols
				(cols).values(msg.values()).where(io.odysz.semantic.jserv.U.AnUpdate.tolerateNv(
				msg.where)).post(io.odysz.semantic.jserv.U.AnUpdate.postUpds(msg.postUpds, usr))
				.ins(st.instancontxt(msg.conn(), usr));
			if (res == null)
			{
				return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
					>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok);
			}
			return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
				>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok).body(new io.odysz.semantic.jprotocol.AnsonResp
				().data(res.props()));
		}
	}
}
