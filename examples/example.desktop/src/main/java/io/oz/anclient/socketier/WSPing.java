package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.mustnonull;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import io.odysz.anson.AnsonException;
import io.odysz.semantic.jprotocol.AnsonBody;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.MsgCode;
import io.odysz.semantic.jprotocol.AnsonResp;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantic.jprotocol.JProtocol.OnError;
import io.odysz.semantic.jprotocol.JProtocol.OnOk;
import io.odysz.semantic.jprotocol.JProtocol.OnProcess;
import io.odysz.semantic.jserv.x.SsException;
import io.odysz.semantic.tier.docs.DocsException;
import io.odysz.semantic.tier.docs.DocsReq;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.WSPointPort;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WServPoint;
import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class WSPing implements WSPointPort {
	final WServPoint socket;

	@Override
	public IPort port() {
		return WSPort.ping;
	}

	public WSPing(WServPoint wsSocket) {
		this.socket = wsSocket;
	}
	
	@Override
	public void onMessage(AnsonMsg<? extends AnsonBody> ansonMsg, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException {

		DocsReq req = (DocsReq) ansonMsg.body(0); 
		DocsResp resp;
		if (DocsReq.A.requestSyn == req.a())
			resp = onTaskPing(synremote, asyremote, req);
		else
			throw new IPCException(MsgCode.ext, "WSDoctier: cannont understand act: %s.", req.a());
		
		socket.<AnsonResp>ok(synremote, port(),
				(DocsResp)resp
				.uri(req.uri())
				.a(req.a()));
	}

	OnError onpushErr = (c, err, args) -> {
        // if (c == AnsonMsg.MsgCode.ext);
    };
    
    ExpSyncDoc templtDoc = new ExpSyncDoc();
	
	DocsResp onTaskPing(Basic sr, Async ar, DocsReq req) {
		DocsResp resp = new DocsResp().doc(new ExpSyncDoc()
							.device(req.doc().device()));

		new Thread(() -> {
			try {
				// Doclienter.startPushs(ExpSyncDoc template, String tbl, List<IFileDescriptor> videos,
				// 						 OnProcess proc, OnDocsOk docOk, OnError ... onErr)
				placePushsTask(templtDoc, req.docTabl, videos(req),
					(rx, rows, bx, blocks, rep) -> {
						rep.msg(String.format("%d/%d, %d/%d", rx, rows, bx, blocks));
						sr.sendText(rep.toBlock());
						return false;
					}, 
					(rep) -> { }, 
					(c, err, args) -> { });
			} catch (DocsException e) {
				onpushErr.err(MsgCode.ext, e.getMessage(), e.getClass().getName());
			} catch (TransException e) {
				e.printStackTrace();
				onpushErr.err(MsgCode.exTransct, e.getMessage(), e.getClass().getName());
			} catch (IOException e) {
				e.printStackTrace();
				onpushErr.err(MsgCode.exIo, e.getMessage(), e.getClass().getName());
			} catch (Exception e) {
				e.printStackTrace();
				onpushErr.err(MsgCode.exGeneral, e.getMessage(), e.getClass().getName());
			}
		}).start();
		
		return resp;
	}

	private void placePushsTask(ExpSyncDoc doc0, String doctbl, List<IFileDescriptor> docs,
			OnProcess proc, OnOk ok, OnError err) throws DocsException, TransException, IOException {
		int px = 0;
		for (IFileDescriptor p : docs) {
			try { Thread.sleep(400); } catch (InterruptedException e) { }
			proc.proc(px, docs.size(), 1, 1, (DocsResp)p);
			px++;
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
