using Sharpen;

namespace io.odysz.semantic.jsession
{
	public class HeartBeat : io.odysz.semantic.jprotocol.AnsonBody
	{
		private string ssid;

		private string uid;

		protected internal HeartBeat(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string ssid, string uid)
			: base(parent, null)
		{
			// Heartbeats don't need db access
			this.ssid = ssid;
			this.uid = uid;
		}
	}
}
