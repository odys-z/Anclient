package io.oz.albumtier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.DateFormat;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.PathsPage;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.album.AlbumPort;
import io.oz.album.tier.PhotoRec;

/**
 * only for MVP (0.3.x)
 * @author Ody
 */
public class AlbumtierTest {
    private static final String jserv = "http://localhost:8081";
	private AlbumContext singleton;
	private PathsPage synchPage;
	
	static final String testimg = "src/test/res/64x48.png";
	static final String testdoc = "src/test/res/doc.pdf";
	static final String device = "omni";
	
	ArrayList<SyncDoc> mList;

	@Test
    public void testRefreshPage0() throws AnsonException,
    		GeneralSecurityException, IOException, TransException, InterruptedException {
		mList = new ArrayList<SyncDoc>(1);
		mList.add(new PhotoRec().createTest(testimg));
		
		// 1. create
		onActivityCreate();
		
		Thread.sleep(1000); // wait for login
//		if (singleton.state != ConnState.Online)
//			fail("Why? Is server started? Or try to wait longer?");

		// 2. clean
		singleton.tier.del(singleton.userInf.device, testimg);
		
		// 3. upload photo
		onImagePicked();
		
		onUserSelectFiles();

		// 4. pause
		Utils.pause("Press Enter when you think the test is finished ...");
		Utils.logi(singleton.userInf.device);
    }

	void onActivityCreate() throws SemanticException, AnsonException, GeneralSecurityException, IOException {
		singleton = new AlbumContext(new T_AndErrorCtx())
			.init("f/zsu", "syrskyi", device, jserv)
			.login( "syrskyi", "слава україні",
					(client) -> refresh(mList),
					(c, t, v) -> {
						Utils.warn("Login denied!");
						Utils.warn(t, (Object[])v);
						fail("POCC");
					});
		singleton.tier.fileProvider(new IFileProvider() {

			@Override
			public long meta(SyncDoc f) throws IOException {
				long size = Files.size(Paths.get(f.fullpath()));
				f.size = size;
				return size;
			}

			@Override
			public InputStream open(SyncDoc pht) throws FileNotFoundException {
				return new FileInputStream(pht.fullpath());
			}

			@Override
			public String saveFolder() {
				return "syrskyi";
			}});
	}

	void refresh(List<? extends SyncDoc> mlist) {
		synchPage = new PathsPage(0, Math.min(20, mlist.size()));
		synchPage.device = singleton.userInf.device;
		if (singleton.tier != null)
			startSynchQuery(synchPage);
	}

	void startSynchQuery(PathsPage page) {
        singleton.tier.asynQueryDocs(mList, page,
			onSyncQueryRespons,
			(c, r, args) -> {
				Utils.warn("%s, %s, %s", AlbumContext.clientUri, r, args == null ? "null" : args[0]);
			});
    }

    JProtocol.OnOk onSyncQueryRespons = (resp) -> {
        DocsResp rsp = (DocsResp) resp;
        if (rsp == null || rsp.syncing() == null)
        	Utils.warn("OnSyncQueryRespons: Got response of empty synchronizing page.");
        else if (synchPage.end() < mList.size()) {
            HashMap<String, String[]> phts = rsp.pathsPage().paths();
            for (long i = synchPage.start(); i < synchPage.end(); i++) {
                SyncDoc f = mList.get((int)i);
                if (phts.keySet().contains(f.fullpath())) {
                	assertEquals(singleton.userInf.device, f.device());
                	assertEquals(3, phts.get(f.fullpath()).length, "needing sync, share, share-date");
                }
            }

            // updateIcons(synchPage);

            if (mList.size() >= synchPage.end()) {
                synchPage.nextPage(Math.min(20, mList.size() - synchPage.end()));
                startSynchQuery(synchPage);
            }
        }
    };
    
    /**
     * see WelcomeAct.onImagePicked()
     <pre>
    protected void onImagePicked(@NonNull ActivityResult result) {
        try {
            Intent data = result.getData();
            if (data != null) {
                ArrayList<ImageFile> list = data.getParcelableArrayListExtra(Constant.RESULT_Abstract);
                if (singl.tier == null)
                    showMsg(R.string.txt_please_login);
                else
                    singl.tier.asyncPhotosUp(list, singl.photoUser,
                        null,
                        (resp, v) -> showMsg(R.string.t_synch_ok, list.size()),
                        (c, r, args) -> showMsg(R.string.msg_upload_failed, (Object[]) args));
            }
        } catch (SemanticException | IOException | AnsonException e) {
            e.printStackTrace();
            showMsg(R.string.msg_upload_failed, e.getClass().getName(), e.getMessage());
        }
    }</pre>
     * @throws IOException 
     * @throws TransException 
     */
   	void onImagePicked() throws TransException, IOException {
   		singleton.tier.asyVideos(mList,
   				photoProc, photosPushed, singleton.errCtx);
	}
   	
   	JProtocol.OnDocsOk photosPushed = (resps) -> {
		SyncDoc doc = ((DocsResp) resps.get(0)).doc;
		assertEquals(device, doc.device());
		assertEquals(testimg, doc.fullpath());

		// ! also make sure files are saved in volume/user-id
		assertEquals(DateFormat.formatYYmm(new Date()), doc.folder());
   		
		DocsResp pths = singleton.tier.synQueryPathsPage(new PathsPage().add(testimg), "h_photos", AlbumPort.album);
		PathsPage pthpage = pths.pathsPage();
		assertEquals(device, pthpage.device);
		assertEquals(1, pthpage.paths().size());
		assertTrue(pthpage.paths().containsKey(testimg));
   	};

	JProtocol.OnProcess photoProc = (rs, rx, bx, bs, rsp) -> {};
	
	void onUserSelectFiles() throws TransException, IOException, InterruptedException {
		int[] res = new int[] {0};

		Thread.sleep(2000); // wait the file processing finished at sever side.
		singleton.tier.del(singleton.userInf.device, testimg);
		singleton.tier.del(singleton.userInf.device, testdoc);

   		List<SyncDoc> filelist = new ArrayList<SyncDoc>(2);
		filelist.add((SyncDoc)new SyncDoc().fullpath(testimg));
		filelist.add((SyncDoc)new SyncDoc().fullpath(testdoc));

		singleton.tier.asyVideos(filelist, photoProc, (resps) -> {
			String template = "Upload files: %s, ignored: %s";
			assertEquals( String.format(template, 2, 0),
						  PhotoSyntier.composeFilesMsg(template, resps));
			res[0]++;
		}, singleton.errCtx);

		Thread.sleep(1000);
		singleton.tier.del(singleton.userInf.device, testdoc);
		Thread.sleep(1000);

		singleton.tier.asyVideos(filelist, photoProc, (resps) -> {
			String template = "Upload files: %s, ignored: %s";
			assertEquals( String.format(template, 2, 1),
						  PhotoSyntier.composeFilesMsg(template, resps));
			res[0]++;
		}, singleton.errCtx);

		Thread.sleep(1000);
		singleton.tier.del(singleton.userInf.device, testimg);
		
		assertEquals(2, res[0], "Thread results verifying...");
	}
}