using Sharpen;

namespace io.odysz.semantic
{
	/// <summary>A basic semantic context for generating sql.</summary>
	/// <remarks>
	/// A basic semantic context for generating sql.
	/// Handling semantics defined in xml file. See path of constructor.
	/// <p>
	/// <see cref="pageSql(string, int, int)"/>
	/// is an example that must handled by context, but not interested by semantic.jserv.
	/// When composing SQL like select statement, if the results needing to be paged at server side,
	/// the paging sql statement is different for different DB.
	/// But semantic-transact don't care DB type or JDBC connection, so it's the context that will handling this.
	/// See the
	/// <see cref="pageSql(string, int, int)"/>
	/// .</p>
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class DASemantext : io.odysz.semantics.ISemantext
	{
		private io.odysz.semantics.SemanticObject autoVals;

		private static io.odysz.transact.sql.Transcxt rawst;

		/// <summary>Semantic Configurations</summary>
		private System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
			> ss;

		private System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.TableMeta
			> metas;

		private io.odysz.semantics.IUser usr;

		private string connId;

		private string basePath;

		private System.Collections.Generic.List<io.odysz.transact.sql.Statement.IPostOperat
			> onOks;

		private java.util.LinkedHashMap<string, io.odysz.transact.sql.Statement.IPostSelectOperat
			> onSelecteds;

		/// <summary>for generating sqlite auto seq</summary>
		private static io.odysz.semantics.IUser sqliteDumyUser;

		/// <summary>Initialize a context for semantics handling.</summary>
		/// <remarks>
		/// Initialize a context for semantics handling.
		/// This class handling semantics comes form path, usually an xml like test/res/semantics.xml.
		/// </remarks>
		/// <param name="connId"/>
		/// <param name="smtcfg">
		/// semantic configs, usally load by
		/// <see cref="DATranscxt"/>
		/// .
		/// <p>sample code: </p>
		/// DATranscxt.initConfigs("inet", rootINF + "/semantics.xml");
		/// </param>
		/// <param name="usr"/>
		/// <param name="rtPath">runtime root path</param>
		/// <exception cref="io.odysz.semantics.x.SemanticException">metas is null</exception>
		internal DASemantext(string connId, System.Collections.Generic.Dictionary<string, 
			io.odysz.semantic.DASemantics> smtcfg, System.Collections.Generic.Dictionary<string
			, io.odysz.semantics.meta.TableMeta> metas, io.odysz.semantics.IUser usr, string
			 rtPath)
		{
			basePath = rtPath;
			this.connId = connId;
			ss = smtcfg;
			if (metas == null)
			{
				throw new io.odysz.semantics.x.SemanticException("DASemantext can not work without DB metas. connId: %s"
					, connId);
			}
			this.metas = metas;
			if (rawst == null)
			{
				rawst = new io.odysz.transact.sql.Transcxt(null);
			}
			this.usr = usr;
		}

		/// <summary>When inserting, process data row with configured semantics, like auto-pk, fk-ins, etc..
		/// 	</summary>
		/// <exception cref="io.odysz.semantics.x.SemanticException"></exception>
		/// <seealso cref="io.odysz.semantics.ISemantext.onInsert(io.odysz.transact.sql.Insert, string, System.Collections.Generic.IList{E})
		/// 	"/>
		public virtual io.odysz.semantics.ISemantext onInsert(io.odysz.transact.sql.Insert
			 insert, string tabl, System.Collections.Generic.IList<System.Collections.Generic.List
			<object[]>> rows)
		{
			if (rows != null && ss != null)
			{
				// second round
				foreach (System.Collections.Generic.List<object[]> row in rows)
				{
					System.Collections.Generic.IDictionary<string, int> cols = insert.getColumns();
					io.odysz.semantic.DASemantics s = ss[tabl];
					if (s == null)
					{
						continue;
					}
					s.onInsert(this, insert, row, cols, usr);
				}
			}
			return this;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual io.odysz.semantics.ISemantext onUpdate(io.odysz.transact.sql.Update
			 update, string tabl, System.Collections.Generic.List<object[]> nvs)
		{
			if (nvs != null && ss != null)
			{
				System.Collections.Generic.IDictionary<string, int> cols = update.getColumns();
				io.odysz.semantic.DASemantics s = ss[tabl];
				if (s != null)
				{
					s.onUpdate(this, update, nvs, cols, usr);
				}
			}
			return this;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.ISemantext onDelete(io.odysz.transact.sql.Delete
			 delete, string tabl, io.odysz.transact.sql.parts.condition.Condit whereCondt)
		{
			if (ss != null)
			{
				io.odysz.semantic.DASemantics s = ss[tabl];
				if (s != null)
				{
					s.onDelete(this, delete, whereCondt, usr);
				}
			}
			return this;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.ISemantext onPost<_T0>(io.odysz.transact.sql.Statement
			<_T0> stmt, string tabl, System.Collections.Generic.List<object[]> row, System.Collections.Generic.List
			<string> sqls)
			where _T0 : io.odysz.transact.sql.Statement<T>
		{
			if (row != null && ss != null)
			{
				System.Collections.Generic.IDictionary<string, int> cols = stmt.getColumns();
				if (cols == null)
				{
					return this;
				}
				io.odysz.semantic.DASemantics s = ss[tabl];
				if (s != null)
				{
					s.onPost(this, stmt, row, cols, usr, sqls);
				}
			}
			return this;
		}

		public virtual io.odysz.semantics.ISemantext insert(io.odysz.transact.sql.Insert 
			insert, string tabl, params io.odysz.semantics.IUser[] usr)
		{
			return clone(this, usr);
		}

		public virtual io.odysz.semantics.ISemantext update(io.odysz.transact.sql.Update 
			update, string tabl, params io.odysz.semantics.IUser[] usr)
		{
			return clone(this, usr);
		}

		public virtual io.odysz.common.dbtype dbtype()
		{
			return io.odysz.semantic.DA.Connects.driverType(connId);
		}

		public virtual string connId()
		{
			return connId;
		}

		public virtual io.odysz.semantics.ISemantext connId(string conn)
		{
			connId = conn;
			return this;
		}

		public virtual io.odysz.semantics.ISemantext clone(io.odysz.semantics.IUser usr)
		{
			try
			{
				return new io.odysz.semantic.DASemantext(connId, ss, metas, usr, basePath);
			}
			catch (io.odysz.semantics.x.SemanticException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				return null;
			}
		}

		// meta is null? how could it be?
		private io.odysz.semantics.ISemantext clone(io.odysz.semantic.DASemantext srctx, 
			params io.odysz.semantics.IUser[] usr)
		{
			try
			{
				io.odysz.semantic.DASemantext newInst = new io.odysz.semantic.DASemantext(connId, 
					srctx.ss, srctx.metas, usr != null && usr.Length > 0 ? usr[0] : null, basePath);
				// newInst.ss = srctx.ss;
				// newInst.usr = usr != null && usr.length > 0 ? usr[0] : null;
				return newInst;
			}
			catch (io.odysz.semantics.x.SemanticException e)
			{
				Sharpen.Runtime.printStackTrace(e);
				return null;
			}
		}

		// meta is null? how could it be?
		/// <summary>Find resolved value in results.</summary>
		/// <param name="table"/>
		/// <param name="col"/>
		/// <returns>RESULt resoLVED VALue in tabl.col, or null if not exists.</returns>
		public virtual object resulvedVal(string tabl, string col)
		{
			return autoVals != null && autoVals.has(tabl) ? ((io.odysz.semantics.SemanticObject
				)autoVals.get(tabl)).get(col) : null;
		}

		/// <summary>
		/// Get the resolved value in
		/// <see cref="autoVals"/>
		/// a.k.a return value of
		/// <see cref="io.odysz.transact.sql.Statement{T}.doneOp(io.odysz.transact.sql.Statement.IPostOperat)
		/// 	"/>
		/// .
		/// </summary>
		/// <returns>
		/// 
		/// <see cref="autoVals"/>
		/// </returns>
		/// <seealso cref="io.odysz.semantics.ISemantext.resulves()"/>
		public virtual io.odysz.semantics.SemanticObject resulves()
		{
			return autoVals;
		}

		///////////////////////////////////////////////////////////////////////////
		// auto ID
		///////////////////////////////////////////////////////////////////////////
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual string genId(string tabl, string col)
		{
			string newv = genId(connId, tabl, col, null);
			if (autoVals == null)
			{
				autoVals = new io.odysz.semantics.SemanticObject();
			}
			io.odysz.semantics.SemanticObject tabl_ids = (io.odysz.semantics.SemanticObject)autoVals
				.get(tabl);
			if (tabl_ids == null)
			{
				tabl_ids = new io.odysz.semantics.SemanticObject();
				autoVals.put(tabl, tabl_ids);
			}
			tabl_ids.put(col, newv);
			return newv;
		}

		/// <summary>
		/// Generate new Id with the help of db function f_incSeq(varchar idName)<br />
		/// Sql script for stored function:<br />
		/// Mysql:<pre>
		/// create FUNCTION f_incSeq2 (seqId varchar(100), prefix varchar(4)) RETURNS int(11)
		/// begin
		/// DECLARE seqName varchar(100);
		/// DECLARE cnt INT DEFAULT 0;
		/// if prefix = '' then set seqName = seqId;
		/// else set seqName = concat(seqId, '.', prefix);
		/// end if;
		/// select count(seq) into cnt from ir_autoSeqs where sid = seqName;
		/// if cnt = 0
		/// then
		/// insert into ir_autoSeqs(sid, seq, remarks) values (seqName, 0, now());
		/// end if;
		/// select seq into cnt from ir_autoSeqs where sid = seqName;
		/// update ir_autoSeqs set seq = cnt + 1 where sid = seqName;
		/// return cnt;
		/// end;</pre>
		/// select f_incSeq2('%s.%s', '%s') newId<br />
		/// Oracle:<pre>
		/// CREATE OR REPLACE FUNCTION GZDX_YJPT.f_incSeq2(seqId in varchar, prefix in varchar) RETURN integer
		/// IS
		/// PRAGMA AUTONOMOUS_TRANSACTION;
		/// seqName varchar(100);
		/// cnt integer DEFAULT 0;
		/// begin
		/// if prefix = '' then seqName := seqId;
		/// else seqName := concat(concat(seqId, '.'), prefix);
		/// end if;
		/// select count(seq) into cnt from ir_autoSeqs where sid = seqName;
		/// if cnt = 0
		/// then
		/// insert into ir_autoSeqs(sid, seq, remarks) values (seqName, 0, to_char(sysdate, 'MM-DD-YYYY HH24:MI:SS'));
		/// commit;
		/// end if;
		/// select seq into cnt from ir_autoSeqs where sid = seqName;
		/// update ir_autoSeqs set seq = cnt + 1, remarks = to_char(sysdate, 'MM-DD-YYYY HH24:MI:SS') where sid = seqName;
		/// commit;
		/// return cnt;
		/// end;
		/// </pre>
		/// select f_incSeq2('%s.%s', '%s') newId from dual
		/// <p>auto ID for sqlite is handled by
		/// <see cref="genSqliteId(string, string, string)"/>
		/// - needing table initialization.</p>
		/// </summary>
		/// <param name="connId"/>
		/// <param name="target">target table</param>
		/// <param name="idField">table id column (no multi-column id supported)</param>
		/// <param name="subCate"/>
		/// <returns>
		/// new Id (shortened in radix 64 by
		/// <see cref="com.infochange.frame.util.Radix64"/>
		/// )
		/// </returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual string genId(string connId, string target, string idField, string 
			subCate)
		{
			io.odysz.common.dbtype dt = io.odysz.semantic.DA.Connects.driverType(connId);
			if (dt == io.odysz.common.dbtype.sqlite)
			{
				return genSqliteId(connId, target, idField);
			}
			if (subCate == null)
			{
				subCate = string.Empty;
			}
			string sql;
			if (dt == io.odysz.common.dbtype.oracle)
			{
				sql = string.format("select \"oz_fIncSeq\"('%s.%s', '%s') newId from dual", target
					, idField, subCate);
			}
			else
			{
				sql = string.format("select oz_fIncSeq('%s.%s', '%s') newId", target, idField, subCate
					);
			}
			io.odysz.module.rs.AnResultset rs = null;
			rs = io.odysz.semantic.DA.Connects.select(connId, sql);
			if (rs.getRowCount() <= 0)
			{
				// throw new TransException("Can't find auot seq of %s, you may check where oz_autoseq.seq and table %s are existing?",
				throw new io.odysz.transact.x.TransException("Can't find auot seq of %1$s.\nFor performantc reason, DASemantext assumes a record in oz_autoseq.seq (id='%1$s.%2$s') exists.\nMay be you would check where oz_autoseq.seq and table %2$s are existing?"
					, idField, target);
			}
			rs.beforeFirst().next();
			int newInt = rs.getInt("newId");
			if (subCate == null || subCate.Equals(string.Empty))
			{
				return io.odysz.common.Radix64.toString(newInt);
			}
			else
			{
				return string.format("%1$s_%2$6s", subCate, io.odysz.common.Radix64.toString(newInt
					));
			}
		}

		/// <summary>
		/// Generate auto id in sqlite.<br />
		/// All auto ids are recorded in oz_autoseq table.<br />
		/// See
		/// <see cref="DASemantextTest"/>
		/// for how to initialize oz_autoseq.
		/// </summary>
		/// <param name="conn"/>
		/// <param name="target"/>
		/// <param name="idF"/>
		/// <returns>new Id</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		internal virtual string genSqliteId(string conn, string target, string idF)
		{
			java.util.concurrent.locks.Lock Lock;
			Lock = getAutoseqLock(conn, target);
			// 1. update ir_autoseq (seq) set seq = seq + 1 where sid = tabl.idf
			// 2. select seq from ir_autoseq where sid = tabl.id
			System.Collections.Generic.List<string> sqls = new System.Collections.Generic.List
				<string>();
			sqls.add(string.format("update oz_autoseq set seq = seq + 1 where sid = '%s.%s'", 
				target, idF));
			io.odysz.module.rs.AnResultset rs = null;
			io.odysz.transact.sql.Query q = rawst.select("oz_autoseq").col("seq").where("=", 
				"sid", string.format("'%s.%s'", target, idF));
			// dumy user for update oz_autoseq
			if (sqliteDumyUser == null)
			{
				sqliteDumyUser = new _IUser_345();
			}
			// each table has a lock.
			// lock to prevent concurrency.
			Lock.Lock();
			try
			{
				// for efficiency
				io.odysz.semantic.DA.Connects.commit(conn, sqliteDumyUser, sqls, io.odysz.semantic.DA.Connects
					.flag_nothing);
				rs = io.odysz.semantic.DA.Connects.select(conn, q.sql(null), io.odysz.semantic.DA.Connects
					.flag_nothing);
			}
			finally
			{
				Lock.unlock();
			}
			if (rs.getRowCount() <= 0)
			{
				throw new io.odysz.transact.x.TransException("Can't find auot seq of %1$s.\n" + "For performance reason and difficulty of implementing sqlite stored process, DASemantext assumes a record in oz_autoseq.seq (id='%1$s.%2$s') exists.\n"
					 + "May be you would check where oz_autoseq.seq and table %2$s are existing?", idF
					, target);
			}
			rs.beforeFirst().next();
			return io.odysz.common.Radix64.toString(rs.getInt("seq"));
		}

		private sealed class _IUser_345 : io.odysz.semantics.IUser
		{
			public _IUser_345()
			{
			}

			public io.odysz.semantics.meta.TableMeta meta()
			{
				return null;
			}

			public string uid()
			{
				return "sqlite-dumy";
			}

			public io.odysz.semantics.IUser logAct(string funcName, string funcId)
			{
				return null;
			}

			public string sessionKey()
			{
				return null;
			}

			public io.odysz.semantics.IUser sessionKey(string skey)
			{
				return null;
			}

			/// <exception cref="io.odysz.transact.x.TransException"/>
			public io.odysz.semantics.IUser notify(object note)
			{
				return null;
			}

			public System.Collections.Generic.IList<object> notifies()
			{
				return null;
			}
		}

		internal static java.util.concurrent.locks.Lock lockOflocks = new java.util.concurrent.locks.ReentrantLock
			();

		/// <summary>[conn-id, [table, lock]]]</summary>
		private static System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
			<string, java.util.concurrent.locks.Lock>> locks;

		private static java.util.concurrent.locks.Lock getAutoseqLock(string conn, string
			 tabl)
		{
			lockOflocks.Lock();
			java.util.concurrent.locks.Lock l = null;
			try
			{
				if (locks == null)
				{
					locks = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary
						<string, java.util.concurrent.locks.Lock>>();
				}
				if (!locks.Contains(conn))
				{
					locks[conn] = new System.Collections.Generic.Dictionary<string, java.util.concurrent.locks.Lock
						>();
				}
				if (!locks[conn].Contains(tabl))
				{
					locks[conn][tabl] = new java.util.concurrent.locks.ReentrantLock();
				}
				l = locks[conn][tabl];
			}
			finally
			{
				lockOflocks.unlock();
			}
			return l;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual string totalSql(string rawSql)
		{
			return io.odysz.semantic.DASemantext.totalSql(io.odysz.semantic.DA.Connects.driverType
				(connId()), rawSql);
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual string pageSql(string rawSql, int page, int size)
		{
			return io.odysz.semantic.DASemantext.pagingSql(io.odysz.semantic.DA.Connects.driverType
				(connId()), rawSql, page, size);
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public static string pagingSql(io.odysz.common.dbtype dt, string sql, int pageIx, 
			int pgSize)
		{
			if (pageIx < 0 || pgSize <= 0)
			{
				return sql;
			}
			int i1 = pageIx * pgSize;
			string r2 = Sharpen.Runtime.getStringValueOf(i1 + pgSize);
			string r1 = Sharpen.Runtime.getStringValueOf(i1);
			java.util.stream.Stream<string> s;
			if (dt == io.odysz.common.dbtype.oracle)
			{
				// "select * from (select t.*, rownum r_n_ from (%s) t WHERE rownum <= %s  order by rownum) t where r_n_ > %s"
				s = java.util.stream.Stream.of("select * from (select t.*, rownum r_n_ from (", sql
					, ") t WHERE rownum <= ", r1, " order by rownum) t where r_n_ > ", r2);
			}
			else
			{
				if (dt == io.odysz.common.dbtype.ms2k)
				{
					// "select * from (SELECT ROW_NUMBER() OVER(ORDER BY (select NULL as noorder)) AS RowNum, * from (%s) t) t where rownum >= %s and rownum <= %s"
					s = java.util.stream.Stream.of("select * from (SELECT ROW_NUMBER() OVER(ORDER BY (select NULL as noorder)) AS RowNum, * from ("
						, sql, ") t) t where rownum >= ", r1, " and rownum <= %s", r2);
				}
				else
				{
					if (dt == io.odysz.common.dbtype.sqlite)
					{
						throw new io.odysz.transact.x.TransException("There is no easy way to support sqlite paging. Don't use server side paging for sqlite datasource."
							);
					}
					else
					{
						// mysql
						// "select * from (select t.*, @ic_num := @ic_num + 1 as rnum from (%s) t, (select @ic_num := 0) ic_t) t1 where rnum > %s and rnum <= %s"
						s = java.util.stream.Stream.of("select * from (select t.*, @ic_num := @ic_num + 1 as rnum from ("
							, sql, ") t, (select @ic_num := 0) ic_t) t1 where rnum > ", r1, " and rnum <= ", 
							r2);
					}
				}
			}
			return s.collect(java.util.stream.Collectors.joining(" "));
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public static string totalSql(io.odysz.common.dbtype dt, string sql)
		{
			return java.util.stream.Stream.of("select count(*) as total from (", sql).collect
				(java.util.stream.Collectors.joining(string.Empty, string.Empty, ") s_jt"));
		}

		public virtual void clear()
		{
			autoVals = null;
		}

		public virtual io.odysz.semantics.meta.TableMeta colType(string tabl)
		{
			return metas[tabl];
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual string relativpath(params string[] sub)
		{
			return org.apache.commons.io_odysz.FilenameUtils.concat(".", sub);
		}

		public virtual string containerRoot()
		{
			return basePath;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		/// <exception cref="java.sql.SQLException"/>
		public virtual void onCommitted(io.odysz.semantics.ISemantext ctx)
		{
			if (onOks != null)
			{
				foreach (io.odysz.transact.sql.Statement.IPostOperat ok in onOks)
				{
					// onOk handlers shoudn't using sqls, it's already committed
					ok.onCommitOk(ctx, null);
				}
			}
		}

		public virtual void addOnOkOperate(io.odysz.transact.sql.Statement.IPostOperat op
			)
		{
			if (onOks == null)
			{
				onOks = new System.Collections.Generic.List<io.odysz.transact.sql.Statement.IPostOperat
					>();
			}
			onOks.add(op);
		}

		public virtual bool hasOnSelectedHandler(string name)
		{
			return onSelecteds != null && onSelecteds.Contains(name);
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual void onSelected(object resultset)
		{
			io.odysz.module.rs.AnResultset rs = (io.odysz.module.rs.AnResultset)resultset;
			if (rs != null && onSelecteds != null && onSelecteds.Count > 0)
			{
				rs.beforeFirst();
				while (rs.next())
				{
					foreach (io.odysz.transact.sql.Statement.IPostSelectOperat op in onSelecteds.Values)
					{
						op.onSelected(this, rs.getRowCells(), rs.getColnames());
					}
				}
			}
		}

		public virtual void addOnSelectedHandler(string name, io.odysz.transact.sql.Statement.IPostSelectOperat
			 op)
		{
			if (onSelecteds == null)
			{
				onSelecteds = new java.util.LinkedHashMap<string, io.odysz.transact.sql.Statement.IPostSelectOperat
					>();
			}
			onSelecteds[name] = op;
		}

		public virtual io.odysz.transact.sql.parts.AbsPart composeVal(object v, string tabl
			, string col)
		{
			if (v is io.odysz.transact.sql.parts.AbsPart)
			{
				return (io.odysz.transact.sql.parts.AbsPart)v;
			}
			io.odysz.semantics.meta.TableMeta mt = colType(tabl);
			return io.odysz.transact.sql.Statement.composeVal(v, mt, col);
		}
	}
}
