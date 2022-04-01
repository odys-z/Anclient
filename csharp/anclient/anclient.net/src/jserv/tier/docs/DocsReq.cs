using io.odysz.anson;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantics.x;
using System.Collections;

namespace io.odysz.semantic.tier.docs {

public class DocsReq : AnsonBody {
	public static class A {
		public static readonly string records = "r/list";
		public static readonly string mydocs = "r/my-docs";
		public static readonly string rec = "r/rec";
		public static readonly string upload = "c";
		public static readonly string del = "d";

		public static readonly string blockStart = "c/b/start";
		public static readonly string blockUp = "c/b/block";
		public static readonly string blockEnd = "c/b/end";
		public static readonly string blockAbort = "c/b/abort";
	}

	public static class State {
		public static readonly string confirmed = "conf";
		public static readonly string published = "publ";
		public static readonly string closed = "clos";
		public static readonly string deprecated = "depr";
	}

	public string docId;
	public string docName;
	public string createDate;
	public string clientpath;
	public string mime;

	[AnsonField(shortoString = true)]
	public string uri64;

	string[] deletings;

	string docState;
	
	public DocsReq() : base(null, null) {
	//	blockSeq = -1;
	}

	protected DocsReq(AnsonMsg parent, string uri) : base(parent, uri)
	{
	}

	protected SyncingPage syncing;
	public SyncingPage Syncing() { return syncing; }
	public DocsReq Syncing(SyncingPage page) {
		this.syncing = page;
		return this;
	}


	protected string device; 
	public string Device() { return device; }

	protected ArrayList syncQueries;
	public ArrayList SyncQueries() { return syncQueries; }

	protected long blockSeq;
	// public long blockSeq() { return blockSeq; } 

	public DocsReq nextBlock;

	public DocsReq querySync(IFileDescriptor p) {
		if (syncQueries == null)
			syncQueries = new ArrayList();
		syncQueries.Add(new SyncRec(p));
		return this;
	}

	public DocsReq blockStart(IFileDescriptor file, SessionInf usr) {
		this.device = usr.device;
		if (LangExt.isblank(this.device, new string[] { ".", "/" }))
			throw new SemanticException("File to be uploaded must come with user's device id - for distinguish files. {0}", file.fullpath());

		this.clientpath = file.fullpath(); 
		this.docName = file.clientname();
		this.createDate = file.Cdate();
		this.blockSeq = 0;
		
		this.a = A.blockStart;
		return this;
	}

	//public DocsReq blockUp(long sequence, DocsResp resp, StringBuilder b64, SessionInf usr) throws SemanticException {
	//	string uri64 = b64.toString();
	//	return blockUp(sequence, resp, uri64, usr);
	//}
	
	public DocsReq blockUp(long sequence, DocsResp resp, string s64, SessionInf usr) {
		this.device = usr.device;
		if (LangExt.isblank(this.device, new string[] { ".", "/" }))
			throw new SemanticException("File to be uploaded must come with user's device id - for distinguish files");

		this.blockSeq = sequence;

		this.docId = resp.RecId();
		this.clientpath = resp.Fullpath();
		this.uri64 = s64;

		this.a = A.blockUp;
		return this;
	}

	public DocsReq blockAbort(DocsResp startAck, SessionInf usr) {
		this.device = usr.device;

		this.blockSeq = startAck.blockSeqReply;

		this.docId = startAck.RecId();
		this.clientpath = startAck.Fullpath();

		this.a = A.blockAbort;
		return this;
	}

	public DocsReq blockEnd(DocsResp resp, SessionInf usr) {
		this.device = usr.device;

		this.blockSeq = resp.blockSeqReply;

		this.docId = resp.RecId();
		this.clientpath = resp.Fullpath();

		this.a = A.blockEnd;
		return this;
	}

	public DocsReq BlockSeq(int i) {
		blockSeq = i;
		return this;
	}
} }
