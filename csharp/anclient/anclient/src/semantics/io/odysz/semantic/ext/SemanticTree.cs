using Sharpen;

namespace io.odysz.semantic.ext
{
	/// <summary>
	/// Servlet implementing Semantic Tree<br />
	/// Querying like query.jserv, return tree data with node configured with semantics in config.xml<br />
	/// Using configured sql like TreeGrid is enough for trees like menu, but tree grid also needing joining and condition query, that' not enough.
	/// </summary>
	/// <remarks>
	/// Servlet implementing Semantic Tree<br />
	/// Querying like query.jserv, return tree data with node configured with semantics in config.xml<br />
	/// Using configured sql like TreeGrid is enough for trees like menu, but tree grid also needing joining and condition query, that' not enough.
	/// t:<br />
	/// reforest: re-build tree/forest structure of the taget table (specified in semantics, paramter sk);<br />
	/// retree: re-build tree from root;<br />
	/// sql: load tree by configured sql (t = ds, sk = sql-key);<br />
	/// [any]: load semantics tree (sk)
	/// </remarks>
	/// <author>odys-z@github.com</author>
	[System.Serializable]
	public class SemanticTree : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.ext.AnDatasetReq
		>
	{
		public SemanticTree()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.stree)
		{
		}

		private const long serialVersionUID = 1L;

		protected internal static io.odysz.semantic.DATranscxt st;

		static SemanticTree()
		{
			//	@Override
			//	public void init() throws ServletException {
			//		super.init();
			//		p = Port.stree;
			//	}
			st = io.odysz.semantic.jserv.JSingleton.defltScxt;
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.anson.x.AnsonException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			io.odysz.common.Utils.logi("---------- squery (r.serv11) get ----------");
			resp.setCharacterEncoding("UTF-8");
			try
			{
				jsonResp(msg, resp);
			}
			catch (java.sql.SQLException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			catch (io.odysz.semantic.jserv.x.SsException e)
			{
				Sharpen.Runtime.printStackTrace(e);
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

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.anson.x.AnsonException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			io.odysz.common.Utils.logi("========== squery (r.serv11) post ==========");
			resp.setCharacterEncoding("UTF-8");
			try
			{
				jsonResp(msg, resp);
			}
			catch (java.sql.SQLException e)
			{
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSession, e.Message
					));
			}
			catch (io.odysz.semantic.jserv.x.SsException e)
			{
				Sharpen.Runtime.printStackTrace(e);
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

		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="io.odysz.semantic.jserv.x.SsException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		protected internal virtual void jsonResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetReq
			> jmsg, javax.servlet.http.HttpServletResponse resp)
		{
			resp.setCharacterEncoding("UTF-8");
			// yes, still only 1 request body in v1.1
			string connId = jmsg.body(0).conn();
			// check session
			io.odysz.semantics.IUser usr = verifier.verify(jmsg.header());
			io.odysz.semantic.ext.AnDatasetReq jreq = jmsg.body(0);
			string t = jreq.a();
			// find tree semantics
			if (jreq.sk == null || jreq.sk.Trim().Length == 0)
			{
				throw new java.sql.SQLException("Sementic key must present for s-tree.serv.");
			}
			// String semantic = Configs.getCfg("tree-semantics", semanticKey);
			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> r;
			// t branches: reforest | retree | ds | <empty>
			// http://127.0.0.1:8080/ifire/s-tree.serv?sk=easyuitree-area&t=reforest
			if ("reforest".Equals(t))
			{
				r = rebuildForest(connId, getTreeSemtcs(jreq), usr);
			}
			else
			{
				// http://127.0.0.1:8080/ifire/s-tree.serv?sk=easyuitree-area&t=retree&root=002
				if ("retree".Equals(t))
				{
					string root = jreq.root();
					r = rebuildTree(connId, root, getTreeSemtcs(jreq), usr);
				}
				else
				{
					if ("sqltree".Equals(t))
					{
						// ds (tree configured in dataset.xml)
						System.Collections.Generic.IList<object> lst = io.odysz.semantic.DA.DatasetCfg.loadStree
							(connId, jreq.sk, jreq.page(), jreq.size(), jreq.sqlArgs);
						io.odysz.semantic.ext.AnDatasetResp re = new io.odysz.semantic.ext.AnDatasetResp(
							null).forest(lst);
						r = ok(re);
					}
					else
					{
						//				else if ("sqltable".equals(t)) {
						//					SResultset lst = DatasetCfg.loadDataset(connId,
						//							jreq.sk, jreq.page(), jreq.size(), jreq.sqlArgs);
						//					R = JProtocol.ok(p, lst);
						//				}
						// empty (build tree from general query results with semantic of 'sk')
						io.odysz.anson.JsonOpt opts = jmsg.opts();
						r = loadSTree(connId, jreq, getTreeSemtcs(jreq), usr, opts);
					}
				}
			}
			write(resp, r, jmsg.opts());
		}

		/// <summary>
		/// Figure out tree semantics in the following steps:<br />
		/// 1.
		/// </summary>
		/// <remarks>
		/// Figure out tree semantics in the following steps:<br />
		/// 1. if jreq is not null try get it (the client has defined a semantics);<br />
		/// 2. if req has an 'sk' parameter, load in confix.xml, if failed, try dataset.xml;<br />
		/// 3. if jreq has and 'sk' parameter, load in confix.xml, if failed, try dataset.xml.<br />
		/// </remarks>
		/// <param name="jreq"/>
		/// <returns>
		/// tree's semantics,
		/// <see cref="io.odysz.semantic.DA.DatasetCfg.TreeSemantics"/>
		/// </returns>
		private io.odysz.semantic.DA.DatasetCfg.TreeSemantics getTreeSemtcs(io.odysz.semantic.ext.AnDatasetReq
			 jreq)
		{
			if (jreq == null)
			{
				return null;
			}
			io.odysz.semantic.DA.DatasetCfg.TreeSemantics ts = jreq.getTreeSemantics();
			if (ts != null)
			{
				return ts;
			}
			//		String tss = Configs.getCfg("tree-semantics", jreq.sk);
			//		if (tss != null)
			//			return new TreeSemantics(tss);
			return io.odysz.semantic.DA.DatasetCfg.getTreeSemtcs(jreq.sk);
		}

		/// <summary>
		/// Build s-tree with general query (
		/// <see cref="JQuery#query(QueryReq)"/>
		/// ).
		/// </summary>
		/// <param name="connId"/>
		/// <param name="jreq"/>
		/// <param name="treeSmtcs"/>
		/// <param name="usr"></param>
		/// <param name="opts"></param>
		/// <returns>
		/// 
		/// <see cref="io.odysz.semantics.SemanticObject"/>
		/// response
		/// </returns>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="io.odysz.semantic.jserv.x.SsException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		private io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetResp>
			 loadSTree(string connId, io.odysz.semantic.ext.AnDatasetReq jreq, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
			 treeSmtcs, io.odysz.semantics.IUser usr, io.odysz.anson.JsonOpt opts)
		{
			// for robustness
			if (treeSmtcs == null)
			{
				throw new io.odysz.semantics.x.SemanticException("SemanticTree#loadSTree(): Can't build tree, tree semantics is null."
					);
			}
			string rootId = jreq.rootId;
			if (rootId != null && rootId.Trim().Length == 0)
			{
				rootId = null;
			}
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.jserv.R.AnQuery.query((io.odysz.semantic.jserv.R.AnQueryReq
				)jreq, usr);
			System.Collections.Generic.IList<object> forest = null;
			if (rs != null)
			{
				if (opts != null && opts.doubleFormat != null)
				{
					rs.stringFormat(Sharpen.Runtime.getClassForType(typeof(double)), io.odysz.common.LangExt
						.prefixIfnull("%", opts.doubleFormat));
				}
				forest = io.odysz.semantic.DA.DatasetCfg.buildForest(rs, treeSmtcs);
			}
			return ok(rs.total(), forest);
		}

		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetResp
			> ok<_T0>(int total, System.Collections.Generic.IList<_T0> forest)
		{
			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetResp> msg = new 
				io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.ext.AnDatasetResp>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				.ok);
			io.odysz.semantic.ext.AnDatasetResp body = new io.odysz.semantic.ext.AnDatasetResp
				(msg);
			body.forest(forest);
			msg.body(body);
			return msg;
		}

		/// <summary>
		/// Rebuild subtree starting at root.<br />
		/// Currently only mysql is supported.
		/// </summary>
		/// <remarks>
		/// Rebuild subtree starting at root.<br />
		/// Currently only mysql is supported. You may override this method to adapt to other RDBMS.
		/// </remarks>
		/// <param name="connId"/>
		/// <param name="rootId"/>
		/// <param name="semanticss"/>
		/// <param name="usrInf"></param>
		/// <returns>response</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException">Failed to lookup connection</exception>
		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> rebuildTree(string connId, string rootId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
			 semanticss, io.odysz.semantics.IUser usrInf)
		{
			if (io.odysz.semantic.DA.Connects.driverType(connId) == io.odysz.common.dbtype.mysql)
			{
				int total = io.odysz.semantic.ext.SemanticTree.BuildMysql.rebuildDbTree(rootId, semanticss
					, usrInf);
				return ok("re-forest", "Updated %s records from root %s", total, rootId);
			}
			else
			{
				throw new java.sql.SQLException("TODO...");
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> rebuildForest(string connId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics semanticss
			, io.odysz.semantics.IUser usrInf)
		{
			if (io.odysz.semantic.DA.Connects.driverType(connId) == io.odysz.common.dbtype.mysql)
			{
				int total = io.odysz.semantic.ext.SemanticTree.BuildMysql.rebuildDbForest(semanticss
					, usrInf);
				return ok("Updated records: %s", total);
			}
			else
			{
				throw new java.sql.SQLException("TODO...");
			}
		}

		/// <summary>
		/// FIXME use semantic.transact to extend this class to build sql for all supported DB
		/// - even supporting no radix64.<br />
		/// A helper class to rebuild tree structure in db table - in case node's parent changing makes subtree fullpath incorrect.<br />
		/// This needs two DB facilities to work:<br />
		/// 1.
		/// </summary>
		/// <remarks>
		/// FIXME use semantic.transact to extend this class to build sql for all supported DB
		/// - even supporting no radix64.<br />
		/// A helper class to rebuild tree structure in db table - in case node's parent changing makes subtree fullpath incorrect.<br />
		/// This needs two DB facilities to work:<br />
		/// 1. the radix64 array<pre>
		/// CREATE TABLE ir_radix64 (
		/// intv int(11) NOT NULL,
		/// charv char(1) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		/// PRIMARY KEY (`intv`)
		/// ) ENGINE=InnoDB DEFAULT CHARSET=ascii
		/// ;
		/// insert into ir_radix64(intv, charv) values (0, '0');
		/// insert into ir_radix64(intv, charv) values (1, '1');
		/// insert into ir_radix64(intv, charv) values (2, '2');
		/// insert into ir_radix64(intv, charv) values (3, '3');
		/// insert into ir_radix64(intv, charv) values (4, '4');
		/// insert into ir_radix64(intv, charv) values (5, '5');
		/// insert into ir_radix64(intv, charv) values (6, '6');
		/// insert into ir_radix64(intv, charv) values (7, '7');
		/// insert into ir_radix64(intv, charv) values (8, '8');
		/// insert into ir_radix64(intv, charv) values (9, '9');
		/// insert into ir_radix64(intv, charv) values (10, 'A');
		/// insert into ir_radix64(intv, charv) values (11, 'B');
		/// insert into ir_radix64(intv, charv) values (12, 'C');
		/// insert into ir_radix64(intv, charv) values (13, 'D');
		/// insert into ir_radix64(intv, charv) values (14, 'E');
		/// insert into ir_radix64(intv, charv) values (15, 'F');
		/// insert into ir_radix64(intv, charv) values (16, 'G');
		/// insert into ir_radix64(intv, charv) values (17, 'H');
		/// insert into ir_radix64(intv, charv) values (18, 'I');
		/// insert into ir_radix64(intv, charv) values (19, 'J');
		/// insert into ir_radix64(intv, charv) values (20, 'K');
		/// insert into ir_radix64(intv, charv) values (21, 'L');
		/// insert into ir_radix64(intv, charv) values (22, 'M');
		/// insert into ir_radix64(intv, charv) values (23, 'N');
		/// insert into ir_radix64(intv, charv) values (24, 'O');
		/// insert into ir_radix64(intv, charv) values (25, 'P');
		/// insert into ir_radix64(intv, charv) values (26, 'Q');
		/// insert into ir_radix64(intv, charv) values (27, 'R');
		/// insert into ir_radix64(intv, charv) values (28, 'S');
		/// insert into ir_radix64(intv, charv) values (29, 'T');
		/// insert into ir_radix64(intv, charv) values (30, 'U');
		/// insert into ir_radix64(intv, charv) values (31, 'V');
		/// insert into ir_radix64(intv, charv) values (32, 'W');
		/// insert into ir_radix64(intv, charv) values (33, 'X');
		/// insert into ir_radix64(intv, charv) values (34, 'Y');
		/// insert into ir_radix64(intv, charv) values (35, 'Z');
		/// insert into ir_radix64(intv, charv) values (36, 'a');
		/// insert into ir_radix64(intv, charv) values (37, 'b');
		/// insert into ir_radix64(intv, charv) values (38, 'C');
		/// insert into ir_radix64(intv, charv) values (39, 'D');
		/// insert into ir_radix64(intv, charv) values (40, 'e');
		/// insert into ir_radix64(intv, charv) values (41, 'f');
		/// insert into ir_radix64(intv, charv) values (42, 'g');
		/// insert into ir_radix64(intv, charv) values (43, 'h');
		/// insert into ir_radix64(intv, charv) values (44, 'i');
		/// insert into ir_radix64(intv, charv) values (45, 'j');
		/// insert into ir_radix64(intv, charv) values (46, 'k');
		/// insert into ir_radix64(intv, charv) values (47, 'l');
		/// insert into ir_radix64(intv, charv) values (48, 'm');
		/// insert into ir_radix64(intv, charv) values (49, 'n');
		/// insert into ir_radix64(intv, charv) values (50, 'o');
		/// insert into ir_radix64(intv, charv) values (51, 'p');
		/// insert into ir_radix64(intv, charv) values (52, 'q');
		/// insert into ir_radix64(intv, charv) values (53, 'R');
		/// insert into ir_radix64(intv, charv) values (54, 's');
		/// insert into ir_radix64(intv, charv) values (55, 't');
		/// insert into ir_radix64(intv, charv) values (56, 'U');
		/// insert into ir_radix64(intv, charv) values (57, 'v');
		/// insert into ir_radix64(intv, charv) values (58, 'w');
		/// insert into ir_radix64(intv, charv) values (59, 'x');
		/// insert into ir_radix64(intv, charv) values (60, 'y');
		/// insert into ir_radix64(intv, charv) values (61, 'z');
		/// insert into ir_radix64(intv, charv) values (62, '+');
		/// insert into ir_radix64(intv, charv) values (63, '-');
		/// </pre>
		/// 2. the stored function:<pre>
		/// CREATE FUNCTION char2rx64(intv int(11)) RETURNS varchar(2)
		/// -- get a radix64 char(2) for an integer value ( 0 ~ 64^2 - 1)
		/// begin
		/// DECLARE chr0 char(1);
		/// DECLARE chr1 char(1);
		/// DECLARE ix INT DEFAULT 0;
		/// set ix = intv & 63; -- 03fh
		/// select charv into chr0 from ir_radix64 R where R.intv = ix;
		/// set intv = intv &gt;&gt; 6;
		/// set ix = intv & 63;
		/// select charv into chr1 from ir_radix64 R where R.intv = ix;
		/// return concat(chr1, chr0);
		/// end </pre>
		/// See
		/// <see cref="rebuildDbForest(io.odysz.semantic.DA.DatasetCfg.TreeSemantics, io.odysz.semantics.IUser)
		/// 	"/>
		/// for tested sqls.
		/// </remarks>
		/// <author>ody</author>
		internal class BuildMysql
		{
			/// <param name="rootId"/>
			/// <param name="sm"/>
			/// <param name="dblog"></param>
			/// <returns/>
			/// <exception cref="java.sql.SQLException"/>
			/// <exception cref="io.odysz.transact.x.TransException"></exception>
			private static int rebuildDbTree(string rootId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
				 sm, io.odysz.semantics.IUser dblog)
			{
				// clear root parentId
				string sql = string.format("update %1$s set %2$s = null where %2$s = %3$s or %2$s = ''"
					, sm.tabl(), sm.dbParent(), sm.dbRecId());
				// sm[Ix.tabl][0], sm[Ix.parent][0], sm[Ix.recId][0]);
				io.odysz.semantic.DA.Connects.commit(dblog, sql);
				string pid = null;
				sql = string.format("select %1$s pid from %2$s where %3$s = '%4$s'", sm.dbParent(
					), sm.tabl(), sm.dbRecId(), rootId);
				// sm[Ix.parent][0], sm[Ix.tabl][0], sm[Ix.recId][0], rootId);
				io.odysz.module.rs.AnResultset rs = new io.odysz.module.rs.AnResultset(io.odysz.semantic.DA.Connects
					.select(sql));
				if (rs.beforeFirst().next())
				{
					pid = rs.getString("pid");
					if (pid != null && pid.Trim().Length == 0)
					{
						pid = null;
					}
				}
				string updatei;
				if (pid != null)
				{
					updatei = updateSubroot(rootId, sm);
				}
				else
				{
					updatei = updateRoot(rootId, sm);
				}
				int total = 0;
				int level = 1;
				int[] i = io.odysz.semantic.DA.Connects.commit(dblog, updatei);
				while (i != null && i.Length > 0 && i[0] > 0)
				{
					total += i[0];
					updatei = updatePi(rootId, sm, level++);
					i = io.odysz.semantic.DA.Connects.commit(dblog, updatei);
				}
				// return ok("re-forest", "Updated %s records from root %s", total, rootId);
				return total;
			}

			/// <summary>
			/// update e_areas
			/// set fullpath = concat(lpad(ifnull(siblingSort, '0'), 2, '0'), ' ', areaId)
			/// where areaId = 'rootId'
			/// </summary>
			/// <param name="rootId"/>
			/// <param name="sm"/>
			/// <returns/>
			private static string updateRoot(string rootId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
				 sm)
			{
				// update e_areas set fullpath = concat(lpad(ifnull(siblingSort, '0'), 2, '0'), ' ', areaId)
				// where areaId = 'rootId'
				return string.format("update %1$s set %2$s = concat(char2rx64(ifnull(%3$s, 0)), ' ', %4$s) "
					 + "where %4$s = '%5$s'", sm.tabl(), sm.dbFullpath(), sm.dbSort(), sm.dbRecId(), 
					rootId);
			}

			// sm[Ix.tabl][0], sm[Ix.fullpath][0], sm[Ix.sort][0], sm[Ix.recId][0], rootId);
			private static string updateSubroot(string rootId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
				 sm)
			{
				// update a_domain p0 join a_domain R on p0.parentId = R.domainId
				// set p0.fullpath = concat(R.fullpath, '.', char2rx64(ifnull(p0.sort, 0)), ' ', p0.domainId)
				// where p0.domainId = '0202';
				return string.format("update %1$s p0 join %1$s R on p0.%2$s = R.%3$s " + "set p0.%4$s = concat(R.%4$s, '.', char2rx64(ifnull(p0.%5$s, 0)), ' ', p0.%3$s) where p0.%3$s = '%6$s'"
					, sm.tabl(), sm.dbParent(), sm.dbRecId(), sm.dbFullpath(), sm.dbSort(), rootId);
			}

			// sm[Ix.tabl][0], sm[Ix.parent][0], sm[Ix.recId][0], sm[Ix.fullpath][0], sm[Ix.sort][0], rootId);
			//////////////////////////////// forest /////////////////////////////////////////////////////
			/// <param name="sm"/>
			/// <param name="dblog"/>
			/// <returns>total records</returns>
			/// <exception cref="java.sql.SQLException"/>
			/// <exception cref="io.odysz.transact.x.TransException"></exception>
			private static int rebuildDbForest(io.odysz.semantic.DA.DatasetCfg.TreeSemantics 
				sm, io.odysz.semantics.IUser dblog)
			{
				// clear root parentId
				string sql = string.format("update %1$s set %2$s = null where %2$s = %3$s or %2$s = ''"
					, sm.tabl(), sm.dbParent(), sm.dbRecId());
				// sm[Ix.tabl][0], sm[Ix.parent][0], sm[Ix.recId][0]);
				io.odysz.semantic.DA.Connects.commit(dblog, sql);
				string updatei = updateForestRoot(sm);
				int total = 0;
				int level = 1;
				int[] i = io.odysz.semantic.DA.Connects.commit(dblog, updatei);
				while (i != null && i.Length > 0 && i[0] > 0)
				{
					total += i[0];
					updatei = updatePi(null, sm, level++);
					i = io.odysz.semantic.DA.Connects.commit(dblog, updatei);
				}
				// return ok("Updated records: %s", total);
				return total;
			}

			private static string updateForestRoot(io.odysz.semantic.DA.DatasetCfg.TreeSemantics
				 sm)
			{
				// update e_areas set fullpath = CONCAT(char2rx64(ifnull(siblingSort, 0)), ' ', areaId) where parentId is null;
				return string.format("update %1$s set %2$s = concat(char2rx64(ifnull(%3$s, 0)), ' ', %4$s) "
					 + "where %5$s is null", sm.tabl(), sm.dbFullpath(), sm.dbSort(), sm.dbRecId(), 
					sm.dbParent());
			}

			// sm[Ix.tabl][0], sm[Ix.fullpath][0], sm[Ix.sort][0], sm[Ix.recId][0], sm[Ix.parent][0]);
			/// <summary>
			/// <pre>
			/// update e_areas set fullpath = CONCAT(char2rx64(ifnull(siblingSort, 0)), '#', areaId) where parentId is null;
			/// update e_areas p1 join e_areas p0 on p1.parentId = p0.areaId
			/// set p1.fullpath = concat(p0.fullpath, ' ', char2rx64(ifnull(p1.siblingSort, 0)), '#', p1.areaId)
			/// where p0.parentId is null;
			/// update e_areas p2 join e_areas p1 on p2.parentId = p1.areaId join e_areas p0 on p1.parentId = p0.areaId
			/// set p2.fullpath = concat(p1.fullpath, ' ', char2rx64(ifnull(p2.siblingSort, 0)), '#', p2.areaId)
			/// where p0.parentId is null;
			/// update e_areas p3 join e_areas p2 on p3.parentId = p2.areaId join e_areas p1 on p2.parentId = p1.areaId join e_areas p0 on p1.parentId = p0.areaId
			/// set p3.fullpath = concat(p2.fullpath, ' ', char2rx64(ifnull(p3.siblingSort, 0)), '#', p3.areaId)
			/// where p0.parentId is null; </pre>
			/// </summary>
			/// <param name="sm"/>
			/// <param name="pi"/>
			/// <returns/>
			private static string updatePi(string rootId, io.odysz.semantic.DA.DatasetCfg.TreeSemantics
				 sm, int pi)
			{
				// e_areas p0 on p1.parentId = p0.areaId
				string p0 = string.format("%1$s p%2$D on p%3$D.%4$s = p%2$D.%5$s", sm.tabl(), sm.
					dbParent(), sm.dbRecId());
				// sm[Ix.tabl][0], 0, 1, sm[Ix.parent][0], sm[Ix.recId][0]);
				for (int i = 1; i < pi; i++)
				{
					// e_areas p1 on p2.parentId = p1.areaId join [e_areas p0 on p1.parentId = p0.areaId]
					p0 = string.format("%1$s p%2$D on p%3$D.%4$s = p%2$D.%5$s join %6$s", sm.tabl(), 
						i, i + 1, sm.dbParent(), sm.dbRecId(), p0);
				}
				// sm[Ix.tabl][0], i, i + 1, sm[Ix.parent][0], sm[Ix.recId][0], p0);
				p0 = string.format("update %1$s p%2$D join %3$s %4$s %5$s", sm.tabl(), pi, p0, setPi
					(sm, pi), rootId == null ? string.format("where p0.%1$s is null", sm.dbParent())
					 : string.format("where p0.%1$s = '%2$s'", sm.dbRecId(), rootId));
				// sm[Ix.tabl][0],
				// sm[Ix.parent][0]
				// where p0.parentId is null
				// sm[Ix.recId][0],
				// where p0.areaId = 'rootId'
				return p0;
			}

			private static string setPi(io.odysz.semantic.DA.DatasetCfg.TreeSemantics sm, int
				 pi)
			{
				// set p2.fullpath = concat(p1.fullpath, ' ', char2rx64(ifnull(p2.siblingSort, 0)), '#', p2.areaId)
				return string.format("set p%1$D.%2$s = concat(p%3$D.%2$s, '.', char2rx64(ifnull(p%1$D.%4$s, 0)), ' ', p%1$D.%5$s)"
					, pi, sm.dbFullpath(), pi - 1, sm.dbSort(), sm.dbRecId());
			}
			// pi, sm[Ix.fullpath][0], pi - 1, sm[Ix.sort][0], sm[Ix.recId][0]);
		}
	}
}
