using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>Flat XML data structure handler.</summary>
	/// <author>Odysseus Zhou</author>
	public class XMLFlatReader : org.xml.sax.helpers.DefaultHandler
	{
		public const string Tag = "XMLFlatReader";

		private io.odysz.module.xtable.ILogger logger;

		protected internal string rootTag;

		protected internal string tableTag;

		protected internal string recordTag;

		public XMLFlatReader(io.odysz.module.xtable.ILogger logger, io.odysz.module.xtable.IXMLStruct
			 xmlStruct)
		{
			//	public class TableStruct { }
			this.logger = logger;
			rootTag = xmlStruct.rootTag();
			tableTag = xmlStruct.tableTag();
			recordTag = xmlStruct.recordTag();
		}

		/// <summary>[key = tableID, value = XMLTable[qName, chars]]</summary>
		protected internal java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable
			> tables = new java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable>(
			);

		public virtual java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> getTables
			()
		{
			return tables;
		}

		protected internal string currV;

		protected internal bool maybeMore = false;

		private io.odysz.module.xtable.XMLTable currentTable;

		// current characters
		// may be more characters not received by characters()
		/// <exception cref="org.xml.sax.SAXException"/>
		public override void startElement(string namespaceURI, string localName, string qname
			, org.xml.sax.Attributes attributes)
		{
			if (rootTag.Equals(qname))
			{
			}
			else
			{
				// ignore
				if (tableTag.Equals(qname))
				{
					// construct a table
					try
					{
						currentTable = new io.odysz.module.xtable.XMLTable(attributes.getValue("id"), attributes
							.getValue("columns"), attributes.getValue("pk"), logger);
						currentTable.setXmlAttrs(attributes);
						currentTable.startTablePush();
					}
					catch (System.Exception e)
					{
						Sharpen.Runtime.printStackTrace(e);
					}
				}
				else
				{
					if (recordTag.Equals(qname))
					{
						// to build a row
						currentTable.startRecordPush();
					}
					else
					{
						currV = string.Empty;
					}
				}
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public override void endElement(string namespaceURI, string sName, string qName)
		{
			// simple name
			// qualified name
			if (rootTag.Equals(qName))
			{
			}
			else
			{
				if (tableTag.Equals(qName))
				{
					// push table
					currentTable.endTablePush();
					tables[currentTable.getTableID()] = currentTable;
					currentTable = null;
				}
				else
				{
					if (recordTag.Equals(qName))
					{
						// push record
						currentTable.endRecordPush(true);
					}
					else
					{
						if (currentTable == null)
						{
							logger.e(Tag, string.format("Can't put value (%s) from tag <%s> into field. Check the XML struct."
								, currV, qName));
						}
						else
						{
							currentTable.appendFieldValue(qName, currV.Trim());
						}
					}
				}
			}
			maybeMore = false;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public override void characters(char[] buf, int offset, int len)
		{
			if (maybeMore == true)
			{
				currV += new string(buf, offset, len);
			}
			else
			{
				currV = new string(buf, offset, len);
			}
			maybeMore = true;
		}

		// may be more character chuncks followed
		public virtual io.odysz.module.xtable.XMLTable getTable(string tableID)
		{
			if (tables == null)
			{
				return null;
			}
			return tables[tableID];
		}
	}
}
