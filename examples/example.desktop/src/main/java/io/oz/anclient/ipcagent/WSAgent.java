package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;
import static io.odysz.common.Utils.logi;

import java.util.ArrayList;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ShutdownMonitor;
import org.eclipse.jetty.server.handler.InetAccessHandler;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.websocket.jakarta.server.config.JakartaWebSocketServletContainerInitializer;
import io.odysz.anson.Anson;
import io.odysz.semantic.jprotocol.JProtocol;
import jakarta.websocket.server.ServerEndpointConfig;

public class WSAgent {
	public static final String ipc_path = "ipc";
	public static AgentSettings settings;
	
	public static void main(String[] args) throws Exception {
		Server server = _main(_0(args, "WEB-INF/settings.json"));
		
		ShutdownMonitor monitor = ShutdownMonitor.getInstance();
	    monitor.setPort(9999);
	    monitor.setKey(StopAgent.secret_key);
	    monitor.setExitVm(true);
	    
        server.start();
        logi("To stop ipc-agent, run: java -cp ws-agent-#.#.#.jar io.oz.anclient.ipcagent.StopAgent");

        server.join();
        // Nothing can be run here, e.e. logi("Stopped!");
	}

	public static Server createServer(ArrayList<ServerEndpointConfig.Builder> cfgBuilders,
			AgentSettings settings) throws Exception {
	    JProtocol.setup(ipc_path, WSPort.echo);
	    Server server = new Server(settings.wsport); 

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
	    	container.setDefaultMaxSessionIdleTimeout(20000);
	    	
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
	    settings = Anson.fromPath(_0(args));

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