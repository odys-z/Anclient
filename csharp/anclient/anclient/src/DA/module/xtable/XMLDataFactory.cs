using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>
	/// Factory of flat xml data.</br>
	/// Is this not necessary? Or a generic flat xml data factory is needed?
	/// </summary>
	/// <author>Odys</author>
	public class XMLDataFactory
	{
		/// <summary>Take as data source ID.</summary>
		/// <remarks>Take as data source ID. Set here for the future expansion.</remarks>
		private static string XMLSrcDefault = "com.infochage.frame.xtable.default";

		protected internal static System.Collections.Generic.Dictionary<string, io.odysz.module.xtable.XMLFlatData
			> xmldata = new System.Collections.Generic.Dictionary<string, io.odysz.module.xtable.XMLFlatData
			>();

		protected internal static io.odysz.module.xtable.XMLFlatData getXMLData(string dataName
			, java.io.InputStream istream, io.odysz.module.xtable.IXMLStruct xmlStruct, bool
			 forceReload)
		{
			if (xmldata.Contains(dataName) && !forceReload)
			{
				return xmldata[dataName];
			}
			try
			{
				xmldata[dataName] = new io.odysz.module.xtable.XMLFlatData(istream, xmlStruct, getLogger
					());
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			return xmldata[dataName];
		}

		/// <summary>
		/// Construct a new table.<br/>
		/// Copy data structure from 'fromTableID', copy data from 'fromList'
		/// </summary>
		/// <param name="sourceID"/>
		/// <param name="androidLogger"/>
		/// <param name="newTableID"/>
		/// <param name="fromStructureOfTableID"/>
		/// <param name="fromList"/>
		/// <param name="targetFullpath"/>
		/// <param name="xmlStruct"/>
		/// <returns>new xml table</returns>
		public static io.odysz.module.xtable.XMLTable buildTable(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string newTableID, string fromStructureOfTableID, System.Collections.Generic.List
			<string[]> fromList, string targetFullpath, io.odysz.module.xtable.IXMLStruct xmlStruct
			)
		{
			logger = androidLogger;
			try
			{
				java.io.FileInputStream istream = new java.io.FileInputStream(targetFullpath);
				io.odysz.module.xtable.IXMLData d = io.odysz.module.xtable.XMLDataFactory.getXMLData
					(sourceID, istream, xmlStruct, false);
				io.odysz.module.xtable.XMLTable t = d.getTable(fromStructureOfTableID);
				return new io.odysz.module.xtable.XMLTable(newTableID, t.getColumns(), t.getPKs()
					, fromList);
			}
			catch (java.io.FileNotFoundException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				return null;
			}
		}

		/// <summary>
		/// Usage ex.:<br/>
		/// InputStream istr = res.getAssets().open(configName + ".xml");<br/>
		/// IXMLStruct xmlStruct = new IXMLStruct() {<br/>
		/// <literal>@</literal>
		/// Override public String rootTag() { return "xtables"; }<br/>
		/// <literal>@</literal>
		/// Override public String tableTag() { return "table"; }<br/>
		/// <literal>@</literal>
		/// Override public String recordTag() { return "record"; }<br/>
		/// };<br/>
		/// ILogger logger = new Logger();<br/>
		/// skintable = XMLDataFactory.getTable(logger, configTablename, istr, xmlStruct);<br/>
		/// </summary>
		/// <param name="logger"/>
		/// <param name="tableID"/>
		/// <param name="fromFullpath"/>
		/// <param name="xmlStruct"/>
		/// <returns>target table</returns>
		public static io.odysz.module.xtable.XMLTable getTable(io.odysz.module.xtable.ILogger
			 logger, string tableID, string fromFullpath, io.odysz.module.xtable.IXMLStruct 
			xmlStruct)
		{
			return getTable(XMLSrcDefault, logger, tableID, fromFullpath, xmlStruct);
		}

		public static io.odysz.module.xtable.XMLTable getTable(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, string fromFullpath, io.odysz.module.xtable.IXMLStruct
			 xmlStruct)
		{
			logger = androidLogger;
			try
			{
				java.io.FileInputStream istream = new java.io.FileInputStream(fromFullpath);
				return getTable(sourceID, androidLogger, tableID, istream, xmlStruct);
			}
			catch (java.io.FileNotFoundException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				return null;
			}
		}

		/// <seealso cref="getTable(ILogger, string, string, IXMLStruct)"></seealso>
		/// <param name="androidLogger"/>
		/// <param name="tableID"/>
		/// <param name="istream"/>
		/// <param name="xmlStruct"/>
		/// <returns>target table</returns>
		public static io.odysz.module.xtable.XMLTable getTable(io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, java.io.InputStream istream, io.odysz.module.xtable.IXMLStruct
			 xmlStruct)
		{
			return getTable(XMLSrcDefault, androidLogger, tableID, istream, xmlStruct);
		}

		/// <summary>Get a table, don't reload.</summary>
		/// <remarks>Get a table, don't reload. This is for caller avoiding reopen file repeatedly.
		/// 	</remarks>
		/// <param name="sourceID"/>
		/// <param name="androidLogger"/>
		/// <param name="tableID"/>
		/// <param name="xmlStruct"/>
		/// <returns>xml table</returns>
		public static io.odysz.module.xtable.XMLTable getTableReusing(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, io.odysz.module.xtable.IXMLStruct xmlStruct)
		{
			logger = androidLogger;
			return getXMLData(sourceID, null, xmlStruct, false).getTable(tableID);
		}

		public static io.odysz.module.xtable.XMLTable getTable(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, java.io.InputStream istream, io.odysz.module.xtable.IXMLStruct
			 xmlStruct)
		{
			//		logger = androidLogger;
			//		return getXMLData(sourceID, istream, xmlStruct).getTable(tableID);
			return getTable(sourceID, androidLogger, tableID, istream, xmlStruct, false);
		}

		public static io.odysz.module.xtable.XMLTable getTable(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, java.io.InputStream istream, io.odysz.module.xtable.IXMLStruct
			 xmlStruct, bool reload)
		{
			logger = androidLogger;
			return getXMLData(sourceID, istream, xmlStruct, reload).getTable(tableID);
		}

		public static io.odysz.module.xtable.XMLTable getTable(string sourceID, io.odysz.module.xtable.ILogger
			 androidLogger, string tableID, string fromFullpath, io.odysz.module.xtable.IXMLStruct
			 xmlStruct, bool reload)
		{
			logger = androidLogger;
			try
			{
				java.io.FileInputStream istream = new java.io.FileInputStream(fromFullpath);
				return getTable(sourceID, androidLogger, tableID, istream, xmlStruct, reload);
			}
			catch (java.io.FileNotFoundException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				return null;
			}
		}

		/// <exception cref="System.Exception"/>
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
			fo.write(Sharpen.Runtime.getBytesForString(("<" + xmlStrct.rootTag() + ">\r")));
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
					fo.write(Sharpen.Runtime.getBytesForString(string.format("\t<%1$s id=\"%2$s\" columns=\"%3$s\" pk=\"%4$s\">\r"
						, xmlStrct.tableTag(), t.getTableID(), cols, pks)));
					t.beforeFirst();
					while (t.next())
					{
						fo.write(Sharpen.Runtime.getBytesForString(("\t\t<" + xmlStrct.recordTag() + ">\r"
							)));
						foreach (string col in t.getColumns().Keys)
						{
							fo.write(Sharpen.Runtime.getBytesForString(string.format("\t\t\t<%1$s>%2$s</%1$s>\r"
								, col, t.getString(col))));
						}
						fo.write(Sharpen.Runtime.getBytesForString(("\t\t</" + xmlStrct.recordTag() + ">\r"
							)));
					}
					fo.write(Sharpen.Runtime.getBytesForString(("\t</" + xmlStrct.tableTag() + ">\r")
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

		private static io.odysz.module.xtable.ILogger logger;

		/// <exception cref="System.Exception"/>
		protected internal static io.odysz.module.xtable.ILogger getLogger()
		{
			if (logger == null)
			{
				throw new System.Exception("logger not set correctly");
			}
			return logger;
		}
	}
}
