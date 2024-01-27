package io.oz.albumtier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.IOException;

import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.SessionClient;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.AlbumPort;

class AlbumContextTest {

	@Test
	void testLogin() throws SemanticException, AnsonException, IOException, InterruptedException {
		String uri = "/test/ss-repack";
		AlbumContext ctx = new AlbumContext()
				.init("f/zsu", "syrskyi", "test", "http://localhost:8081");

		Object[] code = new Object[] {0, null};
		ctx.login("syrskyi", "слава україні",
			new OnLogin() {
				@Override
				public void ok(SessionClient client) {
					try {
						code[0] = 1;
						AnsonBody reqbd = new DocsReq(null, uri)
												.a(DocsReq.A.checkDev);
						AnsonMsg<AnsonBody> req = client.userReq(uri, AlbumPort.album, reqbd);
						DocsResp resp = client.commit(req, (MsgCode c, String msg, String... args) -> {
							fail(msg);
						});
						code[1] = resp.device();
					} catch (SemanticException | AnsonException | IOException e) {
						e.printStackTrace();
						fail(e.getMessage());
					}
				}
			},
			(MsgCode c, String msg, String... args) -> {
				fail(msg);
			});

		Thread.sleep(2000);
		// for debug: AlbumtierTest.pause("Press Enter when you think the test is finished ...");
		assertEquals(1, code[0]);
		assertEquals("test", ((Device)code[1]).devname);
	}
}
