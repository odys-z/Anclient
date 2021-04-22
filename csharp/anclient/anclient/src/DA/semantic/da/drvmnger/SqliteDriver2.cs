using Sharpen;

namespace io.odysz.semantic.DA.drvmnger
{
	/// <summary>
	/// All instance using the same connection.<br />
	/// Sqlite connection.<br />
	/// SqliteDriver using sigle connection to avoid error:<br />
	/// see <a href='https://stackoverflow.com/questions/13891006/getting-sqlite-busy-database-file-is-locked-with-select-statements'>
	/// StackOverflow: Getting [SQLITE_BUSY] database file is locked with select statements</a>
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class SqliteDriver2 : io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.drvmnger.SqliteDriver2
		>
	{
		private static org.sqlite.JDBC drv;

		public static bool enableSystemout = true;

		internal string userName;

		internal string pswd;

		internal string jdbcUrl;

		/// <summary>
		/// Sqlite connection.<br />
		/// SqliteDriver using sigle connection to avoid error:<br />
		/// org.sqlite.SQLiteException: [SQLITE_BUSY]  The database file is locked (database is locked)<br />
		/// see <a href='https://stackoverflow.com/questions/13891006/getting-sqlite-busy-database-file-is-locked-with-select-statements'>
		/// StackOverflow: Getting [SQLITE_BUSY] database file is locked with select statements</a>
		/// </summary>
		private java.sql.Connection conn;

		static SqliteDriver2()
		{
			//	boolean inited = false;
			try
			{
				// see answer of Eehol:
				// https://stackoverflow.com/questions/16725377/no-suitable-driver-found-sqlite
				drv = new org.sqlite.JDBC();
				java.sql.DriverManager.registerDriver(new org.sqlite.JDBC());
			}
			catch (java.sql.SQLException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
		}

		internal SqliteDriver2()
			: base(io.odysz.common.dbtype.sqlite)
		{
			drvName = io.odysz.common.dbtype.sqlite;
			locks = new System.Collections.Generic.Dictionary<string, java.util.concurrent.locks.ReentrantLock
				>();
		}

		/// <exception cref="java.sql.SQLException"/>
		protected internal override void close()
		{
			// This is not correct
			// https://stackoverflow.com/questions/31530700/static-finally-block-in-java
			if (conn != null)
			{
				conn.close();
			}
			java.sql.DriverManager.deregisterDriver(drv);
		}

		/// <summary>
		/// This method is only for debug and test, use #
		/// <see cref="initConnection(string, string, string, int)"/>
		/// before any function call.
		/// MUST CLOSE CONNECTION!
		/// </summary>
		/// <returns/>
		/// <exception cref="java.sql.SQLException"/>
		protected internal virtual java.sql.Connection getConnection()
		{
			//		if (!inited) {
			////			String isTrue = Configs.getCfg("sqlite.printSQL.enable");
			////			enableSystemout = isTrue != null && "true".equals(isTrue.toLowerCase());
			////			
			////			jdbcUrl = "jdbc:sqlite:/media/sdb/docs/prjs/works/RemoteServ/WebContent/WEB-INF/remote.db";
			////			userName = "remote";
			////			pswd = "remote";
			////			
			////			if (conn == null)
			////				conn = DriverManager.getConnection(jdbcUrl, userName, pswd);
			////			inited = true;
			//			throw new SQLException("Sqlite connection not initialized.");
			//		}
			return conn;
		}

		/// <summary>
		/// Use this to init connection without using servlet context for retrieving configured strings.<br />
		/// This is the typical scenario when running test from "main" thread.
		/// </summary>
		/// <param name="jdbc"/>
		/// <param name="user"/>
		/// <param name="psword"/>
		/// <param name="flags"></param>
		/// <returns></returns>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.semantic.DA.drvmnger.SqliteDriver2 initConnection(string jdbc
			, string user, string psword, int flags)
		{
			io.odysz.semantic.DA.drvmnger.SqliteDriver2 inst = new io.odysz.semantic.DA.drvmnger.SqliteDriver2
				();
			//		if (!inited) {
			//			enableSystemout = (flags & Connects.flag_printSql) > 0;
			//			
			//			jdbcUrl = jdbc;
			//			userName = user;
			//			pswd = psword;
			//
			//			if (conn == null)
			//				conn = DriverManager.getConnection(jdbcUrl, userName, pswd);
			//
			//			inited = true;
			//		}
			enableSystemout = (flags & io.odysz.semantic.DA.Connects.flag_printSql) > 0;
			inst.jdbcUrl = jdbc;
			inst.userName = user;
			inst.pswd = psword;
			inst.conn = java.sql.DriverManager.getConnection(jdbc, user, psword);
			return inst;
		}

		/// <exception cref="java.sql.SQLException"/>
		internal virtual io.odysz.module.rs.AnResultset selectStatic(string sql, int flag
			)
		{
			java.sql.Connection conn = getConnection();
			io.odysz.semantic.DA.Connects.printSql(enableSystemout, flag, sql);
			java.sql.Statement stmt = conn.createStatement();
			java.sql.ResultSet rs = stmt.executeQuery(sql);
			io.odysz.module.rs.AnResultset icrs = new io.odysz.module.rs.AnResultset(rs);
			rs.close();
			stmt.close();
			// What about performance?
			// https://stackoverflow.com/questions/31530700/static-finally-block-in-java
			// conn.close();
			return icrs;
		}

		/// <exception cref="java.sql.SQLException"/>
		public override io.odysz.module.rs.AnResultset select(string sql, int flag)
		{
			return selectStatic(sql, flag);
		}

		/// <exception cref="java.sql.SQLException"/>
		protected internal override int[] commit(System.Collections.Generic.List<string> 
			sqls, int flags)
		{
			return commitst(sqls, flags);
		}

		/// <exception cref="java.sql.SQLException"/>
		internal virtual int[] commitst(System.Collections.Generic.List<string> sqls, int
			 flags)
		{
			io.odysz.semantic.DA.Connects.printSql(enableSystemout, flags, sqls);
			int[] ret;
			java.sql.Statement stmt = null;
			try
			{
				java.sql.Connection conn = getConnection();
				stmt = conn.createStatement();
				try
				{
					conn.setAutoCommit(false);
					stmt = conn.createStatement(java.sql.ResultSet.TYPE_FORWARD_ONLY, java.sql.ResultSet
						.CONCUR_READ_ONLY);
					foreach (string sql in sqls)
					{
						stmt.addBatch(sql);
					}
					ret = stmt.executeBatch();
					conn.commit();
				}
				catch (System.Exception exx)
				{
					conn.rollback();
					Sharpen.Runtime.printStackTrace(exx);
					throw new java.sql.SQLException(exx);
				}
			}
			finally
			{
				try
				{
					if (stmt != null)
					{
						stmt.close();
					}
				}
				catch (System.Exception ex)
				{
					Sharpen.Runtime.printStackTrace(ex);
				}
				finally
				{
					stmt = null;
				}
			}
			return ret;
		}

		/// <exception cref="java.sql.SQLException"/>
		public override int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, int i)
		{
			throw new java.sql.SQLException("To the author's knowledge, Sqlite do not supporting CLOB - TEXT is enough. You can contact the author."
				);
		}
	}
}
