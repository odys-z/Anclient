using Sharpen;

namespace io.odysz.semantic.DA
{
	/// <author>odys-z@github.com</author>
	public class Connects
	{
		/// <summary>nothing special for commit</summary>
		public const int flag_nothing = 0;

		public const int flag_printSql = 1;

		public const int flag_disableSql = 2;

		/// <summary>
		/// Convert names like "sqlit" to
		/// <see cref="io.odysz.common.dbtype"/>
		/// .
		/// </summary>
		/// <param name="type"/>
		/// <returns/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static io.odysz.common.dbtype parseDrvType(string type)
		{
			if (type == null || type.Trim().Length == 0)
			{
				throw new io.odysz.semantics.x.SemanticException("Drived type not suppored: %s", 
					type);
			}
			type = type.Trim().ToLower();
			if (type.Equals("mysql"))
			{
				return io.odysz.common.dbtype.mysql;
			}
			else
			{
				if (type.Equals("mssql2k") || type.Equals("ms2k"))
				{
					return io.odysz.common.dbtype.ms2k;
				}
				else
				{
					if (type.Equals("oracle") || type.Equals("orcl"))
					{
						return io.odysz.common.dbtype.oracle;
					}
					else
					{
						if (type.StartsWith("sqlit"))
						{
							return io.odysz.common.dbtype.sqlite;
						}
						else
						{
							throw new io.odysz.semantics.x.SemanticException("Driver type not suppored yet: %s"
								, type);
						}
					}
				}
			}
		}

		private static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.AbsConnect
			<io.odysz.semantic.DA.AbsConnect<object>>> srcs;

		private static string defltConn;

		public static string defltConn()
		{
			return defltConn;
		}

		private const int DmConn = 1;

		private const int CpConn = 2;

		/// <summary>
		/// parse connects.xml, setup connections configured in table "drvmnger", for JDBC DriverManger,
		/// and "dbcp", for JDBC connection-pooled connection managed by container.
		/// </summary>
		/// <param name="xmlDir"/>
		public static void init(string xmlDir)
		{
			if (srcs != null)
			{
				return;
			}
			srcs = new System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.AbsConnect
				<io.odysz.semantic.DA.AbsConnect<object>>>();
			try
			{
				io.odysz.module.xtable.ILogger logger = new io.odysz.module.xtable.Log4jWrapper("xtabl"
					);
				srcs = loadConnects(srcs, "drvmnger", DmConn, logger, xmlDir);
				srcs = loadConnects(srcs, "dbcp", CpConn, logger, xmlDir);
				if (srcs != null && srcs.Count > 0 && !srcs.Contains(defltConn))
				{
					throw new java.sql.SQLException("Found connection configruations, bud initialization failed. DB source must configured with a default source."
						);
				}
				io.odysz.common.Utils.logi("INFO - JDBC initialized using %s (%s) as default connection."
					, defltConn, srcs != null && srcs.Count > 0 ? srcs[defltConn].driverType() : "empty"
					);
			}
			catch (System.Exception ex)
			{
				System.Console.Error.WriteLine("\nFATAL - Connection initializing failed! !!\n");
				Sharpen.Runtime.printStackTrace(ex);
				return;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		private static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.AbsConnect
			<io.odysz.semantic.DA.AbsConnect<object>>> loadConnects(System.Collections.Generic.Dictionary
			<string, io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.AbsConnect<object>
			>> srcs, string tablId, int dmCp, io.odysz.module.xtable.ILogger logger, string 
			xmlDir)
		{
			if (srcs == null)
			{
				srcs = new System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.AbsConnect
					<io.odysz.semantic.DA.AbsConnect<object>>>();
			}
			io.odysz.module.xtable.XMLTable conn = io.odysz.module.xtable.XMLDataFactory.getTable
				(logger, tablId, xmlDir + "/connects.xml", new _IXMLStruct_97());
			conn.beforeFirst();
			while (conn.next())
			{
				try
				{
					// columns="type,id,isdef,conn,usr,pswd,dbg"
					io.odysz.common.dbtype type = parseDrvType(conn.getString("type"));
					string id = conn.getString("id");
					if (dmCp == DmConn)
					{
						srcs[id] = io.odysz.semantic.DA.AbsConnect.initDmConnect(xmlDir, type, conn.getString
							("src"), conn.getString("usr"), conn.getString("pswd"), conn.getBool("dbg", false
							)).prop("smtcs", conn.getString("smtcs"));
					}
					else
					{
						srcs[id] = io.odysz.semantic.DA.AbsConnect.initPooledConnect(xmlDir, type, conn.getString
							("src"), conn.getString("usr"), conn.getString("pswd"), conn.getBool("dbg", false
							)).prop("smtcs", conn.getString("smtcs"));
					}
					if (conn.getBool("isdef", false))
					{
						if (defltConn != null)
						{
							io.odysz.common.Utils.warn("WARN - duplicate default ids found, the previous defined source been ignored: "
								 + defltConn);
						}
						defltConn = id;
					}
				}
				catch (System.Exception e)
				{
					Sharpen.Runtime.printStackTrace(e);
					continue;
				}
			}
			return srcs;
		}

		private sealed class _IXMLStruct_97 : io.odysz.module.xtable.IXMLStruct
		{
			public _IXMLStruct_97()
			{
			}

			public string rootTag()
			{
				return "conns";
			}

			public string tableTag()
			{
				return "t";
			}

			public string recordTag()
			{
				return "c";
			}
		}

		public static void close()
		{
			if (srcs != null)
			{
				foreach (io.odysz.semantic.DA.AbsConnect<object> c in srcs.Values)
				{
					try
					{
						c.close();
					}
					catch (java.sql.SQLException e)
					{
						Sharpen.Runtime.printStackTrace(e);
					}
				}
			}
		}

		/////////////////////////////// common helper /////////////////////////////
		/// <summary>
		/// If printSql is true or if asking enable,
		/// then print sqls.
		/// </summary>
		/// <param name="asking"/>
		/// <param name="flag"/>
		/// <param name="sqls"/>
		public static void printSql(bool asking, int flag, System.Collections.Generic.List
			<string> sqls)
		{
			if ((flag & flag_printSql) == flag_printSql || asking && (flag & flag_disableSql)
				 != flag_disableSql)
			{
				io.odysz.common.Utils.logi(sqls);
			}
		}

		public static void printSql(bool asking, int flag, string sql)
		{
			if ((flag & flag_printSql) == flag_printSql || asking && (flag & flag_disableSql)
				 != flag_disableSql)
			{
				io.odysz.common.Utils.logi(sql);
			}
		}

		///////////////////////////////////// select ///////////////////////////////
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset select(string conn, string sql, params 
			int[] flags)
		{
			// Print WARN? if conn is not null and srcs doesn't contains, it's probably because of wrong configuration in connects.xml. 
			if (flags != null && flags.Length > 0 && flags[0] == flag_printSql)
			{
				if (conn != null && !srcs.Contains(conn))
				{
					throw new java.sql.SQLException("Can't find connection: " + conn);
				}
			}
			string connId = conn == null ? defltConn : conn;
			try
			{
				return srcs[connId].select(sql, flags == null || flags.Length <= 0 ? flag_nothing
					 : flags[0]);
			}
			catch (javax.naming.NamingException)
			{
				throw new java.sql.SQLException("Can't find connection, id=" + connId);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset select(string sql, params int[] flags
			)
		{
			return select(null, sql, flags);
		}

		/// <summary>compose paged sql, e.g.</summary>
		/// <remarks>
		/// compose paged sql, e.g. for Oracle: select * from (sql) t where rownum &gt; 0 and row num &lt; 14<br />
		/// <b>Note:</b> this is not efficiency. You should do in appendable or stream style if an AST is available,
		/// like that one in DASemantext#pagingStream().
		/// </remarks>
		/// <param name="sql"/>
		/// <param name="page"/>
		/// <param name="size"/>
		/// <returns/>
		/// <exception cref="java.sql.SQLException"></exception>
		public static string pagingSql(string conn, string sql, int page, int size)
		{
			conn = conn == null ? defltConn : conn;
			io.odysz.common.dbtype driverType = srcs[conn].driverType();
			int r1 = page * size;
			int r2 = r1 + size;
			if (driverType == io.odysz.common.dbtype.mysql)
			{
				string s2 = string.format("select * from (select t.*, @ic_num := @ic_num + 1 as rnum from (%s) t, (select @ic_num := 0) ic_t) t1 where rnum > %s and rnum <= %s"
					, sql, r1, r2);
				return s2;
			}
			else
			{
				if (driverType == io.odysz.common.dbtype.oracle)
				{
					return string.format("select * from (select t.*, rownum r_n_ from (%s) t WHERE rownum <= %s  order by rownum) t where r_n_ > %s"
						, sql, r2, r1);
				}
				else
				{
					if (driverType == io.odysz.common.dbtype.ms2k)
					{
						return string.format("select * from (SELECT ROW_NUMBER() OVER(ORDER BY (select NULL as noorder)) AS RowNum, * from (%s) t) t where rownum >= 1 and rownum <= 2;"
							 + sql, r1, r2);
					}
					else
					{
						if (driverType == io.odysz.common.dbtype.sqlite)
						{
							// DON'T COMMENT THIS OUT
							// Reaching here means your code has bugs
							// To stop paging from html, don't enable a html pager for a sqlite data source.
							throw new java.sql.SQLException("How to page in sqlite?");
						}
						else
						{
							return sql;
						}
					}
				}
			}
		}

		/////////////////////////////////// update /////////////////////////////
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public static int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, params int[] flags)
		{
			try
			{
				return srcs[defltConn].commit(usr, sqls, flags.Length > 0 ? flags[0] : flag_nothing
					);
			}
			catch (javax.naming.NamingException)
			{
				throw new io.odysz.transact.x.TransException("Can't find connection, id=" + defltConn
					);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public static int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, params int[]
			 flags)
		{
			return srcs[defltConn].commit(usr, sqls, lobs, flags.Length > 0 ? flags[0] : flag_nothing
				);
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public static int[] commit(string conn, io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, params int[] flags)
		{
			if (srcs == null || !srcs.Contains(conn))
			{
				throw new java.sql.SQLException("Can't find connection %s.", conn);
			}
			try
			{
				return srcs[conn].commit(usr, sqls, flags.Length > 0 ? flags[0] : flag_nothing);
			}
			catch (javax.naming.NamingException)
			{
				throw new io.odysz.transact.x.TransException("Can't find connection, id=" + defltConn
					);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public static int[] commit(io.odysz.semantics.IUser usr, string sql)
		{
			return commit(usr, new _List_239(sql));
		}

		private sealed class _List_239 : System.Collections.Generic.List<string>
		{
			public _List_239(string sql)
			{
				this.sql = sql;
				{
					this.add(sql);
				}
			}

			private readonly string sql;
		}

		public static io.odysz.common.dbtype driverType(string conn)
		{
			conn = conn == null ? defltConn : conn;
			return srcs[conn].driverType();
		}

		public static System.Collections.Generic.ICollection<string> connIds()
		{
			return srcs == null ? null : srcs.Keys;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		private static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> loadMeta(string conn)
		{
			io.odysz.common.dbtype dt = driverType(conn);
			System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
				metas = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
				>();
			if (dt == null)
			{
				throw new io.odysz.semantics.x.SemanticException("Drived type not suppored: ", conn
					);
			}
			if (dt == io.odysz.common.dbtype.mysql)
			{
				metas = io.odysz.semantic.DA.MetaBuilder.buildMysql(conn);
			}
			else
			{
				if (dt == io.odysz.common.dbtype.ms2k)
				{
					metas = io.odysz.semantic.DA.MetaBuilder.buildMs2k(conn);
				}
				else
				{
					if (dt == io.odysz.common.dbtype.oracle)
					{
						metas = io.odysz.semantic.DA.MetaBuilder.buildOrcl(conn);
					}
					else
					{
						if (dt == io.odysz.common.dbtype.sqlite)
						{
							metas = io.odysz.semantic.DA.MetaBuilder.buildSqlite(conn);
						}
						else
						{
							throw new io.odysz.semantics.x.SemanticException("Drived type not suppored: %s", 
								dt.ToString());
						}
					}
				}
			}
			return metas;
		}

		protected internal static System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
			<string, io.odysz.semantics.meta.TableMeta>> metas;

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> getMeta(string connId)
		{
			if (metas == null)
			{
				metas = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
					<string, io.odysz.semantics.meta.TableMeta>>(srcs.Count);
			}
			if (!metas.Contains(connId))
			{
				metas[connId] = loadMeta(connId);
			}
			if (!metas.Contains(connId))
			{
				metas[connId] = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
					>(0);
			}
			return metas[connId];
		}

		/// <summary>Get the smtcs file path configured in connects.xml.</summary>
		/// <param name="conn"/>
		/// <returns>smtcs (e.g. semantics.xml)</returns>
		public static string getSmtcs(string conn)
		{
			return srcs == null || !srcs.Contains(conn) ? null : srcs[conn].prop("smtcs");
		}
	}
}
