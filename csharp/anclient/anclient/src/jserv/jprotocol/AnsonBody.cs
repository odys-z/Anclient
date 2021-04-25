namespace io.odysz.semantic.jprotocol
{
	public class AnsonBody
	{
		/// <summary>
		/// @AnsonField(ref= AnsonField.enclosing)
		/// </summary>
		public AnsonMsg<AnsonBody> parent { get; set; }

		// protected String conn;
		public string conn { get; }

		/// <summary>
		/// Action: login | C | R | U | D | any serv extension
		/// </summary>
		protected string a { get; set; }

        /// <summary>
        /// @return Action: login | C | R | U | D | any serv extension
        /// </summary>
        // public string a() { return _a; }

        public AnsonBody A(string act)
        {
            a = act;
            return this;
        }

        public AnsonBody(AnsonMsg<AnsonBody> parent, string conn)
		{
			this.parent = parent;
			this.conn = conn;
		}
	}
}