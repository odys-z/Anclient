namespace anclient.src.jserv
{
	public class AnsonBody
	{
		/// <summary>
		/// @AnsonField(ref= AnsonField.enclosing)
		/// </summary>
		protected AnsonMsg<AnsonBody> parent;

		// protected String conn;
		public string conn { get; }

		/// <summary>
		/// Action: login | C | R | U | D | any serv extension
		/// </summary>
		protected string _a;

		/// <summary>
		/// @return Action: login | C | R | U | D | any serv extension
		/// </summary>
		public string a() { return _a; }

		public AnsonBody a(string act)
		{
			this._a = act;
			return this;
		}

		public AnsonBody(AnsonMsg<AnsonBody> parent, string conn)
		{
			this.parent = parent;
			this.conn = conn;
		}
	}
}