using Sharpen;

namespace io.odysz.module.xtable
{
	/// <author>odys-z@github.com</author>
	[System.ObsoleteAttribute(@"replaced by io.odysz.common.Utils <br>")]
	public interface ILogger
	{
		/// <summary>Logger can working in debug mode and release mode.</summary>
		/// <remarks>
		/// Logger can working in debug mode and release mode.
		/// If in debug mode, i(), d(), v() are disabled.<br/>
		/// </remarks>
		/// <param name="isDebug"/>
		/// <returns>this logger</returns>
		io.odysz.module.xtable.ILogger setDebugMode(bool isDebug);

		void e(string tag, string msg);

		void w(string tag, string msg);

		void i(string tag, string msg);

		void d(string tag, string msg);

		void v(string tag, string msg);
	}
}
