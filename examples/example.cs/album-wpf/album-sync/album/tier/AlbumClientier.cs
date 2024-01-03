using anclient.net.jserv.tier;
using io.odysz.anclient;
using io.odysz.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantic.tier.docs;
using io.odysz.semantics.x;
using io.odysz.tier;
using io.oz.album;
using io.oz.album.tier;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using TestAnson.net.semantics.io.odysz.x;
using static io.odysz.semantic.jprotocol.AnsonMsg;
using static io.odysz.semantic.jprotocol.JProtocol;
using static io.oz.album.tier.AlbumReq;

namespace album_sync.album.tier
{
    public class AlbumClientier
    {
		private SessionClient client;
		private ErrorCtx errCtx;
		private readonly string uri;

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
            this.uri = clientUri;
        }

        public AlbumResp getCollect(string collectId) {
            AlbumReq req = new AlbumReq(uri).CollectId("c-001");
            req.A(A.collect);
                AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), null, req);
            return (AlbumResp) client.Commit(q, errCtx);
        }

        public AlbumClientier getSettings(OnOk onOk, OnError onErr)
        {
            Task.Run(() =>
            {
                    try
                    {
                        AnsonHeader header = client
                            .Header()
                            .UsrAct("album.c#", "profile", "r/settings", "load profile");

                        AlbumReq req = new AlbumReq(uri);
                        req.A(A.getPrefs);
                        AnsonMsg q = client
									.UserReq(uri, new AlbumPort(AlbumPort.album), null, req)
									.Header(header);

                        client.CommitAsync(q, onOk, onErr);
                    }
                    catch (Exception e)
                    {
                        onErr.err(new MsgCode(MsgCode.exIo), string.Format("%s\n%s", e.GetType().Name, e.Message));
                    }
                } );

            return this;
		}
	
        public AlbumClientier asyncVideos(IList<IFileDescriptor> videos, SessionInf user, OnProcess onProc, OnOk onOk, OnError onErr)
        {
            Task.Run( () =>
            {
                try
                {
                    IList<DocsResp> reslts = syncVideos(videos, user, onProc);
                    DocsResp resp = new DocsResp();
                    resp.Data()["results"] = reslts;
                    onOk.ok(resp);
                }
                catch (Exception e)
                {
                    onErr.err(new MsgCode(MsgCode.exIo), uri, new string[] { e.GetType().Name, e.Message });
                }
            } );
            return this;
        }
	
        public IList<DocsResp> syncVideos(IList<IFileDescriptor> videos, SessionInf user, OnProcess proc, ErrorCtx onErr = null)
        {
            ErrorCtx errHandler = onErr == null ? errCtx : onErr;

            DocsResp resp = null;
            try
            {
                AnsonHeader header = client.Header().act(new string[] { "album.c#", "synch", "c/photo", "multi synch" });

                IList<DocsResp> reslts = new List<DocsResp>(videos.Count);

                for (int px = 0; px < videos.Count; px++)
                {

                    IFileDescriptor p = videos[px];
                    DocsReq req = new DocsReq()
                            .blockStart(p, user);

                    AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                            .Header(header);

                    resp = (DocsResp)client.Commit(q, errHandler);
                    // stringchainId = resp.chainId();
                    string pth = p.fullpath();
                    if (pth != resp.Fullpath())
                        Utils.Warn("resp not reply with exactly the same path: %s", resp.Fullpath());

                    int totalBlocks = (int)((new FileInfo(pth).Length + 1) / blocksize);
                    if (proc != null) proc.proc(px, totalBlocks, resp);

                    int seq = 0;
                    FileStream ifs = File.Create(p.fullpath());
                    try
                    {
                        string b64 = AESHelper.Encode64(ifs, blocksize);
                        while (b64 != null)
                        {
                            req = new DocsReq().blockUp(seq, resp, b64, user);
                            seq++;

                            q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                        .Header(header);

                            resp = (DocsResp)client.Commit(q, errHandler);
                            if (proc != null) proc.proc(px, totalBlocks, resp);

                            b64 = AESHelper.Encode64(ifs, blocksize);
                        }
                        req = new DocsReq().blockEnd(resp, user);
                        q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                    .Header(header);

                        resp = (DocsResp)client.Commit(q, errHandler);
                        if (proc != null) proc.proc(px, totalBlocks, resp);
                    }
                    catch (Exception ex)
                    {
                        Utils.Warn(ex.Message);

                        req = new DocsReq().blockAbort(resp, user);
                        req.A(DocsReq.A.blockAbort);
                        q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                    .Header(header);
                        resp = (DocsResp)client.Commit(q, errHandler);
                        if (proc != null) proc.proc(px, totalBlocks, resp);

                        throw ex;
                    }
                    finally { ifs.Close(); }

                    reslts.Add(resp);
                }

                return reslts;
            }
            catch (Exception e)
            {
                errHandler.onError(new MsgCode(MsgCode.exIo), e.GetType().Name + " " + e.Message);
            }
            return null;
        }

        public string download(Photo photo, string localpath) {
            AlbumReq req = new AlbumReq(uri).download(photo);
            req.A(A.download);
            return client.download(uri, new AlbumPort(AlbumPort.album), req, localpath);
        }

        public AlbumResp insertPhoto(string collId, string fullpath, string clientname) {

            AlbumReq req = new AlbumReq(uri)
                    .createPhoto(collId, fullpath)
                    .photoName(clientname);
            req.A(A.insertPhoto);

            AnsonHeader header = client.Header().act("album.c#", "create", "c/photo", "create photo");
            AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                        .Header(header);

            return (AlbumResp)client.Commit(q, errCtx);
        }

        /// <summary>
        /// Asynchronously query synchronizing records.
        /// </summary>
        /// <param name="files"></param>
        /// <param name="page"></param>
        /// <param name="onOk"></param>
        /// <param name="onErr"></param>
        /// <returns>this</returns>
        public AlbumClientier asyncQuerySyncs(IList<IFileDescriptor> files, SyncingPage page, OnOk onOk, OnError onErr)
        {
            Task.Run(() =>
            {
                DocsResp resp = null;
                try
                {
                    AnsonHeader header = client.Header().act("album.c#", "query", "r/states", "query sync");

                    List<DocsResp> reslts = new List<DocsResp>(files.Count);

                    AlbumReq req = (AlbumReq)new AlbumReq().Syncing(page).A(A.selectSyncs);

                    for (int i = page.start; i < page.end & i < files.Count; i++)
                    {
                        IFileDescriptor p = files[i];
                        req.querySync(p);
                    }

                    AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                            .Header(header);


                    resp = (DocsResp)client.Commit(q, errCtx);

                    reslts.Add(resp);

                    onOk.ok(resp);
                }
                catch (Exception e) {
                    onErr.err(new MsgCode(MsgCode.exIo), uri, new string[] { e.GetType().Name, e.Message });
                }
            });
            return this;
        }

        public List<AlbumResp> syncPhotos(List<IFileDescriptor> photos, SessionInf user) {
            AnsonHeader header = client.Header().act("album.c#", "synch", "c/photo", "multi synch");

            List<AlbumResp> reslts = new List<AlbumResp>(photos.Count);

            foreach (IFileDescriptor p in photos)
            {
                AlbumReq req = new AlbumReq()
                        .Device(user.device)
                        .createPhoto(p, user);

                AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                        .Header(header);

                AlbumResp resp = (AlbumResp)client.Commit(q, errCtx);

                reslts.Add(resp);
            }
            return reslts;
        }
	
        /// <summary>
        /// Asynchronously synchronize photos
        /// </summary>
        /// <param name="photos"></param>
        /// <param name="user"></param>
        /// <param name="onOk"></param>
        /// <param name="onErr"></param>
        /// <exception cref="SemanticException"></exception>
        /// <exception cref="SemanticException"></exception>
        /// <exception cref="IOException"></exception>
        /// <exception cref="AnsonException"></exception>
        public void asyncPhotos(List<IFileDescriptor> photos, SessionInf user, OnOk onOk, OnError onErr) {
            DocsResp resp = null;
            try
            {
                AnsonHeader header = client.Header().act("album.c#", "synch", "c/photo", "multi synch");

                List<DocsResp> reslts = new List<DocsResp>(photos.Count);

                foreach (IFileDescriptor p in photos) {
                    AlbumReq req = new AlbumReq()
                            .createPhoto(p, user);

                    AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                            .Header(header);

                    Task<AnsonResp> tresp = (Task<AnsonResp>)client.Commit_async(q, null, onErr);
                    tresp.Wait();
                    reslts.Add((DocsResp)tresp.Result);
                }
                onOk.ok(resp);
            } catch (Exception e)
            {
                onErr.err(new MsgCode(MsgCode.exIo), string.Format("%s, %s", e.GetType().Name, e.Message));
            }
        }

        /**Get a photo record (this synchronous file base64 content)
         * @param docId
         * @param onErr
         * @return response
         */
        public AlbumResp selectPhotoRec(string docId, ErrorCtx err = null)
        {
            ErrorCtx errHandler = err == null ? errCtx : err;
            AnsonHeader header = client.Header().act("album.c#", "synch", "c/photo", "multi synch");

            AlbumReq req = new AlbumReq().selectPhoto(docId);

            AlbumResp resp = null;
            try
            {
                AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                            .Header(header);

                resp = (AlbumResp)client.Commit(q, errCtx);
            }
            catch (Exception e) {
                if (e is AnsonException || e is SemanticException)
                    errHandler.onError(new MsgCode(MsgCode.exSemantic), e.Message + " " + e.Source == null ? "" : e.Source.GetType().Name);
                else
                    errHandler.onError(new MsgCode(MsgCode.exIo), e.Message + " " + e.Source == null ? "" : e.Source.GetType().Name);
            }
            return resp;
        }

        public AlbumClientier blockSize(int size)
        {
            blocksize = size;
            return this;
        }

        public DocsResp del(string device, string clientpath)
        {
            AlbumReq req = new AlbumReq().del(device, clientpath);

            DocsResp resp = null;
            try
            {
                AnsonHeader header = client.Header().act("album.c#", "del", "d/photo", "");
                AnsonMsg q = client.UserReq(uri, new AlbumPort(AlbumPort.album), req)
                                            .Header(header);

                resp = (DocsResp)client.Commit(q, errCtx);
            }
            catch (Exception e)
            {
                if ( e is AnsonException || e is SemanticException)
                    errCtx.onError(new MsgCode(MsgCode.exSemantic), e.Message + " " + e.Source == null ? "" : e.Source.GetType().Name);
                else
                    errCtx.onError(new MsgCode(MsgCode.exIo), e.Message + " " + e.Source == null ? "" : e.Source.GetType().Name);
            }
            return resp;
        }

    }
}
