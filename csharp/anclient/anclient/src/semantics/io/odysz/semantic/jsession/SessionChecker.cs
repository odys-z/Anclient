using Sharpen;

namespace io.odysz.semantic.jsession
{
	public class SessionChecker : java.lang.Runnable
	{
		private readonly long timeout;

		private System.Collections.Generic.Dictionary<string, io.odysz.semantics.IUser> sspool;

		public SessionChecker(System.Collections.Generic.Dictionary<string, io.odysz.semantics.IUser
			> ssPool, long timeoutMin)
		{
			this.sspool = ssPool;
			timeout = timeoutMin * 60 * 1000;
		}

		public virtual void run()
		{
			java.util.HashSet<string> ss = new java.util.HashSet<string>();
			try
			{
				long timestamp = Sharpen.Runtime.currentTimeMillis();
				foreach (string ssid in sspool.Keys)
				{
					io.odysz.semantics.IUser usr = sspool[ssid];
					if (timestamp > usr.touchedMs() + timeout)
					{
						ss.add(ssid);
					}
				}
				if (ss.Count > 0)
				{
					io.odysz.common.Utils.logi("Sesssion refeshed, expired session(s):\n");
				}
				foreach (string ssid_1 in ss)
				{
					io.odysz.semantics.IUser s = Sharpen.Collections.Remove(sspool, ssid_1);
					io.odysz.common.Utils.logi("[%s, %s]", ssid_1, s.uid());
				}
			}
			catch (System.Exception ex)
			{
				Sharpen.Runtime.printStackTrace(ex);
			}
		}
	}
}
