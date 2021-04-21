using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	/// <summary>Anson message response body</summary>
	/// <author>odys-z@github.com</author>
	public class AnsonResp : AnsonBody
	{
		protected internal string m;

		protected internal System.Collections.Generic.List<io.odysz.module.rs.AnResultset
			> rs;

		protected internal System.Collections.Generic.Dictionary<string, object> map;

		public AnsonResp()
			: base(null, null)
		{
		}

		public AnsonResp(AnsonMsg<AnsonMsg> parent)
			: base(parent, null)
		{
		}

		public AnsonResp(AnsonMsg<AnsonMsg> parent, string txt)
			: base(parent, null)
		{
			this.m = txt;
		}

		public AnsonResp(string txt)
			: base(null, null)
		{
			this.m = txt;
		}

		public virtual string msg()
		{
			return m;
		}

		public virtual io.odysz.semantic.jprotocol.AnsonResp rs(io.odysz.module.rs.AnResultset
			 rs)
		{
			if (this.rs == null)
			{
				this.rs = new System.Collections.Generic.List<io.odysz.module.rs.AnResultset>(1);
			}
			this.rs.add(rs);
			return this;
		}

		/// <summary>Add a resultset to list.</summary>
		/// <param name="rs"/>
		/// <param name="totalRows">total row count for a paged query (only a page of rows is actually in rs).
		/// 	</param>
		/// <returns>this</returns>
		public virtual io.odysz.semantic.jprotocol.AnsonResp rs(io.odysz.module.rs.AnResultset
			 rs, int totalRows)
		{
			if (this.rs == null)
			{
				this.rs = new System.Collections.Generic.List<io.odysz.module.rs.AnResultset>();
			}
			this.rs.add(rs.total(totalRows));
			return this;
		}

		public virtual io.odysz.semantic.jprotocol.AnsonBody rs(System.Collections.Generic.List
			<io.odysz.module.rs.AnResultset> rsLst)
		{
			this.rs = rsLst;
			return this;
		}

		public virtual System.Collections.Generic.List<io.odysz.module.rs.AnResultset> rs
			()
		{
			return this.rs;
		}

		public virtual io.odysz.module.rs.AnResultset rs(int ix)
		{
			return this.rs == null ? null : this.rs[ix];
		}

		public virtual io.odysz.semantic.jprotocol.AnsonResp data(System.Collections.Generic.Dictionary
			<string, object> props)
		{
			this.map = props;
			return this;
		}

		public virtual System.Collections.Generic.Dictionary<string, object> data()
		{
			return map;
		}
	}
}
