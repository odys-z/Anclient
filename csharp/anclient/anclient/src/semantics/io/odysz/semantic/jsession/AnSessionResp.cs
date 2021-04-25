using Sharpen;

namespace io.odysz.semantic.jsession
{
	public class AnSessionResp : io.odysz.semantic.jprotocol.AnsonResp
	{
		private io.odysz.semantic.jsession.SessionInf ssInf;

		public AnSessionResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> parent, string ssid, string uid, params string[] roleId)
			: base(parent)
		{
			ssInf = new io.odysz.semantic.jsession.SessionInf(ssid, uid, roleId == null || roleId
				.Length == 0 ? null : roleId[0]);
			ssInf.ssid = ssid;
			ssInf.uid = uid;
		}

		public AnSessionResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> parent, io.odysz.semantic.jsession.SessionInf ssInf)
			: base(parent)
		{
			// TODO built-in role?
			// if (roleId != null && roleId.length > 0)
			// 	ssInf.roleId = roleId[0];
			this.ssInf = ssInf;
		}

		public AnSessionResp()
			: base(string.Empty)
		{
		}

		public virtual io.odysz.semantic.jsession.SessionInf ssInf()
		{
			return ssInf;
		}
	}
}
