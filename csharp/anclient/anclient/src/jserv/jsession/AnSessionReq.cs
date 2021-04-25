using io.odysz.semantic.jprotocol;
using System.Collections.Generic;
using static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody>;

namespace io.odysz.semantic.jsession
{
	/// <summary>
	/// <p>Sessin Request<br />
	/// a: see
	/// <see cref="AnSession"/>
	/// </p>
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnSessionReq : AnsonBody
	{
		public AnSessionReq() : base(null, null)
		{
		}

		/// <summary>Session connection is ignored and controlled by server.</summary>
		/// <param name="parent"/>
		public AnSessionReq(AnsonMsg<AnsonBody> parent)
			: base(parent, null)
		{
		}

		internal string uid;

		internal string token { get; set; }

		// session's DB access is controlled by server
		// internal virtual string token() { return token; }

		internal string iv { get; set; }

		// internal virtual string iv() { return iv; }

		internal Dictionary<string, object> mds;

		public virtual string md(string k)
		{
			return mds == null ? null : (string)mds[k];
		}

		public virtual AnSessionReq md(string k, string md)
		{
			if (k == null || string.IsNullOrEmpty(md))
			{
				return this;
			}
			if (mds == null)
			{
				mds = new Dictionary<string, object>();
			}
			mds[k] = md;
			return this;
		}

		//public virtual string uid()
		//{
		//	return uid;
		//}

		/// <summary>Format login request message.</summary>
		/// <param name="uid"/>
		/// <param name="tk64"/>
		/// <param name="iv64"/>
		/// <returns>login request message</returns>
		public static AnsonMsg<AnsonBody> formatLogin(string uid, string tk64, string iv64)
		{
			// AnSessionReq : AnsonBody
			AnsonMsg<AnsonBody> jmsg = new AnsonMsg<AnsonBody>(new Port(Port.session));
			AnSessionReq itm = new AnSessionReq(jmsg);
			itm.uid = uid;
			itm.A("login");
			itm.setup(uid, tk64, iv64);
			jmsg.Body((AnsonBody)itm);
			return jmsg;
		}

		private void setup(string uid, string tk64, string iv64)
		{
			this.uid = uid;
			this.token = tk64;
			this.iv = iv64;
		}
	}
}
