//using Sharpen;

//namespace io.odysz.semantic.jserv.R
//{
//	/// <summary>CRUD read service.</summary>
//	/// <author>odys-z@github.com</author>
//	[System.Serializable]
//	public class AnQuery : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.jserv.R.AnQueryReq
//		>
//	{
//		public AnQuery()
//			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.query)
//		{
//		}

//		protected internal static io.odysz.semantic.jsession.ISessionVerifier verifier;

//		protected internal static io.odysz.semantic.DATranscxt st;

//		static AnQuery()
//		{
//			//	@Override
//			//	public void init() throws ServletException {
//			//		super.init();
//			//		p = Port.query;
//			//	}
//			st = io.odysz.semantic.jserv.JSingleton.defltScxt;
//			verifier = io.odysz.semantic.jserv.JSingleton.getSessionVerifier();
//		}

//		/// <exception cref="javax.servlet.ServletException"/>
//		/// <exception cref="System.IO.IOException"/>
//		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.R.AnQueryReq
//			> msg, javax.servlet.http.HttpServletResponse resp)
//		{
//			io.odysz.common.Utils.logi("---------- squery (r.serv11) get ----------");
//			try
//			{
//				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
//				io.odysz.module.rs.AnResultset rs = query(msg.body(0), usr);
//				resp.getWriter().write(io.odysz.semantic.jserv.helper.Html.rs(rs));
//			}
//			catch (java.sql.SQLException e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//			}
//			catch (io.odysz.transact.x.TransException e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//			}
//			catch (io.odysz.semantic.jserv.x.SsException e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//			}
//			finally
//			{
//				resp.flushBuffer();
//			}
//		}

//		/// <exception cref="System.IO.IOException"/>
//		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.R.AnQueryReq
//			> msg, javax.servlet.http.HttpServletResponse resp)
//		{
//			io.odysz.common.Utils.logi("========== squery (r.serv11) post ==========");
//			try
//			{
//				io.odysz.semantics.IUser usr = verifier.verify(msg.header());
//				io.odysz.module.rs.AnResultset rs = query(msg.body(0), usr);
//				write(resp, ok(rs), msg.opts());
//			}
//			catch (io.odysz.semantic.jserv.x.SsException e)
//			{
//				// ServletAdapter.write(resp, JProtocol.err(p, MsgCode.exSession, e.getMessage()));
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSession, e.Message
//					));
//			}
//			catch (io.odysz.semantics.x.SemanticException e)
//			{
//				// ServletAdapter.write(resp, JProtocol.err(p, MsgCode.exSemantic, e.getMessage()));
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSemantic, e.Message
//					));
//			}
//			catch (System.Exception e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//				// ServletAdapter.write(resp, JProtocol.err(p, MsgCode.exTransct, e.getMessage()));
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exTransct, e.Message
//					));
//			}
//			catch (System.Exception e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//				// ServletAdapter.write(resp, JProtocol.err(p, MsgCode.exGeneral, e.getMessage()));
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exGeneral, e.Message
//					));
//			}
//			finally
//			{
//				resp.flushBuffer();
//			}
//		}

//		/// <param name="msg"/>
//		/// <param name="usr"></param>
//		/// <returns>
//		/// {code: "ok", port:
//		/// <see cref="JMessage.Port"/>
//		/// .query, rs: [
//		/// <see cref="SResultset"/>
//		/// , ...]}
//		/// </returns>
//		/// <exception cref="java.sql.SQLException"/>
//		/// <exception cref="io.odysz.transact.x.TransException"/>
//		protected internal static io.odysz.transact.sql.Query buildSelct(io.odysz.semantic.jserv.R.AnQueryReq
//			 msg, io.odysz.semantics.IUser usr)
//		{
//			io.odysz.transact.sql.Query selct = st.select(msg.mtabl, msg.mAlias);
//			// exclude sqlite paging
//			if (msg.page >= 0 && msg.pgsize > 0 && io.odysz.common.dbtype.sqlite == io.odysz.semantic.DA.Connects
//				.driverType(msg.conn() == null ? io.odysz.semantic.DA.Connects.defltConn() : msg
//				.conn()))
//			{
//				io.odysz.common.Utils.warn("JQuery#buildSelct(): Requesting data from sqlite, but it's not easy to page in sqlite. So page and size are ignored: %s, %s."
//					, msg.page, msg.pgsize);
//			}
//			else
//			{
//				selct.page(msg.page, msg.pgsize);
//			}
//			if (msg.exprs != null && msg.exprs.Count > 0)
//			{
//				foreach (string[] col in msg.exprs)
//				{
//					selct.col((string)col[io.odysz.transact.sql.Query.Ix.exprExpr], (string)col[io.odysz.transact.sql.Query.Ix
//						.exprAlais]);
//				}
//			}
//			/* Sample of join on parsing:
//			0	l
//			1	a_roles
//			2	R
//			3	U.roleId=R.roleId or U.roleId = 'admin' and U.orgId in ('Mossad', 'MI6', 'CIA', 'SVR', 'ChaoYang People')
			
//			select userId userId, userName userName, mobile mobile, dept.orgId orgId, o.orgName orgName,
//			dept.departName departName, dept.departId departId, R.roleId roleId, R.roleName roleName, notes notes
//			from a_user U
//			join a_reg_org o on U.orgId = o.orgId
//			left outer join a_org_depart dept on U.departId = dept.departId
//			left outer join a_roles R on U.roleId = R.roleId OR U.roleId = 'admin' AND U.orgId in ('Mossad', 'MI6', 'CIA', 'SVR', 'ChaoYang People')
//			where U.userName like '%Uz%'
//			*/
//			if (msg.joins != null && msg.joins.Count > 0)
//			{
//				foreach (object[] j in msg.joins)
//				{
//					if (j[io.odysz.transact.sql.Query.Ix.joinTabl] is io.odysz.semantic.jserv.R.AnQueryReq)
//					{
//						io.odysz.transact.sql.Query q = buildSelct((io.odysz.semantic.jserv.R.AnQueryReq)
//							j[io.odysz.transact.sql.Query.Ix.joinTabl], usr);
//						selct.j(io.odysz.transact.sql.parts.select.JoinTabl.join.parse((string)j[io.odysz.transact.sql.Query.Ix
//							.joinType]), q, (string)j[io.odysz.transact.sql.Query.Ix.joinAlias], (string)j[io.odysz.transact.sql.Query.Ix
//							.joinOnCond]);
//					}
//					else
//					{
//						selct.j(io.odysz.transact.sql.parts.select.JoinTabl.join.parse((string)j[io.odysz.transact.sql.Query.Ix
//							.joinType]), (string)j[io.odysz.transact.sql.Query.Ix.joinTabl], (string)j[io.odysz.transact.sql.Query.Ix
//							.joinAlias], (string)j[io.odysz.transact.sql.Query.Ix.joinOnCond]);
//					}
//				}
//			}
//			if (msg.where != null && msg.where.Count > 0)
//			{
//				foreach (object[] cond in msg.where)
//				{
//					selct.where((string)cond[io.odysz.transact.sql.Query.Ix.predicateOper], (string)cond
//						[io.odysz.transact.sql.Query.Ix.predicateL], (string)cond[io.odysz.transact.sql.Query.Ix
//						.predicateR]);
//				}
//			}
//			// GROUP BY
//			selct.groupby(msg.groups);
//			// HAVING
//			if (msg.havings != null && msg.havings.Count > 0)
//			{
//				foreach (object[] havin in msg.havings)
//				{
//					selct.having((string)havin[io.odysz.transact.sql.Query.Ix.predicateOper], (string
//						)havin[io.odysz.transact.sql.Query.Ix.predicateL], (string)havin[io.odysz.transact.sql.Query.Ix
//						.predicateR]);
//				}
//			}
//			// ORDER BY
//			selct.orderby(msg.orders);
//			if (msg.limt != null)
//			{
//				selct.limit(msg.limt[0], msg.limt.Length > 1 ? msg.limt[1] : null);
//			}
//			return selct;
//		}

//		/// <summary>
//		/// Query with help of
//		/// <see cref="buildSelct(AnQueryReq, io.odysz.semantics.IUser)"/>
//		/// .
//		/// </summary>
//		/// <param name="msg"/>
//		/// <param name="usr"/>
//		/// <returns>result set</returns>
//		/// <exception cref="java.sql.SQLException"/>
//		/// <exception cref="io.odysz.transact.x.TransException"/>
//		public static io.odysz.module.rs.AnResultset query(io.odysz.semantic.jserv.R.AnQueryReq
//			 msg, io.odysz.semantics.IUser usr)
//		{
//			io.odysz.transact.sql.Query selct = buildSelct(msg, usr);
//			io.odysz.semantics.SemanticObject s = selct.rs(st.instancontxt(msg.conn(), usr));
//			return (io.odysz.module.rs.AnResultset)s.rs(0);
//		}
//	}
//}
