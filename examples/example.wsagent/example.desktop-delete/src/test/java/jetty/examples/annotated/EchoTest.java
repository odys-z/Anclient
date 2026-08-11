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
// https://github.com/jetty/jetty-examples : example/annotated

package jetty.examples.annotated;

import java.net.URI;
import java.util.List;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.util.component.LifeCycle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

//import static org.hamcrest.MatcherAssert.assertThat;
//import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.*;

public class EchoTest
{
    private Server server;
    private WebSocketContainer wsClient;

    @BeforeEach
    public void startServerAndClient() throws Exception
    {
        server = EchoServer.newServer(0);
        server.start();
        wsClient = ContainerProvider.getWebSocketContainer();
    }

    @AfterEach
    public void stopAll()
    {
        LifeCycle.stop(server);
    }

    @Test
    public void testEcho() throws Exception
    {
        URI uri = new URI("ws", server.getURI().getAuthority(), "/echo", null, null);
//        URI uri = URI.create("ws://localhost:8700/ipc");

        List<String> msgs = EchoClient.performEcho(wsClient, uri);
        String[] expected = {
            "You are now connected to " + EchoServerEndpoint.class.getName()
        };

        // assertThat(msgs, contains(expected));
        assertEquals(msgs.get(0), expected[0]);
    }
}
