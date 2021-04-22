using Sharpen;

namespace io.odysz.module.xtable
{
	public class XMLDefaultStruct : io.odysz.module.xtable.IXMLStruct
	{
		protected internal readonly string rootQName;

		protected internal readonly string tableQName;

		protected internal readonly string recordQName;

		public XMLDefaultStruct(string rootTag, string tableTag, string recordTag)
		{
			rootQName = rootTag;
			tableQName = tableTag;
			recordQName = recordTag;
		}

		public XMLDefaultStruct()
		{
			rootQName = "lyn";
			tableQName = "table";
			recordQName = "record";
		}

		public virtual string rootTag()
		{
			return rootQName;
		}

		public virtual string tableTag()
		{
			return tableQName;
		}

		public virtual string recordTag()
		{
			return recordQName;
		}
	}
}
