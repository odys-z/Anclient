using Sharpen;

namespace io.odysz.semantic.ext
{
	public class AnDatasetResp : io.odysz.semantic.jprotocol.AnsonResp
	{
		private System.Collections.Generic.IList<object> forest;

		public AnDatasetResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> parent, System.Collections.Generic.List<io.odysz.anson.Anson> forest)
			: base(parent)
		{
		}

		public AnDatasetResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> parent)
			: base(parent)
		{
		}

		public AnDatasetResp()
			: base(string.Empty)
		{
		}

		public virtual io.odysz.semantic.ext.AnDatasetResp forest<_T0>(System.Collections.Generic.IList
			<_T0> lst)
		{
			forest = lst;
			return this;
		}

		public virtual System.Collections.Generic.IList<object> forest()
		{
			return forest;
		}
	}
}
