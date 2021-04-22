using Sharpen;

namespace io.odysz.semantic
{
	/// <summary>
	/// Statement manager that providing statements with overridden callback methods.<br />
	/// <p>Those statements are the starting points to build a sql transact for querying, updating, etc.<br />
	/// For how to use the created statements, see the testing class:
	/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/java/io/odysz/semantic/DASemantextTest.java'>
	/// DASemantextTest</a>.</p>
	/// This manager can handling semantics configured in xml.
	/// </summary>
	/// <remarks>
	/// Statement manager that providing statements with overridden callback methods.<br />
	/// <p>Those statements are the starting points to build a sql transact for querying, updating, etc.<br />
	/// For how to use the created statements, see the testing class:
	/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/java/io/odysz/semantic/DASemantextTest.java'>
	/// DASemantextTest</a>.</p>
	/// This manager can handling semantics configured in xml. See
	/// <see cref="loadSemantics(string, string)"/>
	/// . <br />
	/// Every sql building needing semantics handling must use a context instance created by
	/// <see cref="instancontxt(string, io.odysz.semantics.IUser)"/>
	/// .
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class DATranscxt : io.odysz.transact.sql.Transcxt
	{
		internal static string cfgroot = string.Empty;

		internal static string runtimepath = string.Empty;

		/// <summary>configuration's root</summary>
		public static void configRoot(string cfgRoot, string runtimeRoot)
		{
			cfgroot = cfgRoot;
			runtimepath = runtimeRoot;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public override io.odysz.semantics.meta.TableMeta tableMeta(string t)
		{
			foreach (string cnn in io.odysz.semantic.DA.Connects.connIds())
			{
				System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
					metas;
				try
				{
					metas = io.odysz.semantic.DA.Connects.getMeta(cnn);
					if (metas != null && metas.Contains(t))
					{
						return metas[t];
					}
				}
				catch (java.sql.SQLException e)
				{
					Sharpen.Runtime.printStackTrace(e);
					throw new io.odysz.semantics.x.SemanticException(e.Message);
				}
			}
			return null;
		}

		/// <summary>[conn, [table, DASemantics]</summary>
		protected internal static System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
			<string, io.odysz.semantic.DASemantics>> smtConfigs;

		/// <summary>
		/// Create a new semantext instance with the static resources.<br />
		/// <see cref="DATranscxt"/>
		/// use a basic context (without semantics handler) for basic sql building.<br />
		/// Every context used for
		/// <see cref="DASemantics"/>
		/// handling must use this to create a new context instance.
		/// </summary>
		/// <param name="connId"/>
		/// <param name="usr"/>
		/// <seealso cref="io.odysz.semantics.ISemantext"></seealso>
		/// <seealso cref="io.odysz.transact.sql.Transcxt.instancontxt(string, io.odysz.semantics.IUser)
		/// 	"/>
		/// <returns>semantext</returns>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		public override io.odysz.semantics.ISemantext instancontxt(string connId, io.odysz.semantics.IUser
			 usr)
		{
			/*
			if (basictx == null)
			return null;
			else
			try {
			// return new DASemantext(basiconnId, smtConfigs.get(basiconnId), meta(basiconnId), usr);
			return new DASemantext(basiconnId, getSmtcs(basiconnId),
			Connects.getMeta(basiconnId), usr, runtimepath);
			} catch (SemanticException | SQLException | SAXException | IOException e) {
			// meta is null? shouldn't happen because this instance is already created
			e.printStackTrace();
			return null;
			}
			*/
			try
			{
				string conn = io.odysz.common.LangExt.isblank(connId) ? basiconnId : connId;
				return new io.odysz.semantic.DASemantext(conn, getSmtcs(conn), io.odysz.semantic.DA.Connects
					.getMeta(conn), usr, runtimepath);
			}
			catch (System.Exception e)
			{
				// meta is null? shouldn't happen because this instance is already created
				Sharpen.Runtime.printStackTrace(e);
				throw new io.odysz.transact.x.TransException(e.Message);
			}
		}

		/// <summary>Create a select statement.</summary>
		/// <remarks>
		/// Create a select statement.
		/// <p>This statement is the starting points to build a sql transact for querying.<br />
		/// For how to use the created statements, see the testing class:
		/// <a href='https://github.com/odys-z/semantic-transact/blob/master/semantic.transact/src/test/java/io/odysz/transact/sql/TestTransc.java'>
		/// DASemantextTest</a>.</p>
		/// </remarks>
		/// <seealso cref="io.odysz.transact.sql.Transcxt.select(string, string[])"/>
		public override io.odysz.transact.sql.Query select(string tabl, params string[] alias
			)
		{
			io.odysz.transact.sql.Query q = base.select(tabl, alias);
			q.doneOp(@"TODO: Lambda Expression Ignored
(sctx,sqls) -> {
  if (q.page() < 0 || q.size() <= 0) {
    AnResultset rs=Connects.select(sctx.connId(),sqls.get(0));
    rs.total(rs.getRowCount());
    sctx.onSelected(rs);
    return new SemanticObject().rs(rs,rs.total());
  }
 else {
    AnResultset total=Connects.select(sctx.connId(),((DASemantext)sctx).totalSql(sqls.get(0)));
    total.beforeFirst().next();
    int t=total.getInt(1);
    AnResultset rs=Connects.select(sctx.connId(),((DASemantext)sctx).pageSql(sqls.get(0),q.page(),q.size()));
    rs.total(t);
    sctx.onSelected(rs);
    return new SemanticObject().rs(rs,t);
  }
}
"
				);
			return q;
		}

		/// <summary>Create an insert statement.</summary>
		/// <remarks>
		/// Create an insert statement.
		/// <p>Those statements are the starting points to build a sql transact for querying, updating, etc.<br />
		/// For how to use the created statements, see the testing class:
		/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/java/io/odysz/semantic/DASemantextTest.java'>
		/// DASemantextTest</a>.</p>
		/// </remarks>
		/// <param name="tabl"/>
		/// <param name="usr"/>
		/// <returns>the starting statement</returns>
		public virtual io.odysz.transact.sql.Insert insert(string tabl, io.odysz.semantics.IUser
			 usr)
		{
			io.odysz.transact.sql.Insert i = base.insert(tabl);
			i.doneOp(@"TODO: Lambda Expression Ignored
(sctx,sqls) -> {
  int[] r=Connects.commit(sctx.connId(),usr,sqls);
  sctx.onCommitted(sctx);
  return new SemanticObject().addInts("inserted",r).put("resulved",sctx.resulves());
}
"
				);
			// In semantic.DA 1.0, only deletingl external files here
			return i;
		}

		/// <summary>Create an update statement.</summary>
		/// <remarks>
		/// Create an update statement.
		/// <p>Those statements are the starting points to build a sql transact for querying, updating, etc.<br />
		/// For how to use the created statements, see the testing class:
		/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/java/io/odysz/semantic/DASemantextTest.java'>
		/// DASemantextTest</a>.</p>
		/// </remarks>
		/// <param name="tabl"/>
		/// <param name="usr"/>
		/// <returns>the starting statement</returns>
		public virtual io.odysz.transact.sql.Update update(string tabl, io.odysz.semantics.IUser
			 usr)
		{
			io.odysz.transact.sql.Update u = base.update(tabl);
			u.doneOp(@"TODO: Lambda Expression Ignored
(sctx,sqls) -> {
  int[] r=Connects.commit(sctx.connId(),usr,sqls);
  sctx.onCommitted(sctx);
  return new SemanticObject().addInts("updated",r).put("resulved",sctx.resulves());
}
"
				);
			// In semantic.DA 1.0, only deletingl external files here
			return u;
		}

		/// <summary>Create an update statement.</summary>
		/// <remarks>
		/// Create an update statement.
		/// <p>Those statements are the starting points to build a sql transact for querying, updating, etc.<br />
		/// For how to use the created statements, see the testing class:
		/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/java/io/odysz/semantic/DASemantextTest.java'>
		/// DASemantextTest</a>.</p>
		/// </remarks>
		/// <param name="tabl"/>
		/// <param name="usr"/>
		/// <returns>the starting statement</returns>
		public virtual io.odysz.transact.sql.Delete delete(string tabl, io.odysz.semantics.IUser
			 usr)
		{
			io.odysz.transact.sql.Delete d = base.delete(tabl);
			d.doneOp(@"TODO: Lambda Expression Ignored
(sctx,sqls) -> {
  int[] r=Connects.commit(sctx.connId(),usr,sqls);
  sctx.onCommitted(sctx);
  return new SemanticObject().addInts("deleted",r).put("resulved",sctx.resulves());
}
"
				);
			// In semantic.DA 1.0, only deletingl external files here
			// FIXME if this post operation always happend, this method should been called as an interface,
			// with default implementation been alwasy called by semantic.transact, and overridden by semantic.DA.
			return d;
		}

		protected internal string basiconnId;

		public virtual string basiconnId()
		{
			return basiconnId;
		}

		/// <summary>Create a transact builder with basic DASemantext instance.</summary>
		/// <remarks>
		/// Create a transact builder with basic DASemantext instance.
		/// It's a null configuration, so semantics can not been resolved, but can be used to do basic sql operation.
		/// When creating DATranscxt, db metas can not be null.
		/// </remarks>
		/// <param name="conn">connection Id</param>
		/// <exception cref="java.sql.SQLException"></exception>
		/// <exception cref="System.IO.IOException">load semantics configuration failed</exception>
		/// <exception cref="org.xml.sax.SAXException">load semantics configuration failed</exception>
		/// <exception cref="io.odysz.semantics.x.SemanticException"></exception>
		public DATranscxt(string conn)
			: base(new io.odysz.semantic.DASemantext(conn, getSmtcs(conn), io.odysz.semantic.DA.Connects
				.getMeta(conn), null, runtimepath))
		{
			// super(new DASemantext(conn, smtConfigs == null ? null : smtConfigs.get(conn),
			this.basiconnId = conn;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		private static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
			> getSmtcs(string conn)
		{
			if (smtConfigs == null)
			{
				smtConfigs = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
					<string, io.odysz.semantic.DASemantics>>();
			}
			if (!smtConfigs.Contains(conn))
			{
				string fpath = io.odysz.semantic.DA.Connects.getSmtcs(conn);
				if (io.odysz.common.LangExt.isblank(fpath, "\\."))
				{
					throw new io.odysz.semantics.x.SemanticException("Trying to find semantics of conn %1$s, but the configuration path is empty.\n"
						 + "No 'smtcs' configured in connects.xml for connection %1$s?", conn);
				}
				fpath = org.apache.commons.io_odysz.FilenameUtils.concat(cfgroot, fpath);
				smtConfigs[conn] = loadSemantics(conn, fpath);
			}
			return smtConfigs[conn];
		}

		/// <summary>Load semantics configuration from filepath.</summary>
		/// <remarks>
		/// Load semantics configuration from filepath.
		/// This method also initialize table meta by calling
		/// <see cref="io.odysz.semantic.DA.Connects"/>
		/// .
		/// </remarks>
		/// <param name="connId"/>
		/// <param name="full">path to semantics.xml (path and name)</param>
		/// <returns>configurations</returns>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="java.sql.SQLException"></exception>
		/// <exception cref="io.odysz.semantics.x.SemanticException"></exception>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
			> loadSemantics(string connId, string cfgpath)
		{
			io.odysz.common.Utils.logi("Loading Semantics:\n\t%s", cfgpath);
			java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> xtabs = io.odysz.module.xtable.XMLDataFactoryEx
				.getXtables(new io.odysz.module.xtable.Log4jWrapper(string.Empty).setDebugMode(false
				), cfgpath, new _IXMLStruct_260());
			io.odysz.module.xtable.XMLTable conn = xtabs["semantics"];
			return initConfigs(connId, conn);
		}

		private sealed class _IXMLStruct_260 : io.odysz.module.xtable.IXMLStruct
		{
			public _IXMLStruct_260()
			{
			}

			public string rootTag()
			{
				return "semantics";
			}

			public string tableTag()
			{
				return "t";
			}

			public string recordTag()
			{
				return "s";
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		protected internal static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
			> initConfigs(string conn, io.odysz.module.xtable.XMLTable xcfg)
		{
			xcfg.beforeFirst();
			if (smtConfigs == null)
			{
				smtConfigs = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
					<string, io.odysz.semantic.DASemantics>>();
			}
			while (xcfg.next())
			{
				string tabl = xcfg.getString("tabl");
				string pk = xcfg.getString("pk");
				string smtc = xcfg.getString("smtc");
				string args = xcfg.getString("args");
				try
				{
					addSemantics(conn, tabl, pk, smtc, args);
				}
				catch (io.odysz.semantics.x.SemanticException e)
				{
					// some configuration error
					// continue
					io.odysz.common.Utils.warn(e.Message);
				}
			}
			return smtConfigs[conn];
		}

		public static bool hasSemantics(string conn, string tabl, io.odysz.semantic.DASemantics.smtype
			 sm)
		{
			if (smtConfigs == null || !smtConfigs.Contains(conn) || !smtConfigs[conn].Contains
				(tabl))
			{
				return false;
			}
			io.odysz.semantic.DASemantics s = smtConfigs[conn][tabl];
			return s != null && s.has(sm);
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static void addSemantics(string connId, string tabl, string pk, string smtcs
			, string args)
		{
			io.odysz.semantic.DASemantics.smtype sm = io.odysz.semantic.DASemantics.smtype.parse
				(smtcs);
			addSemantics(connId, tabl, pk, sm, args);
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static void addSemantics(string connId, string tabl, string pk, io.odysz.semantic.DASemantics.smtype
			 sm, string args)
		{
			addSemantics(connId, tabl, pk, sm, io.odysz.common.LangExt.split(args, ","));
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static void addSemantics(string conn, string tabl, string pk, io.odysz.semantic.DASemantics.smtype
			 sm, string[] args)
		{
			if (smtConfigs == null)
			{
				smtConfigs = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
					<string, io.odysz.semantic.DASemantics>>();
			}
			System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics> ss = 
				smtConfigs[conn];
			if (ss == null)
			{
				ss = new System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
					>();
				smtConfigs[conn] = ss;
			}
			io.odysz.semantic.DASemantics s = ss[tabl];
			if (s == null)
			{
				// s = new DASemantics(staticInstance, tabl, pk);
				s = new io.odysz.semantic.DASemantics(getBasicTrans(conn), tabl, pk);
				ss[tabl] = s;
			}
			s.addHandler(sm, tabl, pk, args);
		}

		private static System.Collections.Generic.Dictionary<string, io.odysz.transact.sql.Transcxt
			> basicTrxes;

		private static System.Collections.Generic.Dictionary<string, string> keys;

		//////////// basic transact builders for each connection ////////////
		/// <summary>Get a basic transact builder (without semantics handling)</summary>
		/// <param name="conn"/>
		/// <returns>the basice transact builder</returns>
		/// <exception cref="java.sql.SQLException"></exception>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="org.xml.sax.SAXException"></exception>
		/// <exception cref="io.odysz.semantics.x.SemanticException"></exception>
		private static io.odysz.transact.sql.Transcxt getBasicTrans(string conn)
		{
			if (basicTrxes == null)
			{
				basicTrxes = new System.Collections.Generic.Dictionary<string, io.odysz.transact.sql.Transcxt
					>();
			}
			if (!basicTrxes.Contains(conn))
			{
				io.odysz.semantic.DATranscxt tx = new io.odysz.semantic.DATranscxt(conn);
				basicTrxes[conn] = tx;
			}
			return basicTrxes[conn];
		}

		/// <summary>Set a key.</summary>
		/// <param name="name"/>
		/// <param name="key"/>
		public static void key(string name, string key)
		{
			if (keys == null)
			{
				keys = new System.Collections.Generic.Dictionary<string, string>();
			}
			keys[name] = key;
		}

		public static string key(string name)
		{
			return keys == null ? null : keys[name];
		}
	}
}
