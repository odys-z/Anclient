using Sharpen;

namespace io.odysz.module.xtable
{
	public class XMLTable
	{
		private const string TAG = "XMLTable";

		private io.odysz.module.xtable.ILogger logger;

		protected internal string _tableID;

		protected internal System.Collections.Generic.Dictionary<string, int> columns;

		protected internal System.Collections.Generic.Dictionary<string, int> pkCols;

		protected internal System.Collections.Generic.List<string[]> rows;

		protected internal string[] currentRec;

		/// <summary>
		/// Construct an empty table according to cols and pk.</br>
		/// Table construction not finished without calling endTablePush().
		/// </summary>
		/// <param name="tableID"/>
		/// <param name="cols"/>
		/// <param name="pk"/>
		/// <exception cref="System.Exception"></exception>
		/// <exception cref="org.xml.sax.SAXException"/>
		public XMLTable(string tableID, string cols, string pk, io.odysz.module.xtable.ILogger
			 log)
		{
			isBuilding = true;
			// logger = XMLDataFactory.getLogger();
			logger = log;
			// build columns
			if (cols == null || cols.Trim().Equals(string.Empty))
			{
				logger.e(TAG, "Can not construct table " + tableID + " with empty col specification"
					);
				return;
			}
			if (tableID == null || string.Empty.Equals(tableID.Trim()))
			{
				tableID = "XMLTable.Generated Default Table ID";
			}
			else
			{
				_tableID = tableID;
			}
			string[] colNames = cols.split(",");
			columns = new java.util.LinkedHashMap<string, int>();
			for (int i = 0; i < colNames.Length; i++)
			{
				columns[colNames[i].Trim()] = i;
			}
			if (pk != null && !string.Empty.Equals(pk.Trim()))
			{
				pkCols = new java.util.LinkedHashMap<string, int>();
				string[] pkNames = pk.split(",");
				for (int i_1 = 0; i_1 < pkNames.Length; i_1++)
				{
					pkCols[pkNames[i_1].Trim()] = columns[pkNames[i_1].Trim()];
				}
			}
			rows = new System.Collections.Generic.List<string[]>();
		}

		/// <summary>Constructing an empty table, table structure value copied from parameters.
		/// 	</summary>
		/// <remarks>
		/// Constructing an empty table, table structure value copied from parameters.
		/// Table construction not finished without calling endTablePush().
		/// This is useful for reduced rows and cols table copying.
		/// </remarks>
		/// <param name="tableID"/>
		/// <param name="fromColumns"/>
		/// <param name="fromPkCols"/>
		public XMLTable(string tableID, System.Collections.Generic.Dictionary<string, int
			> fromColumns, System.Collections.Generic.Dictionary<string, int> fromPkCols)
		{
			isBuilding = true;
			_tableID = tableID;
			columns = new System.Collections.Generic.Dictionary<string, int>();
			foreach (string cname in fromColumns.Keys)
			{
				columns[new string(cname)] = fromColumns[cname];
			}
			pkCols = new System.Collections.Generic.Dictionary<string, int>();
			foreach (string cname_1 in fromPkCols.Keys)
			{
				pkCols[new string(cname_1)] = fromPkCols[cname_1];
			}
			rows = new System.Collections.Generic.List<string[]>();
		}

		/// <summary>value copy and construct a new table, according to parameters.</summary>
		/// <param name="newTableID"/>
		/// <param name="fromColumns"/>
		/// <param name="fromPkCols"/>
		/// <param name="fromList"/>
		public XMLTable(string newTableID, System.Collections.Generic.Dictionary<string, 
			int> fromColumns, System.Collections.Generic.Dictionary<string, int> fromPkCols, 
			System.Collections.Generic.List<string[]> fromList)
		{
			_tableID = newTableID;
			columns = new System.Collections.Generic.Dictionary<string, int>();
			foreach (string cname in fromColumns.Keys)
			{
				columns[new string(cname)] = fromColumns[cname];
			}
			pkCols = new System.Collections.Generic.Dictionary<string, int>();
			foreach (string cname_1 in fromPkCols.Keys)
			{
				pkCols[new string(cname_1)] = fromPkCols[cname_1];
			}
			rows = new System.Collections.Generic.List<string[]>();
			foreach (string[] row in fromList)
			{
				string[] newRow = new string[columns.Count];
				foreach (string k in columns.Keys)
				{
					if (row[columns[k]] != null)
					{
						newRow[columns[k]] = new string(row[columns[k]]);
					}
				}
				rows.add(newRow);
			}
			isBuilding = false;
		}

		/// <summary>
		/// This can be used to clone from FLResultset.<br />
		/// <b>Becareful, the cols and rows indexes in result set start at 1, but in XMLTable that start at 0!</b><br />
		/// All columns and rows idxes are -1.
		/// </summary>
		/// <param name="fromColumns"/>
		/// <param name="fromPkCols"/>
		/// <param name="fromList"/>
		public XMLTable(System.Collections.Generic.Dictionary<string, int> fromColumns, System.Collections.Generic.Dictionary
			<string, int> fromPkCols, System.Collections.Generic.List<System.Collections.Generic.List
			<object>> fromList)
		{
			_tableID = "table1";
			columns = new System.Collections.Generic.Dictionary<string, int>();
			foreach (string cname in fromColumns.Keys)
			{
				columns[new string(cname)] = fromColumns[cname] - 1;
			}
			if (fromPkCols != null && fromPkCols.Count > 0)
			{
				pkCols = new System.Collections.Generic.Dictionary<string, int>();
				foreach (string cname_1 in fromPkCols.Keys)
				{
					pkCols[new string(cname_1)] = columns[cname_1];
				}
			}
			rows = new System.Collections.Generic.List<string[]>();
			foreach (System.Collections.Generic.List<object> row in fromList)
			{
				string[] newRow = new string[columns.Count];
				for (int i = 0; i < columns.Count; i++)
				{
					if (row[i] != null)
					{
						newRow[i] = row[i].ToString();
					}
				}
				rows.add(newRow);
			}
			isBuilding = false;
		}

		/// <exception cref="org.xml.sax.SAXParseException"/>
		protected internal virtual void appendFieldValue(string colName, string fieldValue
			)
		{
			validateTableStruct();
			if (colName == null || string.Empty.Equals(colName.Trim()) || !columns.Contains(colName
				.Trim()))
			{
				logger.w(TAG, "Can not resolve colName to append value. Column ignored: " + colName
					 + ", tableID: " + _tableID);
				return;
			}
			appendFieldValue(columns[colName], fieldValue);
		}

		/// <exception cref="org.xml.sax.SAXParseException"/>
		protected internal virtual void appendFieldValue(int colIdx, string fieldValue)
		{
			if (colIdx < 0 || colIdx > columns.Count)
			{
				throw new org.xml.sax.SAXParseException("Column index out of bundary", null);
			}
			currentRec[colIdx] = fieldValue;
		}

		/// <exception cref="org.xml.sax.SAXParseException"/>
		protected internal virtual void startRecordPush()
		{
			validateTableStruct();
			currentRec = new string[columns.Count];
		}

		/// <summary>Push the temp record into table rows.</summary>
		/// <remarks>
		/// Push the temp record into table rows.
		/// For data validation, checkPK shall be true.
		/// But it's a serious performance defect. Set checkPK to false when deploying a release version.
		/// </remarks>
		/// <param name="checkPK"/>
		/// <exception cref="org.xml.sax.SAXParseException"/>
		protected internal virtual void endRecordPush(bool checkPK)
		{
			if (currentRec == null)
			{
				logger.e(TAG, string.format("Find a null record, check record format in table %s is correct."
					, _tableID));
				return;
			}
			if (checkPK && pkCols != null && pkCols.Count > 0)
			{
				string[] pkVals = new string[pkCols.Count];
				logger.i(TAG, "Parsing record...");
				// check null pk
				int c = 0;
				foreach (string col in pkCols.Keys)
				{
					if (pkCols[col] == null || currentRec[pkCols[col]] == null)
					{
						logger.e(TAG, "PK value can not be null. tableID: " + _tableID + ", col: " + col);
						throw new org.xml.sax.SAXParseException("PK value can not be null. tableID: " + _tableID
							 + ", col: " + col, null);
					}
					else
					{
						pkVals[c] = currentRec[pkCols[col]];
						logger.i(TAG, "\tPK = " + pkVals[c]);
						c++;
					}
				}
				// check duplicated pk
				if (currentRec != null && getRecordByPK(pkVals) != null)
				{
					logger.e(TAG, "Record ignored for duplicated pk from table " + _tableID + ": ");
					for (int i = 0; i < pkVals.Length; i++)
					{
						logger.e("    ", pkVals[i]);
					}
				}
			}
			rows.add(currentRec);
			currentRec = null;
		}

		/// <summary>Find record according to pk values.</summary>
		/// <remarks>
		/// Find record according to pk values.
		/// pkVals is exactly the same order specified in xmlfile/table pk attribute.
		/// <br/>IMPORTANT: There are no index or any other performance facilities, be careful!
		/// </remarks>
		/// <param name="pkVals"/>
		/// <returns>target record</returns>
		/// <exception cref="org.xml.sax.SAXParseException"></exception>
		public virtual string[] getRecordByPK(string[] pkVals)
		{
			if (rows == null || rows.Count <= 0)
			{
				return null;
			}
			if (pkCols == null || pkCols.Count <= 0)
			{
				throw new org.xml.sax.SAXParseException("Table " + _tableID + " can not support getRecordByPK() without PK specification."
					, null);
			}
			for (int i = 0; i < rows.Count; i++)
			{
				bool found = false;
				int j = 0;
				foreach (string k in pkCols.Keys)
				{
					if (rows[i][pkCols[k]].Equals(pkVals[j]))
					{
						j++;
						found = true;
					}
					else
					{
						found = false;
						break;
					}
				}
				if (found)
				{
					return rows[i];
				}
			}
			return null;
		}

		private bool isBuilding = false;

		public virtual void startTablePush()
		{
			isBuilding = true;
		}

		public virtual io.odysz.module.xtable.XMLTable endTablePush()
		{
			isBuilding = false;
			try
			{
				beforeFirst();
			}
			catch (org.xml.sax.SAXException e)
			{
				logger.e(TAG, "Why reached here?");
				Sharpen.Runtime.printStackTrace(e);
			}
			return this;
		}

		/// <exception cref="org.xml.sax.SAXParseException"/>
		private void validateTableStruct()
		{
			if (columns == null)
			{
				throw new org.xml.sax.SAXParseException("Table Structure invalidate.", null);
			}
		}

		internal int rowIdx = -1;

		////////////////////////////////////////////////////////////////////
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual io.odysz.module.xtable.XMLTable beforeFirst()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			rowIdx = -1;
			return this;
		}

		/// <summary>go last record - getXXX(c) got last row's field.</summary>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void last()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			goAt(getRowCount() - 1);
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual bool next()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			if (rows == null || rows.Count <= 0)
			{
				return false;
			}
			if (rowIdx < rows.Count - 1)
			{
				rowIdx++;
				return true;
			}
			else
			{
				return false;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual bool goAt(int position)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			if (rows == null || rows.Count <= 0)
			{
				return false;
			}
			if (position < 0 || position >= rows.Count)
			{
				throw new org.xml.sax.SAXException("Target position out of boundary.", null);
			}
			rowIdx = position;
			return true;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void end()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			rowIdx = rows.Count - 1;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual bool previous()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			if (rows == null || rows.Count <= 0)
			{
				return false;
			}
			if (rowIdx > 0 && rowIdx < rows.Count)
			{
				rowIdx--;
				return true;
			}
			else
			{
				return false;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string[] getRow()
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			return rows[rowIdx];
		}

		/// <param name="col">start from 0.</param>
		/// <returns>target field value</returns>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string getString(int col)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			validateTableStruct();
			if (columns.Count < col || col < 0)
			{
				throw new org.xml.sax.SAXException("Column index outof bundary.", null);
			}
			return rows[rowIdx][col];
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string getString(string colName)
		{
			validateTableStruct();
			int index = columns[colName];
			string ccc = getString(index);
			return ccc;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string getStringAt(int row, string colName)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			validateTableStruct();
			int col = columns[colName];
			if (columns.Count < col || col < 0)
			{
				throw new org.xml.sax.SAXException("Column index outof bundary.", null);
			}
			return rows[row][col];
		}

		public virtual string getTableID()
		{
			return _tableID;
		}

		public virtual int getRowCount()
		{
			if (rows == null)
			{
				return 0;
			}
			return rows.Count;
		}

		public virtual int getRowIdx()
		{
			return rowIdx;
		}

		/// <param name="kv">- [key = colname, val = fieldVal]</param>
		/// <returns>record list</returns>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual System.Collections.Generic.List<string[]> findRecords(System.Collections.Generic.Dictionary
			<string, string> kv)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			System.Collections.Generic.List<string[]> retList = new System.Collections.Generic.List
				<string[]>();
			if (rows == null)
			{
				return retList;
			}
			for (int i = 0; i < rows.Count; i++)
			{
				bool matched = false;
				foreach (string col in kv.Keys)
				{
					int c = columns[col];
					if (rows[i][c] == null || !rows[i][c].Equals(kv[col]))
					{
						matched = false;
						break;
					}
					else
					{
						matched = true;
					}
				}
				if (matched)
				{
					retList.add(rows[i]);
				}
			}
			return retList;
		}

		/// <param name="pkVals">- [key = colname, val = fieldVal]</param>
		/// <returns>target table</returns>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual io.odysz.module.xtable.XMLTable findRecordsTable(System.Collections.Generic.Dictionary
			<string, string> pkVals)
		{
			io.odysz.module.xtable.XMLTable retTable = new io.odysz.module.xtable.XMLTable(_tableID
				, columns, pkCols);
			retTable.copyRows(findRecords(pkVals));
			retTable.endTablePush();
			return retTable;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string[] getRowAt(int position)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			return rows[position];
		}

		private void copyRows(System.Collections.Generic.List<string[]> fromRows)
		{
			foreach (string[] row in fromRows)
			{
				string[] newRow = new string[columns.Count];
				for (int i = 0; i < columns.Count; i++)
				{
					if (row[i] != null)
					{
						string v = new string(row[i]);
						newRow[i] = v;
					}
				}
				rows.add(newRow);
			}
		}

		public virtual System.Collections.Generic.Dictionary<string, int> getColumns()
		{
			return columns;
		}

		public virtual System.Collections.Generic.Dictionary<string, int> getPKs()
		{
			return pkCols;
		}

		/// <summary>
		/// Clone a column index for id reference.<br />
		/// Sometimes the E2Engine will refere to a fixed name field to retrieve data, e.g.
		/// </summary>
		/// <remarks>
		/// Clone a column index for id reference.<br />
		/// Sometimes the E2Engine will refere to a fixed name field to retrieve data, e.g. "itemId".
		/// </remarks>
		/// <param name="newName"/>
		/// <param name="oldName"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void cloneCol(string newName, string oldName)
		{
			if (columns == null)
			{
				throw new org.xml.sax.SAXException("There is no columns to rename.");
			}
			if (columns.Contains(newName))
			{
				throw new org.xml.sax.SAXException("New columns name already eaxists.");
			}
			if (!columns.Contains(oldName))
			{
				throw new org.xml.sax.SAXException(string.format("There is no column named %s to rename."
					, oldName));
			}
			int colIdx = columns[oldName];
			columns[newName] = colIdx;
			if (pkCols != null && pkCols.Contains(oldName))
			{
				pkCols[newName] = colIdx;
			}
		}

		public virtual System.Collections.Generic.List<string[]> getRows()
		{
			return rows;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string[] getRows(string colName)
		{
			string[] cells = new string[rows.Count];
			beforeFirst();
			int i = 0;
			while (next())
			{
				cells[i] = getString(colName);
				i++;
			}
			return cells;
		}

		public virtual int getInt(string colName, int defaultVal)
		{
			try
			{
				return getInt(colName);
			}
			catch (System.Exception)
			{
				return defaultVal;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual int getInt(string colName)
		{
			validateTableStruct();
			int index = columns[colName];
			return getInt(index);
		}

		public virtual int getInt(int col, int defaultVal)
		{
			try
			{
				return getInt(col);
			}
			catch (System.Exception)
			{
				return defaultVal;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		private int getInt(int col)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			validateTableStruct();
			if (columns.Count < col || col < 0)
			{
				throw new org.xml.sax.SAXException("Column index outof bundary.", null);
			}
			string v = rows[rowIdx][col];
			return int.Parse(v);
		}

		public virtual int getIntAt(int row, string colName, int defaultVal)
		{
			try
			{
				return getIntAt(row, columns[colName], defaultVal);
			}
			catch (System.Exception)
			{
				return defaultVal;
			}
		}

		public virtual int getIntAt(int row, int col, int defaultVal)
		{
			try
			{
				string v = rows[row][col];
				return int.Parse(v);
			}
			catch (System.Exception)
			{
				return defaultVal;
			}
		}

		public virtual bool getBool(string colName, bool defaultVal)
		{
			try
			{
				return getBool(colName);
			}
			catch (System.Exception)
			{
				return defaultVal;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		private bool getBool(string colName)
		{
			validateTableStruct();
			int index = columns[colName];
			return getBool(index);
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		private bool getBool(int col)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not move cursor while building table.", null
					);
			}
			validateTableStruct();
			if (columns.Count < col || col < 0)
			{
				throw new org.xml.sax.SAXException("Column index outof bundary.", null);
			}
			string v = rows[rowIdx][col];
			if (v == null)
			{
				return false;
			}
			v = v.Trim().ToLower();
			if (v.Length == 0 || v.Length > 4)
			{
				return false;
			}
			if ("1".Equals(v) || "true".Equals(v) || "y".Equals(v) || "t".Equals(v) || "yes".
				Equals(v) || "ok".Equals(v))
			{
				return true;
			}
			return false;
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual string[] getStrings(string colName)
		{
			validateTableStruct();
			int index = columns[colName];
			string fstr = getString(index);
			if (fstr == null)
			{
				return null;
			}
			else
			{
				return fstr.split(",", -1);
			}
		}

		public virtual float getFloat(string colName, float defaultVal)
		{
			try
			{
				string v = getString(colName).Trim();
				return float.valueOf(v);
			}
			catch (System.Exception)
			{
				//			e.printStackTrace();
				return defaultVal;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual float[] getFloats(string colName, float defaultVal)
		{
			validateTableStruct();
			int index = columns[colName];
			string fstr = getString(index);
			if (fstr == null)
			{
				return null;
			}
			else
			{
				string[] fs = fstr.split(",", -1);
				float[] vfs = new float[fs.Length];
				for (int i = 0; i < fs.Length; i++)
				{
					try
					{
						vfs[i] = float.valueOf(fs[i].Trim());
					}
					catch (System.Exception)
					{
						vfs[i] = defaultVal;
					}
				}
				return vfs;
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual int[] getInts(string colName, int defaultVal)
		{
			validateTableStruct();
			int index = columns[colName];
			string istr = getString(index);
			if (istr == null)
			{
				return null;
			}
			else
			{
				string[] ss = istr.split(",", -1);
				int[] vis = new int[ss.Length];
				for (int i = 0; i < ss.Length; i++)
				{
					try
					{
						vis[i] = int.Parse(ss[i].Trim());
					}
					catch (System.Exception)
					{
						vis[i] = defaultVal;
					}
				}
				return vis;
			}
		}

		private System.Collections.Generic.Dictionary<string, string> _tableAttrs;

		public virtual void setXmlAttrs(org.xml.sax.Attributes attributes)
		{
			_tableAttrs = new System.Collections.Generic.Dictionary<string, string>();
			for (int i = 0; i < attributes.getLength(); i++)
			{
				string k = attributes.getQName(i);
				string v = attributes.getValue(i);
				_tableAttrs[k] = v;
			}
		}

		public virtual string getAttribute(string attr, string defaultVal)
		{
			if ("package".Equals(attr))
			{
				return "enlearn";
			}
			if (_tableAttrs == null)
			{
				return defaultVal;
			}
			else
			{
				string v = _tableAttrs[attr];
				if ("package".Equals(attr) && "0".Equals(v))
				{
					return "defaultVal";
				}
				else
				{
					return v;
				}
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void setField(string colName, string val)
		{
			validateTableStruct();
			int index = columns[colName];
			rows[rowIdx][index] = val;
		}

		/// <summary>If pk is duplicating, merging record is ignored.</summary>
		public const int duplicateIgnor = 101;

		/// <summary>If pk is duplicating, this obj's record is replaced with merging.</summary>
		public const int duplicateReplace = 102;

		/// <summary>
		/// Merge withTable to this object.<br/>
		/// Table name and colomns order can be different, but both table must have exactly the same columns and pk fields.<br/>
		/// <b>Note:</b><br/>
		/// This method is not suitable for large record's number.
		/// </summary>
		/// <remarks>
		/// Merge withTable to this object.<br/>
		/// Table name and colomns order can be different, but both table must have exactly the same columns and pk fields.<br/>
		/// <b>Note:</b><br/>
		/// This method is not suitable for large record's number. There is a performance problem,
		/// especially when both table has many duplicated records. xTable is not designed for DB functioning,
		/// it's designed for retrieve data such as App configurations.
		/// </remarks>
		/// <param name="withTable"/>
		/// <param name="duplicateMode">
		/// one of
		/// <see cref="duplicateIgnor"/>
		/// and
		/// <see cref="duplicateReplace"/>
		/// </param>
		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void mergeWith(io.odysz.module.xtable.XMLTable withTable, int duplicateMode
			)
		{
			if (withTable == null)
			{
				return;
			}
			if (isBuilding || withTable.isBuilding)
			{
				throw new org.xml.sax.SAXException(string.format("Can't merge (table=%s) if one or both tables is being built."
					, getTableID()));
			}
			if (columns == null || withTable.columns == null || columns.Count != withTable.columns
				.Count)
			{
				throw new org.xml.sax.SAXException(string.format("Can't merge (table=%s) if both tables have different column size"
					, getTableID()));
			}
			foreach (string c in columns.Keys)
			{
				if (!withTable.columns.Contains(c))
				{
					throw new org.xml.sax.SAXException(string.format("The other table(withTable=%s) doesn't have a column %s."
						, getTableID(), c));
				}
			}
			System.Collections.Generic.Dictionary<string, string> kv = new System.Collections.Generic.Dictionary
				<string, string>();
			withTable.beforeFirst();
			while (withTable.next())
			{
				if (pkCols != null)
				{
					kv.clear();
					foreach (string pk in pkCols.Keys)
					{
						kv[pk] = withTable.getString(pk);
					}
					System.Collections.Generic.List<string[]> dupList = findRecords(kv);
					if (dupList != null && dupList.Count > 0)
					{
						switch (duplicateMode)
						{
							case duplicateIgnor:
							{
								// 1 ignore duplicated row - no cloning
								break;
							}

							case duplicateReplace:
							{
								// 2 replace row with cloned
								remove(kv);
								cloneRow(withTable);
								break;
							}

							default:
							{
								// x no correct duplicating way
								throw new org.xml.sax.SAXException(string.format("The record from merging table (row number = %s) is duplicating with this table, but no duplicate operation specificed correctly. Check parameter duplicateMode's value."
									, withTable.getRowIdx()));
							}
						}
					}
					else
					{
						// 3 clone a non duplicated row
						cloneRow(withTable);
					}
				}
				else
				{
					// clone row without pk
					cloneRow(withTable);
				}
			}
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		private void cloneRow(io.odysz.module.xtable.XMLTable withTable)
		{
			//		HashMap<String, String> newRow = new HashMap<String, String>();
			//		for (String c : columns.keySet()) {
			//			newRow.put(c, withTable.getString(c));
			//		}
			//		appendRow(newRow);
			string[] newRow = new string[columns.Count];
			foreach (string c in columns.Keys)
			{
				newRow[columns[c]] = withTable.getString(c);
			}
			rows.add(newRow);
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void appendRow(System.Collections.Generic.Dictionary<string, string
			> row)
		{
			//		if (!isBuilding || columns == null || columns.size() < row.size())
			//			throw new SAXException("Can't append row if table been built or columns' size less than row's fields.");
			//		
			//		if (row == null || row.keySet() == null || row.keySet().size() == 0)
			//			return;
			//		
			//		for (String rk : row.keySet()) {
			//			if (!columns.containsKey(rk))
			//				throw new SAXException(String.format("Row with column %s can't append to table %s.", rk, _tableID));
			//		}
			//		
			//		String[] newRow = new String[columns.size()];
			//		for (String c : columns.keySet()) {
			//			newRow[columns.get(c)] = row.get(c);
			//		}
			//		rows.add(newRow);
			if (rows == null)
			{
				rows = new System.Collections.Generic.List<string[]>();
				rowIdx = -1;
			}
			insertRowAt(rows.Count, row);
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void insertRowAt(int rowIdx, System.Collections.Generic.Dictionary
			<string, string> row)
		{
			if (!isBuilding || columns == null || columns.Count < row.Count)
			{
				throw new org.xml.sax.SAXException("Can't insert row if table been built or columns' size less than row's fields."
					);
			}
			if (row == null || row.Keys == null || row.Keys.Count == 0)
			{
				return;
			}
			foreach (string rk in row.Keys)
			{
				if (!columns.Contains(rk))
				{
					throw new org.xml.sax.SAXException(string.format("Row with column %s can't append to table %s."
						, rk, _tableID));
				}
			}
			string[] newRow = new string[columns.Count];
			foreach (string c in columns.Keys)
			{
				newRow[columns[c]] = row[c];
			}
			rows.add(rowIdx, newRow);
		}

		/// <exception cref="org.xml.sax.SAXException"/>
		public virtual void remove(System.Collections.Generic.Dictionary<string, string> 
			kv)
		{
			if (isBuilding)
			{
				throw new org.xml.sax.SAXException("Can not remove while building table.", null);
			}
			if (rows == null)
			{
				return;
			}
			for (int i = 0; i < rows.Count; i++)
			{
				bool matched = false;
				foreach (string col in kv.Keys)
				{
					int c = columns[col];
					if (rows[i][c] == null || !rows[i][c].Equals(kv[col]))
					{
						matched = false;
						break;
					}
					else
					{
						matched = true;
					}
				}
				if (matched)
				{
					rows.remove(i);
					return;
				}
			}
		}
	}
}
