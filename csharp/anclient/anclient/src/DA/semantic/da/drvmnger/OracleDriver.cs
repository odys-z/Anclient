using Sharpen;

namespace io.odysz.semantic.DA.drvmnger
{
	/// <author>odys-z@github.com</author>
	public class OracleDriver : io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.drvmnger.OracleDriver
		>
	{
		internal static javax.sql.DataSource ds;

		internal static bool enableSystemout = false;

		internal static bool inited = false;

		internal static string userName;

		internal static string pswd;

		internal static string connect;

		/// <summary>MUST CLOSE CONNECTION!</summary>
		/// <returns/>
		/// <exception cref="java.sql.SQLException"/>
		internal static java.sql.Connection getConnection()
		{
		}
	}
}
