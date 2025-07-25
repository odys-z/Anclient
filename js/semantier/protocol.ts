import AES from './aes';
import { SessionClient, SessionInf } from './anclient';
import { isEmpty, size, str } from './helpers';
import { Tierec } from './semantier';

/**Callback of CRUD.c/u/d */
export type OnCommitOk = (resp: AnsonMsg<AnsonResp>) => void
/**Callback of CRUD.r
 * T is the record type
 */
export type OnLoadOk<T extends Tierec> = (cols: Array<string>, rows: Array<T>) => void

export type OnLoginOk = (resp: SessionClient) => void

export type OnCommitErr = (code: string, resp: AnsonMsg<AnsonResp>) => void

/**Json string options, like no-null: true for asking server replace null with ''.  */
export interface JsonOptions {
    verbose: number;
    noNull: boolean | string;
    noBoolean: boolean | string;
}

/** An abstract object for query condition
 *
 * What's this experimening:
 * export type PageInf = { page: number, size: number, total?: number };
 *
 * Tier pattern handling query condition at server side.
 * So use this to send by query form status.
 *  */
export class PageInf {
	/** Don't set directly, use constructor to set this. */
	type: string;

	page: number;
	size?: number;
	total?: number;

	/** Read via {@link PageInf#condtsRec()} */
	arrCondts?: Array<string[]>;

	/**
	 * Generic query can't parse this parameter.
	 * 
	 * Only used for tier pattern and temp args at client side.
	 */
	mapCondts?: {[p: string]: AnsonValue};

	constructor(page?: number | PageInf, size?: number, total?: number, arrCondts?: Array<string[]>, mapCondts?: {[p: string]: AnsonValue}) {
		this.type = 'io.odysz.transact.sql.PageInf';
		if (typeof page === 'number') {
			this.page = page || 0;
			this.size = size || -1;
			this.total = total || 0;
			this.arrCondts = arrCondts;
		}
		else {// type safe: PageInf
			this.page = page?.page || 0;
			this.size = page?.size || -1;
			this.total = page?.total || 0;
			this.arrCondts = page?.arrCondts;
		}
		this.mapCondts = mapCondts || {};
	}

	nv(k: string, v: string) {
		if (!this.arrCondts)
			this.arrCondts = [];
		this.arrCondts.push([k, v]);
		return this;
	}

	/**
	 * This is used for deprecationg this#condts
	 *
	 * @returns conditions
	 */
	condtsRec () {
		let rec = {} as Tierec;
		if (this.arrCondts)
			for(let nv of this.arrCondts)
				if (nv && nv[0])
					rec[nv[0]] = nv[1];
		return Object.assign(rec, this.mapCondts);
	}

	addCondt(name: string, val: AnsonValue) {
		if (!this.mapCondts) this.mapCondts = {};
		this.mapCondts[name] = val;
		return this;
	}
}

export type AnsonValue = string | object | string | number | boolean | undefined | null;
/**
 * @depcated Lagecy from jquery & easyui, replaced by NV
 * - no need to collect form using JQuery in the future.
 */
export type NameValue = {name: string, value: AnsonValue};
export type NV = {n: string, v: AnsonValue};
export function isNV (obj: any) {
	return !!obj && (obj.name || obj.n);
}

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

export interface DbCol {
    field: string;
    name?: string;
}

/**fk: Foreign key
 * Semantic tree defined in dataset.xml
 * multi-multi (TODO)
 * user defined (?)
 * */
export type SemanticType = 'fk' | 'stree' | 'm2m' | 'customer';

export interface relFK {
	/**table name */
	tabl: string;

	/**child table pk */
	pk: string,

	/**child FK column in DB table */
	col: string,

	/**value for col - column-map's key for where to get the value from UI component */
	relcolumn: string,
}

/**
 * An experiment for semantic pattern of relation tree,
 * trying UI handling s-tree in automatic pattern.
 *
 * Used by {@link Semantier.formatRel()}
 */
export interface relStree {
	/** s-tree semantic key */
	sk?: string, 		
	/** child table (optional when loading / binding records) */
	childTabl?: string,
	/**
	 * AnTreeNode.node field name for updating fk in relation table.
	 * E. g. 'funcId' in a_role_func, where roleId is provided as pkval.v
	 */
	col: string,
	/**
	 * propterty name (of which the value will be collected)
	 * @deprecated replaced by #col
	 */
	colProp?: string,	
	/** fk to main table */
	fk : string,	
	sort?: string,
	fullpath?: string,

	/** additional args, e. g. for string format in dataset.xml */
	sqlArgs?: AnsonValue[]
}

export interface DbRelations {
	/** Child field to m-tabl */
	childField: string,
	/** FK relation handled in UI */
	fk?: relFK,
	/** semantic tree */
	stree?: relStree,
	/** TODO: Multiple to mulitple */
	m2m?: any,
}

/**Issue: As pk fields is wrapped up at server side, should clients caring about the pk name?
 * example of this:
 * that.pkval.v = that.rec && that.rec[that.pk];
*/
export interface PkVal {
    v: AnsonValue;// string | number | boolean | undefined;
    pk: string | undefined;
    tabl?: string;
}

export interface AttachMeta {
    fn: string;
    b64: string;
}

export interface AnResultset {
	results: Array<Array<any>>;
	length() : number;
    total: number;
    colnames: {};
}

/** Regex helper */
class Jregex {
	/**Add single quotes to str, if not yet.
	 * @param str
	 * @return quoted */
	static quote(str: string): string {
		if (str === undefined || str === null )
			str = "''";
		else if (typeof str === "string" && str.substring(0, 1) !== "'"
			&& str.substring(0, 2) != "''")
			return "'" + str + "'";
	}

	static isblank(s: any) : boolean {
		return s === undefined || s === null
			|| (typeof s === 'string' && s.trim() === '');
	}
}

export type TMsgCode = 'ok' | 'exSession' | 'exSemantic' | 'exIo' | 'exTransct' | 'exDA' | 'exGeneral';

/**Json protocol helper to support jclient.
 * All AnsonBody and JHelper static helpers are here. */
export class Protocol {
	/** @deprecated replaced by enum CRUD. */
	static CRUD = {c: 'I', r: 'R', u: 'U', d: 'D'};

	static Port = {	heartbeat: "ping.serv",
		echo: "echo.less",
		session: "login.serv",
		query: "r.serv", update: "u.serv",
		insert: "c.serv", delete: "d.serv",
		dataset: "ds.serv",
		stree: "s-tree.serv",
		datasetier: "ds.tier"
	};

	static MsgCode = {
		ok: "ok" as TMsgCode,
		exSession: "exSession" as TMsgCode,
		exSemantic: "exSemantic" as TMsgCode,
		exIo: "exIo" as TMsgCode,
		exTransct: "exTransct" as TMsgCode,
		exDA: "exDA" as TMsgCode,
		exGeneral: "exGeneral" as TMsgCode
	};

	static Notify = {changePswd: "changePswd", todos: "todos"};

	static cfg  = { ssInfo: "ss-k", };

	static Semantics = {
		chkCntDel: 'checkSqlCountOnDel',
		chkCntIns: 'checkSqlCountOnInsert',
	};

	/**Semantics key
	 * For jsample, these is needed at least:
	 * cbbOrg: 'org.all', cbbRole: 'roles'
	 * For north:
	 * cbbMyClass: 'north.my-class';
	 */
	static sk: any = {
		// app will extending sk here.
	}

	/**Extend new ports
	 * @function
	 * @param {object} newPorts
	 */
	static extend = function(newPorts: {[p: string]: string}) {
		Object.assign(Protocol.Port, newPorts);
	};

	static ansonTypes = {};

	/**Extend new protocol - register new body type creater.
	 * @function
	 * @param type body type
	 * @param bodyConstructor AnsonBody constructor
	 */
	static registerBody = function(type: string, bodyConstructor: { (json: any): AnsonBody; } ) {
		if ( Protocol.ansonTypes[type] )
			console.error("Repeatedly registering protocol body, wrong type registering?",
				type, Protocol.ansonTypes, bodyConstructor);

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
	static opts(options: JsonOptions): Protocol {
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
			port: 'session',
			body: [{type: 'io.odysz.semantic.jsession.AnSessionReq',
					uid, token: tk64, iv: iv64}]
		});
		login.Body().A('login');
		return login;
	}

    static formatHeader(ssInf: SessionInf): AnHeader {
		if (isEmpty(ssInf))
			throw Error("Can't format a header without ssInf.");
		return new AnHeader(ssInf.ssid, ssInf.uid, ssInf.ssToken);
    }

	static rs2arr (rs) {
		return AnsonResp.rs2arr(rs);
	}

	static nv2cell (nv: NameValue | NV): [string, string] {
		return [(nv as NV).n || (nv as NameValue).name, str((nv as NV).v || (nv as NameValue).value)];
	}

	static nvs2row (nvs: NameValue[] | NV[]) {
		var row = [] as [string, string][];
		if (nvs) {
			for (var ix = 0; ix < nvs.length; ix++)
				row.push(Protocol.nv2cell(nvs[ix]));
		}
		return row;
	}

    /** convert [{name, value}, ...] to [n1, n2, ...]
     * @param {Array} [n-v, ...]
     * @return {Array} [n1, n2, ...]
     */
    static nvs2cols(nvArr: Array<NameValue> | Array<NV> | Array<string>): Array<string> {
		var cols = [];
		if (nvArr) {
			for (var ix = 0; ix < nvArr.length; ix++) {
				if ((nvArr[ix] as NameValue).name) {
					cols.push((nvArr[ix] as NameValue).name);
				}
				else if ((nvArr[ix] as NV).n) {
					cols.push((nvArr[ix] as NV).n);
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

export enum CRUD { c = 'I', r = 'R', u = 'U', d = 'D' };

export class AnsonMsg<T extends AnsonBody> {
	type = "io.odysz.semantic.jprotocol.AnsonMsg";

    code: string;
    version: string;
    seq: number;
    port: string;
	/**Json string options, like no-null: true for asking server replace null with ''.  */
    opts: {};
    header: AnHeader;
    body: T[];
    static __type__ = '';


	/**
	 * Get resultset's array mapping.
	 * @param resp general response (AnsonResp)
	 * @param rx resultset index
	 * @returns array
	 */
    static rsArr(resp: AnsonMsg<AnsonResp>, rx?: number): any {
		if (resp.body && resp.body[0] && resp.body[0].rs
			// A legacy of js. Type of rs will be changed to Array<AnResultset>
			&& (resp.body[0].rs as Array<AnResultset>).length > 0) {
			return AnsonResp.rsArr(resp.body, rx);
		}
		return [];
	}

	/**
	 * @param json a json object to be deserialized.
	 * 
	 * TODO
	 * There are better ways for this in Typescript:
	 * const person = { ...new Person(), ...data };
	 * or 
	 * const person = Object.assign(new Person(), data as Partial<Person>);
	 * ____________________________________________________________________
	 * 
	 * <p>Grok recommend using registered contructor rather than find constructor
	 * from globe, the window.</p>
	 */
    constructor(json: any) {
		if (typeof json !== 'object')
			throw new Error("AnClient is upgraded, takes only one arg, the json obj.");

		let header = json.header;
		if (header)
			this.header = header;
		else this.header = new AnHeader(undefined, undefined, undefined);

		if (!(json instanceof AnsonBody)) {
			let [body] = json.body ? json.body : [{}] as any[];
			let a = body.a;

			// initiating json to class
			if (body.constructor.name === 'Object') {
				if (body.type === 'io.odysz.semantic.jprotocol.AnsonResp')
					body = new AnsonResp(body);
				// else if (body.type === 'io.odysz.semantic.jsession.AnSessionResp')
				// 	body = new AnSessionResp(body);
				else if (body.type === 'io.odysz.semantic.jsession.AnSessionReq')
					body = new AnSessionReq(body.uid, body.token, body.iv);
				// else if (body.type === "io.odysz.semantic.jserv.R.AnQueryReq")
				// 	body = new QueryReq(body.uri, body.mtabl, body.mAlias);
				else if (body.type === 'io.odysz.semantic.jserv.user.UserReq')
					body = new UserReq(json.port, header, [body]);
				else if (body.type === "io.odysz.semantic.ext.AnDatasetReq") {
					// body are provided by user
					if (!body.sk) {
						console.error("Since AnClient 0.9.28, constructing DatasetReq with AnsonMsg constructor needs providing DatasetReq as body.",
								"For example, see https://github.com/odys-z/Anclient/blob/master/js/semantier/test/03-jsample.mocha.ts");
						throw new Error("DatasetReq.sk is essential but empty.");
					}
				}
				else if (body.type === "io.odysz.semantic.ext.AnDatasetResp")
					body = new AnDatasetResp(body);

				else if (body.type === DatasetierReq.__type__)
					body = new DatasetierReq(body);
				else if (body.type === DatasetierResp.__type__)
					body = new DatasetierResp(body);

				else if (body.type in Protocol.ansonTypes)
					// TODO FIXME what happens if the other known types are all handled like this?
					body = Protocol.ansonTypes[body.type](body);
				else {
					// server can't handle body without type
					throw new Error("Error: Using json object directly as body. To extend protocol, register a new Protocol like this:"
						+ "\nProtocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => { return new QuizResp(jsonBd); });"
						+ "\nType not handled : " + body.type );
				}

				if (a) body.A(a);

				// imitate the ajax error
				if (json.ajax)
					body.ajax = json.ajax;
			}

			this.body = [];
			if (body)
				body.parent = this.type;
			this.body.push(body);

		}
		else this.body = [json as T];

		this.code = json.code;
		this.version = json.version ? json.version : "1.0";
		this.seq = json.seq;
		this.port = json.port;

		if (!this.seq)
			this.seq = Math.round(Math.random() * 1000);

		this.opts = Protocol.valOptions;
    }

    /** A short cut for body[0].post()
     * @param {AnsonBody} pst post sql request
     * @return {AnsonBody} the  first request body[0].post returned value.*/
    post(pst: AnsonBody): AnsonBody {
		if (this.body !== undefined && this.body.length > 0)
			return this.body[0].post(pst);
	}

    Body(ix = 0): T | undefined {
		return this.body ? this.body[ix] : undefined;
	}

	Uri(uri: string) {
		this.body[0].uri = uri;
		return this;
	}
}

export class AnsonBody {
	msg(): string {
		throw new Error('Method not implemented.');
	}
	ajax: any;
	Rs(): any {
		throw new Error('Method not implemented.');
	}
	ssInf: SessionInf | undefined;
	post(pst: AnsonBody): AnsonBody {
		throw new Error("AnsonBody is an abstract class.");
	}

	/**
	 * Create request object, a Semantic-jserv envolope object.
	 * All user request should be a subclass of AnsonBody.
	 *
	 * It's highly recommended the parameter is pressented when creating the object.
	 * @param body json object
	 * @param body.uri function uri.
	 * @see {@link https://odys-z.github.io/Anclient/guide/func-uri.html#func-uri-datasource-mapping Anclient doc}
	 */
	constructor(body?: {type: string, a?: string, parent?: string, uri?: string}) {
		this.type = body?.type;
		this.a = body?.a
		this.parent = body?.parent;
		this.uri = body?.uri;
	}

    type: string;
    a: string;
    parent: string; // AnsonMsg<AnsonBody>;
    uri: string;
	version?: string;
	seq?: number;

    /**set A tag a.<br>
     * a() can only been called once.
     * @param a
     * @return this */
    A<T extends AnsonBody>(a: string): T {
		this.a = a;
		return this as unknown as T;
	}
}

const aes = new AES();
export class AnHeader {
    constructor(ssid: string, userId: string, ssToken: string) {
		this.type = "io.odysz.semantic.jprotocol.AnsonHeader";
		this.ssid = ssid;
		this.uid = userId;
		this.ssToken = ssToken;
	}

    type: string;
    ssid: string;
    uid : string;

	iv: string;
	/** repackec session token */
	ssToken: string;

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

	// Seq(seq: number) {
	// 	let iv = aes.getIv128() as unknown as Uint8Array;
	// 	this.ssToken = aes.encrypt(`${this.ssid} ${seq}`, this.ssid, iv);
	// 	this.iv = aes.bytesToB64(iv);
	// 	return this;
	// }
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
	set(prop : string, v : object | string) : UserReq {
		this.data.props[prop] = v;
		return this;
	}
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
	static __type__ = 'io.odysz.semantic.jserv.R.AnQueryReq';

    mtabl: string;
    mAlias: string;

    exprs: Array<string[]>;
    joins: Array<string[]>;
    joinings: string[];
    where: Array<string[]>;
    orders: Array<string[]>;
    groups: string[];
    cond: Array<string[]>;
    order: Array<string[]>;
    groupings: Array<string[]>;

    page: number;
    pgsize: number;
    limt: string[];

	// constructor (uri: string, tabl: string, alias: string, pageInf?: PageInf) {
	// 	body = new QueryReq(body.uri, body.mtabl, body.mAlias);
	constructor(json: {uri: string, mtabl: string, mAlias: string, pageInf: PageInf}) {

		super();

		this.type = QueryReq.__type__; // "io.odysz.semantic.jserv.R.AnQueryReq";
		
		let {uri, mtabl, mAlias, pageInf} = json;

		this.uri = uri;
		this.mtabl = mtabl;
		this.mAlias = mAlias;
		this.exprs = [];
		this.joins = [];
		this.where = [];

		if (pageInf) {
			this.Page(pageInf.size, pageInf.page);
			this.where = pageInf.arrCondts;
			if (size(pageInf.mapCondts as any) > 0)
				console.warn("Parameter map is ignored in QueryReq:", pageInf.mapCondts);
		}
	}

	Page (size : number, idx : number): QueryReq {
		this.page = idx;
		this.pgsize = size;
		return this;
	}

	/**
	 * Add joins to the query request object
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

	public expr (exp: string, as?: string) : QueryReq {
		this.exprs.push([exp, as]);
		return this;
	}

	public col (c : string, as? : string) : QueryReq {
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

    /**
	 * Add where clause condition
     * @param logic logic type
     * @param loper left operator
     * @param roper right operator
     * @return this */
	public whereCond (logic: string, loper: string, roper: string): QueryReq {
		if (!this.where)
			this.where = [];

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

	groupby (expr: string) {
		// console.warn("groupby() is still to be implemented");
		if (this.groups === undefined)
			this.groups = [];
		this.groups.push(expr);
		return this;
	}

	groupbys (exprss: string[]) {
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

	/**
	 * limit clause.
	 * @param expr1
	 * @param expr2
	 */
	limit (expr1: string | number, expr2: string | number) {
		this.limt = [];
		if (expr1)
			this.limt.push(str(expr1));

		if (expr2)
			this.limt.push(str(expr2));
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
Protocol.registerBody(QueryReq.__type__, (json) => new QueryReq(json));

export class UpdateReq extends AnsonBody {
    /**Create an update / insert request.
     * @param uri component id
     * @param tabl table
     * @param pkv conditions for pk.<br>
     * If pk is null, use this object's where_() | whereEq() | whereCond().
     */
    constructor(uri: string, tabl: string, pkv: string[] | PkVal) {
		super();
		this.type = "io.odysz.semantic.jserv.U.AnUpdateReq";
		this.uri = uri;
		this.a = CRUD.u;
		this.mtabl = tabl;
		this.nvs = [];
		this.where = [];
		if (Array.isArray(pkv))
			this.where.push(['=', pkv[0], `'${pkv[1]}'`]);
		else if (typeof pkv === "object") {
            let pk_ = pkv as PkVal;
		 	if (pk_.pk !== undefined)
				this.where.push(['=', pk_.pk, `'${pk_.v}'`]);
			else console.error("UpdateReq: Can't understand pk: ", pkv);
        }
    }

    mtabl: string;
    nvs: Array<[string, any]>;
    nvss: Array<Array<[string, string]>>;
    where: any[][];

    limt: string;
    attacheds: AttachMeta[];
    postUpds: AnsonBody[];

    /** add n-v
     * @param n
     * @param v
     * @return this
     */
    nv(n: string, v: string): UpdateReq {
		if (Array.isArray(n)) {
			// TODO cannot publish till all pages are bring up
			throw Error('This branch is replaced with addArrow()')
			// this.nvs = this.nvs.concat(Protocol.nvs2row(n));
			// this.nvs = this.nvs.concat(n);
		}
		else {
			this.nvs.push([n as string, v]);
		}
		return this;
    }

	addNvrow (nv_row : NameValue[] | NV[]) : this {
		this.nvs = this.nvs.concat(Protocol.nvs2row(nv_row));
		return this;
	}

	addArrow (nvs: [string, string][]): UpdateReq {
		// this.nvs = this.nvs.concat(Protocol.nvs2row(n));
		this.nvs = this.nvs.concat(nvs);
		return this;
	}

    /** add n-v
     * @param rec
     * @param ignorePk pk name ignored to upload
     * @return this
     */
    record(rec: Tierec, ignorePk?: string): UpdateReq {
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
     * @return this
    nExpr(n: string, exp: string): UpdateReq {
        console.error("bug !!");
		return this.nv(n, exp);
    }*/

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

	/**
	 * Wrapper of #whereCond(), will take rop as consts and add "''".<br>
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
	 * @param pst post request
	 * @return this */
	post (pst: AnsonBody) {
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
	constructor (uri: string, tabl: string, pk: string[] | PkVal) {
		super (uri, tabl, pk);
		this.a = CRUD.d;
	}
}

export class InsertReq extends UpdateReq {
	static __type__ = "io.odysz.semantic.jserv.U.AnInsertReq";


    cols: Array<string>;

	constructor (uri: string, tabl: string) {
		super (uri, tabl, undefined);
		this.a = CRUD.c;
		this.type = InsertReq.__type__;
		delete this.where;
	}

	/**
	 * Add columns definition before setup nvs.
	 * Scince @anclient/semantier 0.2, can handle tier's fields/columns
	 * (with field property)
	 * @param cols
	 */
	columns (cols: Array<DbCol | string> | DbCol | string) {
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

	/**
	 * Override Update.nv() - the insert statement uses valus() for nvss.
	 * @param n
	 * @param v
	 * @return this*/
	nv (n: string, v: string): this {
		if (this.nvss === undefined)
			this.nvss = [];

		this.columns(n);
		if (this.nvss.length == 0) {
			this.nvss.push([[n, v]]);
		}
		else {
			this.nvss[this.nvss.length - 1].push([n, v]);
		}
		return this;
	}

	newrow () : InsertReq {
		if (this.nvss === undefined)
			this.nvss = [];
		this.nvss.push([]);
		return this;
	}

	/**Take exp as an expression
	 * @param n
	 * @param exp the expression string like "3 * 2"
	 * @return this
	nExpr(n : string, exp : any): this {
        console.error("Bug!!");
		return this.nv(n, exp);
	}
	 **/

	addNvrow (n_row : NameValue[] | NV[]) : this {
		if (this.nvss === undefined)
			this.nvss = [];

		if (this.cols === undefined)
			this.columns(Protocol.nvs2cols(n_row as NV[]));
		this.nvss = this.nvss.concat([Protocol.nvs2row(n_row)]);
		return this;
	}

	addArrow (arrow : Array<[string, string]>) : this {
		if (this.nvss === undefined)
			this.nvss = [];

		this.nvss = this.nvss.concat([arrow]);
		return this;
	}

	/**
	 * Set inserting value(s).
	 * Becareful about function name - 'values' shall be reserved.
	 * @param n_row field name or n-v array<br>
	 * n_row can be typically return of jqueyr serializeArray, a.k.a [{name, value}, ...].<br>
	 * Note:<br>
	 * 1. Only one row on each calling.<br>
	 * 2. Don't use both n-v mode and row mode, can't handle that.
	 * @param v value if n_row is name. Optional.
	 * @return this
	 */
	valuss (n_row : string | Array<string[]> | Array<NV>, v? : string) : this {
		if (this.nvss === undefined)
			this.nvss = [];

		// var warned = false;
		if (Array.isArray(n_row)) {
			if (Array.isArray(n_row[0])) {
				throw Error("This branch is replaced by addArrow().");
				// // already a 2-d array
				// if (Array.isArray(n_row[0][0]) && !warned) {
				// 	console.warn('InsertReq is trying to handle multi rows in on value call, it is wrong. You must use InsertReq.addArrows(rows) instead.',
				// 			n_row);
				// 	warned = true;
				// 	this.nvss = this.nvss.concat(n_row);
				// }
				// else this.nvss = this.nvss.concat([n_row]);
			}
			else {
				// guess as a n-v array
				throw Error("This branch is replaced by addNvrow().");
				// if (this.cols === undefined)
				// 	this.columns(Protocol.nvs2cols(n_row as NV[]));
				// this.nvss = this.nvss.concat([Protocol.nvs2row(n_row)]);
			}
		}
		else if (typeof n_row === 'string'){
			throw Error("This branch is replaced by nv().");
			// this.columns(n_row as unknown as DbCol);
			// if (this.nvss.length == 0) {
			// 	this.nvss.push([[n_row, v]]);
			// }
			// else {
			// 	this.nvss[0].push([n_row, v]);
			// }
		}
		else console.error('Error when setting n-v with', n_row, v,
			'Check the type of n - only string for column, or n is an array represeting a row\'s n-vs!');
		return this;
	}

	/**Design Notes:
	 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
	 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
	*/
	rows(rows: Array<NameValue[]> | Array<NV[]>) {
		if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) {
			for (var ix = 0; ix < rows.length; ix++) {
				// this.valuss(rows[ix]);
				this.addNvrow(rows[ix]);
			}
		}
		return this;
	}

	rowsArr(rows: Array<Array<[string, string]>>) {
		if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) {
			for (var ix = 0; ix < rows.length; ix++) {
				// this.valuss(rows[ix]);
				this.addArrow(rows[ix]);
			}
		}
		return this;
	}
}

export class AnsonResp extends AnsonBody {
    static hasColumn(rs: any, colname: string): boolean {
		return rs && rs.colnames && colname && colname.toUpperCase() in rs.colnames;
	}

	static rsArr(respBody: Array<AnsonResp>, rx = 0): {cols: Array<{}>, rows: Array<{}>} {
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
    static rs2arr(rs: AnResultset): {cols: Array<string>, rows: Array<{}>} {
		let cols = [];
		let rows = [];

		if (rs && typeof(rs.colnames) === 'object') {
			// rs with column index
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
    static rs2nvs(rs: AnResultset | undefined, nv: NV): {cols: Array<string>, rows: Array<NV>} {
		let cols = [];
		let rows = [];
		let ncol = -1, vcol = -1;

		if (!rs)
			return {cols: [], rows: []};

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

    rs: AnResultset | Array<AnResultset>;
    Rs(rx = 0): AnResultset {
		return Array.isArray(this.rs) ? this.rs[rx] : this.rs;
	}

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
	static __type__ = "io.odysz.semantic.jsession.AnSessionResp";

	ssInf: SessionInf;

	/** Any type of Anson.
	 * @since 0.9.99 (Semantic.jser v 1.5.0)
	 */
	profile: object;

	constructor(ssResp) {
		super(ssResp);
		this.ssInf = ssResp.ssInf;
		this.profile = ssResp.profile;
	}
}
Protocol.registerBody(AnSessionResp.__type__, (json) => new AnSessionResp(json));

/**
 * type: io.odysz.semantic.ext.AnDatasetResp,
 * planned to be replaced by DatasetierResp
 */
export class AnDatasetResp extends AnsonResp {
	forest: Array<Tierec>;
	static __type__ = "io.odysz.semantic.ext.AnDatasetResp";

	constructor(dsJson: { forest: Tierec[]; }) {
		super(Object.assign(dsJson, {type: AnDatasetResp.__type__}));
		this.forest = dsJson.forest;
	}

	Rs(rx = 0) {
		return this.rs? this.rs[rx] : undefined;
	}
}
Protocol.registerBody(AnDatasetResp.__type__, (json) => new AnDatasetResp(json));

export interface DatasetOpts {
	/** API args should ignore this */
	port?: string;
	/**component uri, connectiong mapping is configured at server/WEB-INF/connects.xml */
	uri?: string;
	/**
	 * @since 0.9.104, the connect id to synchronized dataset,
	 * which is intended to be different from registration's connection
	 */
	synuri?: string;
	/** semantic key configured in WEB-INF/dataset.xml */
	sk: string;
	/** Can be only one of stree_t.sqltree, stree_t.retree, stree_t.reforest, stree_t.query*/
	// t?: /** load dataset configured and format into tree with semantics defined by sk. */
	// 	"sqltree" |
	// 	/** Reformat the tree structure - reformat the 'fullpath', from the root */
	// 	"retree" |
	// 	/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
	// 	"reforest" |
	// 	/** Query with client provided QueryReq object, and format the result into tree. */
	// 	"query",
	t?: stree_t | keyof DatasetierReq['A'];

	a?: string;
	/**if t is null or undefined, use this to replace maintbl in super (QueryReq), other than let it = sk. */
	mtabl?: string;
	mAlias?: string;
	/** {page, size} page index and page size. */
	pageInf?: PageInf;
	/** tree root id */
	rootId?: string;
	/** sql args */
	sqlArgs?: string[];
	/** {{n, v}} ...opts more arguments for sql args. */
	args?: object;

	onOk?: OnCommitOk;
}

/**
 * @deprecated renamed as AnDatasetReq
 */
export class DatasetReq extends QueryReq {
    /**
     * @param opts this parameter should be refactored
     */
    constructor(opts?: DatasetOpts ) {

		let {uri, sk, t, a, mtabl, mAlias, pageInf, rootId, sqlArgs, ...args} = opts;

		super({uri, mtabl: Jregex.isblank(t) ? mtabl : sk, mAlias, pageInf});
		this.type = "io.odysz.semantic.ext.AnDatasetReq";

		this.uri = uri;
		this.sk = sk;
		this.sqlArgs = sqlArgs;
		this.rootId = rootId;

		this.TA(t || a);
		// this.checkt((t || a) as unknown as string);
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

	/**Set t/a of message.
	 * FIXME this is not a typed way
	 *
	 * @param ask
	 * @returns
	 */
	TA(ask: string | {
			/** load dataset configured and format into tree with semantics defined by sk. */
			sqltree: string;
			/** Reformat the tree structure - reformat the 'fullpath', from the root */
			retree: string;
			/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
			reforest: string;
			/** Query with client provided QueryReq object, and format the result into tree. */
			query: string;
		}) {

		if (typeof ask === 'string' && ask.length > 0 && ask === stree_t.sqltree) {
			console.info('Since @anclient/semantier 0.9.98, A = stree_t.sqltree is deprecated and replaced with DatasetierREq.A.stree, ', DatasetierReq.A.stree);
			this.a = DatasetierReq.A.stree;
		}

		if (typeof ask === 'string' && ask.length > 0 && ask !== DatasetierReq.A.stree) {
			console.info('DatasetReq.a is ignored for sk is defined.', ask);
			this.a = DatasetierReq.A.stree;
		}
		else {
			this.a = ask as string;
			// this.checkt(ask as string);
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

    /**
	 * @deprecated lagacy of without type checking 
	 * 
     * Check is t if port is stree can be undertood by s-tree.serv
	 * 
     * @param {string} t
	 * @return this
	 */
    checkt(t: string): DatasetReq {
		if (t !== undefined && !DatasetierReq.A.hasOwnProperty(t)) {
			console.warn(
				"DatasetReq.t won't be understood by server:", t, "\n 't (a)' should be one of Protocol.stree_t's key.",
				Object.keys(stree_t));
		}
        return this;
    }
}

export class AnDatasetReq extends QueryReq {
	static __type__ = "io.odysz.semantic.ext.AnDatasetReq";

    /**
     * @param opts this parameter should be refactored
     */
    constructor(opts?: DatasetOpts ) {

		let {uri, sk, t, a, mtabl, mAlias, pageInf, rootId, sqlArgs, ...args} = opts;

		super({uri, mtabl: Jregex.isblank(t) ? mtabl : sk, mAlias, pageInf});
		this.type = "io.odysz.semantic.ext.AnDatasetReq";

		this.uri = uri;
		this.sk = sk;
		this.sqlArgs = sqlArgs;
		this.rootId = rootId;

		this.TA(t || a);
		// this.checkt((t || a) as unknown as string);
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

	/**Set t/a of message.
	 * FIXME this is not a typed way
	 *
	 * @param ask
	 * @returns
	 */
	TA(ask: string | {
			/** load dataset configured and format into tree with semantics defined by sk. */
			sqltree: string;
			/** Reformat the tree structure - reformat the 'fullpath', from the root */
			retree: string;
			/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
			reforest: string;
			/** Query with client provided QueryReq object, and format the result into tree. */
			query: string;
		}) {

		if (typeof ask === 'string' && ask.length > 0 && ask === stree_t.sqltree) {
			console.info('Since @anclient/semantier 0.9.98, A = stree_t.sqltree is deprecated and replaced with DatasetierREq.A.stree, ', DatasetierReq.A.stree);
			this.a = DatasetierReq.A.stree;
		}

		if (typeof ask === 'string' && ask.length > 0 && ask !== DatasetierReq.A.stree) {
			console.info('DatasetReq.a is ignored for sk is defined.', ask);
			this.a = DatasetierReq.A.stree;
		}
		else {
			this.a = ask as string;
			// this.checkt(ask as string);
		}
		return this;
	}

    SqlArgs(args: any): AnDatasetReq {
		return this.args(args);
    }

    /**@deprecated
     * Handle differnet args */
    args(args: any): AnDatasetReq {
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

    /**
	 * @deprecated lagacy of without type checking 
	 * 
     * Check is t if port is stree can be undertood by s-tree.serv
	 * 
     * @param {string} t
	 * @return this
	 */
    checkt(t: string): DatasetReq {
		if (t !== undefined && !DatasetierReq.A.hasOwnProperty(t)) {
			console.warn(
				"DatasetReq.t won't be understood by server:", t, "\n 't (a)' should be one of Protocol.stree_t's key.",
				Object.keys(stree_t));
		}
        return this;
    }
}
// StreeTier will register this
// Protocol.registerBody(AnDatasetReq.__type__, (json) => new AnDatasetReq(json));

/**
 * @deprecated replaced by {@link DatasetierReq.A}
 */
export enum stree_t {
	/**
	 * Load dataset configured and format into tree with semantics defined by sk.
	 * @deprecated replaced by {@link DatasetierReq.A.stree}
	 */
	sqltree = 'sqltree',

	/** Reformat the tree structure - reformat the 'fullpath', from the root */
	retree = 'retree',
	/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
	reforest = 'reforest',
	/** Query with client provided QueryReq object, and format the result into tree. */
	query = 'query'
}

export class DatasetierReq extends AnsonBody {
	static __type__ = "io.odysz.semantic.tier.DatasetierReq";

    static A = {
        sks: 'r/sks',

		/** Load dataset configured and format into tree with semantics defined by sk. */
		stree: 'r/stree',

		/** Reformat the tree structure - reformat the 'fullpath', from the root */
		retree: 'retree',
		/** Reformat the forest structure - reformat the 'fullpath', for the entire table */
		reforest: 'reforest',
		/** Query with client provided QueryReq object, and format the result into tree. */
		query: 'query'
    };

    constructor(opts: any) {
		super(opts);
		this.type = DatasetierReq.__type__;
	}
}
Protocol.registerBody(DatasetierReq.__type__, (json) => new DatasetierReq(json));

/**
 * type: io.odysz.semantic.tier.DatasetierResp
 */
export class DatasetierResp extends AnsonResp {
	static __type__ = "io.odysz.semantic.tier.DatasetierResp";
	sks: string[];

	constructor(dsJson: any) {
		super(dsJson);
		this.type = DatasetierResp.__type__;
		this.sks = dsJson.sks;
	}
}
Protocol.registerBody(DatasetierResp.__type__, (json) => new DatasetierResp(json));

export class DocsResp extends AnsonResp {
	static __type__ = 'io.odysz.semantic.tier.docs.DocsResp';

	collectId: string;
	doc: object;
	device: string;

	constructor(dsJson: any) {
		super(dsJson);
		this.type      = DocsResp.__type__;
		this.collectId = dsJson.collectId;
		this.doc       = dsJson.doc;
		this.device    = dsJson.device;
	}
}
Protocol.registerBody(DocsResp.__type__, (json) => new DocsResp(json));

/**
 * SyncDoc is currently an abstract class for __type__ is absent,
 * which makes this class can not be deserialized.
 * 
 * Java: ExpSyncDoc
 */
export class SyncDoc implements Tierec {
	/**
	 * 'io.odysz.semantic.tier.docs.ExpSynDoc'
	 * As this is an anbstract class (in Java), subclass must provide the static "type" field. 
	 */
	static __type0__: 'io.odysz.semantic.tier.docs.ExpSynDoc';

    [f: string]: AnsonValue;

	type?: string;

	/** pid */
	// docId?: string;

	/** card title */
	pname?: string;
	shareby?: string | undefined;
	sharedate?: string;
	device?: string;
	src?: string;
	syncFlag?: string;
	size?: number;
	mime?: string;

	constructor (opt: { recId: any; src?: any; device?: string, type: string }) {
		this.type = opt.type || SyncDoc.__type0__;
		this.src = opt.src
		this.recId = opt.recId;
		this.device = opt.device;
	}
}

export class DocsReq extends AnsonBody {
	static __type__ = 'io.odysz.semantic.tier.docs.DocsReq';

	static A = {
		records: 'r/list',
		rec: 'r/rec',
		upload: 'c/doc',
		insert: 'c',
		download: 'r/download',
		del: 'd',
	};

	synuri?: string;

	doc?: SyncDoc;

	pageInf?: PageInf;

	// docId: string;
	// docName: string;
	// mime: string;
	// uri64: string;

	deletings?: string[];
	// subfolder: string;

	/**
	 *
	 * @param uri
	 * @param args
	 * @param args.synuri The function uri for accessing doc's db. Must no null. 
	 * This is not checked in Java, where the *args.uri* is used directly as synuri
	 * @param args.reqtype: type for deserilizing user's tierec, e. g. type of PhotoRec.
	 * @param args.deletings: old docId to be deleted
	 */
	constructor(uri: string, args? : {synuri: string, docFieldType: string, docId?: string, docName?: string, mime?: string, uri64?: string, deletings?: string[]}) {
		super({uri, type: DocsReq.__type__});

		if (!args || !args.synuri) {
			console.warn("Since 1.0.1, Synuri for doc operation is required.");
			this.synuri = uri;
		}
		else
			this.synuri = args.synuri;

		this.doc = new SyncDoc(Object.assign(args, {recId: args.docId, type: args.docFieldType}));

		this.deletings = args.deletings;
	}
}
Protocol.registerBody(DocsReq.__type__, (json) => new DocsReq(json));
