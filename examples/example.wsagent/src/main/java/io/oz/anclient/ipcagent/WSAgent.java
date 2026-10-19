package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;
import static io.odysz.common.Utils.logi;

import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.ShutdownMonitor;
import org.eclipse.jetty.server.handler.InetAccessHandler;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.websocket.jakarta.server.config.JakartaWebSocketServletContainerInitializer;
import io.odysz.anson.Anson;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.oz.anclient.app.DesktopSettings;
import jakarta.websocket.server.ServerEndpointConfig;

public class WSAgent {
	public static final String ipc_path = "ipc";
	public static SingleAgent single;
	
	/** How many ports above settings.wsport are tried. */
	public static final int scan_range = 1000;

	/**
	 * args[0]: settings json, args[1]: port file, where the bound ports are written:
	 * line 1, the websocket port (read by the desktop app); line 2, the stop port (read by StopAgent).
	 */
	public static void main(String[] args) throws Exception {
		String portfile = args.length > 1 ? args[1] : "ipc-agent.port";
		Server server = _main(_0(args, "WEB-INF/settings.json"));
		int wsport = localPort(server);
		int stopport = freePort(wsport + 1);

		ShutdownMonitor monitor = ShutdownMonitor.getInstance();
	    monitor.setPort(stopport);
	    monitor.setKey(StopAgent.secret_key);
	    monitor.setExitVm(true);
	    
        server.start();
        writePortFile(portfile, wsport, stopport);
        logi("ipc-agent is listening at %s, stop port %s, port file: %s", wsport, stopport, portfile);
        logi("To stop ipc-agent, run: java -cp ws-agent-#.#.#.jar io.oz.anclient.ipcagent.StopAgent %s", portfile);

        server.join();
        // Nothing can be run here, e.e. logi("Stopped!");
	}

	/** @return the port the (first) connector is bound to. */
	public static int localPort(Server server) {
		return ((ServerConnector) server.getConnectors()[0]).getLocalPort();
	}

	/**
	 * Binds the first free port in [from, from + scan_range].
	 * The channel is kept open, and server.start() won't re-open it.
	 */
	static int bindFrom(ServerConnector c, int from) throws IOException {
		int to = Math.min(from + scan_range, 65535);
		for (int p = from; p <= to; p++) {
			c.setPort(p);
			try { c.open(); return c.getLocalPort(); }
			catch (IOException inuse) { c.close(); }
		}
		throw new IOException(String.format("No free port in [%s, %s]", from, to));
	}

	static int freePort(int from) throws IOException {
		for (int p = from; p <= 65535; p++)
			try (ServerSocket s = new ServerSocket(p, 1, InetAddress.getLoopbackAddress())) { return p; }
			catch (IOException inuse) {}
		throw new IOException("No free stop port from " + from);
	}

	/** Line 1: wsport, line 2: stop port. Written to a temp file then moved, so readers never see a partial file. */
	static void writePortFile(String path, int wsport, int stopport) throws IOException {
		Path f = Paths.get(path).toAbsolutePath();
		Path tmp = f.resolveSibling(f.getFileName() + ".tmp");
		Files.createDirectories(f.getParent());
		Files.writeString(tmp, wsport + "\n" + stopport + "\n");
		Files.move(tmp, f, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
	}

	public static Server createServer(ArrayList<ServerEndpointConfig.Builder> cfgBuilders,
			DesktopSettings settings) throws Exception {
	    JProtocol.setup(ipc_path, Port.echo);
	    Server server = new Server();
	    ServerConnector connector = new ServerConnector(server);
	    server.addConnector(connector);
	    bindFrom(connector, settings.wsport);  // settings.wsport is where the search starts

	    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
	    context.setContextPath("/");
	    
	    context.addServlet(org.eclipse.jetty.ee10.servlet.DefaultServlet.class, "/");
	    
	    server.setHandler(context);

	    InetAccessHandler ipHandler = new InetAccessHandler();
	    ipHandler.include("127.0.0.1");
	    ipHandler.include("::1");
	    ipHandler.include("192.168.0.0/24");
	    ipHandler.include("10.0.0.0/24");
	    ipHandler.include(server.getURI().getAuthority());
	    context.insertHandler(ipHandler);

	    JakartaWebSocketServletContainerInitializer.configure(context, (servletContext, container) -> {
	    	container.setDefaultMaxSessionIdleTimeout(settings.wstimeout);
	    	
	    	for (ServerEndpointConfig.Builder b : cfgBuilders) {
	    		ServerEndpointConfig config = b.build();
				// Map<String, Object> userProps = config.getUserProperties();
				// userProps.put("org.eclipse.jetty.websocket.client.connectTimeout", 60000 * 3);
				container.addEndpoint(config);
	    	}
	    });

	    return server;
	}

	public static Server _main(String... args) throws Exception {
	    DesktopSettings settings = Anson.fromPath(_0(args));
	    SingleAgent.getInstance().settings(settings);

	    logi("[Websocket endpoint %s] %s", WSAgent.ipc_path, WSAgent.class.getName());
        return createServer(new ArrayList<ServerEndpointConfig.Builder> () {
			private static final long serialVersionUID = 1L;
        	{ add (ServerEndpointConfig.Builder
        		.create(WServPort.class, "/" + WSAgent.ipc_path)
        		.configurator(new ServerEndpointConfig.Configurator() {
        				@SuppressWarnings("unchecked")
						@Override
	                    public <T> T getEndpointInstance(Class<T> clazz) {
	                        return (T) WServPort.build(settings);
	                    }
        		}));}
        }, settings);
	}
}
