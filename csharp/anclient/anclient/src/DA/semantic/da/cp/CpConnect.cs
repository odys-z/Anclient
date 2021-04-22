using Sharpen;

namespace io.odysz.semantic.DA.cp
{
	public class CpConnect : io.odysz.semantic.DA.AbsConnect<io.odysz.semantic.DA.cp.CpConnect
		>
	{
		// Deprecated. Use java.sql.Clob interface for declaration instead of using concrete class oracle.sql.CLOB.
		// see https://docs.oracle.com/database/121/JAJDB/oracle/sql/CLOB.html 
		//import oracle.sql.CLOB;
		//	public static final HashSet<String> orclKeywords = new HashSet<String>() {{add("level");}};
		/// <summary>Use this for querying database without help of sql builder (which need query meta data first with this method).
		/// 	</summary>
		/// <param name="src">name that matches context.xml/Resource/name, like 'inet' etc.</param>
		/// <param name="sql"/>
		/// <returns>results</returns>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset select(string src, string sql)
		{
			java.sql.Connection con = null;
			java.sql.PreparedStatement pstmt;
			io.odysz.module.rs.AnResultset icrs = null;
			try
			{
				javax.naming.InitialContext ctx = new javax.naming.InitialContext();
				// DataSource ds = (DataSource)ctx.lookup("java:/comp/env/jdbc/frameDs");
				javax.sql.DataSource ds = (javax.sql.DataSource)ctx.lookup("java:/comp/env/" + src
					);
				// apache told us use 
				con = ds.getConnection();
				con.setAutoCommit(false);
				// System.out.println(con.getMetaData().getURL());
				// System.out.println(sql);
				io.odysz.common.Utils.logi(con.getMetaData().getURL());
				io.odysz.common.Utils.logi(sql);
				pstmt = con.prepareStatement(sql);
				java.sql.ResultSet rs = pstmt.executeQuery();
				icrs = new io.odysz.module.rs.AnResultset(rs);
				con.commit();
				pstmt.close();
			}
			catch (System.Exception e)
			{
				// System.err.println("ERROR - " + src);
				// System.err.println("      - " + sql);
				io.odysz.common.Utils.warn("ERROR - " + src);
				io.odysz.common.Utils.warn("      - " + sql);
				Sharpen.Runtime.printStackTrace(e);
				throw new java.sql.SQLException(e.Message);
			}
			finally
			{
				if (con != null)
				{
					con.close();
				}
			}
			return icrs;
		}

		private bool printSql;

		internal virtual bool printSql()
		{
			return printSql;
		}

		private string srcId;

		private javax.sql.DataSource ds;

		/// <summary>Managing connection and ds for mysql, oracle, ...</summary>
		/// <param name="srcId"/>
		/// <param name="driverType"/>
		/// <param name="printSql"/>
		/// <exception cref="org.xml.sax.SAXException"/>
		public CpConnect(string srcId, io.odysz.common.dbtype driverType, bool printSql)
			: base(driverType)
		{
			// private HashMap<String, HashMap<String, String>> mappings;
			this.srcId = "java:/comp/env/" + srcId;
			this.printSql = printSql;
		}

		/// <summary>e.g.</summary>
		/// <remarks>e.g. ["a_logs" ["TXT",  CLOB]]</remarks>
		private System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
			<string, io.odysz.semantic.DA.OracleLob>> clobMeta;

		//	/**Scanning map file, collect any text field: [tabl, [field, lob]]
		//	 * @param mappings
		//	 * @return
		//	 * @throws SAXException
		//	 */
		//	private static HashMap<String, HashMap<String, OracleLob>> buildClobMeta(LinkedHashMap<String, XMLTable> mappings) throws SAXException {
		//		if (mappings == null) return null;
		//		HashMap<String, HashMap<String, OracleLob>> lobMetas = new HashMap<String, HashMap<String, OracleLob>>();
		//		XMLTable mainxt = mappings.get("tabls");
		//		mainxt.beforeFirst();
		//		while (mainxt.next()) {
		//			String tid = mainxt.getString("u");
		//			String logictid = mainxt.getString("b");
		//			String pk = null;
		//			XMLTable xt = mappings.get(tid);
		//			xt.beforeFirst();
		//			ArrayList<String> lobCols = null;
		//			while (xt.next()) {
		//				// 0; idfield, 1; lobfield
		//				if ("text".equals(xt.getString("tn").toLowerCase())) {
		//					if (lobCols == null)
		//						lobCols = new ArrayList<String>(1); 
		//					lobCols.add(xt.getString("f"));
		//				}
		//				else if ("PRI".equals(xt.getString("k"))) {
		//					pk = xt.getString("f");
		//				}
		//			}
		//			if (lobCols != null) {
		//				for (String lobCol : lobCols) {
		//					HashMap<String, OracleLob> tabMeta = lobMetas.get(tid);
		//					if (tabMeta == null) {
		//						tabMeta = new HashMap<String, OracleLob>(1);
		//						lobMetas.put(logictid, tabMeta);
		//					}
		//					OracleLob orclob = OracleLob.template(tid, pk, lobCol); 
		//					tabMeta.put(lobCol, orclob);
		//				}
		//			}
		//			xt.beforeFirst();
		//		}
		//		mainxt.beforeFirst();
		//		return lobMetas;
		//	}
		//	private boolean _isOrcl;
		//	
		//	public boolean isOracle() { return _isOrcl; }
		/// <summary>Get the CLOBs meta data - which is built while initialization.</summary>
		/// <returns>: map[tabl, [field, lob]]</returns>
		public virtual System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
			<string, io.odysz.semantic.DA.OracleLob>> getlobMeta()
		{
			return clobMeta;
		}

		/// <summary>Get Connection</summary>
		/// <returns/>
		/// <exception cref="java.sql.SQLException">
		/// database access error occurs while get connection. See
		/// <see cref="javax.sql.DataSource.getConnection()"/>
		/// .
		/// </exception>
		/// <exception cref="javax.naming.NamingException">lookup connection failed</exception>
		protected internal virtual java.sql.Connection getConnection()
		{
			if (ds == null)
			{
				javax.naming.InitialContext ctx;
				//			try {
				ctx = new javax.naming.InitialContext();
				ds = (javax.sql.DataSource)ctx.lookup(srcId);
			}
			//			} catch (NamingException e) {
			//				throw new SQLException(e.getMessage());
			//			}
			java.sql.Connection conn = ds.getConnection();
			return conn;
		}

		//	public String formatFieldName(String expr) {
		//		if (_isOrcl && orclKeywords.contains(expr.trim()))
		//			return String.format("\"%s\"", expr.trim().toUpperCase());
		//		return expr;
		//	}
		/// <summary>
		/// For
		/// <see cref="io.odysz.semantic.DA.Connects"/>
		/// creating Meta data before Datasource is usable.
		/// </summary>
		/// <param name="sql"/>
		/// <returns>query results</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="javax.naming.NamingException"></exception>
		public override io.odysz.module.rs.AnResultset select(string sql, int flags)
		{
			java.sql.Connection con = null;
			java.sql.PreparedStatement pstmt;
			io.odysz.module.rs.AnResultset icrs = null;
			try
			{
				// if (printSql) System.out.println(sql);
				io.odysz.semantic.DA.Connects.printSql(printSql, flags, sql);
				con = getConnection();
				con.setAutoCommit(false);
				pstmt = con.prepareStatement(sql);
				java.sql.ResultSet rs = pstmt.executeQuery();
				icrs = new io.odysz.module.rs.AnResultset(rs);
				con.commit();
				pstmt.close();
			}
			finally
			{
				if (con != null)
				{
					con.close();
				}
			}
			if (icrs != null)
			{
				icrs.beforeFirst();
			}
			return icrs;
		}

		//	public void readClob(AnResultset rs, String[] tabls) throws SQLException, IOException {
		//		if (tabls == null) return;
		//		for (String tabl : tabls) {
		//			readClob(rs, clobMeta.get(tabl));
		//		}
		//	}
		//	private void readClob(AnResultset rs, HashMap<String, OracleLob> tablobs) throws SQLException, IOException {
		//		if (rs == null || tablobs == null) return;
		//		rs.beforeFirst();
		//		while (rs.next()) {
		//			boolean foundClob = false;
		//			for (int ci = 1; ci <= rs.getColCount(); ci++) {
		//				Object obj = rs.getObject(ci);
		//				if (obj instanceof CLOB) {
		//					foundClob = true;
		//					// read
		//					OracleLob lob = tablobs.get(rs.getColumnName(ci));
		//					if (lob == null) {
		//						System.err.println("Can't find CLOB field: " + rs.getColumnName(ci));
		//						System.err.println("Table CLOBs: " + tablobs.keySet().toString());
		//						System.err.println("Tips:\n\tDon't use alais for a CLOB/text field. Can't handle this.");
		//						continue;
		//					}
		//					AnResultset lobrs = select(String.format("select %s, length(%s) from %s where %s = '%s'",
		//							lob.lobField(), lob.lobField(), lob.tabl(), lob.idField(), rs.getString(lob.idField())),
		//							Connects.flag_nothing);
		//
		//					lobrs.beforeFirst().next();
		//					int len = lobrs.getInt(2);
		//					CLOB clob = (CLOB) lobrs.getObject(1); 
		//					Reader chareader = clob.getCharacterStream();
		//					char [] charray = new char [len];
		//					@SuppressWarnings("unused")
		//					int bytes_read = chareader.read(charray, 0, len);
		//					//conn.close();
		//					rs.set(ci, String.valueOf(charray));
		//				}
		//			}
		//			if (!foundClob) break;
		//		}
		//		
		//		rs.beforeFirst();
		//	}
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="javax.naming.NamingException"/>
		protected internal override int[] commit(System.Collections.Generic.List<string> 
			sqls, int flags)
		{
			io.odysz.semantic.DA.Connects.printSql(printSql, flags, sqls);
			int[] ret = null;
			java.sql.Connection conn = null;
			java.sql.Statement stmt = null;
			try
			{
				conn = getConnection();
				if (conn != null)
				{
					stmt = conn.createStatement();
					try
					{
						stmt = conn.createStatement(java.sql.ResultSet.TYPE_SCROLL_SENSITIVE, java.sql.ResultSet
							.CONCUR_UPDATABLE);
						conn.setAutoCommit(false);
						foreach (string sql in sqls)
						{
							stmt.addBatch(sql);
						}
						ret = stmt.executeBatch();
						conn.commit();
					}
					catch (System.Exception exx)
					{
						conn.rollback();
						Sharpen.Runtime.printStackTrace(exx);
						throw new java.sql.SQLException(exx);
					}
					finally
					{
					}
				}
				else
				{
					throw new java.sql.SQLException("batch execution failed");
				}
			}
			catch (java.sql.SQLException ex)
			{
				//        } catch (NamingException e) {
				//			e.printStackTrace();
				//			throw new SQLException(e.getMessage());
				throw;
			}
			finally
			{
				try
				{
					if (conn != null)
					{
						conn.close();
					}
					if (stmt != null)
					{
						stmt.close();
					}
				}
				catch (System.Exception ex)
				{
					Sharpen.Runtime.printStackTrace(ex);
				}
				finally
				{
					conn = null;
					stmt = null;
				}
			}
			return ret;
		}

		//////////////////////////////// oracle the hateful ///////////////////////////////////////
		//	public void updateLobs(ArrayList<OracleLob> lobs) throws SQLException {
		//		if (!_isOrcl && lobs != null && lobs.size() > 0)
		//			throw new SQLException(" Why updating lobs to a non oracle db ? ");
		//
		//		for (OracleLob lb : lobs) {
		//			try { updateClob(lb); }
		//			catch (Exception e) {
		//				e.printStackTrace();
		//				String msg = lb.lob() == null ? "" : lb.lob().toString();
		//				msg = msg.length() > 30 ? msg.substring(0, 30) : msg;
		//				System.err.println(String.format(
		//					"ERROR - ignoring clob updating error on %s.%s = '%s', lob = %s ...",
		//					lb.tabl(), lb.idField(), lb.recId(), msg));
		//			}
		//		}
		//	}
		//	private void updateClob(OracleLob lob) throws Exception {
		//		String blobField = lob.lobField();
		//	// private void insert_updateClob(String blobTable, String idField, String blobField, String recID, String v) throws Exception {
		//		Connection conn = getConnection();
		//		try{
		//			conn.setAutoCommit(false);
		//			
		//			Statement stmt=conn.createStatement();
		////			if (insertSql != null) {
		////				if (enableSystemout) System.out.println("insert sql: " + insertSql);
		////				stmt.executeUpdate(insertSql);
		////			}
		//			
		//			String sql = String.format("SELECT %s FROM %s WHERE %s = '%s' FOR UPDATE",
		//					blobField, lob.tabl(), lob.idField(), lob.recId());
		//			ResultSet rs=stmt.executeQuery(sql);
		//			
		//			if(rs.next()){
		//				// BLOB rsblob = (BLOB)rs.getBlob(1); rs.getClob(1);
		//				CLOB rslob = (CLOB)rs.getClob(1);
		//				if (rslob == null) {
		//					System.out.println("CLOB " + blobField + " is null. insert '...' first");
		//					// System.out.println("insert into myUploadTable(id, filedata) values('id.001', EMPTY_BLOB())");
		//					return;
		//				}
		//				Writer out = rslob.getCharacterOutputStream(); // .getBinaryOutputStream();
		//				
		////				int size = rslob.getBufferSize();
		////				byte[] buffer = new byte[size];
		////				int len;
		//				//while((len = inStream.read(buffer)) != -1)
		//					// out.write(buffer,0,len);
		//				out.write((String)lob.lob());
		//				out.close();
		//				conn.commit();
		//				if (printSql) System.out.println("blob updated.");
		//			}
		//		}
		//		catch(Exception ex){
		//			conn.rollback();
		//			throw ex;
		//		}
		//		finally {conn.close();}
		//	}
		public static string truncatUtf8(string s, int maxBytes)
		{
			int b = 0;
			for (int i = 0; i < s.Length; i++)
			{
				char c = s[i];
				// ranges from http://en.wikipedia.org/wiki/UTF-8
				int skip = 0;
				int more;
				if (c <= unchecked((int)(0x007f)))
				{
					more = 1;
				}
				else
				{
					if (c <= unchecked((int)(0x07FF)))
					{
						more = 2;
					}
					else
					{
						if (c <= unchecked((int)(0xd7ff)))
						{
							more = 3;
						}
						else
						{
							if (c <= unchecked((int)(0xDFFF)))
							{
								// surrogate area, consume next char as well
								more = 4;
								skip = 1;
							}
							else
							{
								more = 3;
							}
						}
					}
				}
				if (b + more > maxBytes)
				{
					return Sharpen.Runtime.substring(s, 0, i);
				}
				b += more;
				i += skip;
			}
			return s;
		}

		//	public String pageSql(String sql, int page, int size) {
		//		int r1 = page * size;
		//		int r2 = r1 + size;
		//		if (driverType.equalsIgnoreCase("mysql")) {
		//			String s2 = String.format(
		//					"select * from (select t.*, @ic_num := @ic_num + 1 as rnum from (%s) t, (select @ic_num := 0) ic_t) t1 where rnum > %s and rnum <= %s",
		//					sql, r1, r2);
		//			return s2;
		//		}
		//		else if (driverType.equalsIgnoreCase("orcl") || driverType.equalsIgnoreCase("oracle"))
		//			return String.format("select * from (select t.*, rownum r_n_ from (%s) t WHERE rownum <= %s  order by rownum) t where r_n_ > %s",
		//					sql, r2, r1);
		////			return String.format("select * from (%s) t where rownum > %d and rownum <= %s",
		////					sql, r1, r2);
		//		else if (driverType.equalsIgnoreCase("mssql2k"))
		//			return String.format("select * from (SELECT ROW_NUMBER() OVER(ORDER BY (select NULL as noorder)) AS RowNum, * from (%s) t) t where rownum >= 1 and rownum <= 2;" + 
		//					sql, r1, r2);
		//		else return sql;
		//	}
		/// <summary>TODO should this been moved to semantics handling?</summary>
		/// <returns>stamp</returns>
		/// <exception cref="java.sql.SQLException"/>
		public virtual string getTimestamp()
		{
			//		String sql = null;
			//		if (driverType == JDBCType.mysql) {
			//			sql = "select now()";
			//		}
			//		else if (driverType == JDBCType.oracle)
			//			sql = "select sysDate";
			//		else if (driverType == JDBCType.ms2k)
			//			sql = "select now()";
			//		else if (driverType == JDBCType.sqlite)
			//			sql = "select DATETIME('now')";
			//		
			//		AnResultset rs = select(sql, Connects.flag_nothing);
			//		if (rs.next())
			//			return rs.getString(1);
			//		else
			return null;
		}

		/// <exception cref="java.sql.SQLException"/>
		public override int[] commit(io.odysz.semantics.IUser log, System.Collections.Generic.List
			<string> sqls, System.Collections.Generic.List<java.sql.Clob> lobs, int i)
		{
			// return null;
			throw new java.sql.SQLException("Shouldn't reach here!");
		}
	}
}
