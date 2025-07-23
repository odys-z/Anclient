package io.oz.jsample;

import static io.odysz.common.LangExt._0;
import static io.odysz.common.LangExt.f;
import static io.odysz.common.LangExt.ifnull;
import static io.odysz.common.LangExt.isNull;
import static io.odysz.common.Utils.warn;

import java.net.InetSocketAddress;
import javax.servlet.annotation.WebServlet;

import org.eclipse.jetty.ee8.servlet.ServletContextHandler;
import org.eclipse.jetty.ee8.servlet.ServletHolder;
import org.eclipse.jetty.server.Server;
import io.odysz.common.Configs;
import io.odysz.common.Utils;
import io.odysz.semantic.DATranscxt;
import io.odysz.semantic.DA.Connects;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jserv.ServPort;
import io.odysz.semantic.jserv.R.AnQuery;
import io.odysz.semantic.jserv.ServPort.PrintstreamProvider;
import io.odysz.semantic.jserv.U.AnUpdate;
import io.odysz.semantic.jserv.echo.Echo;
import io.odysz.semantic.jsession.AnSession;
import io.odysz.semantic.jsession.HeartLink;
import io.odysz.jsample.SampleSettings;
import io.odysz.jsample.Sampleton;

/**
 * @since 1.5.3
 */
public class SampleApp {

	public static final String servpath = "/jserv-sample";
	
	public static final String config_xml = "config.xml";
	public static final String settings_json = "settings.json";

	public static final String webinf = "./src/test/res/WEB-INF";
	public static final String testDir   = "./src/test/res/";
	public static final String sample_name = "Testing Sample Serv";

	final Sampleton syngleton;

	Server server;

	ServletContextHandler schandler;
	public Sampleton syngleton() { return syngleton; }	

	public static void main(String[] args) {
		SampleApp app = _main(args);
		if (app.server != null)
			try {
				app.server.join();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	}

	/**
	 * @param args [0] settings.xml
	 * @throws Exception
	 */
	public static SampleApp _main(String[] args) {
		try {
			// For Eclipse's running as Java Application
			// E. g. -DWEB-INF=src/main/webapp/WEB-INF
			String srcwebinf = ifnull(System.getProperty("WEB-INF"), webinf);

			SampleSettings settings = SampleSettings.check(srcwebinf, "settings.json", true);

			SampleApp app = boot(settings)
					.afterboot(settings)
					.print("\n. . . . . . . . Synodtier Jetty Application is running . . . . . . . ");

			return app;
		} catch (Exception e) {
			e.printStackTrace();
			
			warn("Fatal errors there. The process is stopped.");
			System.exit(-1);
			return null;
		}
	}

	/**
	 * Expose locally
	 * @return this
	 */
	SampleApp afterboot(SampleSettings settings) {
//		if (!isNull(settings.startHandler)) {
//			logi("Exposing locally by %s, %s ...", (Object[]) settings.startHandler);
//			try {
//				((ISynodeLocalExposer)Class
//					.forName(settings.startHandler[0])
//					.getDeclaredConstructor()
//					.newInstance())
//					.onExpose(settings, this.syngleton.syncfg.domain, settings.jserv(this.syngleton.synode()), this.syngleton.syncfg.https);
//			} catch (Exception e) {
//				warn("Exposing local resources failed!");
//				e.printStackTrace();
//			}
//		}
//
		return this;
	}

	/**
	 * @param webinf
	 * @param config_xml
	 * @param settings_json
	 * @param oe
	 * @return synotier app
	 * @throws Exception
	 */
	public static SampleApp boot(SampleSettings settings,
			PrintstreamProvider ... oe) throws Exception {
		Configs.init(webinf);
		Connects.init(webinf);
		Sampleton.appName = ifnull(Configs.getCfg("app-name"), "Portfolio 0.7");

		String $vol_home = "$" + settings.vol_name;

//		YellowPages.load($vol_home);
//		SynodeConfig cfg = YellowPages.synconfig();
//		if (cfg.mode == null)
//			cfg.mode = SynodeMode.peer;
//		
//		mustnonull(settings.rootkey, f(
//				"Rootkey cannot be null for starting App. settings:\n%s", 
//				settings.toBlock()));
//
//		YellowPages.load(FilenameUtils.concat(new File(".").getAbsolutePath(),
//				webinf, EnvPath.replaceEnv($vol_home)));
//
//		Syngleton.defltScxt = new DATranscxt(cfg.sysconn);
//		AppSettings.rebootdb(cfg, webinf, $vol_home, config_xml, settings.rootkey);
//
//		// updating configuration that's allowed to be re-configured at each time of booting
//		AppSettings.updateOrgConfig(cfg, settings);

		return createSyndoctierApp(settings, webinf, config_xml, f("%s/%s", $vol_home, "syntity.json"))
				.start(isNull(oe) ? () -> System.out : oe[0],
					  !isNull(oe) && oe.length > 1 ? oe[1] : () -> System.err)
				;
	}

	/**
	 * @param cfg
	 * @throws Exception
	 */
	public SampleApp(SampleSettings settings) throws Exception {
		// syngleton = new Sampleton(cfg, settings);
		syngleton = new Sampleton();
	}

	/**
	 * Create an application instance working as a synode tier.
	 * @param urlpath e. g. jserv-album
	 * @param syntity_json e. g. $VOLUME_HOME/syntity.json
	 * @throws Exception
	 */
	public static SampleApp createSyndoctierApp(SampleSettings settings,
			String webinf, String config_xml, String syntity_json) throws Exception {

		SampleApp synapp = SampleApp.instanserver(webinf, settings, config_xml);

		Utils.logi("------------ Starting %s ... --------------", sample_name);
	
		// DBSynTransBuilder.synSemantics(new DATranscxt(sycon), sycon, synid, regists);

		return registerPorts(synapp, settings.conn,
				new AnSession(), new AnQuery(), new AnUpdate(),
				new Echo(),
				new HeartLink())
			.allowCors(synapp.schandler)
			;
	}

    PrintstreamProvider printout;
	PrintstreamProvider printerr;

	public SampleApp start(PrintstreamProvider out, PrintstreamProvider err) throws Exception {
		printout = out;
		printerr = err;

		ServPort.outstream(printout);
		ServPort.errstream(printout);

		server.start();
		
		return this;
	}

	/**
	 * Start jserv with Jetty, register jserv-ports to Jetty.
	 * 
	 * @param <T> subclass of {@link ServPort}
	 * @param synapp
	 * @param sysconn
	 * @param servports
	 * @return Jetty server, the {@link SynotierJettyApp}
	 * @throws Exception
	 */
	@SafeVarargs
	static public <T extends ServPort<? extends AnsonBody>> SampleApp registerPorts(
			SampleApp synapp, String sysconn, T ... servports) throws Exception {

        synapp.schandler = new ServletContextHandler(synapp.server, servpath);
        for (T t : servports) {
        	synapp.registerServlets(synapp.schandler, t.trb(new DATranscxt(sysconn)));
        }

        return synapp;
	}

	<T extends ServPort<? extends AnsonBody>> SampleApp registerServlets(
    		ServletContextHandler context, T t) {
		WebServlet info = t.getClass().getAnnotation(WebServlet.class);
		for (String pattern : info.urlPatterns()) {
			context.addServlet(new ServletHolder(t), pattern);
		}
		
		return this;
	}
//
//	public SynotierJettyApp addServPort(ServPort<?> p) {
//       	registerServlets(schandler, p);
//       	return this;
//	}

	static SampleApp instanserver(String configPath, SampleSettings settings,
			String config_xml) throws Exception {
	
	    // AnsonMsg.understandPorts(SynDocollPort.docoll);
	
	    SampleApp synapp = new SampleApp(settings);

		Sampleton.defltScxt = new DATranscxt(settings.conn);
	
    	synapp.server = new Server(new InetSocketAddress("0.0.0.0", 8080));

	    return synapp;
	}

	/**
	 * See <a href='https://github.com/odys-z/semantic-jserv/blob/master/docsync.jserv/src/test/java/io/oz/jserv/docs/syn/singleton/SynotierJettyApp.java'>
	 * SynotierJettyApp</a>#allowCors() for an example of the implementation.
	 * @param context
	 * @return
	 */
	private SampleApp allowCors(ServletContextHandler context) {
		return this;
	}

	public SampleApp print(String... msg) {
		String qr = f("%s\n%s", sample_name, syngleton.settings.jserv());
		Utils.logi("%s\nSynode %s", _0(msg, ""), qr);
		return this;
	}
}
