using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jserv.R;

namespace io.odysz.semantic.ext
{
	public class AnDatasetReq : AnQueryReq
	{

		public string[] sqlArgs;

		public string rootId;

		/// <summary>String array of tree semantics from client</summary>
		protected internal string smtcss;

		/// <summary>
		/// <see cref="DA.DatasetCfg.TreeSemantics"/>
		/// of tree from
		/// <see cref="smtcss"/>
		/// or set with
		/// <see cref="treeSemtcs(DA.DatasetCfg.TreeSemantics)"/>
		/// (
		/// <see cref="DA.DatasetCfg.TreeSemantics"/>
		/// )
		/// </summary>

		// internal string root;

        // internal Semantext stcs;

        public virtual string root { get; set; }

		public AnDatasetReq() : base(null, null)
		{
		}

		public virtual AnDatasetReq Root(string rootId)
		{
			this.rootId = rootId;
			return this;
		}

		public AnDatasetReq(string uri, AnsonMsg parent)
			: base(uri, parent)
		{
			a = "ds";
		}

		internal string sk { get; set; }
		public AnDatasetReq Sk(string sk) {
			this.sk = sk;
			return this;
		}

		public static AnDatasetReq formatReq(string uri, AnsonMsg parent, string sk)
		{
			AnDatasetReq bdItem = new AnDatasetReq(uri, parent);
			bdItem.sk = sk;
			return bdItem;
		}
	}
}
