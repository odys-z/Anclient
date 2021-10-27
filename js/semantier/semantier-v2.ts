import { AnsonBody, DeleteReq, InsertReq, Protocol, stree_t, UpdateReq } from "./protocol";
const { CRUD } = Protocol;

export interface AnlistCol {
    field: string,
    label: string,

    disabled?: boolean,
    checkbox?: boolean,
    fomatter?: (col: AnlistCol) => string,
    css: {grid: object},
}

export interface AnRecField {
    field: string,
    value: string,
}

/**
 * Base class of semantic tier
 */
export class Semantier2 {
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
     * @param {client: SessionClient | InsecureClient, anReact: AnReact, errCtx : ErrorCtx } context
     */
    setContext(context): Semantier2 {
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

    validate(rec: any, fields: any): boolean {
		if (!rec) rec = this.rec;
		// if (!fields) fields = this.columns ? this.columns() : this.recFields;
		if (!fields) fields = this._fields || this.fields(undefined);

		if (this.disableValidate)
			return true;

		let that = this;

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
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field user provided modifier to change column's style etc.
     * callback function signature: (col, index) {} : return column's properties.
     */
    columns(modifier: {
        field: object | Function;
    }): Array<AnlistCol> {
		if (!this._cols)
			throw Error("_cols are not provided by child tier.");

		if (modifier)
			return this._cols.map( (c, x) =>
				typeof modifier[c.field] === 'function' ?
						{...c, ...modifier[c.field](c, x) } :
						{...c, ...modifier[c.field]}
			);
		else
			return this._cols;
    }

    /** Get form fields data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field see #columns().
     */
    fields(modifier: {
        field: object | Function;
    }): Array<AnRecField> {
		if (!this._fields)
			throw Error("_fields are not provided by child tier.");

		let that = this;

		if (modifier)
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pk && that.pkval ? true : false;
				return typeof modifier[c.field] === 'function' ?
						{...c, ...modifier[c.field](c, x), disabled } :
						{...c, ...modifier[c.field], disabled}
			} );
		else
			return this._fields.map( (c, x) => {
				let disabled = c.disabled || c.field === that.pk && that.pkval ? true : false;
				return {...c, disabled };
			} );
	}

    /** Load relationships */
    relations(opts: any, onOk: any): void {
		if (!this.anReact)
			throw Error ("AnReact here is needed!");

		let that = this;

		// typically relationships are tree data
		let { uri, reltabl, sqlArgs, sqlArg } = opts;
		let { sk, relfk, relcol } = this.rel[reltabl];

		sqlArgs = sqlArgs || [sqlArg];

		if (!sk)
			throw Error('TODO ...');

		let t = stree_t.sqltree;

		let ds = {uri : this.uri, sk, t, sqlArgs};

		this.anReact.stree({ uri: this.uri, sk, t, sqlArgs,
			onOk: (resp) => {
				that.rels = resp.Body().forest;
				onOk(resp);
			}
		}, this.errCtx);

    }

    /** save form with a relationship table */
    saveRec(opts: any, onOk: any): void {
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
							new UpdateReq( uri, this.mtabl, {pk: this.pk, v: this.pkval} )
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
				(resp) => {
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
     * @param opts.uri? overriding local uri
     * @param opts.ids? record id: Set<string> | Array<string>;
     * @param opts.posts? post actions
     * @param {function} onOk: function(AnsonResp);
     */
    del(opts: {
        uri?: string;
        ids: Array<string>;
        posts: Array<AnsonBody>;
    }, onOk: Function): void {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids, posts } = opts;

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
