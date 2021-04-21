using Sharpen;

namespace io.odysz.semantic.jserv.U
{
	/// <summary>
	/// <p>Insert Request Message</p>
	/// <b>Note:</b>
	/// <p>InsertReq is a subclass of UpdateReq, and have no
	/// <see cref="#toJson(com.google.gson.stream.JsonWriter,io.odysz.semantic.jprotocol.JOpts)
	/// 	">toJson()</see>
	/// and
	/// <see cref="#fromJsonName(String,com.google.gson.stream.JsonReader)">fromJson()</see>
	/// implementation.
	/// Otherwise any post updating list in request won't work.</p>
	/// Because all request element is deserialized a UpdateReq, so this can only work for Update/Insert request.</p>
	/// <p>Design Memo<br />
	/// This is a strong evidence showing that we need anson.</p>
	/// see
	/// <see cref="UpdateReq#fromJsonName(String,com.google.gson.stream.JsonReader)">super.fromJsonName()
	/// 	</see>
	/// <br />
	/// and
	/// <see cref="io.odysz.semantic.jprotocol.JHelper#readLstUpdateReq(com.google.gson.stream.JsonReader)
	/// 	">JHelper.readListUpdateReq()</see>
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnUpdateReq : io.odysz.semantic.jprotocol.AnsonBody
	{
		/// <exception cref="io.odysz.anson.x.AnsonException"/>
		/// <exception cref="System.IO.IOException"/>
		public override io.odysz.anson.Anson toBlock(java.io.OutputStream stream, params 
			io.odysz.anson.JsonOpt[] opts)
		{
			if (io.odysz.semantic.jprotocol.JProtocol.CRUD.C.Equals(a) && (cols == null || cols
				.Length == 0))
			{
				io.odysz.common.Utils.warn("WARN - UpdateReq.toJson():\nFound inserting request but cols are null, this is wrong for no insert statement can be generated.\n"
					 + "Suggestion: call the InsertReq.col(col-name) before serialize this to json for table: %s\n"
					 + "Another common error leads to this is using UpdateReq for inserting with java client."
					, mtabl);
			}
			return base.toBlock(stream, opts);
		}

		/// <summary>Format an update request.</summary>
		/// <param name="conn"/>
		/// <param name="parent"/>
		/// <param name="tabl"/>
		/// <param name="cmd">
		/// 
		/// <see cref="io.odysz.semantic.jprotocol.JProtocol.CRUD"/>
		/// .c R U D
		/// </param>
		/// <returns>a new update request</returns>
		public static io.odysz.semantic.jserv.U.AnUpdateReq formatUpdateReq(string conn, 
			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.U.AnUpdateReq> parent
			, string tabl)
		{
			io.odysz.semantic.jserv.U.AnUpdateReq bdItem = ((io.odysz.semantic.jserv.U.AnUpdateReq
				)new io.odysz.semantic.jserv.U.AnUpdateReq(parent, conn).a(io.odysz.semantic.jprotocol.JProtocol.CRUD
				.U)).mtabl(tabl);
			return bdItem;
		}

		/// <summary>Format a delete request.</summary>
		/// <param name="conn"/>
		/// <param name="parent"/>
		/// <param name="tabl"/>
		/// <returns>a new deleting request</returns>
		public static io.odysz.semantic.jserv.U.AnUpdateReq formatDelReq(string conn, io.odysz.semantic.jprotocol.AnsonMsg
			<io.odysz.semantic.jserv.U.AnUpdateReq> parent, string tabl)
		{
			io.odysz.semantic.jserv.U.AnUpdateReq bdItem = ((io.odysz.semantic.jserv.U.AnUpdateReq
				)new io.odysz.semantic.jserv.U.AnUpdateReq(parent, conn).a(io.odysz.semantic.jprotocol.JProtocol.CRUD
				.D)).mtabl(tabl);
			return bdItem;
		}

		/// <summary>Main table</summary>
		internal string mtabl;

		public virtual io.odysz.semantic.jserv.U.AnUpdateReq mtabl(string mtbl)
		{
			mtabl = mtbl;
			return this;
		}

		/// <summary>
		/// nvs: [nv-obj],
		/// nv-obj: {n: "roleName", v: "admin"}
		/// </summary>
		internal System.Collections.Generic.List<object[]> nvs;

		/// <summary>inserting values, used for "I".</summary>
		/// <remarks>inserting values, used for "I". 3d array [[[n, v], ...]]</remarks>
		protected internal System.Collections.Generic.List<System.Collections.Generic.List
			<object[]>> nvss;

		/// <summary>inserting columns, used for "I".</summary>
		/// <remarks>
		/// inserting columns, used for "I".
		/// Here a col shouldn't be an expression - so not Object[], unlike that of query.
		/// </remarks>
		protected internal string[] cols;

		/// <summary>get columns for sql's insert into COLs.</summary>
		/// <returns>columns</returns>
		public virtual string[] cols()
		{
			return cols;
		}

		/// <summary>
		/// where: [cond-obj], see
		/// <see cref="#joins"/>
		/// for cond-obj.
		/// </summary>
		internal System.Collections.Generic.List<object[]> where;

		internal string limt;

		internal System.Collections.Generic.List<io.odysz.semantic.jserv.U.AnUpdateReq> postUpds;

		public io.odysz.semantic.jprotocol.AnsonHeader header;

		internal System.Collections.Generic.List<object[]> attacheds;

		public AnUpdateReq()
			: base(null, null)
		{
		}

		/// <summary>
		/// Don't call new InsertReq(), call
		/// <see cref="#formatReq(String,JMessage,String)"/>
		/// .
		/// This constructor is declared publicly for JHelper.
		/// </summary>
		/// <param name="parent"/>
		/// <param name="conn"/>
		public AnUpdateReq(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string conn)
			: base(parent, conn)
		{
		}

		public virtual io.odysz.semantic.jserv.U.AnUpdateReq nv(string n, object v)
		{
			if (nvs == null)
			{
				nvs = new System.Collections.Generic.List<object[]>();
			}
			object[] nv = new object[2];
			nv[io.odysz.transact.sql.Query.Ix.nvn] = n;
			nv[io.odysz.transact.sql.Query.Ix.nvv] = v;
			nvs.add(nv);
			return this;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void valus(System.Collections.Generic.List<object[]> row)
		{
			if (nvs != null && nvs.Count > 0)
			{
				throw new io.odysz.semantics.x.SemanticException("InsertReq don't support both nv() and values() been called for the same request object. User only one of them."
					);
			}
			if (nvss == null)
			{
				nvss = new System.Collections.Generic.List<System.Collections.Generic.List<object
					[]>>();
			}
			nvss.add(row);
		}

		/// <summary>get values in VALUE-CLAUSE for sql insert into (...) values VALUE-CLAUSE
		/// 	</summary>
		/// <returns>[[[n, v], ...]]</returns>
		public virtual System.Collections.Generic.List<System.Collections.Generic.List<object
			[]>> values()
		{
			if (nvs != null && nvs.Count > 0)
			{
				if (nvss == null)
				{
					nvss = new System.Collections.Generic.List<System.Collections.Generic.List<object
						[]>>();
				}
				nvss.add(nvs);
				nvs = null;
			}
			return nvss;
		}

		/// <summary>FIXME wrong?</summary>
		/// <param name="file"/>
		/// <param name="b64"/>
		/// <returns/>
		public virtual io.odysz.semantic.jserv.U.AnUpdateReq attach(string file, string b64
			)
		{
			if (attacheds == null)
			{
				attacheds = new System.Collections.Generic.List<object[]>();
			}
			attacheds.add(new string[] { file, b64 });
			return this;
		}

		public virtual io.odysz.semantic.jserv.U.AnUpdateReq where(string oper, string lop
			, string rop)
		{
			if (where == null)
			{
				where = new System.Collections.Generic.List<object[]>();
			}
			string[] predicate = new string[io.odysz.transact.sql.Query.Ix.predicateSize];
			predicate[io.odysz.transact.sql.Query.Ix.predicateOper] = oper;
			predicate[io.odysz.transact.sql.Query.Ix.predicateL] = lop;
			predicate[io.odysz.transact.sql.Query.Ix.predicateR] = rop;
			where.add(predicate);
			return this;
		}

		/// <summary>calling where("=", lop, "'" + rconst + "'")</summary>
		/// <param name="lop"/>
		/// <param name="rconst"/>
		/// <returns/>
		public virtual io.odysz.semantic.jserv.U.AnUpdateReq whereEq(string lop, string rconst
			)
		{
			return where("=", lop, "'" + rconst + "'");
		}

		public virtual io.odysz.semantic.jserv.U.AnUpdateReq post(io.odysz.semantic.jserv.U.AnUpdateReq
			 pst)
		{
			if (postUpds == null)
			{
				postUpds = new System.Collections.Generic.List<io.odysz.semantic.jserv.U.AnUpdateReq
					>();
			}
			postUpds.add(pst);
			return this;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void validate()
		{
			if (!io.odysz.semantic.jprotocol.JProtocol.CRUD.D.Equals(a) && (nvs == null || nvs
				.Count <= 0) && (nvss == null || nvss.Count <= 0))
			{
				throw new io.odysz.semantics.x.SemanticException("Updating/inserting denied for empty column values"
					);
			}
			if ((io.odysz.semantic.jprotocol.JProtocol.CRUD.U.Equals(a) || io.odysz.semantic.jprotocol.JProtocol.CRUD
				.D.Equals(a)) && (where == null || where.isEmpty()))
			{
				throw new io.odysz.semantics.x.SemanticException("Updatin/deleting  denied for empty conditions"
					);
			}
			if (!io.odysz.semantic.jprotocol.JProtocol.CRUD.R.Equals(a) && mtabl == null || io.odysz.common.LangExt
				.isblank(mtabl))
			{
				throw new io.odysz.semantics.x.SemanticException("Updating/inserting/deleting denied for empty main table"
					);
			}
		}
	}
}
