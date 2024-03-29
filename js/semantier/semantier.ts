import { SessionClient, Inseclient, AnTreeNode } from "./anclient";
import { toBool, isEmpty, str, len } from "./helpers";
import { stree_t, CRUD,
	AnDatasetResp, AnsonBody, AnsonMsg, AnsonResp,
	DeleteReq, InsertReq, UpdateReq, OnCommitOk, OnLoadOk,
	DbCol, DbRelations, NV, PageInf, PkVal, NameValue, DatasetOpts, DatasetReq, DatasetierReq
} from "./protocol";

export { toBool, isEmpty };
export * from "./helpers";
export type GridSize = 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * UI Element Formatter
 *
 * E.g. TRecordForm will use this to format a field in form.
 * Currently tiers also accept this as field modifier. (FIXME - to be optimized)
 */
export type AnElemFormatter = ( (
	/**field definition */
	col: DbCol,
	/**column index or record for the row */
	rec: number | Tierec | AnTreeNode,
	opts?: any
) => any );

export type InvalidClassNames = "ok" | "anyErr" | "notNull" | "maxLen" | "minLen";

export type AnFieldValidator = ((
	val: any,
	rec: Tierec,
	fld: TierCol,
) => InvalidClassNames );

/**
 * (Form) field formatter
 * E.g. TRecordForm will use this to format a field in form. see also {@link AnRowFormatter}
 *
 * F: field element type, e.g. JSX.Element
 * FO: options, e.g. {classes?: ClassNames, media?: Media}
 * 
 * @since 0.4.50, add colx, the column / field index in a row (a form).
 */
export type AnFieldFormatter<F, FO> = ((rec: Tierec, col: DbCol, colx: number, opts?: FO) => F);

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

/**
 * List column / record field (UI) Type
 * 
 * Should be a valid HTML5 input type. (extended with enum, select)
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
 * 
 * - dynamic-cbb : column / cell is a combobox changing code/value options for each row.
 * 
 * - icon-sum      : column / cell is formatted by hard coded formatters,
 * 
 *		for anreact/src/react/widgets/tree-editor/TreeGallaryComp [columns], the cell is formatted by formatFolderIcons().
 * 
 * - button-swith: a button with a swith can disable it. This widget uses AnlistColAttrs.labels as lable,
 *   where label in labels be showing is
 *      labels [0]: swith true, [1] swith false, toggle true; [2] swith false, toggle false
 */
export type ColType = 'autocbb' | 'cbb'  | 'formatter' | 'dynamic-cbb'   |
		'text'   | 'iconame'    | 'date' | 'datetime'  | 'button-switch' |
		'number' | 'float'      | 'bool' | 'actions'   | 'int' | 'icon-sum';

export interface TierCol extends DbCol {
	/**
	 * Input type / form type, not db type.
	 * 
	 * - actions: user bottons, to be removed
	 * - formatter: user function for UI element
	 */
	type?: ColType;

    /**
	 * Activated style e.g. invalide style, and is different form AnlistColAttrs.css
     * TODO: style?: 'maxLen' | 'notNull' | 'ok';// any; //string;
	 */
    style?: any;

	validator?: AnFieldValidator | AnFieldValidation;

    disabled?: boolean;
	visible?: boolean;
	hide?: boolean; // backward compatible
    checkbox?: boolean;
}

/**
 * List's columns to be handled by tier.
 * 
 * This type need 2 parameters:
 *
 * F: UI field type, e.g. JSX.Element;
 *
 * FO: extended field options, e.g. {classes?: ClassNames, media?: Media} for react field formatter;
*/
export interface AnlistColAttrs<F, FO> extends TierCol {
    /** Readable text (field name) */
    label? : string;

	/**
	 * For widgets with states like TRecordForm swith-button field
	 * labels [0]: swith false, [1] swith true, toggle flase; [2] swith true, toggle true
	 * 
	 * @see ColType."button-swith",
	 */
    labels?: string[];

    opts?: FO;

	/**
	 * Column cell formatter. Usually return type of F.
	 * 
	 * NOTE: for tree, gride etc. the formatter is AnTreegridCol.colFormatter() 
	 */
    formatter?: AnElemFormatter;

	/**Details form field formatter. */
    fieldFormatter?: AnFieldFormatter<F, FO>;

    valid?: boolean;

	/**TODO move this to @anclient/anreact */
    // css?: CSSStyleDeclaration;

	/**TODO move this to @anclient/anreact */
    grid: {xs?: boolean | GridSize; sm?: boolean | GridSize; md?: boolean | GridSize; lg?: boolean | GridSize};

	/**TODO move this to @anclient/anreact */
	box?: {};

	val?: any;  // FIXME: should we extends a editable type?  (check ag-grid)
}

/**
 * Record handled from tier.
 * 
 * Java equivolant for this is java.lang.Object.
 */
export interface Tierec {
	[f: string]: string | number | boolean | object | undefined | null;
}

/**E.g. form's combobox field declaration
 * 
 * TODO rename as QueryField
 */
export interface TierComboField extends AnlistColAttrs<any, any> {
	uri: string;
	/** Only for cbb */
	sk : string;
	nv?: NV;
	options?: Array<NV>
 	noAllItem?: boolean;

 	/** is cbb clean */
 	clean?: boolean; 
	loading?: boolean;
	sqlArgs?: string[];
	sqlArg? : string;

	/** UI Dom etc. for data operation */
	ref: any;
}

/**
 * Client side context for Anclient to work in.
 * Not the same as java Semantext.
 * 
 * { client: SessionClient | InsecureClient, anReact: AnReact, errCtx : ErrorCtx }
 */
export interface Semantext {
	/** For Login, this can be undefined */
    anClient?: SessionClient;

	/**
	 * FIXME rename as presentier:
	 * 
	 * Gloabal UI presentation tier toolkit, e.g. AnReact
	 */
    uiHelper: any;
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
    uiHelper: any;

    /** list's columns */
    _cols: Array<TierCol>;
    /** client function / CRUD identity */
    uri: string;
    /** Fields in details from, e.g. maintable's record fields */
    _fields: TierCol[];

    /** current crud */
    crud: CRUD;
    /** current list's data */
    rows: Tierec[];
    /** current pk value */
    pkval: PkVal = {pk: undefined, v: undefined};
    /** current record */
    rec: Tierec | undefined;

    /** All sub table's relationships */
    relMeta: {[tabl: string]: DbRelations};

    /**
     *
     * @param props
     */
    constructor(props: UIComponent & {pkval?: PkVal}) {
        if (!props || !props.uri)
            throw Error("uri is required!");

        this.uri = props.uri;
        this.pkval = props.pkval || {pk: undefined, v: undefined};
		this.rels = {};
    }

    /**
	 * Current relations - the last loaded relation of this.rel (problem?)
	 *
	 * Looks like all relationship records are item of main tree.
	 */
    rels: {[tbl: string]: AnTreeNode[]};

    /**
     * @param context
     */
    setContext(context: Semantext): Semantier {
		if (!context || !context.anClient)
			console.error(this, "Setup semantic tier without React context (with anClient)?");

		this.client = context.anClient;
		this.uiHelper = context.uiHelper;
		this.errCtx = context.error;
		return this;
	}

    client: SessionClient | Inseclient;
    // anReact: any; // for anreact/AnReact. TODO rename as UIHelper
    errCtx: ErrorCtx;

    disableValidate: any;

	/**
	 * Change each field's style according to it's validator.
	 *
	 * FIXME: lagacy of js
	 *
	 * the second parameter, fields, if provided, will be created a new instance. this is bug.
	 *
	 * See jsample/views/my-pswdcard for usage.
	 *
	 * @param rec
	 * @param fields
	 * @returns
	 */
    validate(rec?: {}, fields?: Array<TierCol>): boolean {
		if (!rec) rec = this.rec;
		// if (!fields) fields = this.columns ? this.columns() : this.recFields;
		if (!fields) fields = this._fields || this.fields(undefined);

		if (this.disableValidate)
			return true;

		let valid = true;
		fields.forEach( (f, _x) => {
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
				else if (vd.len && v && (v as string | Array<any>).length > Number(vd.len))
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

    /**
	 * Get a TRecordForm's field data specification
	 *
	 * Businsess semantics binding: If loading with a record Id, the Id field will be disabled.
	 *
     * @param modifier {field: AnElemFormatter | object }, additional fields or callback function
	 * e.g. for anreact, object can be {Bird, Box, ...}.
	 * 
	 * @since 0.9.99 FIXME: since this should be overriden in each tier, this modifier design doesn't make sense. 
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

    /**
	 * Load relationships
	 * @param client
	 * @param opts
	 * @param onOk
	 * @deprecated since 0.9.99 replaced by {@link StreeTier.relations()}.
	 */
    relations( client: SessionClient | Inseclient,
		opts: { uri?: string;
				reltabl?: string;
				sqlArgs?: string[];
				sqlArg?: string; } ,
		onOk: OnCommitOk): void {

		let that = this;

		// typically relationships are tree data
		let { reltabl, sqlArgs, sqlArg } = opts;
		let fkRel = this.relMeta[reltabl] as DbRelations;
		// let { stree, fk, fullpath } = fkRel;
		let stree = fkRel.stree;

		sqlArgs = sqlArgs || [sqlArg];

		if (!stree)
			throw Error('TODO ...');

		let t = DatasetierReq.A.stree;

		let ds = {uri : this.uri,
			sk: stree.sk, t, sqlArgs,
		};

		Semantier.stree(
			ds as DatasetOpts,
			client,
			(resp: AnsonMsg<AnDatasetResp>) => {
				that.rels[reltabl] = resp.Body().forest as AnTreeNode[];
				onOk(resp)
			},
			this.errCtx);
    }

	/**
	 * Load a jserv record.
	 * @param conds
	 * @param _onLoad
	 */
    record(_conds: PageInf, _onLoad: OnLoadOk<Tierec>) : void {
		console.warn('This method is supposed to be overriden by subclasses.');
    }

	/** Load records of conditions.
	 *
	 * @param _conds QueryConditions type is deprecated
	 * @param _onLoad
	 */
    records(_conds: PageInf, _onLoad: OnLoadOk<Tierec>) : void {
		console.warn('This method is supposed to be overriden by subclasses.');
	}

    /**
	 * Save form with a relationship table.
	 * 
	 * Note 2022.6.24:
	 * 
	 * If the main record's pk value is not automatic and the child relation table need this,
	 * this.pkval.v is required not null - this is subjected to be changed in the future
	 * ( all semantics handling is planned to move to server side as possible ). 
	 *
	 * @param opts semantic options for saving a maintable record
	 * - opts.clearelation: delete child relationships
	 * @param onOk callback
	 * @returns
	 */
    saveRec(opts: { crud: CRUD;disableForm?: boolean;
					disableRelations?: boolean,
					/** true for only clear al relations */
					clearelation?: boolean,
					reltabl?: string}, onOk: OnCommitOk): void {
		if (!this.client) {
			console.error("Saving with undefined AnClient. Ever called setContext(context) ?");
			return;
		}
		let client = this.client;
		let that = this;

		let { crud, disableForm, disableRelations, reltabl } = opts;
		let uri = this.uri;

		if (crud === CRUD.u && !this.pkval.v)
			throw Error("Can't update with null ID.");

		let req: AnsonMsg<AnsonBody>;
		if (!disableForm) {
			if ( crud === CRUD.c ) {
				req = this.client.userReq<InsertReq>(uri, 'insert',
							new InsertReq( uri, this.pkval.tabl )
							.columns(this._fields)
							.record(this.rec) as InsertReq );

				// TODO to be verified
				// Try figure out pk value - auto-key shouldn't have user fill in the value in a form
				if (isEmpty(this.pkval.v))
					this.pkval.v = str(this.rec[this.pkval.pk]);
			}
			else {
				req = this.client.userReq<UpdateReq>(uri, 'update',
							new UpdateReq( uri, this.pkval.tabl, this.pkval)
							.record(this.rec, this.pkval.pk) );
			}
		}

		if (!disableRelations && !reltabl)
			throw Error("Semantier can support only relationship table refering to mtabl. - this will be changed in the future.");

		if (!disableRelations) {
			if (crud === CRUD.c && !isEmpty(this.pkval?.v))
				console.warn( "FIXME: empty pkval.v only suitable for auto-key. This change has a profound effection.",
							  this.pkval);
			req = this.formatRel<AnsonBody>(client, uri, req, this.relMeta[reltabl], opts.clearelation, this.pkval);
		}

		if (req)
			client.commit(req,
				(resp: AnsonMsg<any>) => {
					let bd = resp.Body();
					if (crud === CRUD.c)
						// NOTE:
						// resulving auto-k is a typicall semantic processing, don't expose this to caller
						that.pkval.v = bd.resulve(that.pkval.tabl, that.pkval.pk, that.rec);
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
        ids: Map<string, Tierec>;
        posts?: Array<AnsonBody>;
    }, onOk: OnCommitOk): void {
		if (!this.client) return;
		let client = this.client;
		let { ids, posts } = opts;

		if (ids && len(ids) > 0) {
			let req = client
				.usrAct(this.pkval.tabl, CRUD.d, 'delete')
				.deleteMulti(this.uri, this.pkval.tabl, this.pkval.pk, [...ids]);

			if (posts) {
				let d = req.Body();
				posts.forEach( (p, _x) => {
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
	 * Formatting relationship records - only rel-stree is supported
	 *
	 * TODO change to static
	 * 
	 * @param uri 
	 * @param req 
	 * @param relation 
	 * @param clearRels only for clear relations
	 * @param parentpkv pk: field name, val: record id
	 * @returns req with post updating semantics
	 */
	formatRel<T extends AnsonBody>(client: SessionClient, uri: string, req: AnsonMsg<T>,
			relation: DbRelations, clearRels: boolean, parentpkv: PkVal) : AnsonMsg<T> {

		if (relation.fk || relation.m2m)
			throw Error('TODO ...');

		let rel = relation.stree;
		// collect relationships
		let columnMap = {};
		columnMap[rel.col] = rel.colProp || rel.col; // columnMap[rel.col] = 'nodeId';

		// semantics handler can only resulve fk at inserting when master pk is auto-pk
		columnMap[parentpkv.pk] = parentpkv.v;

		let insRels;
		if (!clearRels)
			insRels = Semantier.inserTreeChecked(
				this.rels[rel.childTabl] as AnTreeNode[],
				{ table: rel.childTabl,
				  columnMap,
				  check: 'checked',
				  // middle nodes been corrected according to children
				  reshape: true
				} );

		if (!parentpkv.v) {
			if (req)
				req.Body().post(insRels);
			else
				req = client.userReq<InsertReq>(uri, 'insert', insRels) as unknown as AnsonMsg<T>;
		}
		else {
			let del_rf = new DeleteReq(uri, rel.childTabl,
							[rel.fk, str(parentpkv.v)])
			if (!clearRels)
				del_rf.post(insRels);

			if (req)
				req.Body().post(del_rf);
			else
				req = client.userReq(uri, 'update', del_rf) as unknown as AnsonMsg<T>;
		}
		return req;
	}

	/**
	 * - todo move this to a semantics handler, e.g. shFK ?
	 * @description Generate an insert request according to tree/forest checked items.
	 * @param forest forest of tree nodes, the forest / tree data, tree node: {id, node}
	 * @param opts options
	 * - opts.table: relationship table name
	 * - opts.columnMap: column's value to be inserted,
	 *   e. g. {orgId: 'org'}, where org is the tree field in AnTreeNode.node, which is used for binding tree items.
	 *
	 * If the item has a same named property, the value is collected from the item;<br>
	 * Otherwise the argument's value will be used.
	 *
	 * - opts.check: checking column name
	 * - opts.reshape: set middle tree node while traverse - check parent node if some children checked.
	 * @return subclass of AnsonBody
	 */
	static inserTreeChecked (forest: AnTreeNode[], opts: {
			table: string;
			columnMap: {};
			check: string; reshape: boolean; }): InsertReq {
		let {table, columnMap, check, reshape} = opts;

		let ins = new InsertReq(null, table)
			.A<InsertReq>(CRUD.c)
			.columns(Object.keys(columnMap));

		let rows = [];

		Semantier.collectTree(forest, rows, columnMap, check, reshape);

		ins.rows(rows);
		return ins;
	}

	/**
	 * Design Notes:
	 * 
	 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
	 * 
	 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
	 * 
	 * @param forest the UI tree object
	 * @param rows records
	 * @param colMap column names
	 * @param checkcol column name for check box 
	 * @param reshape check middle nodes if therei are children checked
	 * @returns check count
	 */
	static collectTree(forest: AnTreeNode[], rows: Array<NV[]>, colMap: {}, checkcol: string, reshape?: boolean) {
		reshape = reshape === undefined? true : reshape;
		let cnt = 0;
		forest.forEach( (tree: AnTreeNode, _i: number) => {
			if (tree && tree.node) {
				if (tree.node.children && tree.node.children.length > 0) {
					let childCnt = Semantier.collectTree(tree.node.children, rows, colMap, checkcol, reshape);

					if (childCnt > 0 && reshape)
						tree.node[checkcol] = 1;
					else if (childCnt === 0)
						tree.node[checkcol] = 0;
				}
				if ( toBool(tree.node[checkcol]) ) {
					rows.push(toNvRow(tree.node, colMap));
					cnt++;
				}
			}
		});
		return cnt;

		/**
		 * Convert tree item (AnTreeNode) to [name-value, ...] as a nv record (Array<{name, value}>),
		 * e.g.
		 *
		 * [ { "name": "funcId", "value": "sys-domain" },
		 *
		 *   { "name": "roleId", "value": "r003" } ]
		 *
		 * If the item has a same named property, the value is collected from the item;<br>
		 * Otherwise the argument's value will be used.
		 *
		 * @param node   TreeNode from wich row will be collected
		 * @param dbcols column names to be converted from node
		 * @param colMap column's static value, e.g. { roleId: '00001' }
		 * @returns
		 */
		function toNvRow(node: AnTreeNode["node"],
				colMap: { [x: string]: any; })
				: Array<NV> {

			let r = [];
			Object.keys(colMap).forEach( (col: string) => {
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
		let {uri, sk, sqlArgs, t, a, rootId} = ds;
		sqlArgs = sqlArgs || [];
		let port = ds.port ||'dataset';

		let reqbody = new DatasetReq({
				uri, port, t, a,
				mtabl: undefined,
				sk, sqlArgs, rootId
			})
			.TA(t || DatasetierReq.A.query);
		let jreq = client.userReq(uri, port, reqbody, undefined);

		client.an.post(jreq, onLoad, errCtx);
	}

	/**
	 * Load jsample.serv dataset. (using DatasetReq or menu.serv).
	 * If opts.onOk is provided, will try to bind stree like this:
	 <pre>
	let onload = onOk || function (c, resp) {
		if (compont)
			compont.setState({stree: resp.Body().forest});
	}</pre>
	 * @since 0.9.86 opts.port can be overriden, with which user can modify s-tree service at server side.
	 * @deprecated since 0.9.99, this method is planned to be replaced by StreeTier.stree().
	 * @param opts dataset info {sk, sqlArgs, onOk, port}
	 * where port is using s-tree if undefined.
	 * @param client
	 * @param onLoad
	 * @param errCtx
	 */
	static stree(opts: DatasetOpts, client: SessionClient | Inseclient, onLoad: OnCommitOk, errCtx: ErrorCtx): void {
		let {uri} = opts;

		if (!uri)
			throw Error('Since v0.9.50, Anclient request needs function uri to find datasource.');

		if (opts.sk && !opts.t)
			// opts.a = stree_t.sqltree;
			opts.a = DatasetierReq.A.stree;
		
		if (!opts.a)    // FIXME, t should be deprecated
			opts.a = opts.t;

		opts.port = opts.port || 'stree';

		Semantier.dataset(opts, client, onLoad, errCtx);
	}
}
