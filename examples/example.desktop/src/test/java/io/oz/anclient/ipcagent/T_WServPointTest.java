//
// ========================================================================
// Copyright (c) 1995 Mort Bay Consulting Pty Ltd and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// https://www.eclipse.org/legal/epl-2.0, or the Apache License, Version 2.0
// which is available at https://www.apache.org/licenses/LICENSE-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
// ========================================================================
//
// https://github.com/jetty/jetty-examples : example/endpoint

package io.oz.anclient.ipcagent;

import java.net.URI;
import java.util.List;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import jakarta.websocket.server.ServerEndpointConfig;
import jetty.examples.endpoint.EchoClient;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;

import static org.junit.jupiter.api.Assertions.*;

public class T_WServPointTest {
    private Server server;
    private WebSocketContainer wsClient;

    @BeforeEach
    public void startServerAndClient() throws Exception {
	    AgentSettings settings = Anson.fromPath("src/test/resources/WEB-INF/settings.json");
        server = T_WSAgent._main2(ServerEndpointConfig.Builder
        		.create(WServPoint.class, "/" + T_WSAgent.ipc_path)
        		.configurator(new ServerEndpointConfig.Configurator() {
        				@SuppressWarnings("unchecked")
						@Override
	                    public <T> T getEndpointInstance(Class<T> clazz) {
	                        return (T) WServPoint.build(server, settings);
	                    }
        		}));
        server.start();
        wsClient = ContainerProvider.getWebSocketContainer();
    }

    @AfterEach
    public void stopAll() {
        LifeCycle.stop(server);
    }

    @Test
    public void testEcho() throws Exception {
        URI uri = new URI("ws", server.getURI().getAuthority(), "/" + T_WSAgent.ipc_path, null, null);

        List<String> msgs = EchoClient.performEcho(wsClient, uri);
		String expected = "session openned: " + WServPoint.lastSession.getId();

        assertEquals(msgs.get(0), expected);
    }
}
