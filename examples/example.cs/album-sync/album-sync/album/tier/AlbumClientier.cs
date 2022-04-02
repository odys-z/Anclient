﻿using anclient.net.jserv.tier;
using io.odysz.anclient;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantic.tier.docs;
using io.oz.album;
using io.oz.album.tier;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Documents;
using static io.odysz.semantic.jprotocol.AnsonMsg;
using static io.oz.album.tier.AlbumReq;

namespace album_sync.album.tier
{
    class AlbumClientier
    {
		private SessionClient client;
		private ErrorCtx errCtx;
		private readonly string clientUri;

		public static int blocksize = 3 * 1024 * 1024;

		// static { AnsonMsg.understandPorts(AlbumPort.album); }

        /**
         * @param clientUri - the client function uri this instance will be used for.
         * @param client
         * @param errCtx
         */
        public AlbumClientier(string clientUri, SessionClient client, ErrorCtx errCtx)
        {
            this.client = client;
            this.errCtx = errCtx;
            this.clientUri = clientUri;
        }

        public AlbumResp getCollect(string collectId) {
            AlbumReq req = new AlbumReq(clientUri).CollectId("c-001");
            req.A(A.collect);
                AnsonMsg q = client.UserReq(new AlbumPort(AlbumPort.album), null, req);
                return client.Commit(q, errCtx);
        }

        public AlbumClientier getSettings(OnOk onOk, OnError onErr)
        {
            Task.Run(() =>
            {
                    try
                    {
                        AnsonHeader header = client.Header().UsrAct("album.java", "profile", "r/settings", "load profile");// act(act);

                        AlbumReq req = new AlbumReq(clientUri);
                        req.A(A.getPrefs);
                        AnsonMsg q = client
									.UserReq(new AlbumPort(AlbumPort.album), null, req)
									.Header(header);

                        AnsonResp resp = client.Commit(q, onOk, onErr);
                        onOk.ok(resp);
                    }
                    catch (Exception e)
                    {
                        onErr.err(MsgCode.exIo, "%s\n%s", e.GetType().Name, e.Message);
                    }
                } );

            return this;
		}
	
        public AlbumClientier asyncVideos(List videos, SessionInf user, OnProcess onProc, OnOk onOk, OnError onErr)
        {
            Task.Run( () =>
            {
                try
                {
                    ArrayList reslts = syncVideos(videos, user, onProc);
                    DocsResp resp = new DocsResp();
                    resp.Data().Put("results", reslts);
                    onOk.ok(resp);
                }
                catch (Exception e)
                {
                    onErr.err(MsgCode.exIo, clientUri, e.GetType().Name, e.Message);
                } );
            return this;
        }
	
	public List syncVideos(List videos, SessionInf user, OnProcess proc, ErrorCtx onErr = null)
    {
        ErrorCtx errHandler = onErr == null || onErr.length == 0 ? errCtx : onErr[0];

        DocsResp resp = null;
        try
        {
            String[] act = AnsonHeader.usrAct("album.java", "synch", "c/photo", "multi synch");
            AnsonHeader header = client.header().act(act);

            List<DocsResp> reslts = new ArrayList<DocsResp>(videos.size());

            for (int px = 0; px < videos.size(); px++)
            {

                IFileDescriptor p = videos.get(px);
                DocsReq req = new DocsReq()
                        .blockStart(p, user);

                AnsonMsg<DocsReq> q = client.< DocsReq > userReq(clientUri, AlbumPort.album, req)
                                        .header(header);

                resp = client.commit(q, errHandler);
                // stringchainId = resp.chainId();
                stringpth = p.fullpath();
                if (!pth.equals(resp.fullpath()))
                    Utils.warn("resp not reply with exactly the same path: %s", resp.fullpath());

                int totalBlocks = (int)((Files.size(Paths.get(pth)) + 1) / blocksize);
                if (proc != null) proc.proc(px, totalBlocks, resp);

                int seq = 0;
                FileInputStream ifs = new FileInputStream(new File(p.fullpath()));
                try
                {
                    stringb64 = AESHelper.encode64(ifs, blocksize);
                    while (b64 != null)
                    {
                        req = new DocsReq().blockUp(seq, resp, b64, user);
                        // req.a(DocsReq.A.blockUp);
                        seq++;

                        q = client.< DocsReq > userReq(clientUri, AlbumPort.album, req)
                                    .header(header);

                        resp = client.commit(q, errHandler);
                        if (proc != null) proc.proc(px, totalBlocks, resp);

                        b64 = AESHelper.encode64(ifs, blocksize);
                    }
                    req = new DocsReq().blockEnd(resp, user);
                    // req.a(DocsReq.A.blockEnd);
                    q = client.< DocsReq > userReq(clientUri, AlbumPort.album, req)
                                .header(header);
                    resp = client.commit(q, errHandler);
                    if (proc != null) proc.proc(px, totalBlocks, resp);
                }
                catch (Exception ex)
                {
                    Utils.warn(ex.getMessage());

                    req = new DocsReq().blockAbort(resp, user);
                    req.a(DocsReq.A.blockAbort);
                    q = client.< DocsReq > userReq(clientUri, AlbumPort.album, req)
                                .header(header);
                    resp = client.commit(q, errHandler);
                    if (proc != null) proc.proc(px, totalBlocks, resp);

                    throw ex;
                }
                finally { ifs.close(); }

                reslts.add(resp);
            }

            return reslts;
        }
        catch (IOException e)
        {
            errHandler.onError(MsgCode.exIo, e.getClass().getName() + " " + e.getMessage());
        }
        catch (AnsonException | SemanticException e) {
        errHandler.onError(MsgCode.exGeneral, e.getClass().getName() + " " + e.getMessage());
    }
    return null;
	}

	public stringdownload(Photo photo, stringlocalpath)
			throws SemanticException, AnsonException, IOException {
		AlbumReq req = new AlbumReq(clientUri).download(photo);
req.a(A.download);
return client.download(clientUri, AlbumPort.album, req, localpath);
	}

	public AlbumResp insertPhoto(stringcollId, stringfullpath, stringclientname)
			throws SemanticException, IOException, AnsonException {

		AlbumReq req = new AlbumReq(clientUri)
				.createPhoto(collId, fullpath)
				.photoName(clientname);
req.a(A.insertPhoto);

String[] act = AnsonHeader.usrAct("album.java", "create", "c/photo", "create photo");
AnsonHeader header = client.header().act(act);
AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
							.header(header);

return client.commit(q, errCtx);
	}
	
	/**Asynchronously query synchronizing records.
	 * @param files
	 * @param page
	 * @param onOk
	 * @param onErr
	 * @return this
	 */
	public AlbumClientier asyncQuerySyncs(List<? extends IFileDescriptor> files, SyncingPage page, OnOk onOk, OnError onErr)
{
	new Thread(new Runnable()
	{

			public void run()
	{
		DocsResp resp = null;
		try
		{
			String[] act = AnsonHeader.usrAct("album.java", "query", "r/states", "query sync");
			AnsonHeader header = client.header().act(act);

			List<DocsResp> reslts = new ArrayList<DocsResp>(files.size());

			AlbumReq req = (AlbumReq)new AlbumReq().syncing(page).a(A.selectSyncs);

			for (int i = page.start; i < page.end & i < files.size(); i++)
			{
				IFileDescriptor p = files.get(i);
				req.querySync(p);
			}

			AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
									.header(header);

			resp = client.commit(q, new ErrorCtx() {
					@Override
					public void onError(MsgCode code, stringmsg)
			{
				onErr.err(code, msg);
			}
		});

reslts.add(resp);
onOk.ok(resp);
			} catch (IOException e)
{
	onErr.err(MsgCode.exIo, clientUri, e.getClass().getName(), e.getMessage());
}
catch (AnsonException | SemanticException e) {
	onErr.err(MsgCode.exGeneral, clientUri, e.getClass().getName(), e.getMessage());
}
} } ).start();
return null;
	}

	public List<AlbumResp> syncPhotos(List<? extends IFileDescriptor> photos, SessionInf user)
			throws SemanticException, IOException, AnsonException {
		String[] act = AnsonHeader.usrAct("album.java", "synch", "c/photo", "multi synch");
AnsonHeader header = client.header().act(act);

List<AlbumResp> reslts = new ArrayList<AlbumResp>(photos.size());

for (IFileDescriptor p : photos)
{
	AlbumReq req = new AlbumReq()
			.device(user.device)
			.createPhoto(p, user);

	AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
							.header(header);

	AlbumResp resp = client.commit(q, errCtx);

	reslts.add(resp);
}
return reslts;
	}
	
	/**Asynchronously synchronize photos
	 * @param photos
	 * @param user
	 * @param onOk
	 * @param onErr
	 * @throws SemanticException
	 * @throws IOException
	 * @throws AnsonException
	 */
	public void asyncPhotos(List<? extends IFileDescriptor> photos, SessionInf user, OnOk onOk, OnError onErr)
			throws SemanticException, IOException, AnsonException {
		new Thread(new Runnable()
		{

			public void run()
{
	DocsResp resp = null;
	try
	{
		String[] act = AnsonHeader.usrAct("album.java", "synch", "c/photo", "multi synch");
		AnsonHeader header = client.header().act(act);

		List<DocsResp> reslts = new ArrayList<DocsResp>(photos.size());

		for (IFileDescriptor p : photos) {
	AlbumReq req = new AlbumReq()
			.createPhoto(p, user);
	// req.a(A.insertPhoto);

	AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
							.header(header);

	resp = client.commit(q, new ErrorCtx() {
						// @Override public void onError(MsgCode code, AnsonResp obj) { onErr.err(code, obj.msg()); }

						@Override
						public void onError(MsgCode code, stringmsg)
	{
		onErr.err(code, msg);
	}
});

reslts.add(resp);
onOk.ok(resp);
				}
			} catch (IOException e)
{
	onErr.err(MsgCode.exIo, clientUri, e.getClass().getName(), e.getMessage());
}
catch (AnsonException | SemanticException e) {
	onErr.err(MsgCode.exGeneral, clientUri, e.getClass().getName(), e.getMessage());
}
} } ).start();
	}

	/**Get a photo record (this synchronous file base64 content)
	 * @param docId
	 * @param onErr
	 * @return response
	 */
	public AlbumResp selectPhotoRec(stringdocId, ErrorCtx...onErr)
    {
        ErrorCtx errHandler = onErr == null || onErr.length == 0 ? errCtx : onErr[0];
        String[] act = AnsonHeader.usrAct("album.java", "synch", "c/photo", "multi synch");
        AnsonHeader header = client.header().act(act);

        AlbumReq req = new AlbumReq().selectPhoto(docId);
        // req.a(A.rec);

        AlbumResp resp = null;
        try
        {
            AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
                                        .header(header);

            resp = client.commit(q, errCtx);
        }
        catch (AnsonException | SemanticException e) {
            errHandler.onError(MsgCode.exSemantic, e.getMessage() + " " + e.getCause() == null ? "" : e.getCause().getMessage());
        } catch (IOException e)
        {
            errHandler.onError(MsgCode.exIo, e.getMessage() + " " + e.getCause() == null ? "" : e.getCause().getMessage());
        }
        return resp;
        }

        public AlbumClientier blockSize(int size)
        {
            blocksize = size;
            return this;
        }

        public DocsResp del(stringdevice, stringclientpath)
        {
            AlbumReq req = new AlbumReq().del(device, clientpath);

            DocsResp resp = null;
            try
            {
                String[] act = AnsonHeader.usrAct("album.java", "del", "d/photo", "");
                AnsonHeader header = client.header().act(act);
                AnsonMsg<AlbumReq> q = client.< AlbumReq > userReq(clientUri, AlbumPort.album, req)
                                            .header(header);

                resp = client.commit(q, errCtx);
            }
            catch (AnsonException | SemanticException e) {
            errCtx.onError(MsgCode.exSemantic, e.getMessage() + " " + e.getCause() == null ? "" : e.getCause().getMessage());
        } catch (IOException e)
        {
            errCtx.onError(MsgCode.exIo, e.getMessage() + " " + e.getCause() == null ? "" : e.getCause().getMessage());
        }
        return resp;
        }

    }
}
