using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>
	/// Generic flat xml data manager.</br>
	/// When inited, kname is treated as reacord id, vname is as value.
	/// </summary>
	/// <remarks>
	/// Generic flat xml data manager.</br>
	/// When inited, kname is treated as reacord id, vname is as value. But this class do nothing for any other data structure.
	/// Value can be fieldized by XMLDataFactory.getFLResultset().
	/// </remarks>
	/// <author>Odys</author>
	public class XMLFlatData : io.odysz.module.xtable.IXMLData
	{
		private const string TAG = "XMLFlatData";

		protected internal io.odysz.module.xtable.XMLFlatReader handler;

		/// <summary>load xml file at "<path>", parse into map</summary>
		/// <exception cref="System.Exception"></exception>
		public XMLFlatData(java.io.InputStream istream, io.odysz.module.xtable.IXMLStruct
			 xmlStruct, io.odysz.module.xtable.ILogger logger)
		{
			javax.xml.parsers.SAXParserFactory factory = javax.xml.parsers.SAXParserFactory.newInstance
				();
			try
			{
				handler = new io.odysz.module.xtable.XMLFlatReader(logger, xmlStruct);
				javax.xml.parsers.SAXParser saxParser = factory.newSAXParser();
				saxParser.parse(new org.xml.sax.InputSource(istream), handler);
				logger.i(TAG, "XML file processed.");
			}
			catch (System.Exception e)
			{
				logger.e(TAG, "Error - Loading xml file failed. Check tags in file and xmlStruct..."
					);
				Sharpen.Runtime.printStackTrace(e);
			}
		}

		public virtual java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> getTables
			()
		{
			return handler.getTables();
		}

		public virtual io.odysz.module.xtable.XMLTable getTable(string tableID)
		{
			return handler.getTable(tableID);
		}

		public virtual string getTableAttribute(string tableID, string attrName)
		{
			return null;
		}
	}
}
