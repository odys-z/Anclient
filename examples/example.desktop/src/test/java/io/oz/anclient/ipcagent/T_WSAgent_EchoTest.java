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
import jetty.examples.endpoint.EchoClient;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;

public class T_WSAgent_EchoTest {
    private Server server;
    private WebSocketContainer wsClient;

    @BeforeEach
    public void startServerAndClient() throws Exception {
        T_EchoEndpoint.token = "token: 123456";
        server = T_WSAgent._main(T_EchoEndpoint.class);
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
		String[] expected = { "token: 123456" };

        assertThat(msgs, contains(expected));
    }
}
