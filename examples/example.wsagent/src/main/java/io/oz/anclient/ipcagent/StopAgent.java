package io.oz.anclient.ipcagent;

import java.io.OutputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import static io.odysz.common.Utils.logi;
import static io.odysz.common.Utils.warn;

public class StopAgent {
    public static final String secret_key = "kkkk";

    /**
     * @param args args[0]: the port file written by WSAgent, whose line 2 is the stop port.
     */
	public static void main(String[] args) {
        int port = 9999;
        if (args.length > 0)
            try { port = Integer.parseInt(Files.readAllLines(Paths.get(args[0])).get(1).trim()); }
            catch (Exception e) { warn("Can't read the stop port from %s, trying %s", args[0], port); }
        
        try (Socket socket = new Socket(InetAddress.getByName("127.0.0.1"), port);
             OutputStream out = socket.getOutputStream()) {
            
            out.write((secret_key + "\r\nstop\r\n").getBytes(StandardCharsets.UTF_8));
            out.flush();
            logi("Sent ipc-agent command: stop!");
        } catch (Exception e) {
            warn("Failed to send ipc-agent command: " + e.getMessage());
        }
    }
}