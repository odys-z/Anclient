using io.odysz.semantic.jprotocol;

namespace io.odysz.semantic.jsession
{
	public class AnSessionResp : AnsonResp
	{
		internal SessionInf ssInf { get; set; }

		public AnSessionResp(AnsonMsg<AnsonBody> parent, string ssid, string uid, params string[] roleId)
			: base(parent)
		{
			ssInf = new SessionInf(ssid, uid, roleId == null || roleId
				.Length == 0 ? null : roleId[0]);
			//ssInf.ssid = ssid;
			//ssInf.uid = uid;
		}

		public AnSessionResp(AnsonMsg<AnsonBody> parent, SessionInf ssInf)
			: base(parent)
		{
			// TODO built-in role?
			// if (roleId != null && roleId.length > 0)
			// 	ssInf.roleId = roleId[0];
			this.ssInf = ssInf;
		}

		public AnSessionResp() : base(string.Empty)
		{
		}
	}
}
