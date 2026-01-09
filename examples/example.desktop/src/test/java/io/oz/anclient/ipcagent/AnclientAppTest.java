package io.oz.anclient.ipcagent;

import static org.junit.jupiter.api.Assertions.*;
import static io.odysz.common.Utils.logi;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.eclipse.jetty.server.Server;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;
import io.odysz.semantic.jprotocol.AnsonResp;

class AnclientAppTest {

	static Process qt;

	static TestSettings testSettings;

	static Server ipcserver;

	
	static CountDownLatch byelatch = new CountDownLatch(1);
	static List<String> docsResponse = new ArrayList<String>();

	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		testSettings = Anson.fromPath("src/test/resources/tests.json");
		ipcserver = WSAgent._main("src/test/resources/WEB-INF/settings.json");
        ipcserver.start();
	}

	@AfterAll
	static void tearDownAfterClass() throws Exception {
		ipcserver.stop();
		ipcserver.join();
	}
	
	static void startQt(String qtmode, String m0, String m1) {
		try {
			// 1. Specify the absolute path to your Qt executable
			String qtAppPath = testSettings.qtclient;
			
			// 2. Configure the process
			ProcessBuilder pb = new ProcessBuilder(qtAppPath, qtmode, m0, m1);
			
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

	static void byeQt(String bye) throws InterruptedException {
		WSSocket.instance().sendEnvelope(bye, (resp) -> {
			docsResponse.add(resp.msg());
			byelatch.countDown();
		});
		logi("Waiting Qt quit ...");
		byelatch.await();
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
	void test() throws Exception {
		String ping = "bla bla";
		SimpleClient sc = SimpleClient.connect(testSettings, 60000);
		sc.asynEcho(ping);
		sc.close();
		AnsonResp res = sc.nextEnvelope(); 
		assertEquals(SimpleClient.funcid, res.uri());
		assertEquals(ping, res.msg());
		
		String m0 = "send-me-0";
		String m1 = "send-me-1";
		startQt("junit-desktop", m0, m1);
		byeQt("bye");
		closeQt();
		
		List<String> msgs = docsResponse;
		
		// assertEquals(List.of(m0, m1), msgs);
	}
}
