//package io.oz.anclient.ipcagent;
//
//import static io.odysz.common.LangExt._0;
//import static io.odysz.common.LangExt.ifnull;
//import static io.odysz.common.LangExt.f;
//import static io.odysz.common.Utils.warn;
//
//import java.util.concurrent.CountDownLatch;
//
//import org.eclipse.jetty.server.Server;
//
//import io.odysz.semantic.jprotocol.JProtocol;
//import io.odysz.common.Utils;
//import io.odysz.jsample.Sampleton;
//import io.odysz.semantic.jprotocol.AnsonMsg.Port;
//
///**
// * TODO to be implemented (IPC is supposed to be visited via ws).
// */
//public class AnclientApp {
//	private static final String servpath = "ipc-agent";
//	public static final String config_xml = "config.xml";
//	public static final String settings_json = "settings.json";
//
//	public static final String webinf = "./src/test/res/WEB-INF";
//	public static final String testDir   = "./src/test/resources/";
//	public static final String sample_name = "Testing Sample Serv";
//
//	public static AnclientApp app;
//
//	private Server server;
//
//	public static Thread startSampleServ(CountDownLatch quit) throws InterruptedException {
//		CountDownLatch ready = new CountDownLatch(1);
//
//		JProtocol.setup(servpath, Port.echo);
//
//		Thread t = new Thread(() -> {
//			app = _main(null);
//			ready.countDown();
//			try {
//				quit.await();
//				app.server.stop();
//				app.server.join();
//			} catch (Exception e) {
//				e.printStackTrace();
//			}
//		}, "Anclient Jetty Server");
//
//		t.start();
//		ready.await();
//		return t;
//	}
//	
//	public static void main(String[] args) {
//		AnclientApp app = _main(args);
//		if (app.server != null)
//			try {
//				app.server.join();
//			} catch (InterruptedException e) {
//				e.printStackTrace();
//			}
//	}
//
//	/**
//	 * @param args [0] settings.xml
//	 * @throws Exception
//	 */
//	public static AnclientApp _main(String[] args) {
//		try {
//			// For Eclipse's running as Java Application
//			// E. g. -DWEB-INF=src/main/webapp/WEB-INF
//			String srcwebinf = ifnull(System.getProperty("WEB-INF"), webinf);
//
//			AgentSettings settings = AgentSettings.check(srcwebinf, "settings.json");
//
//			AnclientApp app = boot(settings)
//					.afterboot(settings)
//					.print("\n. . . . . . . . Anclient Jetty Application is running . . . . . . . ");
//
//			return app;
//		} catch (Exception e) {
//			e.printStackTrace();
//			
//			warn("Fatal errors there. The process is stopped.");
//			System.exit(-1);
//			return null;
//		}
//	}
//
//	/**
//	 * @param cfg
//	 * @throws Exception
//	 */
//	public AnclientApp(AgentSettings settings) throws Exception {
//		syngleton = new Sampleton(settings);
//	}
//
//	/**
//	 * E.g. for a Synode, expose jservs locally.
//	 * @return this
//	 */
//	AnclientApp afterboot(AgentSettings settings) {
//		return this;
//	}
//
//	private static AnclientApp boot(AgentSettings settings) {
//		return null;
//	}
//
//
//	static public Sampleton sampleton() {
//		return app.syngleton;
//	}
//
//	final Sampleton syngleton;
//
//	public AnclientApp print(String... msg) {
//		String qr = f("%s\n%s", sample_name, jserv());
//		Utils.logi("%s\nSynode %s", _0(msg, ""), qr);
//		return this;
//	}
//
//	public static String jserv() {
//		return f("http://localhost:%s/%s", sampleton().settings.port, servpath);
//	}
//
//}
