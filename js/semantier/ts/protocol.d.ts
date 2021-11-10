/**Json protocol helper to support jclient.
 * All AnsonBody and JHelper static helpers are here. */
export class Protocol {
    /**Globally set this client's options.
     * @param {object} options<br>
     * options.noNull no null value <br>
     * options.noBoolean no boolean value<br>
     * options.valOptions<br>
     * options.verbose logging verbose level
     * @return {Protocol} static Protocol class
     */
    static opts(options: object): Protocol;
    /**Format login request message.
     * @param {string} uid
     * @param {string} tk64 password cypher
     * @param {string} iv64
     * @return login request message
     */
    static formatSessionLogin(uid: string, tk64: string, iv64: string): AnsonMsg;
    static formatHeader(ssInf: any): AnHeader;
    static rs2arr(rs: any): any;
    static nv2cell(nv: any): any[];
    static nvs2row(nvs: any): any[][];
    /** convert [{name, value}, ...] to [n1, n2, ...]
     * @param {Array} [n-v, ...]
     * @return {Array} [n1, n2, ...]
     */
    static nvs2cols(nvArr: any): any[];
    /** convert [[{name, value}]] to [[[name, value]]]
     * @param {Array} 2d array of n-v pairs
     * @return {Array} 3d array that can be used by server as nv rows
     */
    static nvs2rows(nvs: any): any[];
}
export class AnsonMsg {
    static rsArr(resp: any, rx?: number): any;
    constructor(json: any);
    type: string;
    code: any;
    version: any;
    seq: any;
    port: any;
    opts: {};
    header: any;
    body: any[];
    /** A short cut for body[0].post()
     * @param {UpdateReq} pst post sql request
     * @return {UpdateReq} the  first request body[0].post returned value.*/
    post(pst: UpdateReq): UpdateReq;
    Body(ix?: number): any;
}
export class AnsonBody {
    constructor(body?: {});
    type: any;
    a: any;
    parent: any;
    uri: any;
    /**set a.<br>
     * a() can only been called once.
     * @param {string} a
     * @return {SessionReq} this */
    A(a: string): any;
}
export class AnHeader {
    constructor(ssid: any, userId: any);
    type: string;
    ssid: any;
    uid: any;
    /**Set user action (for DB log on DB transaction)
     * @param {object} act {funcId(tolerate func), remarks, cate, cmd}
     */
    userAct(act: object): void;
    usrAct: any[];
}
export class UserReq extends AnsonBody {
    constructor(uri: any, tabl: any, data?: {});
    tabl: any;
    data: {
        props: {};
    };
    get(prop: any): any;
    /** set data (SemanticObject)'s map
     * @param {string} prop name
     * @param {object} v value
     * @return {UserReq} this
     */
    set(prop: string, v: object): UserReq;
}
export class AnSessionReq extends AnsonBody {
    constructor(uid: any, token: any, iv: any);
    uid: any;
    token: any;
    iv: any;
    md(k: any, v: any): AnSessionReq;
    mds: {};
}
/**Java equivalent: io.odysz.semantic.jserv.R.AnQueryReq
 * @class
 */
export class QueryReq extends AnsonBody {
    constructor(uri: any, tabl: any, alias: any, pageInf: any);
    mtabl: any;
    mAlias: any;
    exprs: any[];
    joins: any[];
    where: any[];
    Page(size: any, idx: any): QueryReq;
    page: any;
    pgsize: any;
    /**add joins to the query request object
     * @param {string} jt join type, example: "j" for inner join, "l" for left outer join
     * @param {string} t table, example: "a_roles"
     * @param {string} a alias, example: "r"
     * @param {string} on on conditions, example: "r.roleId = mtbl.roleId and mtbl.flag={@varName}"
     * Variables are replaced at client side (by js)
     * @return this query object
     */
    join(jt: string, t: string, a: string, on: string): QueryReq;
    j(tbl: any, alias: any, conds: any): QueryReq;
    l(tbl: any, alias: any, conds: any): QueryReq;
    r(tbl: any, alias: any, conds: any): QueryReq;
    joinss(js: any): QueryReq;
    expr(exp: any, as: any): QueryReq;
    col(c: any, as: any): QueryReq;
    exprss(exps: any): QueryReq;
    /**Add where clause condition
     * @param {string} logic logic type
     * @param {string} loper left operator
     * @param {string} roper right operator
     * @return {QueryReq} this */
    whereCond(logic: string, loper: string, roper: string): QueryReq;
    whereEq(lopr: any, ropr: any): void;
    orderby(tabl: any, col: any, asc: any): QueryReq;
    orders: any[];
    orderbys(cols: any): QueryReq;
    groupby(expr: any): QueryReq;
    groups: any[];
    groupbys(exprss: any): QueryReq;
    /**limit clause.
     * @param {string} expr1
     * @param {string} expr2
     */
    limit(expr1: string, expr2: string): void;
    limt: any[];
    commit(): {
        header: any;
        body: {
            a: string;
            exprs: any[];
            f: any;
            j: any;
            conds: any;
            orders: any;
            group: any;
        }[];
    };
}
export class UpdateReq extends AnsonBody {
    /**Create an update / insert request.
     * @param {string} uri component id
     * @param {string} tabl table
     * @param {object} pk {pk, v} conditions for pk.<br>
     * If pk is null, use this object's where_() | whereEq() | whereCond().
     */
    constructor(uri: string, tabl: string, pk: object);
    mtabl: string;
    nvs: any[];
    where: any[][];
    /** add n-v
     * @param {string} n
     * @param {object} v
     * @return {UpdateReq} this
     */
    nv(n: string, v: object): UpdateReq;
    /** add n-v
     * @param {object} rec
     * @param {string} [ignorePk] pk name ignored
     * @return {UpdateReq} this
     */
    record(rec: object, ignorePk?: string): UpdateReq;
    /**Take exp as an expression
     * @param {string} n
     * @param {string} exp the expression string like "3 * 2"
     * @return {InsertReq} this*/
    nExpr(n: string, exp: string): InsertReq;
    /**Append where clause condiont
     * @param {string} logic "=" | "<>" , ...
     * @param {string} loper left operand, typically a tabl.col.
     * @param {string} roper right operand, typically a string constant.
     * @return {UpdateReq} this */
    whereCond(logic: string, loper: string, roper: string): UpdateReq;
    /**Wrapper of #whereCond(), will take rop as consts and add "''".<br>
     * whereCond(logic, lop, Jregex.quote(rop));
     * @param logic logic operator
     * @param lop left operand
     * @param rop right operand
     * @return {UpdateReq} this */
    where_(logic: any, lop: any, rop: any): UpdateReq;
    /** A wrapper of where_("=", lcol, rconst)
     * @param {string} lcol left operand,
     * @param {string} rconst right constant, will be quoted.
     * @return {UpdateReq} this */
    whereEq(lcol: string, rconst: string): UpdateReq;
    /** A wrapper of where_("=", lcol, rconst)
     * @param {string} lcol left operand,
     * @param {arry} rconsts an array of right constants, will be quoted.
     * @return {UpdateReq} this */
    whereIn(lcol: string, rconsts: any): UpdateReq;
    /**limit clause.
     * @param {string} cnt count
     */
    limit(cnt: string): void;
    limt: string;
    /**Attach a file.
     * The u.serv will handle this in a default attachment table - configured in semantics
     * @param {string} fn file name (from the client locally)
     * @param {string} b64 base 64 encoded string
     * @return {UpdateReq} this
     */
    attach(fn: string, b64: string): UpdateReq;
    attacheds: any[];
    /**Add post operation
     * @param {UpdateReq | InsertReq} pst post request
     * @return {UpdateReq} this */
    post(pst: UpdateReq | InsertReq): UpdateReq;
    postUpds: any;
}
export class DeleteReq extends UpdateReq {
    constructor(uri: any, tabl: any, pk: any);
}
export class InsertReq extends UpdateReq {
    constructor(uri: any, tabl: any);
    /**
     * Add columns definition before setup nvs.
     * Scince @anclient/semantier 0.2, can handle tier's fields/columns
     * (with field property)
     * @param {array} cols
     */
    columns(cols: any[]): InsertReq;
    cols: any;
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
    valus(n_row: string | any[], v: string): InsertReq;
    nvss: any;
    /**Design Notes:
     * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
     * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
    */
    nvRows(rows: any): InsertReq;
}
export class AnsonResp extends AnsonBody {
    static hasColumn(rs: any, colname: any): boolean;
    static rsArr(respBody: any, rx?: number): any;
    /**Change rs object to array like [ {col1: val1, ...}, ... ]
     *
     * <b>Note</b> The column index and rows index shifted to starting at 0.
     *
     * @param {object} rs assume the same fields of io.odysz.module.rs.AnResultset.
     * @return {object} {cols, rows}
     * cols: array like [ col1, col2, ... ]; <br>
     * rows: array like [ {col1: val1, ...}, ... ]
     */
    static rs2arr(rs: object): object;
    /**Provide nv, convert results to AnReact combobox options (for binding).
     * @param {object} rs assume the same fields of io.odysz.module.rs.AnResultset.
     * @param {object} nv e.g. {n: 'domainName', v: 'domainId'}.
     * @return {object} {cols, rows}
     * cols: array like [ col1, col2, ... ]; <br>
     * rows: array like [ {col1: val1, ...}, ... ], <br>
     * e.g. if [results: {'01', 'fname'}], return [{n: 'fname', v: '01'}, ...]
     */
    static rs2nvs(rs: object, nv: object): object;
    constructor(respbody: any);
    m: any;
    map: any;
    rs: any;
    msg(): any;
    Code(): any;
    Rs(rx?: number): any;
    getProp(prop: any): any;
    resulve(tabl: any, pk: any, clientRec: any): any;
}
export class DatasetReq extends QueryReq {
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
    constructor(opts?: {
        uri: string;
        sk: string;
        t: {
            /** load dataset configured and format into tree with semantics defined by sk. */
            sqltree: string;
            /** Reformat the tree structure - reformat the 'fullpath', from the root */
            retree: string;
            /** Reformat the forest structure - reformat the 'fullpath', for the entire table */
            reforest: string;
            /** Query with client provided QueryReq object, and format the result into tree. */
            query: string;
        };
        maintbl: string;
        alias: string;
        pageInf: object;
        sqlArgs: any[];
    });
    sk: string;
    sqlArgs: any[];
    rootId: any;
    get geTreeSemtcs(): any;
    /**Set tree semantics<br>
     * You are recommended not to use this except your are the semantic-* developer.
     * @param {TreeSemantics} semtcs */
    treeSemtcs(semtcs: any): DatasetReq;
    trSmtcs: any;
    T(ask: any): DatasetReq;
    SqlArgs(args: any): DatasetReq;
    args(args: any): DatasetReq;
    /** Check is t can be undertood by s-tree.serv
     * TODO why not asking server for stree_t?
     * @param {string} t*/
    checkt(t: string): DatasetReq;
}
export namespace stree_t {
    const sqltree: string;
    const retree: string;
    const reforest: string;
    const query: string;
}
export class DatasetierReq extends AnsonBody {
    static A: {
        sks: string;
    };
    constructor(opts: any);
}
