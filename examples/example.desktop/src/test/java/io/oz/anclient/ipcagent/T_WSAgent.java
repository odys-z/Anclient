package io.oz.anclient.ipcagent;

import static io.odysz.common.LangExt._0;

import java.util.ArrayList;
import org.eclipse.jetty.server.Server;
import jakarta.websocket.server.ServerEndpointConfig;

import io.odysz.anson.Anson;

public class T_WSAgent extends WSAgent {
	public static final String ipc_path = "ipc";
	public static AgentSettings settings;
	
	public static Server _main(String... args) throws Exception {
	    settings = Anson.fromPath(_0(args));

        return createServer(new ArrayList<ServerEndpointConfig.Builder> () {
			private static final long serialVersionUID = 1L;
			{ add (ServerEndpointConfig.Builder
        		.create(T_EchoEndpoint.class, "/" + T_EchoEndpoint.pointpath));};
        	{ add (ServerEndpointConfig.Builder
        		.create(WServPoint.class, "/" + T_WSAgent.ipc_path)
        		.configurator(new ServerEndpointConfig.Configurator() {
        				@SuppressWarnings("unchecked")
						@Override
	                    public <T> T getEndpointInstance(Class<T> clazz) {
	                        return (T) WServPoint.build(settings);
	                    }
        		}));}
        }, settings);
	}
}
