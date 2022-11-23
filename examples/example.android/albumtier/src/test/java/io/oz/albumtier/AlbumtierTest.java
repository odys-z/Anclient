package io.oz.albumtier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.DocsPage;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.SyncDoc;
import io.odysz.semantics.x.SemanticException;
import io.oz.album.tier.Photo;


public class AlbumtierTest {
    private static final String jserv = "http://localhost:8081";
	private AlbumContext singleton;
	private DocsPage synchPage;
	
	ArrayList<SyncDoc> mList;

	@Test
    public void testRefreshPage0() throws SemanticException, AnsonException, GeneralSecurityException, IOException {
		mList = new ArrayList<SyncDoc>(1);
		mList.add(new Photo().create("src/test/res/64x48.png"));
		
		onActCreate();

		Utils.logi("Press Enter when you think the test is finished ...");
		pause();
		Utils.logi(singleton.photoUser.device);
    }

	public static void pause() {
		try {
			BufferedReader reader = new BufferedReader(
	            new InputStreamReader(System.in));
			reader.readLine();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	void onActCreate() throws SemanticException, AnsonException, GeneralSecurityException, IOException {
		singleton = new AlbumContext()
			.init("f/zsu", "syrskyi", "junit.syrskyi", jserv)
			.login( "syrskyi", "слава україні",
					(client) -> refresh(mList),
					(c, t, v) -> fail(t));
	}

	void refresh(List<? extends SyncDoc> mlist) {
		synchPage = new DocsPage(0, Math.min(20, mlist.size()));
		synchPage.taskNo = 1;   // nextRandomInt();
		synchPage.device = singleton.photoUser.device;
		if (singleton.tier != null)
			startSynchQuery(synchPage);
	}

    void startSynchQuery(DocsPage page) {
        singleton.tier.asynQueryDocs(mList, page,
			onSyncQueryRespons,
			(c, r, args) -> {
				Utils.warn("%s, %s, %s", singleton.clientUri, r, args == null ? "null" : args[0]);
			});
    }

    JProtocol.OnOk onSyncQueryRespons = (resp) -> {
        DocsResp rsp = (DocsResp) resp;
        if (rsp == null || rsp.syncing() == null)
        	Utils.warn("OnSyncQueryRespons: Got response of empty synchronizing page.");
        else if (synchPage.taskNo == rsp.syncing().taskNo && synchPage.end < mList.size()) {
            HashMap<String, String[]> phts = rsp.syncPaths();
            for (int i = synchPage.start; i < synchPage.end; i++) {
                SyncDoc f = mList.get(i);
                if (phts.keySet().contains(f.fullpath())) {
                	assertEquals(singleton.photoUser.device, f.device());
                	assertEquals(3, phts.get(f.fullpath()).length, "needing sync, share, share-date");
                }
            }

            // updateIcons(synchPage);

            if (mList.size() >= synchPage.end) {
                synchPage.nextPage(Math.min(20, mList.size() - synchPage.end));
                startSynchQuery(synchPage);
            }
        }
    };
}