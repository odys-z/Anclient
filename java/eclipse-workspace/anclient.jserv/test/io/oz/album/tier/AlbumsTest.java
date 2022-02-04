package io.oz.album.tier;

import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.IOException;
import java.util.function.Supplier;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;
import org.vishag.async.AsyncSupplier;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.jclient.Clients;
import io.odysz.jclient.InsecureClient;
import io.odysz.jclient.SessionClient;
import io.odysz.jclient.StreamClient;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantics.IUser;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.album.AlbumTier;

/**
 * <pre>INSERT INTO h_photos (pid,uri,pname,pdate,cdate,tags,oper,opertime) VALUES
	 ('test-00000','omni/ody/2019_08/DSC_0005.JPG','DSC_0005.JPG','2019-08-24','2021-08-24','#Qing Hai Lake','ody','2022-01-13'),
	 ('test-00001','omni/ody/2019_08/DSC_0124.JPG','DSC_0124.JPG','2019-08-24','2021-08-24','#Qing Hai Lake','ody','2022-01-13'),
	 ('test-00002','omni/ody/2021_08/IMG_20210826.jgp','IMG_20210826.jgp','2019-08-24 15:44:30','2021-08-26','#Lotus Lake','ody','2022-01-13'),
	 ('test-00003','omni/ody/2021_10/IMG_20211005.jgp','IMG_20211005.jgp','2019-10-05 11:19:18','2021-10-05','#Song Gong Fort','ody','2022-01-13'),
	 ('test-00004','omni/ody/2021_12/DSG_0753.JPG','DSG_0753.JPG','2021-12-05','2021-12-05','#Garze','ody','2022-01-13'),
	 ('test-00005','omni/ody/2021_12/DSG_0827.JPG','DSG_0827.JPG','2021-12-05','2021-12-05','#Garze','ody','2022-01-13'),
	 ('test-00006','omni/ody/2021_12/DSG_0880.JPG','DSG_0880.JPG','2021-12-31','2021-12-31','#Toronto','ody','2022-01-13');
   </pre>
 * @author ody
 *
 */
class AlbumsTest {
	static String jserv;

	static IUser robot;
	/** local working dir */
	static String local;
	
	static InsecureClient client;

	static ErrorCtx errCtx;

	static {
		try {
			jserv = "http://localhost:8080/jserv-album";
			Clients.init(jserv);

			client = new InsecureClient(jserv);
			local = new File("src/test/local").getAbsolutePath();
			
			SessionClient.verbose(true);
			Anson.verbose(true);

			errCtx = new ErrorCtx() {
				public void onError(MsgCode c, AnsonResp rep) {
					fail(rep.msg()); 
				}
			};
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

//	@SuppressWarnings("unchecked")
//	@Test
//	void testUpload() throws SemanticException, TransException, SQLException {
//		AlbumReq req = new AlbumReq("/local/test");
//		req.a(A.insert);
//		req.albumId = "a-001";
//		
//		AlbumResp resp = Albums.album(req, robot);
//		Photo photoRec = resp.collects[0][0];
//		
//		String localPath = "my.jpg";
//		Supplier<String>[] resultSuppliers = null;
//		try {
//			resultSuppliers = AsyncSupplier.getDefault().submitSuppliers(
//						() -> new StreamClient<Photo>().upload(photoRec, localPath) );
//		}
//		catch (Exception ex) {
//			fail(ex.getMessage());
//		}
//	}

	@SuppressWarnings("unchecked")
	@Test
	void testDownload() throws SemanticException, TransException, IOException {

		AlbumResp resp = getCollection("c-001");
		Photo[] collect = resp.photos.get(0);
		Photo ph1 = collect[0];
		FileUtils.delete(new File(ph1.pname));
		Photo ph2 = collect[1];
		FileUtils.delete(new File(ph2.pname));
		Photo ph3 = collect[2];
		FileUtils.delete(new File(ph3.pname));
	
		Supplier<String>[] resultSuppliers = null;
		try {
			resultSuppliers = AsyncSupplier.getDefault().submitSuppliers(
				     () -> getDownloadResult(ph1, ph1.pname),
				     () -> getDownloadResult(ph2, ph2.pname),
				     () -> getDownloadResult(ph3, ph3.pname)
				   );
		}
		catch (Exception ex) {
			fail(ex.getMessage());
		}

		String a = resultSuppliers[0].get();
		assertTrue(a.toLowerCase().contains(".jpg"));
		assertTrue(FileUtils.sizeOf(new File(a)) > 5000);

		String b = resultSuppliers[1].get();
		assertTrue(b.toLowerCase().contains(".jpg"));
		assertTrue(FileUtils.sizeOf(new File(b)) > 5000);

		String c = resultSuppliers[2].get();
		assertTrue(c.toLowerCase().contains(".jpg"));
		assertTrue(FileUtils.sizeOf(new File(c)) > 5000);
	}

	AlbumResp getCollection(String collectId) {
		AlbumTier tier = new AlbumTier(client, errCtx);
		try {
			return tier.getCollect(collectId);
		} catch (SemanticException | IOException | AnsonException e) {
			e.printStackTrace();
			fail(e.getMessage());
			return null;
		}
	}

	String getDownloadResult(Photo photo, String filepath) {
		try {
			AlbumReq req = new AlbumReq().photo(photo);
			return new StreamClient(jserv).download(req, filepath);
		} catch (IOException | AnsonException e) {
			e.printStackTrace();
			return null;
		}
	}
}
