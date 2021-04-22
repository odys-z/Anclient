using System.Collections.Generic;

namespace io.odysz.semantic.jprotocol
{
	/// <summary>Anson message response body</summary>
	/// <author>odys-z@github.com</author>
	public class AnsonResp : AnsonBody
	{
		protected internal string m;

		protected internal List<AnResultset> rs;

		protected internal Dictionary<string, object> map;

		public AnsonResp() : base(null, null)
		{
		}

		public AnsonResp(AnsonMsg<AnsonBody> parent) : base(parent, null)
		{
		}

		public AnsonResp(AnsonMsg<AnsonBody> parent, string txt) : base(parent, null)
		{
			this.m = txt;
		}

		public AnsonResp(string txt) : base(null, null)
		{
			this.m = txt;
		}

		public virtual string msg()
		{
			return m;
		}

		public virtual AnsonResp rs(AnResultset rs)
		{
			if (this._rs == null)
			{
				this._rs = new List<AnResultset>(1);
			}
			this._rs.add(rs);
			return this;
		}

		/// <summary>Add a resultset to list.</summary>
		/// <param name="rs"/>
		/// <param name="totalRows">total row count for a paged query (only a page of rows is actually in rs).
		/// 	</param>
		/// <returns>this</returns>
		public virtual AnsonResp rs(AnResultset rs, int totalRows)
		{
			if (this._rs == null)
			{
				this._rs = new List<AnResultset>();
			}
			this._rs.add(rs.total(totalRows));
			return this;
		}

		public virtual AnsonBody rs(List<AnResultset> rsLst)
		{
			this._rs = rsLst;
			return this;
		}

		public virtual List<AnResultset> rs ()
		{
			return this._rs;
		}

		public virtual AnResultset rs(int ix)
		{
			return this._rs == null ? null : this._rs[ix];
		}

		public virtual AnsonResp data(Dictionary<string, object> props)
		{
			this.map = props;
			return this;
		}

		public virtual Dictionary<string, object> data()
		{
			return map;
		}
	}
}
