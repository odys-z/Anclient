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
			this.root = rootId;
			return this;
		}

		public AnDatasetReq(AnsonMsg parent, string conn)
			: base(parent, conn)
		{
			a = "ds";
		}

		internal string sk { get; set; }
		// public virtual string sk() { return sk; }

		public static AnDatasetReq formatReq(string conn, AnsonMsg parent, string sk)
		{
			AnDatasetReq bdItem = new AnDatasetReq(parent, conn);
			bdItem.sk = sk;
			return bdItem;
		}
	}
}
