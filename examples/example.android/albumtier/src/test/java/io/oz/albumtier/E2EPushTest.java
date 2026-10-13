package io.oz.albumtier;

import static io.odysz.common.LangExt.isblank;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;

import io.odysz.jclient.syn.Doclientier;
import io.odysz.jclient.syn.IFileProvider;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.tier.docs.Device;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.ShareFlag;

/**
 * End-to-end push of a photo to a running synode, the way the Android app does it:
 * {@link AlbumContext#init(String, String, String, String, String)},
 * {@link AlbumContext#login(io.odysz.jclient.Clients.OnLogin, io.odysz.semantic.jprotocol.JProtocol.OnError)},
 * then a push through {@link AlbumContext#tier} into h_photos.
 *
 * <p>Skipped unless SYNODE_E2E_JSERV is set. Run by semantic-jserv
 * .github/workflows/synodes-windows-closed-test.yml, which then checks h_photos of every synode.</p>
 *
 * Env:
 * <pre>
 * SYNODE_E2E_JSERV   jserv root of the synode, e.g. http://127.0.0.1:8961/jserv-album (required)
 * SYNODE_E2E_PSWD    password of the user, i.e. the domain token (required)
 * SYNODE_E2E_USER    default admin
 * SYNODE_E2E_ORG     the user's org (AlbumContext family), default closed-test
 * SYNODE_E2E_DEVICE  default ci-android
 * SYNODE_E2E_OUT     optional, a file to write the pushed doc's name into
 * </pre>
 *
 * The pushed file is a copy of src/test/res/64x48.png, named 64x48_e2e_&lt;time&gt;_&lt;nonce&gt;.png,
 * with a unique trailer, so that every run pushes a new document.
 */
class E2EPushTest {
	static final String doctbl = "h_photos";
	static final String res = "src/test/res/64x48.png";

	static String env(String name, String deflt) {
		String v = System.getenv(name);
		return isblank(v) ? deflt : v;
	}

	@Test
	void testPushPhoto() throws Exception {
		String jserv = env("SYNODE_E2E_JSERV", null);
		assumeTrue(jserv != null, "SYNODE_E2E_JSERV is not set.");

		String pswd   = env("SYNODE_E2E_PSWD", null);
		String uid    = env("SYNODE_E2E_USER", "admin");
		String org    = env("SYNODE_E2E_ORG", "closed-test");
		String device = env("SYNODE_E2E_DEVICE", "ci-android");
		assertNotNull(pswd, "SYNODE_E2E_PSWD is not set.");

		String[] err = new String[1];
		AlbumContext ctx = new AlbumContext();
		ctx.errCtx = (code, msg, args) -> {
			if (err[0] == null) err[0] = String.format("%s: %s", code, msg);
		};
		ctx.init(org, uid, pswd, device, jserv);

		// 1. login, asynchronously as the app does
		CountDownLatch logged = new CountDownLatch(1);
		ctx.login((client) -> logged.countDown(),
				  (code, msg, args) -> {
					  err[0] = String.format("login %s: %s", code, msg);
					  logged.countDown();
				  });
		assertTrue(logged.await(30, TimeUnit.SECONDS), "Login timeout: " + jserv);
		assertNull(err[0], err[0]);
		assertEquals(AlbumContext.ConnState.Online, ctx.state());

		// 2. push a new photo
		Path photo = uniqueCopy(Paths.get(res));
		ctx.tier.fileProvider(new IFileProvider() {});

		Device dev = new Device(device, null, device).folder("ci-e2e");
		AnsonResp[] pushed = new AnsonResp[1];

		@SuppressWarnings("deprecation")
		ExpSyncDoc xdoc = Doclientier.videoUpByApp(ctx.tier, dev, photo.toAbsolutePath().toString(),
				doctbl, ShareFlag.publish, (rep) -> pushed[0] = rep, null);

		assertNull(err[0], err[0]);
		assertNotNull(xdoc, "No document is pushed.");
		assertNotNull(xdoc.recId(), "The pushed document has no id.");

		// 3. read it back from the synode
		DocsResp rp = ctx.tier.selectDoc(doctbl, xdoc.recId());
		assertNull(err[0], err[0]);
		assertNotNull(rp.xdoc, "The pushed document is not found: " + xdoc.recId());
		assertEquals(device, rp.xdoc.device());
		assertEquals(photo.getFileName().toString(), rp.xdoc.pname);

		System.out.printf("[E2E] pushed %s, id %s, to %s%n", rp.xdoc.pname, xdoc.recId(), jserv);

		String out = env("SYNODE_E2E_OUT", null);
		if (out != null)
			Files.write(Paths.get(out), rp.xdoc.pname.getBytes(StandardCharsets.UTF_8));
	}

	/**
	 * Copy the resource as 64x48_e2e_&lt;time&gt;_&lt;nonce&gt;.png, with a trailer making its content unique.
	 */
	static Path uniqueCopy(Path src) throws IOException {
		String nonce = UUID.randomUUID().toString().substring(0, 8);
		String time  = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
		String name  = src.getFileName().toString().replaceFirst("\\.png$", "");

		Path dir = Files.createTempDirectory("synode-e2e");
		Path dst = dir.resolve(String.format("%s_e2e_%s_%s.png", name, time, nonce));
		Files.copy(src, dst);
		Files.write(dst, String.format("synode-e2e:%s:%s", time, nonce).getBytes(StandardCharsets.UTF_8),
					StandardOpenOption.APPEND);
		return dst;
	}
}
