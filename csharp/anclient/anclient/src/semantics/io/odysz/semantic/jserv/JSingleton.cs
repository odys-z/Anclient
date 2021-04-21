using Sharpen;

namespace io.odysz.semantic.jserv
{
	/// <summary>This jserv lib  initializing and managing module.</summary>
	/// <remarks>
	/// This jserv lib  initializing and managing module. Subclass must be a web listener.
	/// See
	/// <see cref="io.odysz.jsample.Sampleton"/>
	/// example of how to use JSingleton in application.
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class JSingleton
	{
		public static io.odysz.semantic.DATranscxt defltScxt;

		private static io.odysz.semantic.jsession.ISessionVerifier ssVerier;

		private static string rootINF;

		public virtual void onDestroyed(javax.servlet.ServletContextEvent arg0)
		{
			io.odysz.semantic.jsession.AnSession.stopScheduled(5);
			io.odysz.semantic.DA.Connects.close();
		}

		public virtual void onInitialized(javax.servlet.ServletContextEvent evt)
		{
			io.odysz.common.Utils.printCaller(false);
			io.odysz.common.Utils.logi("JSingleton initializing...");
			javax.servlet.ServletContext ctx = evt.getServletContext();
			rootINF = ctx.getRealPath("/WEB-INF");
			io.odysz.semantic.DA.Connects.init(rootINF);
			io.odysz.common.Configs.init(rootINF);
			io.odysz.semantic.DATranscxt.configRoot(rootINF, rootINF);
			io.odysz.semantic.DATranscxt.key("user-pswd", ctx.getInitParameter("io.oz.root-key"
				));
			try
			{
				io.odysz.semantic.DA.DatasetCfg.init(rootINF);
				defltScxt = new io.odysz.semantic.DATranscxt(io.odysz.semantic.DA.Connects.defltConn
					());
				io.odysz.common.Utils.logi("Initializing session with default jdbc connection %s ..."
					, io.odysz.semantic.DA.Connects.defltConn());
				io.odysz.semantic.jsession.AnSession.init(defltScxt, ctx);
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
		}

		public static io.odysz.semantic.jsession.ISessionVerifier getSessionVerifier()
		{
			if (ssVerier == null)
			{
				ssVerier = new io.odysz.semantic.jsession.AnSession();
			}
			return ssVerier;
		}

		//	public static ISessionVerifier getSessionVerifierV11() {
		//		return ssVerierV11;
		//	}
		/// <summary>Get server root/WEB-INF path (filesystem local)</summary>
		/// <returns>WEB-INF root path</returns>
		public static string rootINF()
		{
			return rootINF;
		}

		/// <summary>Get WEB-INF file path</summary>
		/// <param name="filename"/>
		/// <returns>rootINF() + filename</returns>
		public static string getFileInfPath(string filename)
		{
			return org.apache.commons.io_odysz.FilenameUtils.concat(rootINF(), filename);
		}
	}
}
