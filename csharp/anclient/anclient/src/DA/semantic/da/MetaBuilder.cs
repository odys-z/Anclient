using Sharpen;

namespace io.odysz.semantic.DA
{
	public class MetaBuilder
	{
		private static java.util.HashSet<string> ignorTabls;

		/// <summary>Build mysql table metas</summary>
		/// <param name="conn"/>
		/// <returns>table metas for the conn.</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="SAXException"/>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> buildMysql(string conn)
		{
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, "show tables"
				);
			System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
				tablMeta = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
				>(rs.getRowCount());
			rs.beforeFirst();
			while (rs.next())
			{
				try
				{
					string tn = rs.getString(1);
					if (ignorTabls == null || !ignorTabls.contains(tn))
					{
						io.odysz.semantics.meta.TableMeta table = metaMysql(conn, tn);
						tablMeta[tn] = table;
					}
				}
				catch (java.sql.SQLException e)
				{
					System.Console.Error.WriteLine(e.Message);
					Sharpen.Runtime.printStackTrace(e);
					continue;
				}
			}
			return tablMeta;
		}

		internal static io.odysz.common.Regex regexMysqlCol = new io.odysz.common.Regex("(\\w+)"
			);

		/// <exception cref="java.sql.SQLException"/>
		private static io.odysz.semantics.meta.TableMeta metaMysql(string conn, string tabl
			)
		{
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, "show columns from "
				 + tabl);
			rs.beforeFirst();
			io.odysz.semantics.meta.TableMeta tab = new io.odysz.semantics.meta.TableMeta(tabl
				);
			while (rs.next())
			{
				string tlen = rs.getString(2);
				System.Collections.Generic.List<string> typeLen = regexMysqlCol.findGroups(tlen);
				int len = 0;
				try
				{
					len = int.Parse(typeLen[1]);
				}
				catch (System.Exception)
				{
				}
				tab.col(rs.getString(1), typeLen[0], len);
			}
			return tab;
		}

		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> buildMs2k(string conn)
		{
			// https://stackoverflow.com/questions/175415/how-do-i-get-list-of-all-tables-in-a-database-using-tsql
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, "SELECT s.name FROM sysobjects s WHERE s.xtype = 'U' or s.xtype = 'V'"
				);
			System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
				tablMeta = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
				>(rs.getRowCount());
			rs.beforeFirst();
			while (rs.next())
			{
				string tn = rs.getString(1);
				if (ignorTabls == null || !ignorTabls.contains(tn))
				{
					io.odysz.semantics.meta.TableMeta table = metaMs2k(conn, tn);
					tablMeta[tn] = table;
				}
			}
			return tablMeta;
		}

		/// <exception cref="java.sql.SQLException"/>
		private static io.odysz.semantics.meta.TableMeta metaMs2k(string srcName, string 
			tabl)
		{
			// https://stackoverflow.com/questions/2418527/sql-server-query-to-get-the-list-of-columns-in-a-table-along-with-data-types-no
			string sql = string.format("SELECT c.name, t.Name, c.max_length FROM sys.columns c "
				 + "INNER JOIN sys.types t ON c.user_type_id = t.user_type_id " + "LEFT OUTER JOIN sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id "
				 + "LEFT OUTER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id "
				 + "WHERE c.object_id = OBJECT_ID('%s')", tabl);
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(srcName, 
				sql);
			io.odysz.semantics.meta.TableMeta tab = new io.odysz.semantics.meta.TableMeta(tabl
				);
			rs.beforeFirst();
			while (rs.next())
			{
				int len = 0;
				try
				{
					len = rs.getInt(3);
				}
				catch (System.Exception)
				{
				}
				tab.col(rs.getString(1), rs.getString(2), len);
			}
			return tab;
		}

		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> buildOrcl(string conn)
		{
			// https://stackoverflow.com/questions/205736/get-list-of-all-tables-in-oracle
			// https://stackoverflow.com/questions/1953239/search-an-oracle-database-for-tables-with-specific-column-names
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, "SELECT table_name, column_name, data_type, data_length \"len\" FROM cols"
				);
			System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
				tablMeta = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
				>(rs.getRowCount());
			rs.beforeFirst();
			while (rs.next())
			{
				string tn = rs.getString(1);
				if (ignorTabls == null || !ignorTabls.contains(tn))
				{
					io.odysz.semantics.meta.TableMeta table = tablMeta[tn];
					if (table == null)
					{
						table = new io.odysz.semantics.meta.TableMeta(rs.getString("table_name"));
						tablMeta[tn] = table;
					}
					table.col(rs.getString(2), rs.getString(3), rs.getInt("len", 0));
				}
			}
			return tablMeta;
		}

		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> buildSqlite(string conn)
		{
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, "select distinct tbl_name from sqlite_master  where type = 'table'"
				);
			System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta> 
				tablMeta = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
				>(rs.getRowCount());
			rs.beforeFirst();
			while (rs.next())
			{
				string tn = rs.getString(1);
				if (ignorTabls == null || !ignorTabls.contains(tn))
				{
					io.odysz.semantics.meta.TableMeta table = metaSqlite(conn, tn);
					tablMeta[tn] = table;
				}
			}
			return tablMeta;
		}

		/// <exception cref="java.sql.SQLException"/>
		private static io.odysz.semantics.meta.TableMeta metaSqlite(string conn, string tabl
			)
		{
			// cid |name    |type |notnull |dflt_value |pk |
			// ----|--------|-----|--------|-----------|---|
			// 0   |aid     |TEXT |1       |           |1  |
			// 1   |remarka |TEXT |0       |           |0  |
			// 2   |afk     |TEXT |0       |           |0  |
			// 3   |testInt |INTEGER |0    |           |0  |
			string sql = string.format("pragma table_info(%s)", tabl);
			io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(conn, sql
				);
			io.odysz.semantics.meta.TableMeta tab = new io.odysz.semantics.meta.TableMeta(tabl
				);
			rs.beforeFirst();
			while (rs.next())
			{
				tab.col(rs.getString("name"), rs.getString("type"), 0);
			}
			return tab;
		}
	}
}
