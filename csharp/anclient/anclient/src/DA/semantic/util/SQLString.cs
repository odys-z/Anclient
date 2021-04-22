using Sharpen;

namespace io.odysz.semantic.util
{
	public class SQLString
	{
		/// <summary>
		/// Get sql string "insert into [table]([f1], f[2], f[3], ...) values ([v1], [v2], fd_v[3], ...)"<br />
		/// Only varchar2 and date are parsable, tested on mysql.
		/// </summary>
		/// <param name="rs"/>
		/// <param name="table"/>
		/// <returns>sqls</returns>
		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.List<string> composeInserts(io.odysz.module.rs.AnResultset
			 rs, string table)
		{
			if (rs == null)
			{
				return null;
			}
			string fields = null;
			for (int c = 1; c <= rs.getColCount(); c++)
			{
				// col-index start at 1
				if (fields == null)
				{
					fields = rs.getColumnName(c);
				}
				else
				{
					fields += ", " + rs.getColumnName(c);
				}
			}
			System.Collections.Generic.List<string> sqls = new System.Collections.Generic.List
				<string>(rs.getRowCount());
			rs.beforeFirst();
			while (rs.next())
			{
				string values = null;
				for (int c_1 = 1; c_1 <= rs.getColCount(); c_1++)
				{
					string v = rs.getString(c_1);
					if (values == null)
					{
						values = string.format("'%s'", v == null ? string.Empty : v);
					}
					else
					{
						values += string.format(", '%s'", v == null ? string.Empty : v);
					}
				}
				string sql = string.format("insert into %s(%s) values(%s)", table, fields, values
					);
				sqls.add(sql);
			}
			return sqls;
		}

		public static string formatSql(string s)
		{
			if (s != null)
			{
				string s1 = s.Replace("\n", "\\n");
				string s2 = s1.Replace("\t", "\\t");
				string s3 = s2.Replace("'", "''");
				return s3;
			}
			return string.Empty;
		}
	}
}
