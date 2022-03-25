import { SessionClient, Inseclient } from "./anclient";
import { toBool } from "./helpers";
import { stree_t, CRUD,
	AnDatasetResp, AnsonBody, AnsonMsg, AnsonResp,
	DeleteReq, InsertReq, UpdateReq, OnCommitOk, OnLoadOk,
	DbCol, DbRelations, Stree, NV, PageInf, AnTreeNode, Semantics, PkMeta, NameValue, DatasetOpts, DatasetReq, UIRelations
} from "./protocol";

export type GridSize = 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**<p>UI element formatter</p>
 * E.g. TRecordForm will use this to format a field in form.
 * Currently tiers also accept this as field modifier. (FIXME - to be optimized)
 */
export type AnElemFormatter = ( (
	/**field definition */
	col: DbCol,
	/**column index or record for the row */
	rec: number | Tierec | AnTreeNode,
	opts?: object
) => UIComponent );

export type InvalidClassNames = "ok" | "anyErr" | "notNull" | "maxLen" | "minLen";

export type AnFieldValidator = ((
	val: any,
	rec: Tierec,
	fld: TierCol,
) => InvalidClassNames );

/**(Form) field formatter
 * E.g. TRecordForm will use this to format a field in form. see also {@link AnRowFormatter}
 *
 * F: field element type, e.g. JSX.Element
 * FO: options, e.g. {classes?: ClassNames, media?: Media}
 */
export type AnFieldFormatter<F, FO> = ((rec: Tierec, col: DbCol, opts?: FO) => F);

export type AnFieldValidation = {
	notNull?: boolean | number,
	minLen?: number | string,
	len?   : number | string,

	vrange?: [number, number],
	strs?  : string[],
 };

export interface ErrorCtx {
	msg?: string;
	onError: (
		/**MsgCode need to be re-defined */
		code: string, resp: AnsonMsg<AnsonResp>) => void
}

export interface TierCol extends DbCol {
    /**input type / form type, not db type */
    type?: string;

    /**Activated style e.g. invalide style, and is different form AnlistColAttrs.css */
    style?: string;

	validator?: AnFieldValidator | AnFieldValidation;

    disabled?: boolean;
	visible?: boolean;
    checkbox?: boolean;
}

/**Meta data handled from tier (DB field).
 * field and label properties are required.
 * F: field type, e.g. JSX.Element;
 * FO: options, e.g. {classes?: ClassNames, media?: Media} for react field formatter;
*/
export interface AnlistColAttrs<F, FO> extends TierCol {
    /** Readable text (field name) */
    label?: string;

    opts?: FO;
    formatter?: AnElemFormatter;
    fieldFormatter?: AnFieldFormatter<F, FO>;

    valid?: boolean;

    css?: CSSStyleDeclaration;
    grid?: {sm?: boolean | GridSize; md?: boolean | GridSize; lg?: boolean | GridSize};
	box?: {};

	val?: any;  // FIXME: should we extends a editable type?  (check ag-grid)
}

/**Record handled from tier */
export interface Tierec {
	[f: string]: string | object | undefined;
}

/**E.g. form's combobox field declaration */
export interface TierComboField<F, FO> extends AnlistColAttrs<F, FO> {
	uri: string;
	sk : string;
	nv?: NV;
	options?: Array<NV>

	loading?: boolean;
	sqlArgs?: string[];
	sqlArg? : string;
}

export interface Tierelations extends DbRelations {
}

/**Query condition item, used by AnQueryForm, saved by CrudComp as last search conditions - for pagination.  */
export interface QueryConditions {
	pageInf?: PageInf;
	[q: string]: string | number | object | boolean;
}

/**
 * Not the same as java Semantext.
 * { client: SessionClient | InsecureClient, anReact: AnReact, errCtx : ErrorCtx }
 */
export interface Semantext {
    anClient: SessionClient;
	/**FIXME rename as TSHelper:
	 * Gloabal UI helper, e.g. AnReact */
    anReact: any;
    error: ErrorCtx;
}

export interface UIComponent {
	/**Component uri usually comes from function configuration (e.g. set by anreact SysComp.extendLinks).
	 * uri is not always needed but Semantier enforce the check for it's needed to accesss server.
	 */
	readonly uri?: string;
}

/**
 * Base class of semantic tier
 */
export class Semantier {
    /**
     *
     * @param {uri: string} props
     */
    constructor(props: UIComponent) {
        if (!props || !props.uri)
            throw Error("uri is required!");

        this.uri = props.uri;
    }

    /**main table name */
    mtabl: string;
    /** list's columns */
    _cols: Array<TierCol>;
    /** client function / CRUD identity */
    uri: string;
    /** Fields in details from, e.g. maintable's record fields */
    _fields: TierCol[];
    /** optional main table's pk */
    // pk: string;

    /** current crud */
    crud: CRUD;
    /** current list's data */
    rows: Tierec[];
    /** current pk value */
    pkval: PkMeta = {pk: undefined, v: undefined};
    /** current record */
    rec: Tierec;

    /** All sub table's relationships */
    relMeta: Tierelations;

    /** currrent relation table - wrong */
    // reltabl: string;

    /** current relations - the last loaded relation of this.rel (problem?)
	 *
	 * Looks like all relationship records are item of main tree.
	 */
    rels: UIRelations = {};

    lastCondit: QueryConditions;

    /**
     * @param context
     */
    setContext(context: Semantext): Semantier {
		if (!context || !context.anClient)
			console.error(this, "Setup semantic tier without React context (with anClient)?");

		this.client = context.anClient;
		// this.anReact = context.anReact;
		this.errCtx = context.error;
		return this;
	}

	/**TODO check widgets right
	 *
	 * @param field
	 * @returns
	 */
	isReadonly(field: TierCol) {
		return false;
	}

    client: SessionClient | Inseclient;
    // anReact: any; // for anreact/AnReact. TODO rename as UIHelper
    errCtx: ErrorCtx;

    disableValidate: any;

    validate(rec?: {}, fields?: Array<TierCol>): boolean {
		if (!rec) rec = this.rec;
		// if (!fields) fields = this.columns ? this.columns() : this.recFields;
		if (!fields) fields = this._fields || this.fields(undefined);

		if (this.disableValidate)
			return true;

		let valid = true;
		fields.forEach( (f, x) => {
			f.style = validField(rec, f);
			valid &&= f.style === 'ok';
		} );
		return valid;

		function validField (record: Tierec, f: TierCol): string {
			let v = record[f.field] as string | number | Array<any> | object;

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return 'typerr';

			if (typeof f.validator === 'function')
				return f.validator(v, record, f);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v === null || (v as string | Array<any>).length === 0))
					return 'notNull';
				else if (vd.len && v && (v as string | Array<any>).length > vd.len)
					return 'maxLen';
				return 'ok';
			}
			else // no validator
				return 'ok';
		}
	}


    /** Get list's column data specification
     * @param modifier {field, function | object }
     * @param modifier.field user provided modifier to change column's style etc.
     * callback function signature: (col, index) {} : return column's properties.
     */
	 columns (modifier?: {[x: string]: AnElemFormatter}): Array<TierCol> {
		if (!this._cols)
			throw Error("_cols are not provided by child tier.");

		if (modifier)
			return this._cols.map( (c, x) =>
				typeof modifier[c.field] === 'function' ?
						{...c, ...(modifier[c.field] as AnElemFormatter)(c, x) } :
						{...c, ...modifier[c.field]}
			);
		else
			return this._cols;
    }

    /**Get form fields data specification
	 *
	 * Businsess semantics binding: If the loading with a record Id, the Id field will be disabled.
	 *
     * @param modifier {field: AnElemFormatter | object }
	 * e.g. for anreact, object can be {gird, box, ...}.
     */
	 fields (modifier?: {[x: string]: AnElemFormatter | object}): Array<TierCol> {
		if (!this._fields)
			throw Error("_fields are not provided by child tier.");

		let that = this;

		if (modifier)
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pkval.pk && that.pkval.v ? true : false;
				return typeof modifier[c.field] === 'function' ?
						{...c, ...(modifier[c.field] as AnElemFormatter)(c, x), disabled } :
						{...c, ...modifier[c.field], disabled}
			} );
		else
			return this._fields.map( (c) => {
				let disabled = c.disabled || c.field === that.pkval.pk && that.pkval.v ? true : false;
				return {...c, disabled };
			} );
	}

    /** Load relationships */
    relations( client: SessionClient | Inseclient,
		opts: {
			uri: string;
			reltabl: string;
			sqlArgs?: string[]; sqlArg?: string; } ,
			onOk: OnCommitOk): void {

		let that = this;

		// typically relationships are tree data
		let { reltabl, sqlArgs, sqlArg } = opts;
		let fkRel = this.relMeta[reltabl] as unknown as Stree;
		let { sk, fk, fullpath } = fkRel;

		sqlArgs = sqlArgs || [sqlArg];

		if (!sk)
			throw Error('TODO ...');

		let t = stree_t.sqltree;

		let ds = {uri : this.uri,
			sk, t, sqlArgs,
		};

		Semantier.stree(ds, client,
				(resp: AnsonMsg<AnDatasetResp>) => {
					that.rels[reltabl] = resp.Body().forest;
					onOk(resp)
				},
			this.errCtx);
    }

	/**
	 * Load a jserv record.
	 * @param conds
	 * @param onLoad
	 */
    record(conds: QueryConditions, onLoad: OnLoadOk<Tierec>) : void {
    }

	/** Load records of conditions.
	 *
	 * @param opts
	 * @param onLoad
	 */
    records(opts: QueryConditions, onLoad: OnLoadOk<Tierec>) : void {
	}

    /** save form with a relationship table.
	 *
	 * @param opts semantic options for saving a maintable record
	 * @param onOk callback
	 * @returns
	 */
    saveRec(opts: {crud: CRUD; disableForm?: boolean; disableRelations?: boolean, reltabl?: string}, onOk: OnCommitOk): void {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { crud, disableForm, disableRelations, reltabl } = opts;
		let uri = this.uri;

		if (crud === CRUD.u && !this.pkval.v)
			throw Error("Can't update with null ID.");

		let req: AnsonMsg<AnsonBody>;
		if (!disableForm) {
			console.log(crud, CRUD.c);
			if ( crud === CRUD.c ) {
				req = this.client.userReq<UpdateReq>(uri, 'insert',
							new InsertReq( uri, this.mtabl )
							.columns(this._fields)
							.record(this.rec) );
			}
			else {
				req = this.client.userReq<UpdateReq>(uri, 'update',
							new UpdateReq( uri, this.mtabl, this.pkval)
							.record(this.rec, this.pkval.pk) );
			}
		}

		if (!disableRelations && !reltabl)
			throw Error("Semantier can support on relationship table to mtabl. - this will be changed in the future.");

		if (!disableRelations)
			req = this.formatRel<AnsonBody>(uri, req, this.relMeta[reltabl],
											crud === CRUD.c ? {pk: this.pkval.pk, v: undefined} : this.pkval);

		if (req)
			client.commit(req,
				(resp: AnsonMsg<any>) => {
					let bd = resp.Body();
					if (crud === CRUD.c)
						// NOTE:
						// resulving auto-k is a typicall semantic processing, don't expose this to caller
						that.pkval.v = bd.resulve(that.mtabl, that.pkval.pk, that.rec);
					onOk(resp);
				},
				this.errCtx);
		else console.warn("Nothing to save ?");
    }

    /**
     * @param opts
     * @param opts.ids? record id: Set<string> | Array<string>;
     * @param opts.posts? post actions
     * @param onOk: ;
     */
    del(opts: {
        ids: Array<string>;
        posts?: Array<AnsonBody>;
    }, onOk: OnCommitOk): void {
		if (!this.client) return;
		let client = this.client;
		let { ids, posts } = opts;

		if (ids && ids.length > 0) {
			let req = client
				.usrAct(this.mtabl, CRUD.d, 'delete')
				.deleteMulti(this.uri, this.mtabl, this.pkval.pk, [...ids]);

			if (posts) {
				let d = req.Body();
				posts.forEach( (p, x) => {
					d.post(p);
				} );
			}

			client.commit(req, onOk, this.errCtx);
		}
    }

    resetFormSession(): void {
		this.pkval.v = undefined;
		this.rec = {};
		this.rels = {};
		this.crud = undefined;
    }

	/**
	 * format relationship records - only fk supported
	 *
	 * TODO change to static
	 * @param uri
	 * @param req
	 * @param relation
	 * @param parentpkv pk: field name, val: record id
	 * @returns req with post updating semantics
	 */
	formatRel<T extends AnsonBody>(uri: string, req: AnsonMsg<T>, relation: Semantics, parentpkv: PkMeta ) : AnsonMsg<T> {
		if (relation.stree || relation.m2m)
			throw Error('TODO ...');

		let rel = relation.fk;
		// collect relationships
		let columnMap = {};
		columnMap[rel.col] = rel.relcolumn; // columnMap[rel.col] = 'nodeId';

		// semantics handler can only resulve fk at inserting when master pk is auto-pk
		columnMap[parentpkv.pk] = parentpkv.v;

		let insRels = this.inserTreeChecked(
				this.rels[rel.tabl] as AnTreeNode[],
				{ table: rel.tabl,
				  columnMap,
				  check: 'checked',
				  // middle nodes been corrected according to children
				  reshape: true
				} );

		if (!parentpkv.v) {
			if (req)
				req.Body().post(insRels);
			else
				req = this.client.userReq(uri, 'insert', insRels) as unknown as AnsonMsg<T>;
		}
		else {
			// e.g. delete from a_role_func where roleId = '003'
			let del_rf = new DeleteReq(uri, rel.tabl, rel.col)
							.whereEq(rel.col, parentpkv.v)
							.post(insRels);

			if (req)
				req.Body().post(del_rf);
			else
				req = this.client.userReq(uri, 'update', del_rf) as unknown as AnsonMsg<T>;
		}
		return req;
	}

	/**move this to a semantics handler, e.g. shFK ?
	 * Generate an insert request according to tree/forest checked items.
	 * @param forest forest of tree nodes, the forest / tree data, tree node: {id, node}
	 * @param opts options
	 * - opts.table: relationship table name
	 * - opts.columnMap: column's value to be inserted
	 * - opts.check: checking column name
	 * - opts.reshape: set middle tree node while traverse - check parent node if some children checed.
	 * @return subclass of AnsonBody
	 */
	inserTreeChecked (forest: AnTreeNode[], opts: { table: string; columnMap: {}; check: string; reshape: boolean; }): InsertReq {
		let {table, columnMap, check, reshape} = opts;
		reshape = reshape === undefined? true : reshape;

		// FIXME shouldn't we map this at server side?
		let dbCols = Object.keys(columnMap);

		let ins = new InsertReq(null, table)
			.A<InsertReq>(CRUD.c)
			.columns(dbCols);

		let rows = [];

		collectTree(forest, rows);

		ins.nvRows(rows);
		return ins;

		/**Design Notes:
		 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
		 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
		*/
		function collectTree(forest: AnTreeNode[], rows: Array<NameValue[]>) {
			let cnt = 0;
			forest.forEach( (tree: AnTreeNode, _i: number) => {
				if (tree && tree.node) {
					if (tree.node.children && tree.node.children.length > 0) {
						let childCnt = collectTree(tree.node.children, rows);

						if (childCnt > 0 && reshape)
							tree.node[check] = 1;
						else if (childCnt === 0)
							tree.node[check] = 0;
					}
					if ( toBool(tree.node[check]) ) {
						rows.push(toNvRow(tree.node, dbCols, columnMap));
						cnt++;
					}
				}
			});
			return cnt;
		}

		/**convert to [name-value, ...] as a row (Array<{name, value}>), e.g.
		 * [ { "name": "funcId", "value": "sys-domain" },
		 *   { "name": "roleId", "value": "r003" } ]
		 *
		 * @param node   TreeNode from wich row will be collected
		 * @param dbcols column names to be converted from node
		 * @param colMap column's static value, e.g. { roleId: '00001' }
		 * @returns
		 */
		function toNvRow(node: AnTreeNode["node"],
				  dbcols: string[], colMap: { [x: string]: any; })
				: Array<NameValue> {

			let r = [];
			dbcols.forEach( (col: string) => {
				let mapto = colMap[col];
				if (node.hasOwnProperty(mapto))
					// e.g. roleName: 'text'
					r.push({name: col, value: node[mapto]});
				else
					// e.g. roleId: '0001'
					r.push({name: col, value: mapto});
			} );
			return r;
		}
	}

	/**
	 * Load dataset from jserv
	 *
	 * @param ds
	 * @param client
	 * @param onLoad
	 * @param errCtx
	 */
	static dataset(ds: DatasetOpts, client: SessionClient | Inseclient, onLoad: OnCommitOk, errCtx: ErrorCtx): void {
		// let ssInf = this.client.ssInf;
		let {uri, sk, sqlArgs, t, rootId} = ds;
		sqlArgs = sqlArgs || [];
		let port = ds.port ||'dataset';

		let reqbody = new DatasetReq({
				uri, port,
				mtabl: undefined,
				sk, sqlArgs, rootId
			})
			.TA(t || stree_t.query);
		let jreq = client.userReq(uri, port, reqbody, undefined);

		client.an.post(jreq, onLoad, errCtx);
	}

	/** Load jsample.serv dataset. (using DatasetReq or menu.serv).
	 * If opts.onOk is provided, will try to bind stree like this:
	 <pre>
	let onload = onOk || function (c, resp) {
		if (compont)
			compont.setState({stree: resp.Body().forest});
	}</pre>
	 *
	 * @param opts dataset info {sk, sqlArgs, onOk}
	 * @param client
	 * @param onLoad
	 * @param errCtx
	 */
	static stree(opts: DatasetOpts, client: SessionClient | Inseclient, onLoad: OnCommitOk, errCtx: ErrorCtx): void {
		let {uri} = opts;

		if (!uri)
			throw Error('Since v0.9.50, Anclient request needs function uri to find datasource.');

		if (opts.sk && !opts.t)
			opts.a = stree_t.sqltree;

		opts.port = 'stree';

		Semantier.dataset(opts, client, onLoad, errCtx);
	}
}
