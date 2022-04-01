using io.odysz.semantic.jprotocol;
using System.Collections.Generic;


namespace io.odysz.semantic.tier.docs {
	/**This structure is recommend used as Parcel between Android activities.
	 * @author ody
	 *
	 */
	public class DocsResp : AnsonResp {
		long size;
		long Size() { return size; }

		public DocsResp() : base() {
			map = new Dictionary<string, object>();
		}

		SyncingPage syncing;
		public SyncingPage Syncing() { return syncing; }
		public DocsResp Syncing(SyncingPage page) {
			syncing = page;
			return this;
		}

		string recId;
		public string RecId() { return recId; }
		public DocsResp RecId(string recid) {
			recId = recid;
			return this;
		}

		string fullpath;
		public string Fullpath() { return fullpath; }
		public DocsResp Fullpath(string fullpath) {
			this.fullpath = fullpath;
			return this;
		}

		string filename;
		public string clientname() { return filename; }
		public DocsResp clientname(string clientname) {
			this.filename = clientname;
			return this;
		}

		public long blockSeqReply;
		public long blockSeq() { return blockSeqReply; }
		public DocsResp blockSeq(long seq) {
			blockSeqReply = seq;
			return this;
		}

		string cdate;
		public string Cdate() { return cdate; }
		public DocsResp Cdate(string cdate) {
			this.cdate = cdate;
			return this;
		}

	} }
