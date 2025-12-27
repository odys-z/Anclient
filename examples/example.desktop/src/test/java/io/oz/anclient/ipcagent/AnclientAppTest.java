package io.oz.anclient.ipcagent;

import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.eclipse.jetty.server.Server;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;

class AnclientAppTest {

	static Process qt;

	static TestSettings testSettings;

	static Server jettyserver;

	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		testSettings = Anson.fromPath("src/test/resources/tests.json");
		jettyserver = WSAgent._main("src/test/resources/setting.json");
        jettyserver.start();
		startQt();
	}

	@AfterAll
	static void tearDownAfterClass() throws Exception {
		closeQt();
		jettyserver.stop();
		jettyserver.join();
	}
	
	static void startQt() {
		try {
			// 1. Specify the absolute path to your Qt executable
			String qtAppPath = testSettings.tester;
			
			// 2. Configure the process
			ProcessBuilder pb = new ProcessBuilder(qtAppPath);
			
			// Set the working directory to the folder containing the .exe
			// This is critical for Qt apps to find their local .dlls or assets
			pb.directory(new File("."));
			
			// Redirect error and output streams to Java's console for debugging
			pb.inheritIO(); 

			// 3. Start the application
			qt = pb.start();
			System.out.println("Qt Application started successfully.");

			// Optional: In a test, you might wait for it to finish or 
			// continue with your WebSocket/IPC communication here.
			
		} catch (IOException e) {
			System.err.println("Failed to start Qt app: " + e.getMessage());
		}
	}
	
	static void closeQt() {
		// 1. Attempt a graceful termination (SIGTERM on Linux/macOS, WM_CLOSE on Windows)
		qt.destroy();

		// 2. Wait a few seconds for the process to exit
		try {
		    if (!qt.waitFor(20, TimeUnit.SECONDS)) {
		        // 3. If it hasn't closed, force it (SIGKILL / TaskKill)
		        System.out.println("Qt app didn't close in time, forcing shutdown...");
		        qt.destroyForcibly();
		    }
		} catch (InterruptedException e) {
		    qt.destroyForcibly();
		}
	}
	
	@Test
	void test() {
		fail("Not yet implemented");
	}

}
