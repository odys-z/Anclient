using Sharpen;

namespace io.odysz.semantic.jserv.R
{
	/// <summary>
	/// Query Request Body Item.<br />
	/// Included are information of RDBMS query information,
	/// table, joins, conditions, groups, orders, etc.
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnQueryReq : io.odysz.semantic.jprotocol.AnsonBody
	{
		/// <summary>Main table</summary>
		internal string mtabl;

		/// <summary>Main table alias</summary>
		internal string mAlias;

		/// <summary>
		/// <pre>joins: [join-obj],
		/// - join-obj: [{t: "j/R/l", tabl: "table-1", as: "t_alais", on: conds}]
		/// - conds: [cond-obj]
		/// cond-obj: {(main-table | alais.)left-col-val op (table-1 | alias2 .)right-col-val}
		/// - op: '=' | '&lt;=' | '&gt;=' ...</pre>
		/// </summary>
		internal System.Collections.Generic.List<string[]> joins;

		/// <summary>
		/// exprs: [expr-obj],
		/// expr-obj: {tabl: "b_articles/t_alais", alais: "recId", expr: "recId"}
		/// </summary>
		internal System.Collections.Generic.List<string[]> exprs;

		/// <summary>
		/// where: [cond-obj], see
		/// <see cref="joins"/>
		/// for cond-obj.
		/// </summary>
		internal System.Collections.Generic.List<string[]> where;

		/// <summary>
		/// orders: [order-obj],
		/// - order-obj: {tabl: "b_articles", field: "pubDate", asc: "true"}
		/// </summary>
		internal System.Collections.Generic.List<string[]> orders;

		/// <summary>
		/// group: [group-obj]
		/// - group-obj: {tabl: "b_articles/t_alais", expr: "recId" }
		/// </summary>
		internal string[] groups;

		protected internal int page;

		protected internal int pgsize;

		internal string[] limt;

		internal System.Collections.Generic.List<string[]> havings;

		public AnQueryReq(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string conn)
			: base(parent, conn)
		{
			a = io.odysz.semantic.jprotocol.JProtocol.CRUD.R;
		}

		public AnQueryReq()
			: base(null, null)
		{
			a = io.odysz.semantic.jprotocol.JProtocol.CRUD.R;
		}

		public AnQueryReq(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string conn, string fromTbl, params string[] alias)
			: base(parent, conn)
		{
			a = io.odysz.semantic.jprotocol.JProtocol.CRUD.R;
			mtabl = fromTbl;
			mAlias = alias == null || alias.Length == 0 ? null : alias[0];
			this.page = -1;
			this.pgsize = 0;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq page(int page, int size)
		{
			this.page = page;
			this.pgsize = size;
			return this;
		}

		public virtual int size()
		{
			return pgsize;
		}

		public virtual int page()
		{
			return page;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq j(string with, string @as, string
			 on)
		{
			return j("j", with, @as, on);
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq l(string with, string @as, string
			 on)
		{
			return j("l", with, @as, on);
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq r(string with, string @as, string
			 on)
		{
			return j("R", with, @as, on);
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq j(System.Collections.Generic.List
			<string[]> joins)
		{
			if (joins != null)
			{
				foreach (string[] join in joins)
				{
					j(join);
				}
			}
			return this;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq j(string t, string with, string
			 @as, string on)
		{
			if (joins == null)
			{
				joins = new System.Collections.Generic.List<string[]>();
			}
			string[] j = new string[io.odysz.transact.sql.Query.Ix.joinSize];
			j[io.odysz.transact.sql.Query.Ix.joinTabl] = with;
			j[io.odysz.transact.sql.Query.Ix.joinAlias] = @as;
			j[io.odysz.transact.sql.Query.Ix.joinType] = t;
			j[io.odysz.transact.sql.Query.Ix.joinOnCond] = on;
			return j(j);
		}

		private io.odysz.semantic.jserv.R.AnQueryReq j(string[] join)
		{
			joins.add(join);
			return this;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq expr(string expr, string alias
			, params string[] tabl)
		{
			if (exprs == null)
			{
				exprs = new System.Collections.Generic.List<string[]>();
			}
			string[] exp = new string[io.odysz.transact.sql.Query.Ix.exprSize];
			exp[io.odysz.transact.sql.Query.Ix.exprExpr] = expr;
			exp[io.odysz.transact.sql.Query.Ix.exprAlais] = alias;
			exp[io.odysz.transact.sql.Query.Ix.exprTabl] = tabl == null || tabl.Length == 0 ? 
				null : tabl[0];
			exprs.add(exp);
			return this;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq where(string oper, string lop
			, string rop)
		{
			if (where == null)
			{
				where = new System.Collections.Generic.List<string[]>();
			}
			string[] predicate = new string[io.odysz.transact.sql.Query.Ix.predicateSize];
			predicate[io.odysz.transact.sql.Query.Ix.predicateOper] = oper;
			predicate[io.odysz.transact.sql.Query.Ix.predicateL] = lop;
			predicate[io.odysz.transact.sql.Query.Ix.predicateR] = rop;
			where.add(predicate);
			return this;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq orderby(string col, params bool
			[] asc)
		{
			if (orders == null)
			{
				orders = new System.Collections.Generic.List<string[]>();
			}
			orders.add(new string[] { col, Sharpen.Runtime.getStringValueOf(asc == null || asc
				.Length == 0 ? "asc" : asc[0] ? "asc" : "desc") });
			return this;
		}

		/// <summary>
		/// <p>Create a qeury request body item, for joining etc.</p>
		/// <p>This is a client side helper, don't confused with
		/// <see cref="io.odysz.transact.sql.Query">Query</see>
		/// .</p>
		/// </summary>
		/// <param name="conn"/>
		/// <param name="parent"/>
		/// <param name="from"></param>
		/// <param name="as"></param>
		/// <returns>query request</returns>
		public static io.odysz.semantic.jserv.R.AnQueryReq formatReq(string conn, io.odysz.semantic.jprotocol.AnsonMsg
			<io.odysz.semantic.jserv.R.AnQueryReq> parent, string from, params string[] @as)
		{
			io.odysz.semantic.jserv.R.AnQueryReq bdItem = new io.odysz.semantic.jserv.R.AnQueryReq
				(parent, conn, from, @as == null || @as.Length == 0 ? null : @as[0]);
			return bdItem;
		}

		public virtual io.odysz.semantic.jserv.R.AnQueryReq having(string oper, string lop
			, string rop)
		{
			if (where == null)
			{
				where = new System.Collections.Generic.List<string[]>();
			}
			string[] predicate = new string[io.odysz.transact.sql.Query.Ix.predicateSize];
			predicate[io.odysz.transact.sql.Query.Ix.predicateOper] = oper;
			predicate[io.odysz.transact.sql.Query.Ix.predicateL] = lop;
			predicate[io.odysz.transact.sql.Query.Ix.predicateR] = rop;
			where.add(predicate);
			return this;
		}
	}
}
