using Sharpen;

namespace io.odysz.module.xtable
{
	public interface ITableStruct
	{
		/// <summary>Get columns defining attributes name</summary>
		/// <returns>col specification string</returns>
		string attrCols();

		java.util.LinkedHashMap<string, int> colIdx();

		string colDefs();

		string attrTableID();

		string attrPks();

		java.util.LinkedHashMap<string, int> pkIdx();

		string pkDefs();
	}
}
