using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	public class AnsonHeader : io.odysz.anson.Anson
	{
		internal string uid;

		// internal string ssid;
		public string ssid { get; }

		internal string iv64;

		internal string[] usrAct;

		public AnsonHeader(string ssid, string uid)
		{
			this.uid = uid;
			this.ssid = ssid;
		}

		public AnsonHeader()
		{
		}

		public virtual string logid()
		{
			return uid;
		}


		/*
		/// <returns>js equivalent {md: ssinf.md, ssid: ssinf.ssid, uid: ssinf.uid, iv: ssinf.iv};
		/// 	</returns>
		public static io.odysz.semantic.jprotocol.AnsonHeader format(string uid, string ssid)
		{
			// formatLogin: {a: "login", logid: logId, pswd: tokenB64, iv: ivB64};
			return new io.odysz.semantic.jprotocol.AnsonHeader(ssid, uid);
		}

		public virtual io.odysz.semantic.jprotocol.AnsonHeader act(string[] act)
		{
			usrAct = act;
			return this;
		}

		public static string[] usrAct(string funcId, string cmd, string cate, string remarks)
		{
			return new string[] { funcId, cate, cmd, remarks };
		}

		/// <summary>For test.</summary>
		/// <remarks>For test. The string can not been used for json data.</remarks>
		/// <seealso cref="object.ToString()"/>
		public override string ToString()
		{
			return string.format("{ssid: %s, uid: %s, iv64: %s,\n\t\tuserAct: %s}", ssid, uid
				, iv64, usrAct == null ? null : java.util.Arrays.stream(usrAct).collect(java.util.stream.Collectors
				.joining(", ", "[", "]")));
		}
		*/
	}
}
