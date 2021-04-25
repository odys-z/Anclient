using Sharpen;

namespace io.odysz.semantic.jsession
{
	public class SessionInf : io.odysz.anson.Anson
	{
		internal string ssid;

		internal string uid;

		internal string roleId;

		public SessionInf()
		{
		}

		public SessionInf(string ssid, string uid, params string[] roleId)
		{
			this.ssid = ssid;
			this.uid = uid;
			this.roleId = roleId == null || roleId.Length == 0 ? null : roleId[0];
		}

		public virtual string ssid()
		{
			return ssid;
		}

		public virtual string uid()
		{
			return uid;
		}

		public virtual string roleId()
		{
			return roleId;
		}
	}
}
