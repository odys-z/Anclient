using Sharpen;

namespace io.odysz.semantic.DA
{
	public abstract class AbsConnect<T>
		where T : io.odysz.semantic.DA.AbsConnect<T>
	{
		protected internal io.odysz.common.dbtype drvName;

		public virtual io.odysz.common.dbtype driverType()
		{
			return drvName;
		}

		public AbsConnect(io.odysz.common.dbtype drvName)
		{
			this.drvName = drvName;
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static io.odysz.semantic.DA.AbsConnect<object> initDmConnect(string xmlDir
			, io.odysz.common.dbtype type, string jdbcUrl, string usr, string pswd, bool printSql
			)
		{
			if (type == io.odysz.common.dbtype.mysql)
			{
				return io.odysz.semantic.DA.drvmnger.MysqlDriver.initConnection(jdbcUrl, usr, pswd
					, printSql ? io.odysz.semantic.DA.Connects.flag_printSql : io.odysz.semantic.DA.Connects
					.flag_nothing);
			}
			else
			{
				if (type == io.odysz.common.dbtype.sqlite)
				{
					return io.odysz.semantic.DA.drvmnger.SqliteDriver2.initConnection(string.format("jdbc:sqlite:%s"
						, org.apache.commons.io_odysz.FilenameUtils.concat(xmlDir, jdbcUrl)), usr, pswd, 
						printSql ? io.odysz.semantic.DA.Connects.flag_printSql : io.odysz.semantic.DA.Connects
						.flag_nothing);
				}
				else
				{
					if (type == io.odysz.common.dbtype.ms2k)
					{
						return io.odysz.semantic.DA.drvmnger.Msql2kDriver.initConnection(jdbcUrl, usr, pswd
							, printSql ? io.odysz.semantic.DA.Connects.flag_printSql : io.odysz.semantic.DA.Connects
							.flag_nothing);
					}
					else
					{
						if (type == io.odysz.common.dbtype.oracle)
						{
							return io.odysz.semantic.DA.drvmnger.OracleDriver.initConnection(jdbcUrl, usr, pswd
								, printSql ? io.odysz.semantic.DA.Connects.flag_printSql : io.odysz.semantic.DA.Connects
								.flag_nothing);
						}
						else
						{
							throw new io.odysz.semantics.x.SemanticException("The configured DB type %s is not supported yet."
								, type);
						}
					}
				}
			}
		}

		public static io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.AbsConnect<object
			>> initPooledConnect(string xmlDir, io.odysz.common.dbtype type, string jdbcUrl, 
			string usr, string pswd, bool printSql)
		{
			return new io.odysz.semantic.DA.cp.CpConnect(jdbcUrl, type, printSql);
		}

		/// <exception cref="java.sql.SQLException"/>
		protected internal virtual void close()
		{
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="javax.naming.NamingException"/>
		public abstract io.odysz.module.rs.AnResultset select(string sql, int flags);

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="javax.naming.NamingException"/>
		protected internal abstract int[] commit(System.Collections.Generic.List<string> 
			sqls, int flags);

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="javax.naming.NamingException"/>
		public int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, int flags)
		{
			int[] c = commit(sqls, flags);
			if (usr != null)
			{
				try
				{
					sqls = usr.dbLog(sqls);
					if (sqls != null)
					{
						commit(null, sqls, io.odysz.semantic.DA.Connects.flag_nothing);
					}
				}
				catch (System.Exception ex)
				{
					Sharpen.Runtime.printStackTrace(ex);
				}
			}
			else
			{
				io.odysz.common.Utils.warn("Some db commitment not logged:", sqls);
			}
			return c;
		}

		/// <exception cref="java.sql.SQLException"/>
		public abstract int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, int i);

		/// <summary>
		/// Lock table when generating auto Id.<br />
		/// [table, lock]
		/// </summary>
		protected internal System.Collections.Generic.Dictionary<string, java.util.concurrent.locks.ReentrantLock
			> locks;

		private System.Collections.Generic.Dictionary<string, string> props;

		/// <exception cref="java.sql.SQLException"/>
		public virtual java.util.concurrent.locks.Lock getAutoseqLock(string target)
		{
			return locks[target];
		}

		public virtual io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.AbsConnect<object
			>> prop(string k, string v)
		{
			if (props == null)
			{
				props = new System.Collections.Generic.Dictionary<string, string>();
			}
			props[k] = v;
			return this;
		}

		public virtual string prop(string k)
		{
			return props == null ? null : props[k];
		}
	}
}
