using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	public abstract class AnsonBody : io.odysz.anson.Anson
	{
		protected internal io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent;

		protected internal string conn;

		//	public static String[] jcondt(String logic, String field, String v, String tabl) {
		//		return new String[] {logic, field, v, tabl};
		//	}
		public virtual string conn()
		{
			return conn;
		}

		/// <summary>Action: login | C | R | U | D | any serv extension</summary>
		protected internal string a;

		/// <returns>Action: login | C | R | U | D | any serv extension</returns>
		public virtual string a()
		{
			return a;
		}

		public virtual io.odysz.semantic.jprotocol.AnsonBody a(string act)
		{
			this.a = act;
			return this;
		}

		protected internal AnsonBody(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string conn)
		{
			this.parent = parent;
			this.conn = conn;
		}
	}
}
