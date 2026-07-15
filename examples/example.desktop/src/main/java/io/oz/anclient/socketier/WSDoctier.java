package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.Utils.warn;
import static io.oz.anclient.ipcagent.SingleAgent.getInstance;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnDocsOk;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.app.DesktopSettings;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IWSPoint;
import io.oz.anclient.ipcagent.SingleAgent;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WServPort;
import io.oz.syndoc.client.AsynClientier;

import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class WSDoctier implements IWSPoint  {
	final WServPort socket;
	final DesktopSettings settings;

	@Override
	public IPort port() {
		return WSPort.docstier;
	}

	public WSDoctier(WServPort wsSocket) throws SemanticException {
		this.socket = wsSocket;
		settings = SingleAgent.getInstance().settings();
	}
	
	@Override
	public void onMessage(AnsonMsg<? extends AnsonBody> ansonMsg, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException {

		DocsReq req = (DocsReq) ansonMsg.body(0); 
		DocsResp resp;
		if (DocsReq.A.requestSyn == req.a())
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

			try { sr.sendText(getInstance().ver(rep).toBlock());
			} catch (AnsonException | IOException e) {
				e.printStackTrace();
			}
    	};
    }

    ExpSyncDoc templtDoc = new ExpSyncDoc();
	
	DocsResp onResuestSyn(Basic sr, Async ar, DocsReq req) throws SemanticException {
		DocsResp resp = new DocsResp()
							.doc(new ExpSyncDoc()
							.device(req.doc().device()));

		placePushsTask(sr, templtDoc, req.docTabl, videos(req),
			(rx, rows, bx, blocks, rep) -> {
				rep.msg(String.format("%d,%d,%d,%d,rx rows bx blocks", rx, rows, bx, blocks));
				sr.sendText(rep.toBlock());
				return false;
			},
			// pushsOk,
			(synrep) -> {
				AnsonMsg<AnsonResp> repmsg = new AnsonMsg<AnsonResp>();
				repmsg.bodys(synrep);
				sr.sendText(repmsg.toBlock());
			},
			getErr(sr));
		return resp;
	}

	private void placePushsTask(Basic sr, ExpSyncDoc doc0, String doctbl,
			List<IFileDescriptor> docs, OnProcess proc, OnDocsOk ok, OnError err) {
		if (docs.size() > 0) {
			new Thread(() -> {
				try {
					AsynClientier asyclient = new AsynClientier(settings.sysuri, settings.synuri, getErr(sr));
					asyclient.asyVideos(doc0, docs, proc, ok, err);
				} catch (DocsException e) {
					getErr(sr).err(MsgCode.ext, e.getMessage(), e.getClass().getName());
				} catch (TransException e) {
					e.printStackTrace();
					getErr(sr).err(MsgCode.exTransct, e.getMessage(), e.getClass().getName());
				} catch (IOException e) {
					e.printStackTrace();
					getErr(sr).err(MsgCode.exIo, e.getMessage(), e.getClass().getName());
				} catch (Exception e) {
					e.printStackTrace();
					getErr(sr).err(MsgCode.exGeneral, e.getMessage(), e.getClass().getName());
				}
			}).start();
		}
	}

	private List<IFileDescriptor> videos(DocsReq req) throws SemanticException {
		mustnonull(req.syncingPage());
		mustnonull(req.syncingPage().paths());

		List<IFileDescriptor> vids = new ArrayList<IFileDescriptor>(req.syncingPage().end() - req.syncingPage().start());
		for (String p : req.syncingPage().paths().keySet()) {
			ExpSyncDoc d = new ExpSyncDoc();
			d.clientpath = p;
			vids.add(d);
		}
		return vids;
	}

}
