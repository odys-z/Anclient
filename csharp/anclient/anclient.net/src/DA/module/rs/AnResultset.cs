using io.odysz.anson;
using System;
using System.Collections.Generic;
using System.Data;

namespace io.odysz.module.rs
{
	/// <summary>This Resultset is used for non-connected manipulation.</summary>
	/// <remarks>
	/// This Resultset is used for non-connected manipulation.
	/// Rows and Cols are start at 1, the same as
	/// <see cref="java.sql.Resultset"/>
	/// .<br />
	/// TODO This will be changed in the future (It's proved starting at 0 is more bug free).
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class AnResultset : Anson
	{
		// private const bool debug = true;

		// private int colCnt = 0;

		/// <summary>current row index, start at 1.</summary>
		// private int rowIdx = -1;

		// private int rowCnt = 0;

		public DataSet ds { get; }

		/// <summary>
		/// col-index start at 1, map: [alais(upper-case), [col-index, db-col-name(in raw case)]<br />
		/// case 1<pre>
		/// String colName = rsMeta.getColumnLabel(i).toUpperCase();
		/// colnames.put(colName, new Object[] {i, rsMeta.getColumnLabel(i)});
		/// </pre>
		/// case 2<pre>
		/// for (String coln : colnames.keySet())
		/// colnames.put(coln.toUpperCase(), new Object[] {colnames.get(coln), coln});
		/// </pre>
		/// </summary>
		// private Dictionary<string, object[]> colnames;

		// private Dictionary<Type, string> stringFormats;

		/// <summary>for deserializing</summary>
		public AnResultset()
		{
        }

		/// <exception cref="java.sql.SQLException"/>
		public AnResultset(DataSet rs)
		{
			// ICRconstructor(rs);
			ds = rs;
		}

		/// <summary>For paged query, this the total row count</summary>
		public virtual int total { get
			{
				return ds.Tables[0].Rows.Count;
			}
		}

		/*
		private List<List<object>> results;

		/// <exception cref="java.sql.SQLException"/>
		public AnResultset(DataSet rs, SqlConnection connection, Statement statement)
		{
			this._rs = rs;
			conn = connection;
			stmt = statement;
			ICRconstructor(rs);
			this.rs.beforeFirst();
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual void ICRconstructor(DataSet rs)
		{
			results = new List<List<object>>();
			if (rs == null)
			{
				return;
			}
			java.sql.ResultSetMetaData rsMeta = rs.getMetaData();
			colCnt = rsMeta.getColumnCount();
			colnames = new Dictionary<string, object[]>();
			for (int i = colCnt; i >= 1; i--)
			{
				// 2017-11-25, in mysql testing, getColumnName returning original db name, rsMeta.getColumnLabel() returning alias.
				// String colName = rsMeta.getColumnName(i).toUpperCase();
				string colName = rsMeta.getColumnLabel(i).ToUpper();
				if (colnames.Contains(colName))
				{
					Console.Error.WriteLine("WARN: Duplicated col name found, only the last one's index reserved: "
						 + colName);
				}
				colnames[colName] = new object[] { i, rsMeta.getColumnLabel(i) };
			}
			rowIdx = 0;
			rowCnt = 0;
			while (rs.next())
			{
				rowCnt++;
				List<object> row = new List
					<object>();
				for (int j = 1; j <= colCnt; j++)
				{
					row.add(rs.getObject(j));
				}
				results.add(row);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public AnResultset(io.odysz.module.rs.AnResultset icrs)
		{
			results = new List<List<object
				>>();
			if (icrs == null)
			{
				return;
			}
			Dictionary<string, object[]> src_colnames = icrs.getColnames
				();
			colnames = new Dictionary<string, object[]>();
			foreach (string cname in src_colnames.Keys)
			{
				object[] v = src_colnames[cname];
				colnames[cname] = new object[] { v[0], new string((string)v[1]) };
			}
			rowIdx = 0;
			rowCnt = 0;
			colCnt = src_colnames.Keys.Count;
			while (icrs.next())
			{
				rowCnt++;
				List<object> row = new List
					<object>();
				for (int j = 1; j <= colCnt; j++)
				{
					string v = icrs.getString(j);
					if (v == null)
					{
						row.add(string.Empty);
					}
					else
					{
						row.add(new string(v));
					}
				}
				results.add(row);
			}
		}

		/// <summary>Construct an empty set, used for appending rows.</summary>
		/// <param name="colnames"/>
		public AnResultset(Dictionary<string, int> colnames)
		{
			results = new List<List<object
				>>();
			colCnt = colnames.Count;
			this.colnames = new Dictionary<string, object[]>(colCnt
				);
			foreach (string coln in colnames.Keys)
			{
				this.colnames[coln.ToUpper()] = new object[] { colnames[coln], coln };
			}
			rowIdx = 0;
			rowCnt = 0;
		}

		/// <summary>Construct an empty set, used for appending rows.</summary>
		/// <remarks>
		/// Construct an empty set, used for appending rows.
		/// Cols are deep copied.
		/// </remarks>
		/// <param name="colnames"/>
		public AnResultset(Dictionary<string, object[]> colnames
			, bool toUpperCase)
		{
			results = new List<List<object
				>>();
			colCnt = colnames.Count;
			this.colnames = new Dictionary<string, object[]>(colCnt
				);
			foreach (string coln in colnames.Keys)
			{
				this.colnames[toUpperCase ? coln.ToUpper() : coln] = colnames[coln];
			}
			rowIdx = 0;
			rowCnt = 0;
		}

		/// <summary>Append a new row - deep copy, set current row as the appended row.</summary>
		/// <param name="row"/>
		/// <returns>this</returns>
		public virtual io.odysz.module.rs.AnResultset appendDeeply(List
			<object> row)
		{
			List<object> newRow = new List
				<object>(row.Count);
			for (int j = 0; j < row.Count; j++)
			{
				string v = string.Empty;
				try
				{
					v = row[j].ToString();
				}
				catch (Exception)
				{
				}
				newRow.add(v);
			}
			results.add(newRow);
			rowCnt++;
			rowIdx = results.Count;
			return this;
		}

		public virtual io.odysz.module.rs.AnResultset append(List
			<object> includingRow)
		{
			results.add(includingRow);
			rowCnt++;
			rowIdx = results.Count;
			return this;
		}

		/// <summary>For debug, generate a fake rs.</summary>
		/// <param name="rows"/>
		/// <param name="cols"/>
		public AnResultset(int rows, int cols, params string[] colPrefix)
		{
			if (rows <= 0 || cols <= 0)
			{
				return;
			}
			results = new List<List<object
				>>(rows);
			colCnt = cols;
			colnames = new Dictionary<string, object[]>(cols);
			for (int i = colCnt; i >= 1; i--)
			{
				string colName = (colPrefix == null || colPrefix.Length != 1) ? Sharpen.Runtime.getStringValueOf
					(i) : string.format("%s%s", colPrefix[0].Trim(), i);
				colnames[colName.ToUpper()] = new object[] { i, colName };
			}
			rowIdx = 0;
			rowCnt = 0;
			for (int r = 0; r < rows; r++)
			{
				rowCnt++;
				List<object> row = new List
					<object>(colCnt);
				for (int j = 1; j <= colCnt; j++)
				{
					row.add(string.format("%s, %s", r, j));
				}
				results.add(row);
			}
		}

		public AnResultset(int rows, string[] colNames, bool generateData)
		{
			if (rows <= 0 || colNames == null || colNames.Length == 0)
			{
				return;
			}
			results = new List<List<object
				>>(rows);
			colCnt = colNames.Length;
			this.colnames = new Dictionary<string, object[]>(colCnt
				);
			for (int i = colCnt; i >= 1; i--)
			{
				string cn = colNames[i - 1] == null ? Sharpen.Runtime.getStringValueOf(i) : colNames
					[i - 1];
				colnames[cn.ToUpper()] = new object[] { i, cn };
			}
			rowIdx = 0;
			rowCnt = 0;
			for (int r = 0; r < rows; r++)
			{
				rowCnt++;
				List<object> row = new List
					<object>(colCnt);
				for (int j = 1; j <= colCnt; j++)
				{
					if (generateData)
					{
						row.add(string.format("%s, %s", r, j));
					}
					else
					{
						row.add(string.Empty);
					}
				}
				results.add(row);
			}
		}

		public AnResultset(string[] colNames)
		{
			results = new List<List<object
				>>(16);
			colCnt = colNames.Length;
			this.colnames = new Dictionary<string, object[]>(colCnt
				);
			for (int i = colCnt; i >= 1; i--)
			{
				// colnames.put(colNames[i - 1] == null ? String.valueOf(i): colNames[i - 1].toUpperCase(), i);
				string cn = colNames[i - 1] == null ? Sharpen.Runtime.getStringValueOf(i) : colNames
					[i - 1];
				colnames[cn.ToUpper()] = new object[] { i, cn };
			}
			rowIdx = 0;
			rowCnt = 0;
		}

		public AnResultset(List<string> colNames)
		{
			results = new List<List<object
				>>(16);
			colCnt = colNames.Count;
			this.colnames = new Dictionary<string, object[]>(colCnt
				);
			for (int i = colCnt; i >= 1; i--)
			{
				// colnames.put(colNames.get(i - 1) == null ? String.valueOf(i): colNames.get(i - 1).toUpperCase(), i);
				string cn = colNames[i - 1] == null ? Sharpen.Runtime.getStringValueOf(i) : colNames
					[i - 1];
				colnames[cn.ToUpper()] = new object[] { i, cn };
			}
			rowIdx = 0;
			rowCnt = 0;
		}

		/// <returns>column names</returns>
		public virtual Dictionary<string, object[]> getColnames
			()
		{
			return colnames;
		}

		public virtual bool hasCol(string c)
		{
			return io.odysz.common.LangExt.isblank(c) ? false : getColnames().Contains(c.Trim
				().ToUpper());
		}

		public virtual List<List<object
			>> getRows()
		{
			return results;
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual bool next()
		{
			rowIdx++;
			if (rs != null)
			{
				rs.next();
			}
			if (rowIdx > rowCnt)
			{
				return false;
			}
			else
			{
				return true;
			}
		}

		/// <summary>
		/// last start at 1, included in nexting range.<br />
		/// If current index = 4, nextUntill(5) return true;<br />
		/// If current index = 5, nextUntill(5) return false;
		/// </summary>
		/// <param name="last"/>
		/// <returns>true: ok</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual bool nextUntill(int last)
		{
			rowIdx++;
			if (rs != null)
			{
				rs.next();
			}
			if (rowIdx > rowCnt || rowIdx > last)
			{
				return false;
			}
			else
			{
				return true;
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual int append(io.odysz.module.rs.AnResultset more)
		{
			// check cols
			if (colCnt != more.getColCount())
			{
				throw new java.sql.SQLException("Columns not matched.");
			}
			Sharpen.Collections.AddAll(results, ((io.odysz.module.rs.AnResultset)more).results
				);
			rowCnt += ((io.odysz.module.rs.AnResultset)more).rowCnt;
			return rowCnt;
		}

		/// <summary>Add a formatter to type of clz when converting to String.</summary>
		/// <param name="clz"/>
		/// <param name="format"/>
		/// <returns>this</returns>
		public virtual io.odysz.module.rs.AnResultset stringFormat(java.lang.Class clz, string
			 format)
		{
			if (stringFormats == null)
			{
				stringFormats = new Dictionary<java.lang.Class, string
					>();
			}
			stringFormats[clz] = format;
			return this;
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual string getString(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					return null;
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					return null;
				}
				else
				{
					// else return results.get(rowIdx - 1).get(colIndex - 1).toString();
					object v = results[rowIdx - 1][colIndex - 1];
					return stringFormats != null && stringFormats.Contains(Sharpen.Runtime.getClassForObject
						(v)) ? string.format(stringFormats[Sharpen.Runtime.getClassForObject(v)], v) : v
						.ToString();
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message + " Empty Results?");
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual string getString(string colName)
		{
			if (colName == null)
			{
				return null;
			}
			return getString((int)(colnames[colName.ToUpper()][0]));
		}

		/// <summary>If field is a date value, return string formatted by sdf.</summary>
		/// <param name="colName"/>
		/// <param name="sdf"/>
		/// <returns>string value</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual string getString(string colName, java.text.SimpleDateFormat sdf)
		{
			if (colName == null)
			{
				return null;
			}
			return getString((int)colnames[colName.ToUpper()][0], sdf);
		}

		/// <summary>If field is a date value, return string formatted by sdf.</summary>
		/// <param name="colIndex"/>
		/// <param name="sdf"/>
		/// <returns>string value</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual string getString(int colIndex, java.text.SimpleDateFormat sdf)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					return null;
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					return null;
				}
				else
				{
					object obj = results[rowIdx - 1][colIndex - 1];
					if (obj is DateTime)
					{
						return sdf.format(obj);
					}
					// return results.get(rowIdx - 1).get(colIndex - 1).toString();
					object v = results[rowIdx - 1][colIndex - 1];
					return stringFormats != null && stringFormats.Contains(Sharpen.Runtime.getClassForObject
						(v)) ? string.format(stringFormats[Sharpen.Runtime.getClassForObject(v)], v) : v
						.ToString();
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <summary>if null, change to ""</summary>
		/// <param name="colName"/>
		/// <returns>string value</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual string getStringNonull(string colName)
		{
			if (colName == null)
			{
				return string.Empty;
			}
			string s = getString((int)colnames[colName.ToUpper()][0]);
			return s == null ? string.Empty : s;
		}

		/// <summary>if value is equals case insensitive to 1,true, yes, y, t, decimal &gt; 0.001 return true, else return false;
		/// 	</summary>
		/// <param name="colIndex"/>
		/// <returns>string value</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual bool getBoolean(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					return false;
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					return false;
				}
				else
				{
					try
					{
						string v = Sharpen.Runtime.getStringValueOf(results[rowIdx - 1][colIndex - 1]).Trim
							();
						if (v == null)
						{
							return false;
						}
						v = v.ToLower();
						if (v.Equals("1"))
						{
							return true;
						}
						if (v.Equals("true"))
						{
							return true;
						}
						if (v.Equals("yes"))
						{
							return true;
						}
						if (v.Equals("y"))
						{
							return true;
						}
						if (v.Equals("t"))
						{
							return true;
						}
						try
						{
							double d = double.valueOf(v);
							if (d >= 0.001d)
							{
								return true;
							}
						}
						catch (Exception)
						{
						}
						//if (v.equals("0")) return false;
						//if (v.equals("false")) return false;
						return false;
					}
					catch (Exception)
					{
						return false;
					}
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual bool getBoolean(string colName)
		{
			return getBoolean((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual double getDouble(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					throw new java.sql.SQLException("Null value to be converted to double.");
				}
				else
				{
					return double.valueOf(results[rowIdx - 1][colIndex - 1].ToString());
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual double getDouble(string colName)
		{
			return getDouble((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual java.math.BigDecimal getBigDecimal(int colIndex)
		{
			return java.math.BigDecimal.valueOf(getDouble(colIndex));
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual java.math.BigDecimal getBigDecimal(string colName)
		{
			return java.math.BigDecimal.valueOf(getDouble((int)colnames[colName.ToUpper()][0]
				));
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual DateTime getDate(int index)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				if (results[rowIdx - 1][index - 1] == null)
				{
					return null;
				}
				else
				{
					// Oracle Datetime, Mysql Date, datetime can safely cast to date.
					// If your debugging arrived here, you may first check you database column type.
					return (DateTime)results[rowIdx - 1][index - 1];
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual DateTime getDate(string colName)
		{
			return getDate((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual int getInt(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					throw new java.sql.SQLException("Null value to be converted to int.");
				}
				else
				{
					return int.Parse(results[rowIdx - 1][colIndex - 1].ToString());
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		public virtual int getInt(string col, int deflt)
		{
			try
			{
				return getInt(col);
			}
			catch (java.sql.SQLException)
			{
				return deflt;
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual long getLong(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					throw new java.sql.SQLException("Null value to be converted to long.");
				}
				else
				{
					return long.valueOf(results[rowIdx - 1][colIndex - 1].ToString());
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual long getLong(string colName)
		{
			return getLong((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual int getInt(string colName)
		{
			return getInt((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual java.sql.Blob getBlob(int colIndex)
		{
			try
			{
				if (rs == null)
				{
					throw new java.sql.SQLException("Can not get Blob constructed by OracleHelper.select(). To access Blob, use OracleHelper.selectBlob()"
						);
				}
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				if (results[rowIdx - 1][colIndex - 1] == null)
				{
					throw new java.sql.SQLException("Null value to be converted to blob.");
				}
				else
				{
					return (java.sql.Blob)rs.getBlob(colIndex);
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual java.sql.Blob getBlob(string colName)
		{
			return getBlob((int)colnames[colName.ToUpper()][0]);
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual object getObject(int colIndex)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					throw new java.sql.SQLException("Null row to be accessed.");
				}
				else
				{
					//if (results.get(rowIdx - 1).get(colIndex - 1) == null) throw new SQLException("Null value to be converted to object.");
					return results[rowIdx - 1][colIndex - 1];
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <summary>
		/// Get current row index.<br />
		/// Row index start from 1.<br />
		/// The last row indix == getRowCount()
		/// </summary>
		/// <returns>string value</returns>
		public virtual int getRow()
		{
			if (results == null)
			{
				return 0;
			}
			return rowIdx;
		}

		public virtual int getColumnCount()
		{
			return colCnt;
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual void first()
		{
			if (getRow() <= 0)
			{
				throw new java.sql.SQLException("Resultset out of boundary.");
			}
			rowIdx = 1;
			if (rs != null)
			{
				rs.first();
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual io.odysz.module.rs.AnResultset beforeFirst()
		{
			if (getRow() > 0)
			{
				rowIdx = 0;
			}
			if (rs != null)
			{
				rs.beforeFirst();
			}
			return this;
		}

		/// <summary>idx start from 1.</summary>
		/// <remarks>
		/// idx start from 1. before(1) == beforeFirst().<br />
		/// As java.sql.Resultset don't support this method,
		/// calling this will throw an exception if this object are created from a java.sql.Resultset.
		/// </remarks>
		/// <param name="idx"/>
		/// <returns>this</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual io.odysz.module.rs.AnResultset before(int idx)
		{
			if (rs != null)
			{
				throw new java.sql.SQLException("before(int) can't been called when there is an associate java.sql.Resultset."
					);
			}
			rowIdx = idx - 1;
			return this;
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual void close()
		{
			if (rs != null)
			{
				rs.close();
				stmt.close();
				conn.close();
				rs = null;
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual bool previous()
		{
			rowIdx--;
			if (rs != null)
			{
				rs.previous();
			}
			if (0 < rowIdx && rowIdx <= rowCnt)
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		/// <summary>Get col name in raw case.<br /></summary>
		/// <param name="i">start at 1</param>
		/// <returns>column name or null</returns>
		public virtual string getColumnName(int i)
		{
			foreach (string cn in colnames.Keys)
			{
				if (((int)colnames[cn][0]) == i)
				{
					return (string)colnames[cn][1];
				}
			}
			return null;
		}

		/// <summary>Set column raw name.</summary>
		/// <param name="i">index</param>
		/// <param name="n">name</param>
		public virtual void setColumnName(int i, string n)
		{
			foreach (string cn in colnames.Keys)
			{
				if (((int)colnames[cn][0]) == i)
				{
					colnames[cn][1] = n;
					break;
				}
			}
		}

		/// <param name="upper_bumps">[key: UPPER-CASE, value: bumpCase]</param>
		/// <returns>
		/// this (with column names updated)
		/// public SResultset setColumnCase(HashMap<String, String> upper_bumps) {
		/// if (upper_bumps == null) return this;
		/// for (String cn : colnames.keySet()) {
		/// if (upper_bumps.containsKey(cn)) {
		/// String bump =  (upper_bumps.get(cn));
		/// if (bump != null)
		/// colnames.get(cn)[1] = bump;
		/// }
		/// }
		/// return this;
		/// }
		/// </returns>
		public virtual int getRowCount()
		{
			return rowCnt;
		}

		public virtual int getColCount()
		{
			return colCnt;
		}

		/// <summary>idx start at 0</summary>
		/// <exception cref="java.sql.SQLException"/>
		public virtual Collections.Generic.List<object> getRowAt(int idx)
		{
			if (results == null || idx < 0 || idx >= results.Count)
			{
				throw new java.sql.SQLException("Row index out of boundary. idx: " + idx);
			}
			return results[idx];
		}

		/// <summary>Set value to current row</summary>
		/// <param name="colIndex"/>
		/// <param name="v"/>
		/// <returns>this</returns>
		/// <exception cref="java.sql.SQLException"></exception>
		public virtual io.odysz.module.rs.AnResultset set(int colIndex, string v)
		{
			try
			{
				if (rowIdx <= 0 || results == null || results[rowIdx - 1] == null)
				{
					return this;
				}
				//if (results.get(rowIdx - 1).get(colIndex - 1) == null) return false;
				if (results[rowIdx - 1].Count < colIndex)
				{
					return this;
				}
				else
				{
					results[rowIdx - 1].set(colIndex - 1, v);
					return this;
				}
			}
			catch (Exception e)
			{
				throw new java.sql.SQLException(e.Message);
			}
		}

		/// <summary>Set value to current row</summary>
		/// <param name="colName"/>
		/// <param name="v"/>
		/// <returns>this</returns>
		/// <exception cref="java.sql.SQLException"></exception>
		public virtual io.odysz.module.rs.AnResultset set(string colName, string v)
		{
			return set((int)colnames[colName.ToUpper()][0], v);
		}

		/// <summary>find the first row that contain a matched value in field <i>col</i>.</summary>
		/// <remarks>find the first row that contain a matched value in field <i>col</i>. Matching are done by <i>regex</i>.
		/// 	</remarks>
		/// <param name="col"/>
		/// <param name="regex"/>
		/// <returns>row index or 0</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual int findFirst(string col, string regex)
		{
			beforeFirst();
			io.odysz.common.Regex regx = new io.odysz.common.Regex(regex);
			while (next())
			{
				string target = getString(col);
				if (regx.match(target))
				{
					return rowIdx;
				}
			}
			return 0;
		}

		public virtual Collections.Generic.List<object> getRowCells()
		{
			return results[rowIdx - 1];
		}

		/// <summary>Print ResutSet in out or err.</summary>
		/// <param name="err">weather output in "out" or "err"</param>
		/// <param name="max">mas rows to print</param>
		/// <param name="includeCols">include column of names.</param>
		/// <returns/>
		public virtual int printSomeData(bool err, int max, params string[] includeCols)
		{
			try
			{
				printHeaders();
				if (includeCols != null && includeCols.Length > 0)
				{
					if (!"*".Equals(includeCols[0]))
					{
						for (int ix = 0; ix < includeCols.Length; ix++)
						{
							if (err)
							{
								Console.Error.Write("\t" + includeCols[ix]);
							}
							else
							{
								Console.Out.Write("\t" + includeCols[ix]);
							}
						}
						// line feed
						if (err)
						{
							Console.Error.WriteLine(string.Empty);
						}
						else
						{
							Console.Out.WriteLine(string.Empty);
						}
						beforeFirst();
						while (next() && getRow() <= max)
						{
							foreach (string incCol in includeCols)
							{
								printcell(err, incCol);
							}
							// end line
							if (err)
							{
								Console.Error.WriteLine(string.Empty);
							}
							else
							{
								Console.Out.WriteLine(string.Empty);
							}
						}
					}
					else
					{
						beforeFirst();
						while (next() && getRow() <= max)
						{
							for (int c = 1; c <= getColCount(); c++)
							{
								printcell(err, c);
							}
							// end line
							if (err)
							{
								Console.Error.WriteLine(string.Empty);
							}
							else
							{
								Console.Out.WriteLine(string.Empty);
							}
						}
					}
				}
			}
			catch (Exception)
			{
			}
			return results == null ? 0 : results.Count;
		}

		/// <exception cref="java.sql.SQLException"/>
		private void printcell(bool err, string c)
		{
			if (err)
			{
				Console.Error.Write("\t" + getString(c));
			}
			else
			{
				Console.Out.Write("\t" + getString(c));
			}
		}

		/// <exception cref="java.sql.SQLException"/>
		private void printcell(bool err, int c)
		{
			if (err)
			{
				Console.Error.Write(string.format("%s : %s  ", c, getString(c)));
			}
			else
			{
				Console.Out.Write(string.format("%s : %s  ", c, getString(c)));
			}
		}

		private void printHeaders()
		{
			for (int c = 0; c < colnames.Count; c++)
			{
				Console.Out.Write(string.format("%s : %s\t", c + 1, getColumnName(c + 1)));
			}
			Console.Out.WriteLine(string.format("\nrow count: %d", results == null ? 0
				 : results.Count));
		}

		//	public SemanticObject convert2Jarr(boolean includeColHeader) throws UnsupportedEncodingException {
		//		// JsonObjectBuilder b = Json.createObjectBuilder();
		//		SemanticObject b = new SemanticObject();
		////		b.add("rowCount", results == null ? 0 : results.size());
		////		b.add("colCount", colnames == null ? 0 : colnames.size());
		////		if (gson == null) gson = new Gson();
		////		b.add("headers", gson.toJson(colnames));
		////
		////		Type rt = new TypeToken<ArrayList<ArrayList<String>>>(){}.getType();
		////		b.add("rows", gson.toJson(results, rt ));
		//
		//		return b;
		//	}
		/// <summary>Collect fields value that can be used in "IN" condition, e.g.</summary>
		/// <remarks>Collect fields value that can be used in "IN" condition, e.g. 'v1', 'v2', ...
		/// 	</remarks>
		/// <param name="rs"/>
		/// <param name="fields"/>
		/// <returns>['row0 field-val', 'row1 field-val', ...]</returns>
		/// <exception cref="java.sql.SQLException"/>
		public static string collectFields(io.odysz.module.rs.AnResultset rs, params string
			[] fields)
		{
			string s = string.Empty;
			if (rs != null)
			{
				rs.beforeFirst();
				while (rs.next())
				{
					foreach (string f in fields)
					{
						if (s.Length > 0)
						{
							s += ",";
						}
						// 2018.10.07 see UpdateBatch#recordUpdate() condition handling section
						// s += String.format("'%s'", rs.getString(f));
						s += rs.getString(f);
					}
				}
				rs.beforeFirst();
			}
			return s;
		}

		/// <exception cref="java.sql.SQLException"/>
		public virtual string getString(int rowix, string field)
		{
			if (results == null || results.Count < rowix)
			{
				return null;
			}
			int colix = (int)colnames[field.ToUpper()][0];
			// return results == null ? null : (String) results.get(rowix - 1).get(colix - 1);
			return getString(colix);
		}

		/// <summary>
		/// Try in-place convert all values to integer elements
		/// - expensive, especially with many non-integers.
		/// </summary>
		/// <returns/>
		public virtual.List<object> getRowsInt()
		{
			foreach (Collections.ArrayList row in results)
			{
				for (int i = 0; i < sz; i++)
				{
					try
					{
						row.set(i, int.Parse((string)row[i]));
					}
					catch (Exception)
					}
				}
			}
			return results;
		}
		*/
	}
}
