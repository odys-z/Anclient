import { SessionClient, Inseclient } from "./anclient";
import { Protocol, stree_t,
	AnDatasetResp, AnsonBody, AnsonMsg, AnsonResp, DeleteReq, InsertReq, UpdateReq
} from "./protocol";
const { CRUD } = Protocol;

export interface ErrorCtx {
	msg?: undefined | string | Array<string>;
	onError: (code: string, resp: AnsonMsg<AnsonResp>) => void
}

export type GridSize = 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface AnlistColAttrs {
    disabled?: boolean;
	visible?: boolean;
    checkbox?: boolean;
    // formatter?: (col: AnlistCol) => string;
    formatter?: (rec: {}) => string;
    css?: {};
    grid?: {sm?: boolean | GridSize; md?: boolean | GridSize; lg?: boolean | GridSize};
	box?: {};
}

export interface AnlistCol extends AnlistColAttrs{
    field: string;
    label: string;
    /**input type / form type */
    type?: string;
    /**Activated style e.g. invalide style, and is different form AnlistColAttrs.css */
    style?: string | {};
    options?: [];
}

/**E.g. form's combobox field declaration */
export interface DatasetComboField extends AnlistCol {
	nv: {n: string; v: string};
	sk: string;
	cbbStyle: {}; 
}

export type AnColModifier = ((col: AnlistCol, colIndx: number)=> AnlistColAttrs);

/**Query condition item, used by AnQueryForm, saved by tier as last search conditions.  */
export interface QueryConditions {
	[q: string]: any;
}

/**Callback of CRUD.c/u/d */
export type OnCommitOk = (resp: AnsonMsg<AnsonResp>) => void
/**Callback of CRUD.r */
export type OnLoadOk = (cols: Array<string>, rows: Array<{}>) => void

export type OnCommitErr = (code: string, resp: AnsonMsg<AnsonResp>) => void

/**
 * Not the same as java Semantext.
 * { client: SessionClient | InsecureClient, anReact: AnReact, errCtx : ErrorCtx }
 */
export interface Semantext {
    anClient: SessionClient | Inseclient;
    anReact: object;
    error: object;
}

/**
 * Base class of semantic tier
 */
export class Semantier {
    static invalidStyles = {
        ok: {},
        anyErr : { border: "1px solid red" },
        notNull: { backgroundColor: '#ff9800b0' },
        maxLen : { border: "1px solid red" },
        minLen : { border: "1px solid red" },
    }

    /**
     *
     * @param {uri: string} props
     */
    constructor(props: any) {
        if (!props || !props.uri)
            throw Error("uri is required!");

        this.uri = props.uri;
    }

    /**main table name */
    mtabl: string;
    /** list's columns */
    _cols: Array<AnlistCol>;
    /** client function / CRUD identity */
    uri: string;
    /** maintable's record fields */
    _fields: any[];
    /** optional main table's pk */
    pk: string;
    /** current crud */
    crud: string;
    /** current list's data */
    rows: any[];
    /** current pk value */
    pkval: any;
    /** current record */
    rec: {};

    /** All sub table's relationships */
    rel: Array<any>;
    /** currrent relation table */
    reltabl: string;
    /** current relations */
    rels: any[];

    /**
     * @param context
     */
    setContext(context: Semantext): Semantier {
		if (!context || !context.anClient)
			console.error(this, "Setup semantic tier without React context (with anClient)?");

		this.client = context.anClient;
		this.anReact = context.anReact;
		this.errCtx = context.error;
		return this;
	}

    client: any;
    anReact: any;
    errCtx: any;

    disableValidate: any;

    validate(rec: {}, fields: Array<AnlistCol>): boolean {
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

		function validField (record, f) {
			let v = record[f.field];

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return false;

			if (typeof f.validator === 'function')
				return f.validator(v, record, f);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v === null || v.length === 0))
					return 'notNull';
				if (vd.len && v && v.length > vd.len)
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
	 columns (modifier?: {[x: string]: AnlistColAttrs | AnColModifier}): Array<AnlistColAttrs> {
		if (!this._cols)
			throw Error("_cols are not provided by child tier.");

		if (modifier)
			return this._cols.map( (c, x) =>
				typeof modifier[c.field] === 'function' ?
						{...c, ...(modifier[c.field] as AnColModifier)(c, x) } :
						{...c, ...modifier[c.field]}
			);
		else
			return this._cols;
    }

    /** Get form fields data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field see #columns().
     */
	 fields (modifier?: {[x: string]: AnlistColAttrs | AnColModifier}): Array<AnlistCol> {
		if (!this._fields)
			throw Error("_fields are not provided by child tier.");

		let that = this;

		if (modifier)
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pk && that.pkval ? true : false;
				return typeof modifier[c.field] === 'function' ?
						{...c, ...(modifier[c.field] as AnColModifier)(c, x), disabled } :
						{...c, ...modifier[c.field], disabled}
			} );
		else
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pk && that.pkval ? true : false;
				return {...c, disabled };
			} );
	}

    /** Load relationships */
    relations(opts: { reltabl: string;
			sqlArgs?: string[]; sqlArg?: string; } ,
			onOk: OnCommitOk): void {
		if (!this.anReact)
			throw Error ("AnReact here is needed!");

		let that = this;

		// typically relationships are tree data
		let { reltabl, sqlArgs, sqlArg } = opts;
		let { sk, relfk, relcol } = this.rel[reltabl];

		sqlArgs = sqlArgs || [sqlArg];

		if (!sk)
			throw Error('TODO ...');

		let t = stree_t.sqltree;

		let ds = {uri : this.uri,
			sk, t, sqlArgs,
			onOk: (resp: AnsonMsg<AnDatasetResp>) => {
				that.rels = resp.Body().forest;
				onOk(resp);
			}
		};

		this.anReact.stree(ds, this.errCtx);
    }

    record( opts: QueryConditions, onLoad: OnLoadOk) : void {
	}

    records(opts: QueryConditions, onLoad: OnLoadOk) : void {
	}

    /** save form with a relationship table */
    saveRec(opts: any, onOk: OnCommitOk): void {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { crud, disableForm, disableRelations } = opts;
		let uri = this.uri;

		if (crud === CRUD.u && !this.pkval)
			throw Error("Can't update with null ID.");

		let req;
		if (!disableForm) {
			if ( crud === CRUD.c )
				req = this.client.userReq(uri, 'insert',
							new InsertReq( uri, this.mtabl )
							.columns(this._fields)
							.record(this.rec) );
			else
				req = this.client.userReq(uri, 'update',
							new UpdateReq( uri, this.mtabl, this.pkval)
							.record(this.rec, this.pk) );
		}

		if (!disableRelations) {
			let rel = this.rel[this.reltabl];
			// collect relationships
			let columnMap = {};
			columnMap[rel.col] = 'nodeId';

			// semantics handler will resulve fk when inserting only when master pk is auto-pk
			columnMap[rel.fk] = this.pkval
							? this.pkval			// when updating
							: this.rec[this.pk];	// when creating

			let insRels = this.anReact
				.inserTreeChecked(
					this.rels,
					{ table: this.reltabl,
					  columnMap,
					  check: 'checked',
					  // middle nodes been corrected according to children
					  reshape: true }
				);

			if (!this.pkval) {
				if (req)
					req.Body().post(insRels);
				else
					req = this.client.userReq(uri, 'insert', insRels);
			}
			else {
				// e.g. delete from a_role_func where roleId = '003'
				let del_rf = new DeleteReq(null, this.reltabl, rel.fk)
								.whereEq(rel.fk, this.pkval)
								.post(insRels);

				if (req)
					req.Body().post(del_rf);
				else
					req = this.client.userReq(uri, 'update', del_rf);
			}
		}

		if (req)
			client.commit(req,
				(resp: AnsonMsg<any>) => {
					let bd = resp.Body();
					if (crud === CRUD.c)
						// NOTE:
						// resulving auto-k is a typicall semantic processing, don't expose this to caller
						that.pkval = bd.resulve(that.mtabl, that.pk, that.rec);
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
        posts: Array<AnsonBody>;
    }, onOk: OnCommitOk): void {
		if (!this.client) return;
		let client = this.client;
		let { ids, posts } = opts;

		if (ids && ids.length > 0) {
			let req = client
				.usrAct(this.mtabl, CRUD.d, 'delete')
				.deleteMulti(this.uri, this.mtabl, this.pk, [...ids]);

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
		this.pkval = undefined;
		this.rec = {};
		this.rels = [];
		this.reltabl = undefined;
		this.crud = undefined;
    }
}
