using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>
	/// Factory of flat xml data.</br>
	/// All tables are not managed - release memory for performance.
	/// </summary>
	/// <author>Odys</author>
	public class XMLDataFactoryEx
	{
		/// <summary>
		/// Construct a new table.<br/>
		/// Not xml table data are buffered - for release memory.
		/// </summary>
		/// <param name="logger"/>
		/// <param name="targetFullpath">path and filename</param>
		/// <param name="xmlStruct"/>
		/// <returns>xtables</returns>
		/// <exception cref="SQLException"></exception>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="org.xml.sax.SAXException"/>
		public static java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> getXtables
			(io.odysz.module.xtable.ILogger logger, string targetFullpath, io.odysz.module.xtable.IXMLStruct
			 xmlStruct)
		{
			//logger = androidLogger;
			try
			{
				java.io.FileInputStream istream = new java.io.FileInputStream(targetFullpath);
				//IXMLData d = XMLDataFactoryEx.getXMLData(sourceID, istream, xmlStruct, false);
				io.odysz.module.xtable.IXMLData d = new io.odysz.module.xtable.XMLFlatData(istream
					, xmlStruct, logger);
				// XMLTable t = d.getTable(fromStructureOfTableID);
				// return new XMLTable(newTableID, t.getColumns(), t.getPKs(), fromList);
				return d.getTables();
			}
			catch (java.io.FileNotFoundException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				throw new System.IO.IOException(e.Message);
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
				throw new org.xml.sax.SAXException(e.Message);
			}
		}

		//	public static void writeXML(IXMLStruct xmlStrct, String fullpath, XMLTable[] tables) throws SAXException, IOException {
		//		FileOutputStream fo = null;
		//		File f = new File(fullpath);
		//		if (f.exists()) f.delete();
		//		f.createNewFile();
		//		fo = new FileOutputStream(f);
		//		// <rootTag>
		//		fo.write(("<" + xmlStrct.rootTag() + ">\r").getBytes());
		//		
		//		for (XMLTable t : tables) {
		//			try {
		//				// <table id="tid" columns="c1,c2,c3" pk="c1">
		//				String cols = "";
		//				for (String c : t.getColumns().keySet()) {
		//					cols += c + ",";
		//				}
		//				cols = cols.trim();
		//				if (cols.length() > 1) {
		//					cols = cols.substring(0, cols.length() - 1);
		//					cols = cols.trim();
		//				}
		//				
		//				String pks = "";
		//				for (String pk : t.getPKs().keySet()) {
		//					pks += pk + ",";
		//				}
		//				pks = pks.trim();
		//				if (pks.length() > 1) {
		//					pks = pks.substring(0, pks.length() - 1);
		//					pks = pks.trim();
		//				}
		//				
		//				fo.write(String.format("\t<%1$s id=\"%2$s\" columns=\"%3$s\" pk=\"%4$s\">\r",
		//						xmlStrct.tableTag(), t.getTableID(), cols, pks).getBytes());
		//				t.beforeFirst();
		//				while (t.next()) {
		//					fo.write(("\t\t<" + xmlStrct.recordTag() + ">\r").getBytes());
		//					for (String col : t.getColumns().keySet()) {
		//						fo.write(String.format("\t\t\t<%1$s>%2$s</%1$s>\r", col, t.getString(col)).getBytes());
		//					}
		//					fo.write(("\t\t</" + xmlStrct.recordTag() + ">\r").getBytes());
		//				}
		//				fo.write(("\t</" + xmlStrct.tableTag() + ">\r").getBytes());
		//			} catch (Exception e) {
		//				e.printStackTrace();
		//				continue;
		//			}
		//		}
		//			
		//		fo.write(("</" + xmlStrct.rootTag() + ">").getBytes());
		//		fo.flush();
		//		fo.close();
		//	}
		/// <summary>Write xtables (mapping info) into mapping file (fullpath).</summary>
		/// <param name="xmlStrct"/>
		/// <param name="fullpath"/>
		/// <param name="tables"/>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="System.Exception"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		public static void writeTables(io.odysz.module.xtable.IXMLStruct xmlStrct, string
			 fullpath, io.odysz.module.xtable.XMLTable[] tables)
		{
			java.io.FileOutputStream fo = null;
			java.io.File f = new java.io.File(fullpath);
			if (f.exists())
			{
				f.delete();
			}
			f.createNewFile();
			fo = new java.io.FileOutputStream(f);
			// <rootTag>
			fo.write(Sharpen.Runtime.getBytesForString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
				));
			fo.write(Sharpen.Runtime.getBytesForString(("<" + xmlStrct.rootTag() + ">\n")));
			foreach (io.odysz.module.xtable.XMLTable t in tables)
			{
				try
				{
					// <table id="tid" columns="c1,c2,c3" pk="c1">
					string cols = string.Empty;
					foreach (string c in t.getColumns().Keys)
					{
						cols += c + ",";
					}
					cols = cols.Trim();
					if (cols.Length > 1)
					{
						cols = Sharpen.Runtime.substring(cols, 0, cols.Length - 1);
						cols = cols.Trim();
					}
					string pks = string.Empty;
					if (t.getPKs() != null)
					{
						foreach (string pk in t.getPKs().Keys)
						{
							pks += pk + ",";
						}
						pks = pks.Trim();
						if (pks.Length > 1)
						{
							pks = Sharpen.Runtime.substring(pks, 0, pks.Length - 1);
							pks = pks.Trim();
						}
					}
					fo.write(Sharpen.Runtime.getBytesForString(string.format("\t<%1$s id=\"%2$s\" columns=\"%3$s\" pk=\"%4$s\">\n"
						, xmlStrct.tableTag(), t.getTableID(), cols, pks)));
					t.beforeFirst();
					while (t.next())
					{
						fo.write(Sharpen.Runtime.getBytesForString(("\t\t<" + xmlStrct.recordTag() + ">")
							));
						foreach (string col in t.getColumns().Keys)
						{
							string v = t.getString(col);
							if (v != null)
							{
								fo.write(Sharpen.Runtime.getBytesForString(string.format("<%1$s>%2$s</%1$s>", col
									, v)));
							}
						}
						fo.write(Sharpen.Runtime.getBytesForString(("</" + xmlStrct.recordTag() + ">\n"))
							);
					}
					fo.write(Sharpen.Runtime.getBytesForString(("\t</" + xmlStrct.tableTag() + ">\n")
						));
				}
				catch (System.Exception e)
				{
					Sharpen.Runtime.printStackTrace(e);
					continue;
				}
			}
			fo.write(Sharpen.Runtime.getBytesForString(("</" + xmlStrct.rootTag() + ">")));
			fo.flush();
			fo.close();
		}
	}
}
