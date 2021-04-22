using Sharpen;

namespace io.odysz.semantic.DA.drvmnger
{
	public class Msql2kDriver : io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.drvmnger.Msql2kDriver
		>
	{
		public Msql2kDriver(io.odysz.common.dbtype drvName)
			: base(drvName)
		{
		}

		public static io.odysz.semantic.DA.drvmnger.Msql2kDriver initConnection(string @string
			, string string2, string string3, int i)
		{
			return null;
		}

		/// <exception cref="java.sql.SQLException"/>
		public override io.odysz.module.rs.AnResultset select(string sql, int flags)
		{
			// TODO Auto-generated method stub
			return null;
		}

		/// <exception cref="java.sql.SQLException"/>
		protected internal override int[] commit(System.Collections.Generic.List<string> 
			sqls, int flags)
		{
			// TODO Auto-generated method stub
			return null;
		}

		//	@Override
		//	public int[] commit(DbLog log, ArrayList<String> sqls, int flags) throws SQLException {
		//		// TODO Auto-generated method stub
		//		return null;
		//	}
		/// <exception cref="java.sql.SQLException"/>
		public override int[] commit(io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, int i)
		{
			throw new java.sql.SQLException("For the author's knowledge, MS 2000 seams do not supporting LOB - TEXT is enough. You can contact the author."
				);
		}
	}
}
