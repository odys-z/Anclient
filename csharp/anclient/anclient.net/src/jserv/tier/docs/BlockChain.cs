//using io.odysz.anson.src.common;
//using System.IO;

//namespace io.odysz.semantic.tier.docs {

///**
// * Blocks stream, not that block chain:)
// * @author ody
// *
// */
//public class BlockChain {

//	// public final string ssId;
//	public readonly string clientpath;
//	public readonly string clientname;
//	public readonly string cdate;

//	// protected final string tempFolder;
//	public readonly string outputPath;
//	// protected readonly OutputStream ofs;
	
//	protected readonly DocsReq waitings;

//	/**Create file output stream to $VALUME_HOME/userid/ssid/clientpath
//	 * 
//	 * @param tempDir
//	 * @param clientpathRaw - client path that can match at client's environment (saving at server side replaced some special characters)
//	 * @param createDate 
//	 * @throws IOException
//	 * @throws TransException 
//	public BlockChain(string tempDir, string clientpathRaw, string createDate)
//	{
//		if (LangExt.isBlank(clientpathRaw))
//			throw new transact.x.TransException("Client path is neccessary to start a block chain transaction.");

//		this.cdate = createDate;
//		this.clientpath = clientpathRaw;

//		// tempDir = FilenameUtils.concat(rootpath, userId, "uploading-temp", ssId);

//		string clientpath = clientpathRaw.Replace("^/", "");
//		clientpath = clientpath.Replace(":", "");

//		clientname = Path.GetFileName(clientpath);
//		outputPath = EnvPath.decodeUri(tempDir, clientpath);

//		string parentpath = FilenameUtils.getFullPath(outputPath);
//		new File(parentpath).mkdirs(); 

//		File f = new File(outputPath);
//		f.createNewFile();
//		this.ofs = new FileOutputStream(f);

//		waitings = new DocsReq().blockSeq(-1);
//	}
//	 */

//		/*
//	public BlockChain appendBlock(DocsReq blockReq) throws IOException, TransException {
//		DocsReq pre = waitings;
//		DocsReq nxt = waitings.nextBlock;

//		while (nxt != null && nxt.blockSeq < blockReq.blockSeq) {
//				pre = nxt;
//				nxt = nxt.nextBlock;
//		}
//		pre.nextBlock = blockReq;
//		blockReq.nextBlock = nxt;

//		// assertNotNull(ofs); makes out going stream in trouble?
//		if (ofs == null) throw new IOException("Output stream broken!");
//		if (waitings.nextBlock != null && waitings.blockSeq >= waitings.nextBlock.blockSeq)
//			throw new TransException("Handling block's sequence error.");

//		while (waitings.nextBlock != null && waitings.blockSeq + 1 == waitings.nextBlock.blockSeq) {
//			ofs.write(AESHelper.decode64(waitings.nextBlock.uri64));

//			waitings.blockSeq = waitings.nextBlock.blockSeq;
//			waitings.nextBlock = waitings.nextBlock.nextBlock;
//		}
//		return this;
//	}

//	public void abortChain() throws IOException, InterruptedException, TransException {
//		if (waitings.nextBlock != null)
//			Thread.sleep(1000);

//		ofs.close();

//		try { Files.delete(Paths.get(outputPath)); }
//		catch (IOException e) { e.printStackTrace(); }

//		if (waitings.nextBlock != null)
//			// some packages lost
//			throw new TransException("Some packages lost. path: %s", clientpath);
//	}

//	public string closeChain() throws IOException, InterruptedException, TransException {
//		if (waitings.nextBlock != null)
//			Thread.sleep(1000);

//		ofs.close();

//		if (waitings.nextBlock != null) {
//			try { Files.delete(Paths.get(outputPath)); }
//			catch (IOException e) { e.printStackTrace(); }

//			// some packages lost
//			throw new TransException("Some packages lost. path: %s", clientpath);
//		}

//		return outputPath;
//	}
//		*/
//} }
