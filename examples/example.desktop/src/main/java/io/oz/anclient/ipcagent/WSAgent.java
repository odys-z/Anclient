package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.InetAccessHandler;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

import io.odysz.anson.Anson;

public class WSAgent {
	public static void main(String[] args) throws Exception {
		Server server = _main("WEB-INF/settings.json");
        server.start();
        server.join();
	}

    public static Server _main(String... args) throws Exception {
    	AgentSettings settings = Anson.fromPath(_0(args));

        Server server = new Server(8080); // No setHost means it listens on all interfaces

        // 1. Define your WebSocket logic
        WebSocketHandler wsHandler = new WebSocketHandler() {
            @Override
            public void configure(WebSocketServletFactory factory) {
                // factory.register(WSSocket.class);
            	factory.setCreator((servletUpgradeRequest, servletUpgradeResponse)
            						-> WSSocket.build(settings.tiers));
            }
        };
        
        /*
         Google AI:
         It's possible to bind multiple service on different url path, with 
         org.eclipse.jetty.websocket : websocket-jetty-server : 12.0.x 

        WebSocketUpgradeHandler wsHandler = WebSocketUpgradeHandler.from(server, container -> {
            // Path 1: /events
            container.addMapping("/events", (req, resp) -> WSSocket.build(settings.tiers));
            
            // Path 2: /chat
            container.addMapping("/chat", (req, resp) -> new OtherSocketImplementation());
            
            // Optional: Set global timeouts
            container.setIdleTimeout(Duration.ofMinutes(5));
        });
         */

        // 2. Create the IP Whitelist Handler
        InetAccessHandler ipHandler = new InetAccessHandler();
        
        ipHandler.include("127.0.0.1");
        ipHandler.include("192.168.0.0/24");
        ipHandler.include("10.0.0.0/24");

        // 3. Chain them: IP Filter -> WebSocket Handler
        ipHandler.setHandler(wsHandler);
        server.setHandler(ipHandler);

        return server;
    }
}
