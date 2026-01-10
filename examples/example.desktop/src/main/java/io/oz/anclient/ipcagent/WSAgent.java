package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;

import java.util.Map;

import org.eclipse.jetty.server.Server;
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
        server.start();
        server.join();
	}

    public static Server _main(String... args) throws Exception {
    	JProtocol.setup(ipc_path, WSPort.echo);

    	settings = Anson.fromPath(_0(args));

        Server server = new Server(settings.wsport); // No setHost means it listens on all interfaces

        // 1. Create a ServletContextHandler (the EE8 container for your WebSocket)
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        // 2. Configure the WebSocket Creator using the modern Initializer
        JakartaWebSocketServletContainerInitializer.configure(context, (servletContext, container) -> {
            ServerEndpointConfig config = ServerEndpointConfig.Builder
                    .create(WSSocket.class, "/" + ipc_path)
                    .configurator(new ServerEndpointConfig.Configurator() {
                        @SuppressWarnings("unchecked")
						@Override
                        public <T> T getEndpointInstance(Class<T> clazz) {
                            return (T) WSSocket.build(settings);
                        }
                    })
                    .build();
            Map<String, Object> userProps = config.getUserProperties();
            userProps.put("org.eclipse.jetty.websocket.client.connectTimeout", 60000 * 3);
            container.addEndpoint(config);
        });
        
        // 3. Create the IP Whitelist Handler
        InetAccessHandler ipHandler = new InetAccessHandler();
        
        ipHandler.include("127.0.0.1");
        ipHandler.include("192.168.0.0/24");
        ipHandler.include("10.0.0.0/24");

        // 3. Chain them: IP Filter -> WebSocket Handler
        ipHandler.setHandler(context);
        server.setHandler(ipHandler);

        return server;
    }
}
