using Sharpen;

namespace io.odysz.semantic.DA.drvmnger
{
	public class MysqlDriver : io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.drvmnger.MysqlDriver
		>
	{
		public static bool printSql = true;

		internal static bool inited = false;

		internal static string userName;

		internal static string pswd;

		internal static string connect;

		private static java.sql.Connection conn;

		/// <summary>IMPORTANT: Caller must close connection!</summary>
		/// <returns/>
		/// <exception cref="java.sql.SQLException"/>
		protected internal static java.sql.Connection getConnection()
		{
			if (!inited)
			{
				throw new java.sql.SQLException("connection must explicitly initialized first - call initConnection()"
					);
			}
			if (conn == null)
			{
				conn = java.sql.DriverManager.getConnection(connect, userName, pswd);
			}
			return conn;
		}

		/// <summary>
		/// Use this to init connection without using servlet context for retrieving configured strings.<br />
		/// This is the typical scenario when running test from "main" thread.
		/// </summary>
		/// <param name="conn"/>
		/// <param name="user"/>
		/// <param name="psword"/>
		/// <param name="dbg"></param>
		/// <returns></returns>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.semantic.DA.drvmnger.MysqlDriver initConnection(string conn
			, string user, string psword, int flags)
		{
			if (!inited)
			{
				printSql = (flags & io.odysz.semantic.DA.Connects.flag_printSql) > 0;
				connect = conn;
				userName = user;
				pswd = psword;
				// FIXME decipher pswd
				// pswd = Encrypt.DecryptPswdImpl(pswd);
				try
				{
					java.lang.Class.forName("com.mysql.jdbc.Driver").newInstance();
				}
				catch (java.lang.ReflectiveOperationException e)
				{
					Sharpen.Runtime.printStackTrace(e);
					throw new java.sql.SQLException(e.Message);
				}
				inited = true;
			}
			return new io.odysz.semantic.DA.drvmnger.MysqlDriver();
		}

		/// <summary>Not used.</summary>
		/// <remarks>Not used. Reserved for encrypting db password?</remarks>
		/// <param name="pswd"/>
		/// <param name="userName"/>
		/// <returns>
		/// "unused")
		/// private static String DecryptPswd(String pswd, String userName) {
		/// if (pswd == null) return "";
		/// BASE64Decoder decoder = new BASE64Decoder();
		/// try {
		/// byte[] b = decoder.decodeBuffer(pswd);
		/// return new String(b);
		/// } catch (Exception e) {
		/// return "";
		/// }
		/// }
		/// </returns>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset selectStatic(string sql, int flags)
		{
			java.sql.Connection conn = getConnection();
			io.odysz.semantic.DA.Connects.printSql(printSql, flags, sql);
			java.sql.Statement stmt = conn.createStatement();
			java.sql.ResultSet rs = stmt.executeQuery(sql);
			io.odysz.module.rs.AnResultset icrs = new io.odysz.module.rs.AnResultset(rs);
			rs.close();
			stmt.close();
			conn.close();
			return icrs;
		}

		public MysqlDriver()
			: base(io.odysz.common.dbtype.mysql)
		{
		}

		/// <exception cref="java.sql.SQLException"/>
		public override io.odysz.module.rs.AnResultset select(string sql, int flags)
		{
			return selectStatic(sql, flags);
		}

		/// <exception cref="java.sql.SQLException"/>
		protected internal override int[] commit(System.Collections.Generic.List<string> 
			sqls, int flags)
		{
			io.odysz.semantic.DA.Connects.printSql(printSql, flags, sqls);
			int[] ret;
			java.sql.Connection conn = getConnection();
			java.sql.Statement stmt = null;
			try
			{
				if (conn != null)
				{
					stmt = conn.createStatement();
					try
					{
						// String logs = "";
						// boolean noMoreLogs = false;
						stmt = conn.createStatement(java.sql.ResultSet.TYPE_SCROLL_SENSITIVE, java.sql.ResultSet
							.CONCUR_UPDATABLE);
						conn.setAutoCommit(false);
						foreach (string sql in sqls)
						{
							stmt.addBatch(sql);
						}
						ret = stmt.executeBatch();
						conn.commit();
						if (printSql)
						{
							System.Console.Out.WriteLine("mysql batch execute successfully.");
						}
					}
					catch (System.Exception exx)
					{
						conn.rollback();
						Sharpen.Runtime.printStackTrace(exx);
						throw new java.sql.SQLException(exx);
					}
					finally
					{
					}
				}
				else
				{
					throw new java.sql.SQLException("mysql batch execution failed");
				}
			}
			catch (java.sql.SQLException ex)
			{
				throw;
			}
			finally
			{
				try
				{
					conn.close();
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
		public override int[] commit(io.odysz.semantics.IUser log, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, int i)
		{
			throw new java.sql.SQLException("For the author's knowledge, Mysql TEXT is enough for CLOB"
				 + " - and not planning supporting BLOB as this project is currently designed for supporting mainly JSON module over HTTP. "
				 + "You can contact the author for any suggestion.");
		}
	}
}
