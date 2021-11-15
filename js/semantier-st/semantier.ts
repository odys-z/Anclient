import * as CSS from 'csstype';
import { SessionClient, Inseclient } from "./anclient";
import { stree_t, CRUD,
	AnDatasetResp, AnsonBody, AnsonMsg, AnsonResp, DeleteReq, InsertReq, UpdateReq, OnCommitOk, OnLoadOk, DbCol
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
	rec: number | Tierec
) => any );

export type InvalidClassNames = "ok" | "anyErr" | "notNull" | "maxLen" | "minLen";

export type AnFieldValidator = ((

) => InvalidClassNames );

/**(Form) field formatter
 * E.g. TRecordForm will use this to format a field in form. see also {@link AnRowFormatter}
 *
 * F: field element type, e.g. JSX.Element
 * FO: options, e.g. {classes?: ClassNames, media?: Media}
 */
export type AnFieldFormatter<F, FO> = ((rec: Tierec, col: DbCol, opts?: FO) => F);

export type AnFieldValidation = {
	[k in "notNull" | "minLen" | "len"]: number | string | object
 };

export interface ErrorCtx {
	msg?: undefined | string | Array<string>;
	onError: (
		/**MsgCode need to be re-defined */
		code: string, resp: AnsonMsg<AnsonResp>) => void
}

export interface TierCol extends DbCol {
	validator?: AnFieldValidator | AnFieldValidation;

    disabled?: boolean;
	visible?: boolean;
    checkbox?: boolean;

    /**Activated style e.g. invalide style, and is different form AnlistColAttrs.css */
    style?: string | {};
}

/**Meta data handled from tier (DB field).
 * field and label properties are required.
 * F: field type, e.g. JSX.Element;
 * FO: options, e.g. {classes?: ClassNames, media?: Media} for react field formatter;
*/
export interface AnlistColAttrs<F, FO> extends TierCol {
    // field: string;
    label: string;

    formatter?: AnElemFormatter;
    fieldFormatter?: AnFieldFormatter<F, FO>;

    valid?: boolean;

    /**input type / form type, not db type */
    type?: string;

    css?: CSSStyleDeclaration;
    grid?: {sm?: boolean | GridSize; md?: boolean | GridSize; lg?: boolean | GridSize};
	box?: {};
}

/**Record handled from tier */
export interface Tierec {
	[f: string]: string | object | undefined;
}

/**E.g. form's combobox field declaration */
export interface TierComboField extends TierCol {
	nv: {n: string; v: string};
	sk: string;
	// cbbStyle: {};
	options: Array<{n: string; v: string}>
}

/**Query condition item, used by AnQueryForm, saved by tier as last search conditions.  */
export interface QueryConditions {
	[q: string]: any;
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

/**
 * Base class of semantic tier
 */
export class Semantier {
    /**
     *
     * @param {uri: string} props
     */
    constructor(props: {uri: string, [opt: string]: object | string}) {
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
    pk: string;
    /** current crud */
    crud: string;
    /** current list's data */
    rows: Tierec[];
    /** current pk value */
    pkval: any;
    /** current record */
    rec: Tierec;

    /** All sub table's relationships */
    rel: Array<any>;
    /** currrent relation table */
    reltabl: string;
    /** current relations */
    rels: any[];

    lastCondit: QueryConditions;

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

    client: SessionClient | Inseclient;
    anReact: any;
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

    /** Get form fields data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field see #columns().
     */
	 fields (modifier?: {[x: string]: AnElemFormatter}): Array<TierCol> {
		if (!this._fields)
			throw Error("_fields are not provided by child tier.");

		let that = this;

		if (modifier)
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pk && that.pkval ? true : false;
				return typeof modifier[c.field] === 'function' ?
						{...c, ...(modifier[c.field] as AnElemFormatter)(c, x), disabled } :
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

    record( conds: QueryConditions, onLoad: OnLoadOk) : void {
	}

    records(conds: QueryConditions, onLoad: OnLoadOk) : void {
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
