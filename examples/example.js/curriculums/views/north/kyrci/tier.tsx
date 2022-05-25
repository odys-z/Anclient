import { Protocol, AnsonBody, AnsonResp, CRUD, ErrorCtx,
	OnCommitOk, OnLoadOk, PageInf} from '@anclient/semantier';

import { SheetCol, SpreadsheetRec, Spreadsheetier, CellEditingStoppedEvent } from '@anclient/anreact';

/**
 * @example table DDL
 drop table if exists b_curriculums;
CREATE TABLE b_curriculums (
  cid varchar2(12) NOT NULL,
  parentId varchar2(12),
  currName varchar2(256) NOT NULL,
  clevel varchar2(12),
  module varchar2(12),
  cate   varchar2(12),
  subject varchar2(12),
  sort varchar2(12),
  fullpath varchar2(80),
  oper varchar2(12) NOT NULL,
  optime DATETIME NOT NULL,
  PRIMARY KEY ("cid")
);

select * from b_curriculums;
 */
class MyWorkbookTier extends Spreadsheetier {
	static curriculPk = {pk: 'cid', v: undefined, tabl: 'b_curriculums'};

	/**
	 * @param props
	 */
	constructor(props: {uri: string, cols?: SheetCol[]}) {
		super('workbook',
			Object.assign(props, 
			/* not used, but is usefull for session client - which using prot 'update'. */
			{pkval: MyWorkbookTier.curriculPk}));

		console.log(this.uri);

		this.rows = [{cId: 'Math Jasmine'}];
		this._cols = props.cols? props.cols : [{field: 'cid', label: '#'}];
	}

	insert(onOk: OnCommitOk) {
		let req = this.client.userReq(this.uri,
				this.port,
				new MyBookReq( undefined ).A(MyBookReq.A.insert));

		this.client.commit(req, onOk, this.errCtx);
	}

	/**
	 * @override(Semantier)
	 */
	records<T extends SpreadsheetRec>(conds: PageInf, onLoad: OnLoadOk<T>) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new MyBookReq( conds )
					.A(MyBookReq.A.records) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				onLoad(cols, rows as T[]);
			},
			this.errCtx);
	}

	update(crud: CRUD, rec: MyCurriculum, ok: OnCommitOk, err: ErrorCtx) {
		console.log(rec);

		if (!this.client) return;
		let client = this.client;

		let req = client.userReq(this.uri, this.port,
						new MyBookReq( undefined, rec )
						.A( crud === CRUD.d ? MyBookReq.A.delete :
							crud === CRUD.c ? MyBookReq.A.insert :
							MyBookReq.A.update ) );

		client.commit(req, ok, err);
	}

	columns (): Array<SheetCol> {
		return this._cols as Array<SheetCol>;
	}

	updateCell(p: CellEditingStoppedEvent): void {
		let rec = {cid: p.data.cid};
		let {value, oldValue} = p;
		if (value !== oldValue) {
			value = this.encode(p.colDef.field, value);
			// oldValue = this.encode(p.colDef.field, oldValue);

			rec[p.colDef.field] = value;
			this.update(CRUD.u, rec, undefined, this.errCtx);
		}
	}

	del(opts: {
        ids: Array<string>;
        posts?: Array<AnsonBody>;
    }, onOk: OnCommitOk): void {
		throw Error('TODO override for session less');
	}
}

interface MyCurriculum extends SpreadsheetRec {
    cid: string;
    cate?: string;
    module?: string;
    subject?: string;
    parentId?: string;
}

class MyBookReq<T extends SpreadsheetRec> extends AnsonBody {
	static A = {
		update: 'u',
		insert: 'c',
		delete: 'd',
		records: 'r',
		rec: 'rec',
	}

	port: 'workbook';

	rec: SpreadsheetRec;
	page: PageInf;
	// conds: Array<string[]>;

	constructor(query?: PageInf, rec?: T) {
		super({type: 'io.oz.sandbox.sheet.SpreadsheetReq'});

		this.page = query;
		this.rec = rec;
	}
}

class MyBookResp extends AnsonResp {
}

Protocol.registerBody('io.oz.sandbox.sheet.SpreadsheetResp',
					  (jsonBd) => { return new MyBookResp(jsonBd); });

export { MyWorkbookTier, MyCurriculum, MyBookReq, MyBookResp };
