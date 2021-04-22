using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>FIXME this class must been removed.</summary>
	/// <author>ody</author>
	public class Log4jWrapper : io.odysz.module.xtable.ILogger
	{
		protected internal bool debug;

		public Log4jWrapper(string name)
		{
		}

		// log = Logger.getLogger(name);
		public virtual io.odysz.module.xtable.ILogger setDebugMode(bool isDebug)
		{
			debug = isDebug;
			return this;
		}

		public virtual void e(string tag, string msg)
		{
		}

		// log.error(String.format(" %s - %s", tag, msg));
		public virtual void w(string tag, string msg)
		{
		}

		// log.warn(String.format(" %s - %s", tag, msg));
		public virtual void i(string tag, string msg)
		{
		}

		//		if (debug)
		//			log.info(String.format(" %s - %s", tag, msg));
		public virtual void d(string tag, string msg)
		{
		}

		//		if (debug)
		//			log.debug(String.format(" %s - %s", tag, msg));
		public virtual void v(string tag, string msg)
		{
		}
		//		if (debug)
		//			log.debug(String.format(" %s - %s", tag, msg));
	}
}
