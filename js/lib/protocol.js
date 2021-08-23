/**Json protocol helper to support jclient.
 * All AnsonBody and JHelper static helpers are here. */
class Protocol {
	/**Globally set this client's options.
	 * @param {object} options<br>
	 * options.noNull no null value <br>
	 * options.noBoolean no boolean value<br>
	 * options.valOptions<br>
	 * options.verbose logging verbose level
	 * @return {Protocol} static Protocol class
	 */
	static opts(options) {
		if (options) {
			if (options.noNull !== undefined)
				Protocol.valOptions.noNull = options.noNull === true || options.noNull === 'true';
			if (options.noBoolean !== undefined)
				Protocol.valOptions.noBoolean = options.noBoolean === true || options.noBoolean === 'true';

			Protocol.valOptions = Object.assign(Protocol.valOptions, options);

			// TODO we are planning extending verbose level requested by client.
			Protocol.verbose = options.verbose >= 0 ? options.verbose : 5;
		}
		return Protocol;
	}

	/**Format login request message.
	 * @param {string} uid
	 * @param {string} tk64 password cypher
	 * @param {string} iv64
	 * @return login request message
	 */
	static formatSessionLogin (uid, tk64, iv64) {
		let login = new AnsonMsg({
			type: 'io.odysz.semantic.jprotocol.AnsonMsg',
			port: 'session', //Protocol.Port.session,
			body: [{type: 'io.odysz.semantic.jsession.AnSessionReq',
					uid, token: tk64, iv: iv64}]
		});
		login.Body().A('login');
		return login;
	}

	static formatHeader (ssInf) {
		return new AnHeader(ssInf.ssid, ssInf.uid);
	}

	static rs2arr (rs) {
		return AnsonResp.rs2arr(rs);
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

/** Static methods of Protocol */
{
	Protocol.CRUD = {c: 'I', r: 'R', u: 'U', d: 'D'};

	Protocol.Port = {	heartbeat: "ping.serv11", echo: "echo.serv11", session: "login.serv11",
						query: "r.serv11", update: "u.serv11",
						insert: "c.serv11", delete: "d.serv11",
						dataset: "ds.serv11", stree: "s-tree.serv11" };

	Protocol.MsgCode = {ok: "ok", exSession: "exSession", exSemantic: "exSemantic",
						exIo: "exIo", exTransct: "exTransct", exDA: "exDA",
						exGeneral: "exGeneral"};

	Protocol.Notify = {changePswd: "changePswd", todos: "todos"};

	Protocol.cfg  = { ssInfo: "ss-k", };

	Protocol.Semantics = {
		chkCntDel: 'checkSqlCountOnDel',
		chkCntIns: 'checkSqlCountOnInsert',
	};

	Protocol.valOptions = {};

	/**Extend new ports
	 * @function
	 * @param {object} newPorts
	 */
	Protocol.extend = function(newPorts) {
		Object.assign(Protocol.Port, newPorts);
	};

	Protocol.ansonTypes = {};
	/**Extend new protocol - register new body type creater.
	 * @function
	 * @param {string} type body type
	 * @param {function} bodyConstructor AnsonBody constructor
	 */
	Protocol.registerBody = function(type, bodyConstructor) {
		Protocol.ansonTypes[type] = bodyConstructor;
	}
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

class AnsonMsg {
	constructor (json) {
		if (typeof json !== 'object')
			throw new Error("AnClient is upgraded.");

		let header = json.header;
		let [body] = json.body ? json.body : [{}];
		let a = body.a;

		// initiating json to class
		if (body.constructor.name === 'Object') {
			if (body.type === 'io.odysz.semantic.jprotocol.AnsonResp')
				body = new AnsonResp(body);
			else if (body.type === 'io.odysz.semantic.jsession.AnSessionResp')
				body = new AnSessionResp(body);
			else if (body.type === 'io.odysz.semantic.jsession.AnSessionReq')
				body = new AnSessionReq(body.uid, body.token, body.iv);
			else if (body.type === "io.odysz.semantic.jserv.R.AnQueryReq")
				body = new QueryReq(body.uri, body.mtabl, body.mAlias);
			else if (body.type === 'io.odysz.semantic.jserv.user.UserReq')
				body = new UserReq(json.port, header, [body]);
			else if (body.type === "io.odysz.semantic.ext.AnDatasetReq") {
				// body are provided by user
				if (!body.sk) {
					console.error("Since AnClient 0.9.28, constructing DatasetReq with AnsonMsg constructor needs providing DatasetReq as body.",
							"For example, see https://github.com/odys-z/Anclient/blob/master/js/test/jsunit/03-jsample.mocha.js");
					throw new Error("DatasetReq.sk is essential but empty.");
				}
			}
			else if (body.type === "io.odysz.semantic.ext.AnDatasetResp")
				body = new AnDatasetResp(body);
			else if (body.type in Protocol.ansonTypes)
				// TODO FIXME what happens if the other known types are all handled like this?
				body = Protocol.ansonTypes[body.type](body);
			else {
				// if (Protocol.verbose >= 5)
				// 	console.warn("Using json object directly as body. Type : " + body.type);

				// server can't handle body without type
				throw new Error("Error: Using json object directly as body. To extend protocol, register a new Protocol like this:"
					+ "\nProtocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => { return new QuizResp(jsonBd); });"
					+ "\nType not handled : " + body.type );
			}
		}

		if (a) body.A(a);

		// FIXME type must be the first key of evry json object.
		this.type = "io.odysz.semantic.jprotocol.AnsonMsg";

		this.code = json.code;
		this.version = json.version ? json.version : "0.9";
		this.seq = json.seq;
		this.port = json.port;

		// this.version = "0.9";
		if (!this.seq)
			this.seq = Math.round(Math.random() * 1000);

		// string options, like no-null: true for asking server replace null with ''.
		this.opts = Protocol.valOptions;

		// moc the ajax error
		if (json.ajax)
			body.ajax = json.ajax;

		if (header)
			this.header = header;
		else this.header = {};

		this.body = [];
		if (body)
			body.parent = this.type;
		this.body.push(body);
	}

	/** A short cut for body[0].post()
	 * @param {UpdateReq} pst post sql request
	 * @return {UpdateReq} the  first request body[0].post returned value.*/
	post(pst) {
		if (this.body !== undefined && this.body.length > 0)
			return this.body[0].post(pst);
	}

	Body(ix = 0) {
		return this.body ? this.body[ix] : undefined;
	}

	static rsArr(resp, rx = 0) {
		if (resp.body && resp.body[0] && resp.body[0].rs && resp.body[0].rs.length > 0) {
			return AnsonResp.rsArr(resp.body, rx);
		}
		return [];
	}
}

class AnHeader {
	constructor (ssid, userId) {
		this.type = "io.odysz.semantic.jprotocol.AnsonHeader";
		this.ssid = ssid;
		this.uid = userId;
	}

	/**Set user action (for DB log on DB transaction)
	 * @param {object} act {funcId(tolerate func), remarks, cate, cmd}
	 */
	userAct (act) {
		this.usrAct = [];
		this.usrAct.push(act.func === undefined ? act.funcId : act.func);
		this.usrAct.push(act.cate);
		this.usrAct.push(act.cmd);
		this.usrAct.push(act.remarks);
	}
}

class AnsonBody {
	constructor(body = {}) {
		this.type = body.type;
		this.a = body.a
		this.parent = body.parent;
		this.uri = body.uri;
	}

	/**set a.<br>
	 * a() can only been called once.
	 * @param {string} a
	 * @return {SessionReq} this */
	A(a) {
		this.a = a;
		return this;
	}

}

class AnsonResp extends AnsonBody {
	constructor (respbody) {
		super(respbody);
		this.m = respbody.m;
		this.map = respbody.map;
		this.rs = respbody.rs;
	}

	msg() {
		return this.m;
	}

	Code() {
		return this.code;
	}

	Rs(rx = 0) {
		return this.rs && this.rs.length > rx ? this.rs[rx] : undefined;
	}

	getProp(prop) {
		if (this.data && this.data.props) {
			return this.data.props[prop];
		}
	}

	static hasColumn(rs, colname) {
		return rs && rs.colnames && colname && colname.toUpperCase() in rs.colnames;
	}

	static rsArr(respBody, rx = 0) {
		return AnsonResp.rs2arr(respBody[0].rs[rx]);
	}

	/**Change rs object to array like [ {col1: val1, ...}, ... ]
	 *
	 * <b>Note</b> The column index and rows index shifted to starting at 0.
	 *
	 * @param {object} rs assume the same fields of io.odysz.module.rs.AnResultset.
	 * @return {object} {cols, rows}
	 * cols: array like [ col1, col2, ... ]; <br>
	 * rows: array like [ {col1: val1, ...}, ... ]
	 */
	static rs2arr (rs) {
		let cols = [];
		let rows = [];

		if (rs && typeof(rs.colnames) === 'object') {
			// rs with column index
			cols = new Array(rs.colnames.length);
			for (var col in rs.colnames) {
				// e.g. col = "VID": [ 1, "vid" ],
				let cx = rs.colnames[col][0] - 1;
				let cn = rs.colnames[col][1];
				cols[cx] = cn;
			}

			rs.results.forEach((r, rx) => {
				let rw = {};
				r.forEach((c, cx) => {
					rw[cols[cx]] = c;
				});
				rows.push(rw);
			});
		}
		else if (rs) {
			// first line as column index
			rs.forEach((r, rx) => {
				if (rx === 0) {
					cols = r;
				}
				else {
					rw = {};
					r.forEach((c, cx) => {
						rw[cols[cx]] = c;
					});
					rows.push(rw);
				}
			});
		}

		return {cols, rows};
	}

	/**Provide nv, convert results to AnReact combobox options (for binding).
	 * @param {object} rs assume the same fields of io.odysz.module.rs.AnResultset.
	 * @param {object} nv e.g. {n: 'domainName', v: 'domainId'}.
	 * @return {object} {cols, rows}
	 * cols: array like [ col1, col2, ... ]; <br>
	 * rows: array like [ {col1: val1, ...}, ... ], <br>
	 * e.g. if [results: {'01', 'fname'}], return [{n: 'fname', v: '01'}, ...]
	 */
	static rs2nvs(rs, nv) {
		let cols = [];
		let rows = [];
		let ncol = -1, vcol = -1;

		if (typeof(rs.colnames) === 'object') {
			// rs with column index
			cols = new Array(rs.colnames.length);
			for (var col in rs.colnames) {
				// e.g. col = "VID": [ 1, "vid" ],
				let cx = rs.colnames[col][0] - 1;
				let cn = rs.colnames[col][1];
				cols[cx] = cn;

				if (cn === nv.n)
					ncol = cx;
				else if (cn === nv.v)
					vcol = cx;
			}

			rs.results.forEach((r, rx) => {
				rows.push({n: r[ncol], v: r[vcol]});
			});
		}
		else {
			throw new Error( 'TODO: first line as column index' );
		}
		return {cols, rows};
	}
}

class UserReq extends AnsonBody {
	constructor (uri, tabl, data = {}) {
		super();
		this.type = "io.odysz.semantic.jserv.user.UserReq";
		this.uri = uri;
		this.tabl = tabl
		this.data = {props: data};
	}

	get(prop) {
		return this.data.props ? this.data.props[prop] : undefined;
	}

	/** set data (SemanticObject)'s map
	 * @param {string} prop name
	 * @param {object} v value
	 * @return {UserReq} this
	 */
	set(prop, v) {
		this.data.props[prop] = v;
		return this;
	}

	/**set a.<br>
	 * a() can only been called once.
	 * @param {string} a
	 * @return {UserReq} this */
	A(a) {
		this.a = a;
		return this;
	}
}

class AnSessionReq extends AnsonBody {
	constructor (uid, token, iv) {
		super();
		this.type = "io.odysz.semantic.jsession.AnSessionReq";
		this.uid = uid;
		this.token = token;
		this.iv = iv;
	}

	/**set a.<br>
	 * @param {string} a
	 * @return {SessionReq} this */
	A(a) {
		return super.A(a);
	}

	md(k, v) {
		if (this.mds === undefined)
			this.mds = {};
		this.mds[k] = v;
		return this;
	}
}

class AnSessionResp extends AnsonResp {
	constructor(ssResp) {
		super(ssResp);
		this.ssInf = ssResp.ssInf;
	}
}

class AnDatasetResp extends AnsonResp {
	constructor(dsJson) {
		super(dsJson);
		this.forest = dsJson.forest;
	}

	Rs(rx = 0) {
		return this.rs[rx];
	}

}

/**Java equivalent: io.odysz.semantic.jserv.R.AnQueryReq
 * @class
 */
class QueryReq extends AnsonBody {
	constructor (uri, tabl, alias, pageInf) {
		super();
		this.type = "io.odysz.semantic.jserv.R.AnQueryReq";
		this.uri = uri;
		this.mtabl = tabl;
		this.mAlias = alias;
		this.exprs = [];
		this.joins = [];
		this.where = [];

		if (pageInf)
			this.Page(pageInf.size, pageInf.page);
	}

	/**set a.<br>
	 * @param {string} a
	 * @return {QueryReq} this */
	A(a) {
		return super.A(a);
	}

	Page (size, idx) {
		this.page = idx;
		this.pgsize = size;
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
		this.exprs.push([exp, as]);
		return this;
	}

	exprss (exps) {
		if (exps !== undefined && exps.length !== undefined) {
			for (var ix = 0; ix < exps.length; ix++) {
				if (exps[ix].exp !== undefined)
					this.expr(exps[ix].exp, exps[ix].as);
				else if (exps[ix].length !== undefined)
					this.expr(exps[ix][0], exps[ix][1]);
				else {
					console.error(`Can not parse expr [exp, as]: exprs[${ix}] = `,
						exps[ix]);
				}
			}
		}
		return this;
	}

    /**Add where clause condition
     * @param {string} logic logic type
     * @param {string} loper left operator
     * @param {string} roper right operator
     * @return {QueryReq} this */
	whereCond (logic, loper, roper) {
		if (Array.isArray(logic))
			this.where = this.where.concat(logic);
		else if (logic !== undefined)
			this.where.push([logic, loper, roper]);
		return this;
	}

	whereEq (lopr, ropr) {
		this.whereCond("=", lopr, "'" + ropr + "'");
	}

	orderby (tabl, col, asc) {
		if (this.orders === undefined)
			this.orders = [];
		this.orders.push([tabl, col, asc]);
		return this;
	}

	orderbys (cols) {
		if (Array.isArray(cols)) {
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
		}
		else if (cols) {
			console.log('QueryReq#orderbys() - argument is not an array.', cols);
		}

		return this;
	}

	groupby (expr) {
		// console.warn("groupby() is still to be implemented");
		if (this.groups === undefined)
			this.groups = [];
		this.groups.push(expr);
		return this;
	}

	groupbys (exprss) {
		// console.warn("groupby() is still to be implemented");
		if (Array.isArray(exprss)) {
			for (var ix = 0; ix < exprss.length; ix++) {
				this.groupby(exprss[ix]);
			}
		}
		else if (exprss != undefined) {
            console.log('QueryReq#groupbys() - argument is not an array.', exprss);
        }
		return this;
	}

	/**limit clause.
	 * @param {string} expr1
	 * @param {string} expr2
	 */
	limit (expr1, expr2) {
		this.limt = [];
		if (expr1)
			this.limt.push(expr1);

		if (expr2)
			this.limt.push(expr2);
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

class UpdateReq extends AnsonBody {
	/**Create an update / insert request.
	 * @param {string} uri component id
	 * @param {string} tabl table
	 * @param {object} pk {pk, v} conditions for pk.<br>
	 * If pk is null, use this object's where_() | whereEq() | whereCond().
	 */
	constructor (uri, tabl, pk) {
		super();
		this.type = "io.odysz.semantic.jserv.U.AnUpdateReq";
		this.uri = uri;
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

	/**Take exp as an expression
	 * @param {string} n
	 * @param {string} exp the expression string like "3 * 2"
	 * @return {InsertReq} this*/
	nExpr (n, exp) {
		return this.nv(n, {exp});
	}

	/**Append where clause condiont
	 * @param {string} logic "=" | "<>" , ...
	 * @param {string} loper left operand, typically a tabl.col.
	 * @param {string} roper right operand, typically a string constant.
	 * @return {UpdateReq} this */
	whereCond (logic, loper, roper) {
		if (Array.isArray(logic))
			this.where = this.where.concat(logic);
		else if (logic !== undefined)
			this.where.push([logic, loper, roper]);
		return this;
	}

	/**Wrapper of #whereCond(), will take rop as consts and add "''".<br>
	 * whereCond(logic, lop, Jregex.quote(rop));
	 * @param logic logic operator
	 * @param lop left operand
	 * @param rop right operand
	 * @return {UpdateReq} this */
	where_ (logic, lop, rop) {
		return this.whereCond(logic, lop, Jregex.quote(rop));
	}

	/** A wrapper of where_("=", lcol, rconst)
	 * @param {string} lcol left operand,
	 * @param {string} rconst right constant, will be quoted.
	 * @return {UpdateReq} this */
	whereEq (lcol, rconst) {
		return this.where_("=", lcol, rconst);
	}

	/** A wrapper of where_("=", lcol, rconst)
	 * @param {string} lcol left operand,
	 * @param {arry} rconsts an array of right constants, will be quoted.
	 * @return {UpdateReq} this */
	whereIn (lcol, rconsts) {
		let vals = null;
		if ( Protocol.verbose >= 4
			&& Array.isArray(rconsts) && rconsts.length === 0)
			console.error('[4] Deleting empty ids?', mtabl, lcol);

		else if (Array.isArray(rconsts))
			rconsts.forEach( (v, i) =>{
				vals = vals ? vals += ", " : '';
				vals += `'${v}'`;
			} );
		return this.whereCond("in", lcol, vals);
	}

	/**limit clause.
	 * @param {string} cnt count
	 */
	limit (cnt) {
		this.limt = cnt;
	}

	/**Attach a file.
	 * The u.serv will handle this in a default attachment table - configured in semantics
	 * @param {string} fn file name (from the client locally)
	 * @param {string} b64 base 64 encoded string
	 * @return {UpdateReq} this
	 */
	attach(fn, b64) {
		if (this.attacheds === undefined) {
			this.attacheds = [];
		}
		this.attacheds.push({fn: fn, b64: b64});
		return this;
	}

	/**Add post operation
	 * @param {UpdateReq | InsertReq} pst post request
	 * @return {UpdateReq} this */
	post (pst) {
		if (pst === undefined) {
			console.warn('You really wanna an undefined post operation?');
			return this;
		}
		else if (typeof pst.version === 'string' && typeof pst.seq === 'number')
			console.warn('You pobably adding a AnsonMsg as post operation? It should only be AnsonBody(s).');

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
	constructor (uri, tabl, pk) {
		super (uri, tabl, pk);
		this.a = Protocol.CRUD.d;
	}
}

class InsertReq extends UpdateReq {
	constructor (uri, tabl) {
		super (uri, tabl);
		this.type = "io.odysz.semantic.jserv.U.AnInsertReq";
		this.a = Protocol.CRUD.c;
	}

	columns (cols) {
		if (this.cols === undefined)
			this.cols = [];
		if (Array.isArray(cols)){
			this.cols = this.cols.concat(cols);
		}
		else this.cols.push(cols);
		return this;
	}

	/**Override Update.nv() - insert is using valus() for nvss.
	 * @param {string} n
	 * @param {string} v
	 * @return {InsertReq} this*/
	nv (n, v) {
		return this.valus(n, v);
	}

	/**Take exp as an expression
	 * @param {string} n
	 * @param {string} exp the expression string like "3 * 2"
	 * @return {InsertReq} this*/
	nExpr(n, exp) {
		return this.nv(n, {exp});
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

	/**Design Notes:
	 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
	 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
	*/
	nvRows(rows) {
		if (Array.isArray(rows)) {
			for (var ix = 0; ix < rows.length && Array.isArray(rows[ix]); ix++) {
				this.valus(rows[ix]);
			}
		}
		return this;
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
	query: 'query'
};

class DatasetReq extends QueryReq {
	/**
	 * @param {object} opts parameter objects
	 * @param {string} opts.uri component uri, connectiong mapping is configured at server/WEB-INF/connects.xml
	 * @param {string} opts.sk semantic key configured in WEB-INF/dataset.xml
	 * @param {stree_t} opts.t also opts.a, function branch tag (AnsonBody.a).
	 * Can be only one of stree_t.sqltree, stree_t.retree, stree_t.reforest, stree_t.query
	 * @param {string} opts.maintbl if t is null or undefined, use this to replace maintbl in super (QueryReq), other than let it = sk.
	 * @param {string} opts.alias if t is null or undefined, use this to replace alias in super (QueryReq).
	 * @param {object} opts.pageInf {page, size} page index and page size.
	 * @param {array} opts.sqlArgs args for dataset definition, used by server to format sql.
	 * @param {{n, v}} ...opts more arguments for sql args.
	 */
	constructor (opts = {}) {
		let {uri, sk, t, a, mtabl, mAlias, pageInf, sqlArgs, ...args} = opts;

		super(uri, Jregex.isblank(t) ? mtabl : sk, mAlias);
		this.type = "io.odysz.semantic.ext.AnDatasetReq";

		this.uri = uri;
		this.sk = sk;
		this.sqlArgs = sqlArgs;

		t = t || a;
		this.T(t);
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

	T(ask) {
		if (typeof sk === 'string' && sk.length > 0 && ask !== stree_t.sqltree) {
			console.warn('DatasetReq.a is ignored for sk is defined.', sk);
			this.a = stree_t.sqltree;
		}
		else {
			this.a = ask;
			this.checkt(ask);
		}
		return this;
	}

	A(a) {
		return this.T(a);
	}

	SqlArgs(args) {
		return this.args(args);
	}

	args(args) {
		if (this.sqlArgs === undefined){
			this.sqlArgs = [];
		}

		if (typeof args === 'string' || Array.isArray(args)) {
			this.sqlArgs = this.sqlArgs.concat(args);
		}
		else {
			console.error('sql args is not an arry: ', args);
			this.sqlArgs = this.sqlArgs.concat(args);
		}
		return this;
	}

	/** Check is t can be undertood by s-tree.serv
	 * TODO why not asking server for stree_t?
	 * @param {string} t*/
	checkt(t) {
		// if (t !== stree_t.sqltree && t !== stree_t.retree && t !== stree_t.reforest) {
		if (t !== undefined && !stree_t.hasOwnProperty(t)) {
			console.warn(
				"DatasetReq.t won't be understood by server:", t, "\n 't (a)' should be one of Protocol.stree_t's key.",
				Object.keys(stree_t));
		}
		return this;
	}
}

///////////////// END //////////////////////////////////////////////////////////
export {
	Jregex, Protocol, AnsonMsg, AnHeader,
	UserReq, AnSessionReq, QueryReq, UpdateReq, DeleteReq, InsertReq,
	AnsonResp, DatasetReq, stree_t
}
