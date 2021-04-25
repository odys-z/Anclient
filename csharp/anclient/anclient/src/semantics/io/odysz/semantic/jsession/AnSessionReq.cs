using Sharpen;

namespace io.odysz.semantic.jsession
{
	/// <summary>
	/// <p>Sessin Request<br />
	/// a: see
	/// <see cref="AnSession"/>
	/// </p>
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnSessionReq : io.odysz.semantic.jprotocol.AnsonBody
	{
		public AnSessionReq()
			: base(null, null)
		{
		}

		/// <summary>Session connection is ignored and controlled by server.</summary>
		/// <param name="parent"/>
		public AnSessionReq(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
			> parent)
			: base(parent, null)
		{
		}

		internal string uid;

		internal string token;

		// session's DB access is controlled by server
		// session's DB access is controlled by server
		internal virtual string token()
		{
			return token;
		}

		internal string iv;

		internal virtual string iv()
		{
			return iv;
		}

		internal System.Collections.Generic.Dictionary<string, object> mds;

		public virtual string md(string k)
		{
			return mds == null ? null : (string)mds[k];
		}

		public virtual io.odysz.semantic.jsession.AnSessionReq md(string k, string md)
		{
			if (k == null || io.odysz.common.LangExt.isblank(md))
			{
				return this;
			}
			if (mds == null)
			{
				mds = new System.Collections.Generic.Dictionary<string, object>();
			}
			mds[k] = md;
			return this;
		}

		public virtual string uid()
		{
			return uid;
		}

		/// <summary>Format login request message.</summary>
		/// <param name="uid"/>
		/// <param name="tk64"/>
		/// <param name="iv64"/>
		/// <returns>login request message</returns>
		public static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
			> formatLogin(string uid, string tk64, string iv64)
		{
			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq> jmsg
				 = new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
				>(io.odysz.semantic.jprotocol.AnsonMsg.Port.session);
			io.odysz.semantic.jsession.AnSessionReq itm = new io.odysz.semantic.jsession.AnSessionReq
				(jmsg);
			itm.uid = uid;
			itm.a("login");
			itm.setup(uid, tk64, iv64);
			jmsg.body((io.odysz.semantic.jprotocol.AnsonBody)itm);
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
