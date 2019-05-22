/**Json protocol helper to support jclient.
 * All JBody and JHelper static helpers are here. */
class Protocol {
	static opts(options) {
		if (options) {
			if (options.noNull !== undefined)
				Protocol.valOptions.noNull = options.noNull === true || options.noNull === 'true';
			if (options.noBoolean !== undefined)
				Protocol.valOptions.noBoolean = options.noBoolean === true || options.noBoolean === 'true';
		}
	}

	/**Format login request message.
	 * @param {string} uid
	 * @param {string} tk64
	 * @param {string} iv64
	 * @return login request message
	 */
	static formatSessionLogin (uid, tk64, iv64) {
		var body = new SessionReq(uid, tk64, iv64);
		body.a = 'login';
		return new JMessage(Protocol.Port.session, null, body);
	}

	/**Format a query request object, including all information for construct a "select" statement.
	 * @param  {string} tabl  from table
	 * @param  {string} alias
	 * @return {object} fromatter to build request object
	static formatQueryReq (tbl, alias) {
		return new QueryReq(this, tbl, alias);
	}
	 */

	static formatHeader (ssInf) {
		return new JHeader(ssInf.ssid, ssInf.uid);
	}

	static rs2arr (rs) {
		var cols = [];
		var rows = [];
		rs.forEach((r, rx) => {
			if (rx === 0) {
				cols = r;
			}
			else {
				rw = {};
				r.forEach((c, cx) => {
					rw[cols[cx]] = c;
				})
				rows.push(rw);
			}
		});

		return rows;
	}

	static nv2cell (nv) {
		return [nv.name, nv.value];
	}

	static nvs2row (nvs) {
		var row = [];
		if (nvs) {
			for (var ix = 0; ix < nvs.length; ix++)
				row.push(this.nv2cell(nvs[ix]));
		}
		return row;
	}

	/** convert [{name, value}, ...] to [n1, n2, ...]
	 * @param {Array} [n-v, ...]
	 * @return {Array} [n1, n2, ...]
	 */
	static nvs2cols(nvArr) {
		var cols = [];
		if (nvArr) {
			for (var ix = 0; ix < nvArr.length; ix++) {
				if (nvArr[ix].name) {
					cols.push(nvArr[ix].name);
				}
				else
					cols.push(ix);
			}
		}
		return cols;
	}

	/** convert [[{name, value}]] to [[[name, value]]]
	 * @param {Array} 2d array of n-v pairs
	 * @return {Array} 3d array that can be used by server as nv rows
	 */
	static nvs2rows(nvs) {
		var rows = [];
		if(nvs) {
			for (var ix = 0; ix < nvs.length; ix++)
				// Ix.nvn = 0; Ix.nvv = 1
				// rows.push([nvs[ix].name, nvs[ix].value]);
				rows.push(this.nvs2row(nvs[ix]));
		}
		return rows;
	}
} ;

/**Static methods of Protocol */
{
	Protocol.CRUD = {c: 'I', r: 'R', u: 'U', d: 'D'};

	Protocol.Port = {	heartbeat: "ping.serv", echo: "echo.serv", session: "login.serv",
						query: "r.serv", update: "u.serv",
						insert: "c.serv", delete: "d.serv",
						dataset: "ds.serv", stree: "s-tree.serv" };

	Protocol.MsgCode = {ok: "ok", exSession: "exSession", exSemantic: "exSemantic",
						exIo: "exIo", exTransct: "exTransct", exDA: "exDA",
						exGeneral: "exGeneral"};

	Protocol.cfg  = {	ssInfo: "ss-k", };

	Protocol.valOptions = {};
}

/** Regex helper */
class Jregex  {
	/**Add single quotes to str, if not yet.
	 * @param {string} str
	 * @return {string} quoted */
	static quote(str) {
		if (str === undefined || str === null )
			str = "''";
		else if (typeof str === "string" && str.substring(0, 1) !== "'"
			&& str.substring(0, 2) != "''")
			return "'" + str + "'";
	}

	static isblank(s) {
		return s === undefined || s === null
			|| (typeof s === 'string' && s.trim() === '');
	}
}

class JMessage {
	constructor (port, header, body) {
		this.version = "1.0";
		this.seq = Math.round(Math.random() * 1000);

		// string options, like no-null: true for asking server replace null with ''.
		this.opts = Protocol.valOptions;

		/**Protocol.Port property name, use this name to get port url */
		this.port = port; // for robustness?
		var prts = Protocol.Port;
		var msg = this;
		Object.getOwnPropertyNames(prts).forEach(function(val, idx, array) {
			if (prts[val] === port) {
				// console.log(val + ' -> ' + obj[val]);
				msg.port = val;
				return false;
			}
		});

		if (header)
			this.header = header;
		else this.header = {};

		this.body = [];
		// this.body.push(body.parentMsg(this));
		this.body.push(body);
	}

	/** A short cut for body[0].post()
	 * @param {UpdateReq} pst post sql request
	 * @return {UpdateReq} the  first request body[0].post returned value.*/
	post(pst) {
		if (this.body !== undefined && this.body.length > 0)
			return this.body[0].post(pst);
	}
}

class JHeader {
	constructor (ssid, userId) {
		this.ssid = ssid;
		this.uid = userId;
	}

	/**Set user action (for DB log on DB transaction)
	 * @param {object} act {funcId, remarks, cate, cmd}
	 */
	userAct (act) {
		this.usrAct = [];
		this.usrAct.push(act.funcId);
		this.usrAct.push(act.cate);
		this.usrAct.push(act.cmd);
		this.usrAct.push(act.remarks);
	}
}

class UserReq {
	constructor (conn, tabl) {
		this.conn = conn;
		this.tabl = tabl
		this.data = {};
	}

	get(prop) {
		return this.data[prop];
	}

	set(prop, v) {
		this.data[prop] = v;
		return this;
	}

	/**set a.<br>
	 * a() can only been called once.
	 * @param {string} a
	 * @return {UserReq} this */
	a(a) {
		this.a = a;
		return this;
	}
}

class SessionReq {
	constructor (uid, token, iv) {
		this.uid = uid;
		this.token = token;
		this.iv = iv;
	}
}

class QueryReq {
	constructor (conn, tabl, alias, pageInf) {
		this.conn = conn;
		// this.query = query;
		this.mtabl = tabl;
		this.mAlias = alias;
		this.exprs = [];
		this.joins = [];
		this.where = [];

		if (pageInf)
			this.page(pageInf.size, pageInf.page);
	}

	page (size, idx) {
		this.page = idx;
		this.pgSize = size;
		return this;
	}

	/**add joins to the query request object
	 * @param {string} jt join type, example: "j" for inner join, "l" for left outer join
	 * @param {string} t table, example: "a_roles"
	 * @param {string} a alias, example: "r"
	 * @param {string} on on conditions, example: "r.roleId = mtbl.roleId and mtbl.flag={@varName}"
	 * Variables are replaced at client side (by js)
	 * @return this query object
	 */
	join (jt, t, a, on) {
		// parse "j:tbl:alias [conds]"
		this.joins.push([jt, t, a, on]);
		return this;
	}

	j (tbl, alias, conds) {
		return this.join("j", tbl, alias, conds);
	}

	l (tbl, alias, conds) {
		return this.join("l", tbl, alias, conds);
	}

	r (tbl, alias, conds) {
		return this.join("r", tbl, alias, conds);
	}

	joinss (js) {
		if (js !== undefined && js.length !== undefined)
			for (var ix = 0; ix < js.length; ix++)
				this.join(js[ix].t, js[ix].tabl, js[ix].as, js[ix].on);
		return this;
	}

	expr (exp, as) {
		//this.exprs.push({expr: exp, as: as});
		this.exprs.push([exp, as]);
		return this;
	}

	exprss (exps) {
		if (exps !== undefined && exps.length !== undefined)
			for (var ix = 0; ix < exps.length; ix++)
				if (exps[ix].exp !== undefined)
					this.expr(exps[ix].exp, exps[ix].as);
				else if (exps[ix].length !== undefined)
					this.expr(exps[ix][0], exps[ix][1]);
				else {
					console.error('Can not parse expr:');
					console.error(exps[ix]);
					console.error('Correct Format:')
					console.error('[exp, as]');
				}
		return this;
	}

	whereCond (logic, loper, roper) {
		if (Array.isArray(logic))
			this.where = this.where.concat(logic);
		else if (logic !== undefined)
			this.where.push([logic, loper, roper]);
		return this;
	}

	orderby (tabl, col, asc) {
		if (this.orders === undefined)
			this.orders = [];
		this.orders.push([tabl, col, asc]);
		return this;
	}

	orderbys (cols) {
		if (Array.isArray(cols))
			for (var ix = 0; ix < cols.length; ix++) {
				if (Array.isArray(cols[ix])) {
					if (this.orders === undefined)
						this.orders = [];
					this.orders.push(cols[ix]);
				}
				else {
					this.orderby(cols[ix].tabl, cols[ix].col, cols[ix].asc);
				}

			}
		return this;
	}

	groupby (col) {
		console.warn("groupby() is still to be implemented");
		return this;
	}

	groupbys (cols) {
		console.warn("groupby() is still to be implemented");
		return this;
	}

	commit () {
		var hd = this.formatHeader();
		// return { header: hd, tabls: froms, exprs: expr, conds: cond, orders: order, group: groupings};
		return {header: hd,
				body: [{a: "R",
						exprs: this.exprs,
						f: this.mtbl,
						j: this.joinings,
						conds: this.cond,
						orders: this.order,
						group: this.groupings}]};
	}
}

class UpdateReq {
	constructor (conn, tabl, pk) {
		this.conn = conn;
		this.mtabl = tabl;
		this.nvs = [];
		this.where = [];
		if (Array.isArray(pk))
			this.where.push(pk);
		else if (typeof pk === "object")
		 	if (pk.pk !== undefined)
				this.where.push([pk.pk, pk.v]);
			else console.error("UpdateReq: Can't understand pk: ", pk);
	}

	/** add n-v
	 * @param {string} n
	 * @param {object} v
	 * TODO what about v is QueryReq ?
	 * @return {UpdateReq} this
	 */
	nv (n, v) {
		if (Array.isArray(n)) {
			this.nvs = this.nvs.concat(Protocol.nvs2row(n));
		}
		else {
			this.nvs.push([n, v]);
		}
		return this;
	}

	whereCond (logic, loper, roper) {
		if (Array.isArray(logic))
			this.where = this.where.concat(logic);
		else if (logic !== undefined)
			this.where.push([logic, loper, roper]);
		return this;
	}

	/**Wrapper of #wherecodn(), will take rop as consts and add "''".<br>
	 * whereCond(logic, lop, Jregex.quote(rop));
	 * @param logic logic operator
	 * @param lop left operand
	 * @param rop right operand
	 * @return {UpdateReq} this */
	where_ (logic, lop, rop) {
		return this.whereCond(logic, lop, Jregex.quote(rop));
	}

	/**Add post operation
	 * @param {UserReq | UpdateReq | QueryReq} pst post request
	 * @return {UpdateReq} this */
	post (pst) {
		if (pst === undefined) {
			console.warn('You really wanna an undefined post operation?');
			return this;
		}
		else if (typeof pst.version === 'string' && typeof pst.seq === 'number')
			console.warn('You pobably adding a JMessage as post operation? It should only be JBody(s).');

		if (this.postUpds === undefined) {
			this.postUpds = [];
		}
		if (Array.isArray(pst)) {
			this.postUpds = this.postUpds.concat(pst);
		}
		else {
			this.postUpds.push(pst);
		}
		return this;
	}
}

class DeleteReq extends UpdateReq {
	constructor (conn, tabl, pk) {
		super (conn, tabl, pk);
		this.a = Protocol.CRUD.d;
	}
}

class InsertReq extends UpdateReq {
	constructor (conn, tabl) {
		super (conn, tabl);
		this.a = Protocol.CRUD.c;
	}

	columns (cols) {
		if (this.cols === undefined)
			this.cols = [];
		if (Array.isArray(cols)){
			this.cols = this.cols.concat(cols);
		}
		else this.cols.push(cols);
	}

	/**Override Update.nv() - insert is using valus() for nvss.
	 * @param {string} n
	 * @param {string} v
	 * @return {InsertReq} this*/
	nv (n, v) {
		this.valus(n, v);
	}

	/**Set inserting value(s).
	 * Becareful about function name - 'values' shall be reserved.
	 * @param {string|Array} n_row field name or n-v array<br>
	 * n_row can be typically return of jqueyr serializeArray, a.k.a [{name, value}, ...].<br>
	 * Note:<br>
	 * 1. Only one row on each calling.<br>
	 * 2. Don't use both n-v mode and row mode, can't handle that.
	 * @param {string} v value if n_row is name. Optional.
	 * @return {InsertReq} this
	 */
	valus (n_row, v) {
		if (this.nvss === undefined)
			this.nvss = [];

		var warned = false;
		if (Array.isArray(n_row)) {
			if (Array.isArray(n_row[0])) {
				// already a 2-d array
				if (Array.isArray(n_row[0][0]) && !warned) {
					console.warn('InsertReq is trying to handle multi rows in on value call, it is wrong. You must use InsertReq.nvRows(rows) instead.',
							n_row);
					warned = true;
					this.nvss = this.nvss.concat(n_row);
				}
				else {this.nvss = this.nvss.concat([n_row]);}
			}
			else {
				// guess as a n-v array
				if (this.cols === undefined)
					this.columns(Protocol.nvs2cols(n_row));
				this.nvss = this.nvss.concat([Protocol.nvs2row(n_row)]);
			}
		}
		else if (typeof n_row === 'string'){
			this.columns(n_row);
			if (this.nvss.length == 0) {
				this.nvss.push([[n_row, v]]);
			}
			else {
				this.nvss[0].push([n_row, v]);
			}
		}
		else console.error('Error when setting n-v with', n_row, v,
			'Check the type of n - only string for column, or n is an array represeting a row\'s n-vs!');
		return this;
	}

	nvRows(rows) {
		if (Array.isArray(rows)) {
			for (var ix = 0; ix < rows.length && Array.isArray(rows[ix]); ix++) {
				this.valus(rows[ix]);
			}
		}
	}
}
///////////////// io.odysz.semantic.ext ////////////////////////////////////////
/** define t that can be understood by stree.serv */
const stree_t = {
	/** load dataset configured and format into tree with semantics defined by sk. */
	sqltree: 'sqltree',
	/** Reformat the tree structure - reformat the 'fullpath', from the root */
	retree: 'retree',
	/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
	reforest: 'reforest',
	/** Query with client provided QueryReq object, and format the result into tree. */
	query: ''};

class DatasetCfg extends QueryReq {
	/**@param {string} conn JDBC connection id, configured at server/WEB-INF/connects.xml
	 * @param {string} sk semantic key configured in WEB-INF/dataset.xml
	 * @param {stree_t} t function branch tag (JBody#a).
	 * Can be only one of stree_t.sqltree, stree_t.retree, stree_t.reforest, stree_t.query
	 * @param {object} args arguments to be formatted to sql args.
	 * @param {string} maintbl if t is null or undefined, use this to replace maintbl in super (QueryReq), other than let it = sk.
	 */
	constructor (conn, sk, t, args, maintbl) {
		super(conn, Jregex.isblank(t) ? maintabl : sk);

		this.conn = conn;
		this.sk = sk;
		this.sqlArgs = args;

		this._t(t);
		this.checkt(t);
	}

	get geTreeSemtcs() { return this.trSmtcs; }

	/**Set tree semantics<br>
	 * You are recommended not to use this except your are the semantic-* developer.
	 * @param {TreeSemantics} semtcs */
	treeSemtcs(semtcs) {
		this.trSmtcs = semtcs;
		return this;
	}

	_t(ask) {
		if (typeof sk === 'string' && sk.length > 0 && ask !== stree_t.sqltree) {
			console.warn('DatasetReq.a is ignored for sk is defined.', sk);
			this.a = stree_t.sqltree;
		}
		else {
			this.a = ask;
			this.checkt(ask);
		}
	}

	args(args) {
		if (this.sqlArgs === undefined)
			this.sqlArgs = [];

		if (typeof args === 'string')
			this.sqlArgs = this.sqlArgs.concat([args]);
		else if (Array.isArray(args))
			this.sqlArgs = args;
		else console.error('sql args is not an arry: ', args);
			this.sqlArgs = this.sqlArgs.concat(args);
		return this;
	}

	/** Check is t can be undertood by s-tree.serv
	 * @param {string} t*/
	checkt(t) {
		// if (t !== stree_t.sqltree && t !== stree_t.retree && t !== stree_t.reforest) {
		if (t !== undefined && !stree_t.hasOwnProperty(t)) {
			console.warn("DatasetCfg.t won't been understood by server:", t, "Should be one of", stree_t);
		}
	}
}

///////////////// END //////////////////////////////////////////////////////////
export {Protocol, JMessage, JHeader, UserReq, SessionReq, QueryReq, UpdateReq, DeleteReq, InsertReq, DatasetCfg, stree_t}
