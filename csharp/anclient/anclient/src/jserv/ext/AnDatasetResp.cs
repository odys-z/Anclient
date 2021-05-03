using io.odysz.anson;
using io.odysz.semantic.jprotocol;
using System.Collections.Generic;

namespace io.odysz.semantic.ext
{
	public class AnDatasetResp : AnsonResp
	{

        public AnDatasetResp(AnsonMsg parent, List<Anson> forest) : base(parent)
		{
		}

		public AnDatasetResp(AnsonMsg parent) : base(parent)
		{
		}

		public AnDatasetResp() : base(string.Empty)
		{
		}

        private IList<object> _forest;
		public AnDatasetResp Forest(IList<object> lst)
		{
			_forest = lst;
			return this;
		}

		public IList<object> Forest()
		{
			return _forest;
		}
	}
}
