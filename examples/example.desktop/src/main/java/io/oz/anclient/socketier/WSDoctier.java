package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.Utils.warn;
import static io.odysz.common.Utils.logi;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import io.odysz.anson.AnsonException;
import io.odysz.jclient.Clients.OnLogin;
import io.odysz.jclient.syn.IFileProvider;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.jsession.AnSessionResp;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.albumtier.AlbumContext.ConnState;
import io.oz.anclient.app.DesktopSettings;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IWSPoint;
import io.oz.anclient.ipcagent.SingleAgent;
import io.oz.anclient.ipcagent.WServPort;
import io.oz.syndoc.client.AsynClientier;

import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class WSDoctier implements IWSPoint  {
	final WServPort socket;
	final DesktopSettings settings;

	@Override
	public IPort port() {
		return Port.docstier;
	}

	public WSDoctier(WServPort wsSocket) throws SemanticException, IOException {
		this.socket = wsSocket;
		settings = SingleAgent.getInstance().settings();
		mustnonull(settings);
	}
	
	@Override
	public void onMessage(AnsonMsg<? extends AnsonBody> ansonMsg, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException {

		DocsReq req = (DocsReq) ansonMsg.body(0); 
		DocsResp resp;
		if (eq(DocsReq.A.requestSyn, req.a()))
			resp = onResuestSyn(synremote, asyremote, req);
		else
			throw new IPCException(MsgCode.ext, "WSDoctier: cannont understand act: %s.", req.a());
		
		socket.<AnsonResp>ok(synremote, port(),
				(DocsResp)resp
				.uri(req.uri())
				.a(req.a()));
	}

    OnError getErr(Basic sr) {
    	return (c, err, args) -> {
			DocsResp rp = new DocsResp();
			warn("%s, %s", c, err);
			rp.msg(err);
			AnsonMsg<DocsResp> rep = new AnsonMsg<DocsResp>(port(), c);
			rep.body(rp);

			try { logi(rep.toBlock()); }
			catch (Exception e) { }

			try { sr.sendText(rep.toBlock());
			} catch (AnsonException | IOException e) {
				e.printStackTrace();
			}
    	};
    }
    
    /**
     * Start heart beating.
     * @param sr
     * @return callback to start
     */
    OnLogin getLogin(Basic sr) {
    	return (client) -> {
			synlink_state = ConnState.Online;
			client.openLink(settings.sysuri,
					// on link ok
					(rep) -> { logi("heartbeat to synode is broken."); },
					// on link break
					(c, e, args) -> { logi("heartbeat to synode is broken."); },
					19900); // 4 times failed in 3 min

			DocsResp rp = new DocsResp();
			rp.msg("Logged into " + settings.synode_id);
			AnsonMsg<DocsResp> rep = new AnsonMsg<DocsResp>(port(), MsgCode.ok);
			rep.body(rp);

			try { sr.sendText(rep.toBlock()); }
			catch (AnsonException | IOException e) {
				e.printStackTrace();
			}
		};
    }

    ExpSyncDoc templtDoc = new ExpSyncDoc();
	
	DocsResp onResuestSyn(Basic sr, Async ar, DocsReq req)
			throws SemanticException, IOException, AnsonException, SsException {

		mustnonull(req.device());

		DocsResp resp = new DocsResp()
							.doc(new ExpSyncDoc()
							.device(req.device()));

		List<String> problematics = new ArrayList<String>();
		List<IFileDescriptor> uploadings = videos(req, problematics);
		
		if (problematics.size() > 0) {
			getErr(sr).err(MsgCode.exIo, "On fiel verification failed:", (String[]) problematics.toArray());
		}
			
		if (uploadings.size() > 0)
		placePushsTask(sr, templtDoc, req.docTabl, uploadings,
			(rx, rows, bx, blocks, repbd) -> {
				repbd.msg(String.format("%d,%d,%d,%d,rx rows bx blocks", rx, rows, bx, blocks));
				AnsonMsg<AnsonResp> repmsg = new AnsonMsg<AnsonResp>(Port.docstier, MsgCode.ok);
				repmsg.body(repbd);
				sr.sendText(repmsg.toBlock());
				return false;
			},
			// pushsOk,
			(synrep) -> {
				AnsonMsg<AnsonResp> repmsg = new AnsonMsg<AnsonResp>(Port.docstier, MsgCode.ok);
				if (synrep.size() == 0)
					repmsg.body(new DocsResp().msg("No files has been pushed."));
				else
					repmsg.bodys(synrep);
				sr.sendText(repmsg.toBlock());
			},
			(client) -> {
				// TODO start hearbeat...

				// relay the response
				AnsonMsg<AnsonResp> repmsg = new AnsonMsg<AnsonResp>(Port.docstier, MsgCode.ok);
				AnSessionResp rp = new AnSessionResp();
				repmsg.body(rp);
				try {
					sr.sendText(repmsg.toBlock());
				} catch (AnsonException | IOException e) {
					e.printStackTrace();
				}
			},
			getErr(sr));
		return resp;
	}
	
	ConnState synlink_state = ConnState.Disconnected;

	AsynClientier synodeclient;

	private void placePushsTask(Basic sr, ExpSyncDoc doc0, String doctbl, List<IFileDescriptor> docs,
				OnProcess proc, OnDocsOk ok, OnLogin onlogin, OnError err)
				throws SemanticException, IOException, AnsonException, SsException {
		if (docs.size() > 0) {
			if (synodeclient == null) {
				synodeclient = new AsynClientier(settings.sysuri, settings.synuri, getErr(sr));
				synodeclient.fileProvider(new IFileProvider() {});
			}
			if (synodeclient.client == null) {
				mustnonull(settings.synode_jserv, "settings.synode_jserv is null!"); // check here, not at initiating
	        	synodeclient.loginWithUri(settings.synode_jserv,
	        						settings.admin, settings.device, settings.token);
			}
			synodeclient.asyVideos(doc0, docs, proc, ok, err);
		}
	}

	private List<IFileDescriptor> videos(DocsReq req, List<String> problematics) throws SemanticException {
		mustnonull(req.syncingPage());
		mustnonull(req.syncingPage().paths());
		mustnonull(req.device());
		mustnonull(req.device().id, "device id is null");

		List<IFileDescriptor> vids = new ArrayList<IFileDescriptor>();
		for (String p : req.syncingPage().paths().keySet()) {
			ExpSyncDoc d = new ExpSyncDoc();
			try {
				d.clientpath(p).device(req.device()).figure_locally();
			} catch (IOException e) {
				problematics.add(p);
			}
			vids.add(d);
		}
		return vids;
	}

}
