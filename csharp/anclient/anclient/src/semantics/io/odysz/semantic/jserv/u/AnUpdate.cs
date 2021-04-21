using Sharpen;

namespace io.odysz.semantic.jserv.U
{
	[System.Serializable]
	public class AnUpdate : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.jserv.U.AnUpdateReq
		>
	{
		public AnUpdate()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.update)
		{
		}

		private const long serialVersionUID = 1L;

		private static io.odysz.semantic.DATranscxt st;

		protected internal static io.odysz.semantic.jsession.ISessionVerifier verifier;

		static AnUpdate()
		{
			st = io.odysz.semantic.jserv.JSingleton.defltScxt;
			verifier = io.odysz.semantic.jserv.JSingleton.getSessionVerifier();
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.U.AnUpdateReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			try
			{
				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
				io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> res = 
					updt(msg.body(0), usr);
				resp.setCharacterEncoding("UTF-8");
				resp.getWriter().write(io.odysz.semantic.jserv.helper.Html.map(res));
				resp.flushBuffer();
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
		}

		/// <exception cref="System.IO.IOException"/>
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.U.AnUpdateReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			try
			{
				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
				// validate requires
				io.odysz.semantic.jserv.U.AnUpdateReq q = msg.body(0);
				q.validate();
				io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> res = 
					null;
				if (io.odysz.semantic.jprotocol.JProtocol.CRUD.U.Equals(q.a()))
				{
					res = updt(q, usr);
				}
				else
				{
					if (io.odysz.semantic.jprotocol.JProtocol.CRUD.C.Equals(q.a()))
					{
						// res = inst((InsertReq) q, usr);
						throw new io.odysz.semantics.x.SemanticException("Inserting Request is handled by i.serv. Please update client."
							);
					}
					else
					{
						if (io.odysz.semantic.jprotocol.JProtocol.CRUD.D.Equals(q.a()))
						{
							res = delt(q, usr);
						}
					}
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
					, e.ex()));
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
				// only for debug convenience
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
		/// Handle update request, generate
		/// <see cref="io.odysz.transact.sql.Update"/>
		/// , commit, return results.
		/// </summary>
		/// <param name="msg"/>
		/// <param name="usr"/>
		/// <returns>results</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		private io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> updt(io.odysz.semantic.jserv.U.AnUpdateReq msg, io.odysz.semantics.IUser usr)
		{
			io.odysz.transact.sql.Update upd = st.update(msg.mtabl, usr);
			io.odysz.semantics.SemanticObject res = (io.odysz.semantics.SemanticObject)upd.nvs
				(msg.nvs).where(tolerateNv(msg.where)).post(postUpds(msg.postUpds, usr)).limit(msg
				.limt).u(st.instancontxt(msg.conn(), usr));
			// .attachs(msg.attacheds)
			if (res == null)
			{
				return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
					>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok);
			}
			return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
				>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok).body(new io.odysz.semantic.jprotocol.AnsonResp
				().data(res.props()));
		}

		/// <summary>Change [n-v] to ["=", n, "'v'"], tolerate client's behavior.</summary>
		/// <param name="where"/>
		/// <returns>predicates[[logic, n, v], ...]</returns>
		internal static System.Collections.Generic.List<object[]> tolerateNv(System.Collections.Generic.List
			<object[]> where)
		{
			if (where != null)
			{
				for (int ix = 0; ix < where.Count; ix++)
				{
					object[] nv = where[ix];
					if (nv != null && nv.Length == 2)
					{
						object v = nv[io.odysz.transact.sql.Query.Ix.nvv];
						if (v == null)
						{
							// client has done something wrong
							where.set(ix, null);
							// not remove(), because it's still iterating
							continue;
						}
						// v can be large, performance can be improved
						if (v is string && ((string)v).StartsWith("'"))
						{
							where.set(ix, new object[] { "=", nv[io.odysz.transact.sql.Query.Ix.nvn], v });
						}
						else
						{
							where.set(ix, new string[] { "=", (string)nv[io.odysz.transact.sql.Query.Ix.nvn], 
								"'" + v + "'" });
						}
					}
				}
				where.removeIf(@"TODO: Lambda Expression Ignored
m -> m == null");
			}
			return where;
		}

		/// <summary>
		/// convert update requests' body, usually from msg's post requests,
		/// list of (
		/// <see cref="UpdateReq"/>
		/// ) to
		/// <see cref="io.odysz.transact.sql.Statement{T}"/>
		/// .
		/// </summary>
		/// <param name="updreq"/>
		/// <param name="st"/>
		/// <param name="usr"/>
		/// <returns>statements</returns>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		public static System.Collections.Generic.List<io.odysz.transact.sql.Statement<object
			>> postUpds(System.Collections.Generic.List<io.odysz.semantic.jserv.U.AnUpdateReq
			> updreq, io.odysz.semantics.IUser usr)
		{
			if (updreq != null)
			{
				System.Collections.Generic.List<io.odysz.transact.sql.Statement<object>> posts = 
					new System.Collections.Generic.List<io.odysz.transact.sql.Statement<object>>(updreq
					.Count);
				foreach (io.odysz.semantic.jserv.U.AnUpdateReq pst in updreq)
				{
					io.odysz.transact.sql.Statement<object> upd = null;
					if (io.odysz.semantic.jprotocol.JProtocol.CRUD.C.Equals(pst.a()))
					{
						upd = st.insert(pst.mtabl, usr).cols(pst.cols()).values(pst.values());
					}
					else
					{
						if (io.odysz.semantic.jprotocol.JProtocol.CRUD.U.Equals(pst.a()))
						{
							upd = st.update(pst.mtabl, usr).nvs(pst.nvs);
						}
						else
						{
							if (io.odysz.semantic.jprotocol.JProtocol.CRUD.D.Equals(pst.a()))
							{
								upd = st.delete(pst.mtabl, usr);
							}
							else
							{
								if (pst != null)
								{
									io.odysz.common.Utils.warn("Can't handle request:\n" + pst.ToString());
									continue;
								}
							}
						}
					}
					posts.add(upd.where(pst.where).post(postUpds(pst.postUpds, usr)));
				}
				return posts;
			}
			return null;
		}

		/// <summary>
		/// Handle delete request, generate
		/// <see cref="io.odysz.transact.sql.Delete"/>
		/// , commit, return results.
		/// </summary>
		/// <param name="msg"/>
		/// <param name="usr"/>
		/// <returns>results</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		private io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> delt(io.odysz.semantic.jserv.U.AnUpdateReq msg, io.odysz.semantics.IUser usr)
		{
			io.odysz.transact.sql.Delete del = st.delete(msg.mtabl, usr);
			io.odysz.semantics.SemanticObject res = (io.odysz.semantics.SemanticObject)del.where
				(tolerateNv(msg.where)).post(postUpds(msg.postUpds, usr)).d(st.instancontxt(msg.
				conn(), usr));
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
