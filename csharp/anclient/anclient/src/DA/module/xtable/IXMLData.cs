using Sharpen;

namespace io.odysz.module.xtable
{
	public interface IXMLData
	{
		java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> getTables();

		io.odysz.module.xtable.XMLTable getTable(string tableID);

		string getTableAttribute(string tableID, string attrName);
	}
}
