package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;

import java.util.Map;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.InetAccessHandler;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.websocket.jakarta.server.config.JakartaWebSocketServletContainerInitializer;
import io.odysz.semantic.jprotocol.JProtocol;
import jakarta.websocket.Endpoint;
import jakarta.websocket.server.ServerEndpointConfig;

public class T_WSAgent {
	public static final String ipc_path = "ipc";
	public static AgentSettings settings;
	
	public static void main(String[] args) throws Exception {
		Server server = _main(T_EchoEndpoint.class, _0(args, "WEB-INF/settings.json"));
        server.start();
        server.join();
	}

	public static Server _main(Class<? extends Endpoint> endpointClass, String... args) throws Exception {
	    JProtocol.setup(ipc_path, WSPort.echo);

	    // settings = Anson.fromPath(_0(args));
	    settings = new AgentSettings();
	    settings.wsport = 8700;

	    Server server = new Server(settings.wsport); 

	    // 1. Create a clean EE10 ServletContextHandler
	    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
	    context.setContextPath("/");
	    
	    // Force a default servlet layout so the context is obligated to fully initialize on boot
	    context.addServlet(org.eclipse.jetty.ee10.servlet.DefaultServlet.class, "/");
	    
	    // 2. Link the context directly to the server root handler
	    server.setHandler(context);

	    // 3. Setup the IP Whitelist Filter directly inside the active context pipeline
	    InetAccessHandler ipHandler = new InetAccessHandler();
	    ipHandler.include("127.0.0.1");
	    ipHandler.include("::1"); // Essential for browser localhost loops
	    ipHandler.include("192.168.0.0/24");
	    ipHandler.include("10.0.0.0/24");
	    context.insertHandler(ipHandler);

	    // 4. Use the public initialiser configuration to map the WebSocket endpoint
	    JakartaWebSocketServletContainerInitializer.configure(context, (servletContext, container) -> {
	        ServerEndpointConfig config = ServerEndpointConfig.Builder
	                .create(endpointClass, "/" + ipc_path)
//	                .configurator(new ServerEndpointConfig.Configurator() {
//	                    @SuppressWarnings("unchecked")
//	                    @Override
//	                    public <T> T getEndpointInstance(Class<T> clazz) {
//	                        return (T) WSSocket.build(server, settings);
//	                    }
//	                })
	                .build();
	        
	        // Timeout configuration
	        Map<String, Object> userProps = config.getUserProperties();
	        userProps.put("org.eclipse.jetty.websocket.client.connectTimeout", 60000 * 3);
	        
	        container.addEndpoint(config);
	    });

	    return server;
	}
}
