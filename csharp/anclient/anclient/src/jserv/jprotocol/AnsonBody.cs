using io.odysz.anson;

namespace io.odysz.semantic.jprotocol
{
	public abstract class AnsonBody : Anson
	{
		protected internal AnsonMsg<AnsonBody> parent;

		protected internal string conn { get; }

		/// <summary>Action: login | C | R | U | D | any serv extension</summary>
		protected internal string a { get; set; }

		//public virtual AnsonBody a(string act)
		//{
		//	this.a = act;
		//	return this;
		//}

		protected internal AnsonBody(AnsonMsg<AnsonBody> parent, string conn)
		{
			this.parent = parent;
			this.conn = conn;
		}
	}
}
