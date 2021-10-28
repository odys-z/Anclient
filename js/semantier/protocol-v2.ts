export interface JsonOptions {
    verbose: number;
    noNull: boolean | string;
    noBoolean: boolean | string;
};

export type PageInf = { page: number, size: number };

export type NameVal = {name: string, value: object};
export type NV = {n: string, v: object};

export interface LogAct {
    func   : string;
    cmd    : string;
    remarks: string;
    cate   : string;
};

export type SqlJoin = {
    /**Join type, one of ['j', 'l', 'r'] */
    jt: string,
    /** table name */
    tabl: string,
    as: string,
    /** "on" condition */
    on: string
}

export type Expr = {
    exp: string,
    as: string
}

export interface ColMeta {
    field: string;
    name: string;
}

export interface PkMeta {
    v: any;
    pk: string;
}

export interface AttachMeta {
    fn: string;
    b64: string;
}

export interface AnResultset {
	length();
    results: any;
    // filter(arg0: (r: any) => boolean) : Array<{}>;
    rs: Array<{}>;
    colnames: {};
}

/** Regex helper */
class Jregex {
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

/**Json protocol helper to support jclient.
 * All AnsonBody and JHelper static helpers are here. */
export class Protocol {
	static CRUD = {c: 'I', r: 'R', u: 'U', d: 'D'};
	static Port = {	heartbeat: "ping.serv11",
		echo: "echo.serv11", session: "login.serv11",
		query: "r.serv11", update: "u.serv11",
		insert: "c.serv11", delete: "d.serv11",
		dataset: "ds.serv11", stree: "s-tree.serv11",
		datasetier: "ds.tier"
	};

	static MsgCode = {ok: "ok",
		exSession: "exSession", exSemantic: "exSemantic",
        exIo: "exIo", exTransct: "exTransct", exDA: "exDA",
        exGeneral: "exGeneral"
	};

	static Notify = {changePswd: "changePswd", todos: "todos"};

	static cfg  = { ssInfo: "ss-k", };

	static Semantics = {
		chkCntDel: 'checkSqlCountOnDel',
		chkCntIns: 'checkSqlCountOnInsert',
	};

	static sk = {
		// app will extending sk here.
	}

	/**Extend new ports
	 * @function
	 * @param {object} newPorts
	 */
	static extend = function(newPorts: string) {
		Object.assign(Protocol.Port, newPorts);
	};

	static ansonTypes = {};

	/**Extend new protocol - register new body type creater.
	 * @function
	 * @param {string} type body type
	 * @param {function} bodyConstructor AnsonBody constructor
	 */
	static registerBody = function(type, bodyConstructor) {
		Protocol.ansonTypes[type] = bodyConstructor;
	}

    /**(De)sevrialize options */
    static valOptions: JsonOptions;

    /**Logging verbose level 1-5 */
    static verbose: number;

	/**Globally set this client's options.
	 * @param {object} options<br>
	 * @param {boolean} options.noNull no null value <br>
	 * @param {boolean} options.noBoolean no boolean value<br>
	 * @param {JsonOptions} options.valOptions<br>
	 * @param {boolean} options.verbose logging verbose level
	 * @return {Protocol} static Protocol class
	 */
	static opts(options: JsonOptions) {
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
     * 
     * @param uid 
     * @param tk64  password cypher
     * @param iv64 
     * @return login request message
     */
    static formatSessionLogin(uid: string, tk64: string, iv64: string): AnsonMsg<AnSessionReq> {
		let login = new AnsonMsg<AnSessionReq>({
			type: 'io.odysz.semantic.jprotocol.AnsonMsg',
			port: 'session', //Protocol.Port.session,
			body: [{type: 'io.odysz.semantic.jsession.AnSessionReq',
					uid, token: tk64, iv: iv64}]
		});
		login.Body().A('login');
		return login;
	}

    static formatHeader(ssInf: any): AnHeader {
		return new AnHeader(ssInf.ssid, ssInf.uid);
    }

	static rs2arr (rs) {
		return AnsonResp.rs2arr(rs);
	}

	static nv2cell (nv: NameVal): [string, string] {
		return [nv.name, nv.value as unknown as string];
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
    static nvs2cols(nvArr: Array<NameVal>): Array<string> {
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
    static nvs2rows(nvs: any): any[] {
		var rows = [];
		if(nvs) {
			for (var ix = 0; ix < nvs.length; ix++)
				// Ix.nvn = 0; Ix.nvv = 1
				// rows.push([nvs[ix].name, nvs[ix].value]);
				rows.push(this.nvs2row(nvs[ix]));
		}
		return rows;
	}

}

export class AnsonMsg<T extends AnsonBody> {
    static rsArr(resp: AnsonMsg<AnsonResp>, rx?: number): any {
		if (resp.body && resp.body[0] && resp.body[0].rs && resp.body[0].rs.length() > 0) {
			return AnsonResp.rsArr(resp.body, rx);
		}
		return [];
	}

    constructor(json: any) {
		if (typeof json !== 'object')
			throw new Error("AnClient is upgraded, takes only one arg, the json obj.");

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
				body = new QueryReq(body.uri, body.mtabl, body.mAlias, {});
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
			else if (body.type === "io.odysz.semantic.tier.DatasetierReq")
				body = new DatasetierReq(body);

			// FIXME never used?
			// else if (body.type === "io.odysz.semantic.tier.DatasetierResp")
			// 	body = new DatasetierResp(body);

			else if (body.type in Protocol.ansonTypes)
				// TODO FIXME what happens if the other known types are all handled like this?
				body = Protocol.ansonTypes[body.type](body);
			else {
				// server can't handle body without type
				throw new Error("Error: Using json object directly as body. To extend protocol, register a new Protocol like this:"
					+ "\nProtocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => { return new QuizResp(jsonBd); });"
					+ "\nType not handled : " + body.type );
			}
		}
    }

    type: string;
    code: any;
    version: any;
    seq: any;
    port: any;
    opts: {};
    header: AnHeader;
    body: T[];

    /** A short cut for body[0].post()
     * @param {AnsonBody} pst post sql request
     * @return {AnsonBody} the  first request body[0].post returned value.*/
    post(pst: AnsonBody): AnsonBody {
		if (this.body !== undefined && this.body.length > 0)
			return this.body[0].post(pst);
	}

    Body(ix?: number): any {
		return this.body ? this.body[ix] : undefined;
	}
}

export class AnsonBody {
	post(pst: AnsonBody): AnsonBody {
		throw new Error("AnsonBody is an abstract class.");
	}

    constructor(body?: {type: string, a: string, parent: AnsonMsg<any>, uri: string}) {
		this.type = body?.type;
		this.a = body?.a
		this.parent = body?.parent;
		this.uri = body?.uri;
	}

    type: string;
    a: string;
    parent: AnsonMsg<AnsonBody>;
    uri: string;

    /**set a.<br>
     * a() can only been called once.
     * @param {string} a
     * @return {AnsonBody} this */
    A<T extends AnsonBody>(a: string): T {
		this.a = a;
		return this as unknown as T;
	}
}

export class AnHeader {
    constructor(ssid: any, userId: any) {
		this.type = "io.odysz.semantic.jprotocol.AnsonHeader";
		this.ssid = ssid;
		this.uid = userId;
	}

    type: string;
    ssid: string;
    uid : string;

    /**Set user action (for DB log on DB transaction)
     * @param {object} act {funcId(tolerate func), remarks, cate, cmd}
     */
    userAct(act: LogAct): AnHeader {
		this.usrAct = [];
		this.usrAct.push(act.func);
		this.usrAct.push(act.cate);
		this.usrAct.push(act.cmd);
		this.usrAct.push(act.remarks);
        return this;
    }

    usrAct: any[];
}

export class UserReq extends AnsonBody {
	type = "io.odysz.semantic.jserv.user.UserReq";

    tabl: string;
    data: { props: {}; };

	constructor (uri: string, tabl: string, data = {}) {
		super();
		this.uri = uri;
		this.tabl = tabl
		this.data = {props: data};
	}

	get(prop: string) : object {
		return this.data.props ? this.data.props[prop] : undefined;
	}

	/** set data (SemanticObject)'s map
	 * @param prop name
	 * @param v value
	 * @return this
	 */
	set(prop : string, v : object) : UserReq {
		this.data.props[prop] = v;
		return this;
	}

	// /**set a.<br>
	//  * a() can only been called once.
	//  * @param a
	//  * @return this */
	// A(a: string): UserReq {
	// 	this.a = a;
	// 	return this;
	// }
}

export class AnSessionReq extends AnsonBody {
    constructor(uid: any, token: any, iv: any) {
		super();
		this.type = "io.odysz.semantic.jsession.AnSessionReq";
		this.uid = uid;
		this.token = token;
		this.iv = iv;
    }

    mds: {}; // what's this for?

    uid  : string;
    token: string;
    iv   : string;

    md(k: string, v: string): AnSessionReq {
		if (this.mds === undefined)
			this.mds = {};
		this.mds[k] = v;
		return this;
	}
}

/**Java equivalent: io.odysz.semantic.jserv.R.AnQueryReq
 * @class
 */
export class QueryReq extends AnsonBody {
    mtabl: string;
    // mtbl: string;
    mAlias: string;

    exprs: string[][];
    joins: string[][];
    joinings: string[];
    where: string[][];
    orders: string[][];
    groups: string[];
    cond: any;
    order: any;
    groupings: any;

    page: number;
    pgsize: number;
    limt: string[];

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

	Page (size : number, idx : number): QueryReq {
		this.page = idx;
		this.pgsize = size;
		return this;
	}

	/**add joins to the query request object
	 * @param jt join type, example: "j" for inner join, "l" for left outer join
	 * @param t table, example: "a_roles"
	 * @param a alias, example: "r"
	 * @param on on conditions, example: "r.roleId = mtbl.roleId and mtbl.flag={@varName}"
	 * Variables are replaced at client side (by js)
	 * @return this query object
	 */
	public join (jt: string, t: string, a: string, on: string) : QueryReq {
		// parse "j:tbl:alias [conds]"
		this.joins.push([jt, t, a, on]);
		return this;
	}

	public j (tbl: string, alias: string, conds: string) : QueryReq {
		return this.join("j", tbl, alias, conds);
	}

	public l (tbl: string, alias: string, conds: string) : QueryReq {
		return this.join("l", tbl, alias, conds);
	}

	public r (tbl: string, alias: string, conds: string) : QueryReq {
		return this.join("r", tbl, alias, conds);
	}

	public joinss (js: Array<SqlJoin>) : QueryReq {
		if (js !== undefined && js.length !== undefined)
			for (var ix = 0; ix < js.length; ix++)
				this.join(js[ix].jt, js[ix].tabl, js[ix].as, js[ix].on);
		return this;
	}

	public expr (exp: string, as: string) : QueryReq {
		this.exprs.push([exp, as]);
		return this;
	}

	public col (c : string, as : string) : QueryReq {
		return this.expr(c, as);
	}

	public exprss (exps : Array<Expr | [string, string]>) : QueryReq {
		if (exps !== undefined && exps.length !== undefined) {
			for (var ix = 0; ix < exps.length; ix++) {
				if ((exps[ix] as Expr).exp !== undefined)
					this.expr((exps[ix] as Expr).exp, (exps[ix] as Expr).as);
				else if ((exps[ix] as unknown as []).length !== undefined)
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
     * @param logic logic type
     * @param loper left operator
     * @param roper right operator
     * @return this */
	public whereCond (logic: string, loper: string, roper: string): QueryReq {
		if (Array.isArray(logic))
			this.where = this.where.concat(logic);
		else if (logic !== undefined)
			this.where.push([logic, loper, roper]);
		return this;
	}

	public whereEq (lopr: string, ropr: string) : QueryReq {
		return this.whereCond("=", lopr, "'" + ropr + "'");
	}

	public orderby (tabl: any, col: any, asc: any) : QueryReq {
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
						f: this.mtabl,
						j: this.joinings,
						conds: this.cond,
						orders: this.order,
						group: this.groupings}]};
	}
    formatHeader() {
        throw new Error("Method not implemented.");
    }
}

export class UpdateReq extends AnsonBody {
    /**Create an update / insert request.
     * @param uri component id
     * @param tabl table
     * @param pkv {pk, v} conditions for pk.<br>
     * If pk is null, use this object's where_() | whereEq() | whereCond().
     */
    constructor(uri: string, tabl: string, pkv?: [string, string] | {pk: string, v: string}) {
		super();
		this.type = "io.odysz.semantic.jserv.U.AnUpdateReq";
		this.uri = uri;
		this.a = Protocol.CRUD.u;
		this.mtabl = tabl;
		this.nvs = [];
		this.where = [];
		if (Array.isArray(pkv))
			this.where.push(['=', pkv[0], `'${pkv[1]}'`]);
		else if (typeof pkv === "object") {
            let pk_ = pkv as PkMeta;
		 	if (pk_.pk !== undefined)
				this.where.push(['=', pk_.pk, `'${pk_.v}'`]);
			else console.error("UpdateReq: Can't understand pk: ", pkv);
        }
    }

    mtabl: string;
    nvs: Array<[string, string]>;
    where: any[][];

    limt: string;
    attacheds: AttachMeta[];
    postUpds: AnsonBody[];

    /** add n-v
     * @param n
     * @param v
     * @return this
     */
    nv(n: string | Array<string>, v: string): UpdateReq {
		if (Array.isArray(n)) {
			this.nvs = this.nvs.concat(Protocol.nvs2row(n));
		}
		else {
			this.nvs.push([n, v]);
		}
		return this;
    }

    /** add n-v
     * @param rec
     * @param ignorePk pk name ignored to upload
     * @return this
     */
    record(rec: object, ignorePk?: string): UpdateReq {
	    if (rec)
			for (let n in rec) {
				if (ignorePk !== n)
					this.nvs.push([n, rec[n]]);
			}
		return this;
    }

    /**Take exp as an expression
     * @param n
     * @param exp the expression string like "3 * 2"
     * @return this*/
    nExpr(n: string, exp: string): UpdateReq {
        console.error("bug !!");
		return this.nv(n, exp);
    }

	/**Append where clause condiont
	 * @param logic "=" | "<>" , ...
	 * @param loper left operand, typically a tabl.col.
	 * @param roper right operand, typically a string constant.
	 * @return this */
     whereCond (logic: string, loper: string, roper: string): UpdateReq {
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
	 * @return this */
	where_ (logic: string, lop: string, rop: string): UpdateReq {
		return this.whereCond(logic, lop, Jregex.quote(rop));
	}

	/** A wrapper of where_("=", lcol, rconst)
	 * @param lcol left operand,
	 * @param rconst right constant, will be quoted.
	 * @return this */
	whereEq (lcol: string, rconst: string): UpdateReq {
		return this.where_("=", lcol, rconst);
	}

	/** A wrapper of where_("=", lcol, rconst)
	 * @param lcol left operand,
	 * @param rconsts an array of right constants, will be quoted.
	 * @return this */
	whereIn (lcol: string, rconsts: Array<string>): UpdateReq {
		let vals = null;
		if ( Protocol.verbose >= 4
			&& Array.isArray(rconsts) && rconsts.length === 0)
			console.error('[4] Deleting empty ids?', this.mtabl, lcol);

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
	attach(fn: string, b64: string): UpdateReq {
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

export class DeleteReq extends UpdateReq {
	constructor (uri: string, tabl: string, pk: [string, string] | { pk: string; v: string; }) {
		super (uri, tabl, pk);
		this.a = Protocol.CRUD.d;
	}
}

export class InsertReq extends UpdateReq {
	type = "io.odysz.semantic.jserv.U.AnInsertReq";
    cols: Array<string>;
    nvss: any;

	constructor (uri: string, tabl: string) {
		super (uri, tabl);
		this.a = Protocol.CRUD.c;
	}

	/**
	 * Add columns definition before setup nvs.
	 * Scince @anclient/semantier 0.2, can handle tier's fields/columns
	 * (with field property)
	 * @param cols
	 */
	columns (cols: Array<ColMeta | string> | ColMeta | string) {
		if (this.cols === undefined)
			this.cols = [];
		if (Array.isArray(cols)){
			this.cols = this.cols.concat(cols.map(
				(c, x) => typeof c === 'string'
								? c
								: c.field ? c.field
								: c.name
				));
		}
        else if (typeof cols === 'object')
            this.cols.push(cols.field ? cols.field : cols.name);
		else this.cols.push(cols);
		return this;
	}

	/**Override Update.nv() - the insert statement uses valus() for nvss.
	 * @param n
	 * @param v
	 * @return this*/
	nv (n: string, v: string): InsertReq {
		return this.valus(n, v);
	}

	/**Take exp as an expression
	 * @param n
	 * @param exp the expression string like "3 * 2"
	 * @return {InsertReq} this*/
	nExpr(n : string, exp : any) {
        console.error("Bug!!"); 
		return this.nv(n, exp);
	}

	/**Set inserting value(s).
	 * Becareful about function name - 'values' shall be reserved.
	 * @param n_row field name or n-v array<br>
	 * n_row can be typically return of jqueyr serializeArray, a.k.a [{name, value}, ...].<br>
	 * Note:<br>
	 * 1. Only one row on each calling.<br>
	 * 2. Don't use both n-v mode and row mode, can't handle that.
	 * @param v value if n_row is name. Optional.
	 * @return this
	 */
	valus (n_row : string | Array<string>, v : string) : InsertReq {
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
					this.columns(Protocol.nvs2cols(n_row as unknown as NameVal[]));
				this.nvss = this.nvss.concat([Protocol.nvs2row(n_row)]);
			}
		}
		else if (typeof n_row === 'string'){
            console.error("shouldn't reach here in ts.");
			this.columns(n_row as unknown as ColMeta);
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
				this.valus(rows[ix], undefined);
			}
		}
		return this;
	}
}

export class AnsonResp extends AnsonBody {
    static hasColumn(rs: any, colname: any): boolean {
		return rs && rs.colnames && colname && colname.toUpperCase() in rs.colnames;
	}

	static rsArr(respBody: Array<AnsonResp>, rx = 0): any {
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
    static rs2arr(rs: AnResultset): object {
		let cols = [];
		let rows = [];

		if (rs && typeof(rs.colnames) === 'object') {
			// rs with column index
            console.error("FIXME bug form js?");
			cols = new Array(Object.keys(rs.colnames || {}).length);

			for (var col in rs.colnames) {
				// e.g. col = "VID": [ 1, "vid" ],
				let cx = rs.colnames[col][0] - 1;
				let cn = rs.colnames[col][1];
				cols[cx] = cn;
			}

			rs.results.filter(r => !!r)
				.forEach((r, rx) => {
					let rw = {};
					r.forEach((c, cx) => {
						rw[cols[cx]] = c;
					});
					rows.push(rw);
				});
		}
		else if (rs) {
			// first line as column index
			(rs as unknown as Array<{}>)
			.filter( r => !!r ).forEach((r, rx) => {
				if (rx === 0) {
					cols = r as Array<{}>; // handsontable style
				}
				else {
					let rw = {};
					(<Array<{}>>r).forEach( (c, cx) => {
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
    static rs2nvs(rs: AnResultset, nv: NV): {cols: Array<string>, rows: Array<{}>} {
		let cols = [];
		let rows = [];
		let ncol = -1, vcol = -1;

		if (typeof(rs.colnames) === 'object') {
			// rs with column index
			cols = new Array(Object.keys(rs.colnames).length);
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

    constructor(respbody: any) {
		super(respbody);
		this.m = respbody.m;
		this.map = respbody.map;
		this.rs = respbody.rs;
    }

    m: string;
	msg() : string { return this.m; }

    code: string;
    Code(): string { return this.code };

    rs: AnResultset;
    Rs(rx?: number): AnResultset { return this.rs; }

    data: {props?: {}};
    getProp(prop: string): object { 
		if (this.data && this.data.props)
			return this.data.props[prop];
    }

    map: {resulved: string | {} };
    resulved: object;
    resulve(tabl: any, pk: any, clientRec: any): string {
		let resulved;
		if (this.map && this.map.resulved)
			resulved = this.map.resulved;
		else if (this.resulved)
			resulved = this.resulved;

		if (resulved)
			return resulved.props
					? resulved.props[tabl]
						? resulved.props[tabl].props[pk]
						: resulved.props[tabl][pk]
					: undefined ;
		else return clientRec[pk];
    }
}

export class AnSessionResp extends AnsonResp {
	ssInf: {uid: string, ssid: string, iv: string, usrName?: string};

	constructor(ssResp) {
		super(ssResp);
		this.ssInf = ssResp.ssInf;
	}
}

export class AnDatasetResp extends AnsonResp {
	forest: Array<{}>;

	constructor(dsJson: { forest: {}[]; }) {
		super(dsJson);
		this.forest = dsJson.forest;
	}

	Rs(rx = 0) {
		return this.rs[rx];
	}
}

export class DatasetReq extends QueryReq {
    /**
     * @param opts this parameter should be refactored 
     */
    constructor(opts?: {
        /**component uri, connectiong mapping is configured at server/WEB-INF/connects.xml */
        uri: string;
        /** semantic key configured in WEB-INF/dataset.xml */
        sk: string;
        /** Can be only one of stree_t.sqltree, stree_t.retree, stree_t.reforest, stree_t.query*/
        t?: {
            /** load dataset configured and format into tree with semantics defined by sk. */
            sqltree: string;
            /** Reformat the tree structure - reformat the 'fullpath', from the root */
            retree: string;
            /** Reformat the forest structure - reformat the 'fullpath', for the entire table */
            reforest: string;
            /** Query with client provided QueryReq object, and format the result into tree. */
            query: string;
        };
        a?: string;
        /**if t is null or undefined, use this to replace maintbl in super (QueryReq), other than let it = sk. */
        mtabl: string;
        mAlias: string;
        /** {page, size} page index and page size. */
        pageInf?: PageInf;
        /** tree root id */
        rootId?: string;
        /** sql args */
        sqlArgs: string[];
        /** {{n, v}} ...opts more arguments for sql args. */
        args?: object;
    } ) {

		let {uri, sk, t, a, mtabl, mAlias, pageInf, rootId, sqlArgs, ...args} = opts;

		super(uri, Jregex.isblank(t) ? mtabl : sk, mAlias, pageInf);
		this.type = "io.odysz.semantic.ext.AnDatasetReq";

		this.uri = uri;
		this.sk = sk;
		this.sqlArgs = sqlArgs;
		this.rootId = rootId;

		this.TA(t || a);
		this.checkt((t || a) as unknown as string);
	}

    maintbl: string;
    alias: string;
    pageInf: object;

    sk: string;
    sqlArgs: any[];
    rootId: any;

	get geTreeSemtcs() { return this.trSmtcs; }

    /**Set tree semantics<br>
     * You are recommended not to use this except your are the semantic-* developer.
     * @param {TreeSemantics} semtcs */
    treeSemtcs(semtcs: any): DatasetReq {
		this.trSmtcs = semtcs;
		return this;
    }

    trSmtcs: any;

	// FIXME this is not a typed way
	TA(ask: string | any[] | {
			/** load dataset configured and format into tree with semantics defined by sk. */
			sqltree: string;
			/** Reformat the tree structure - reformat the 'fullpath', from the root */
			retree: string;
			/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
			reforest: string;
			/** Query with client provided QueryReq object, and format the result into tree. */
			query: string;
		}) {
		if (typeof ask === 'string' && ask.length > 0 && ask !== stree_t.sqltree) {
			console.warn('DatasetReq.a is ignored for sk is defined.', ask);
			this.a = stree_t.sqltree;
		}
		else {
			this.a = ask as string;
			this.checkt(ask as string);
		}
		return this;
	}

    SqlArgs(args: any): DatasetReq {
		return this.args(args);
    }

    /**@deprecated
     * Handle differnet args */
    args(args: any): DatasetReq {
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

    /**@deprecated let's user type checking
     * Check is t can be undertood by s-tree.serv
     * TODO why not asking server for stree_t?
     * @param {string} t*/
    checkt(t: string): DatasetReq {
		if (t !== undefined && !stree_t.hasOwnProperty(t)) {
			console.warn(
				"DatasetReq.t won't be understood by server:", t, "\n 't (a)' should be one of Protocol.stree_t's key.",
				Object.keys(stree_t));
		}
        return this;
    }
}

export const stree_t = {
	/** load dataset configured and format into tree with semantics defined by sk. */
	sqltree: 'sqltree',
	/** Reformat the tree structure - reformat the 'fullpath', from the root */
	retree: 'retree',
	/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
	reforest: 'reforest',
	/** Query with client provided QueryReq object, and format the result into tree. */
	query: 'query'
};

export class DatasetierReq extends AnsonBody {
	type = "io.odysz.semantic.tier.DatasetierReq";

    static A = {
        sks: undefined as string
    };

    constructor(opts: any) {
		super(opts);
	    this.type = "io.odysz.semantic.tier.DatasetierReq";
    }
}
