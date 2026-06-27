package io.oz.anclient.socketier;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.musteq;
import static io.odysz.common.LangExt.mustnonull;
import static io.odysz.common.Utils.warn;

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
import io.odysz.semantic.tier.docs.DocsReq.A;
import io.odysz.semantic.tier.docs.DocsResp;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantics.x.SemanticException;
import io.odysz.transact.x.TransException;
import io.oz.anclient.ipcagent.IPCException;
import io.oz.anclient.ipcagent.IWSPoint;
import io.oz.anclient.ipcagent.WSPort;
import io.oz.anclient.ipcagent.WServPort;
import jakarta.websocket.RemoteEndpoint.Async;
import jakarta.websocket.RemoteEndpoint.Basic;

public class WSPing implements IWSPoint {
	public static final int msInterval = 400;

	final WServPort socket;

	@Override
	public IPort port() {
		return WSPort.ping;
	}

	public WSPing(WServPort wsSocket) {
		this.socket = wsSocket;
	}
	
	@Override
	public void onMessage(AnsonMsg<? extends AnsonBody> ansonMsg, Basic synremote, Async asyremote)
			throws IPCException, SemanticException, TransException, AnsonException, SsException, IOException {

		DocsReq req = (DocsReq) ansonMsg.body(0); 
		DocsResp resp;
		if (eq(DocsReq.A.requestSyn, req.a()))
			resp = onTaskPing(synremote, asyremote, req);
		else
			throw new IPCException(MsgCode.ext, "WSDoctier: cannont understand act: %s.", req.a());
		
		socket.<AnsonResp>ok(synremote, port(),
				(DocsResp)resp
				.uri(req.uri())
				.a(req.a()));
	}

	OnError onpushErr = (c, err, args) -> {
		warn("%s: %s", c, err);
    };
    
    ExpSyncDoc templtDoc = new ExpSyncDoc();
	
	DocsResp onTaskPing(Basic sr, Async ar, DocsReq req) {
		musteq(A.requestSyn, req.a());
		DocsResp resp = (DocsResp) new DocsResp()
									.doc(new ExpSyncDoc()
											.device(req.device()))
									.a(req.a());

		new Thread(() -> {
			try {
				placePushsTask(templtDoc, req.docTabl, make_videos_uploaded(req),
					// onProcess
					(rx, rows, bx, blocks, rep) -> {
						rep.msg(String.format("%d,%d,%d,%d,rx rows bx blocks", rx, rows, bx, blocks));
						socket.<AnsonResp>ok(sr, port(), rep);
						return false;
					}, 
					// onOk
					(rep) -> {}, 
					// onError
					(c, err, args) -> {});
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
			try { Thread.sleep(msInterval); } catch (InterruptedException e) { }
			proc.proc(0, 2, px, docs.size(), (DocsResp) new DocsResp()
											 .doc(((ExpSyncDoc)p).size(2)).blockSeq(0).a(DocsReq.A.requestSyn));

			try { Thread.sleep(msInterval); } catch (InterruptedException e) { }
			proc.proc(1, 2, px, docs.size(), (DocsResp) new DocsResp()
											 .doc(((ExpSyncDoc)p).size(2)).blockSeq(1).a(DocsReq.A.requestSyn));
			px++;
		}
	}

	private List<IFileDescriptor> make_videos_uploaded(DocsReq req) throws SemanticException {
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
