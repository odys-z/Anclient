import { AnElemFormatter, AnlistColAttrs, AnsonBody, AnsonMsg, AnsonResp, AnTreeNode, CRUD, ErrorCtx,
	Inseclient,
	InsertReq,
	OnCommitOk, OnLoadOk, PageInf, PkMeta, QueryConditions, QueryPage, Semantext, Semantier, SessionClient, TierCol, Tierec, Tierelations, UIRelations 
} from '../../../../semantier/anclient';

import { L, SheetCol, SpreadsheetRec, Spreadsheetier } from '../../../../anreact/src/an-components';

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
class MyWorkbookTier implements Spreadsheetier {
	static port = 'sheet.less';
	/**
	 * @param props
	 */
	constructor(props: {uri: string, cols?: SheetCol[]}) {
		super(props);
		console.log(this.uri);

		this.rows = [{cId: 'Math Jasmine'}];
		this._cols = props.cols? props.cols : [{field: 'cId', label: '#'}];
	}
	cbbCellOptions(p: { value: any; data: SpreadsheetRec; }) {
		throw new Error('Method not implemented.');
	}
	decode;
	mtabl: string;
	_cols: TierCol[];
	uri: string;
	_fields: TierCol[];
	crud: CRUD;
	rows: Tierec[];
	pkval: PkMeta;
	rec: Tierec;
	relMeta: { [tabl: string]: Tierelations; };
	rels: UIRelations;
	lastCondit: QueryConditions | QueryPage;
	setContext(context: Semantext): Semantier {
		throw new Error('Method not implemented.');
	}
	isReadonly(field: TierCol): boolean {
		throw new Error('Method not implemented.');
	}
	client: SessionClient | Inseclient;
	errCtx: ErrorCtx;
	disableValidate: any;
	validate(rec?: {}, fields?: TierCol[]): boolean {
		throw new Error('Method not implemented.');
	}
	fields(modifier?: { [x: string]: object | AnElemFormatter; }): TierCol[] {
		throw new Error('Method not implemented.');
	}
	relations(client: SessionClient | Inseclient, opts: { uri: string; reltabl: string; sqlArgs?: string[]; sqlArg?: string; }, onOk: OnCommitOk): void {
		throw new Error('Method not implemented.');
	}
	record(conds: QueryConditions | QueryPage, onLoad: OnLoadOk<Tierec>): void {
		throw new Error('Method not implemented.');
	}
	saveRec(opts: { crud: CRUD; disableForm?: boolean; disableRelations?: boolean; reltabl?: string; }, onOk: OnCommitOk): void {
		throw new Error('Method not implemented.');
	}
	del(opts: { ids: string[]; posts?: AnsonBody[]; }, onOk: OnCommitOk): void {
		throw new Error('Method not implemented.');
	}
	resetFormSession(): void {
		throw new Error('Method not implemented.');
	}
	formatRel<T extends AnsonBody>(uri: string, req: AnsonMsg<T>, relation: Tierelations, parentpkv: PkMeta): AnsonMsg<T> {
		throw new Error('Method not implemented.');
	}
	inserTreeChecked(forest: AnTreeNode[], opts: { table: string; columnMap: {}; check: string; reshape: boolean; }): InsertReq {
		throw new Error('Method not implemented.');
	}

	insert(onOk: OnCommitOk) {
		let req = this.client.userReq(this.uri,
				MyWorkbookTier.port,
				new MyBookReq( undefined ).A(MyBookReq.A.insert));

		this.client.commit(req, onOk, this.errCtx);
	}

	/**
	 * @override(Semantier)
	 */
	records<T extends SpreadsheetRec>(conds: QueryPage, onLoad: OnLoadOk<T>) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, MyWorkbookTier.port,
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

		let req = client.userReq(this.uri, MyWorkbookTier.port,
						new MyBookReq( undefined, rec )
						.A( crud === CRUD.d ? MyBookReq.A.delete :
							crud === CRUD.c ? MyBookReq.A.insert :
							MyBookReq.A.update ) );

		client.commit(req, ok, err);
	}

	columns (): Array<SheetCol> {
		return this._cols as Array<SheetCol>;
	}
}

interface MyCurriculum extends SpreadsheetRec {
    cid: string;
    cate: string;
    module: string;
    subject: string;
    parentId?: string;
}

class MyBookReq extends AnsonBody {
	static A = {
		update: 'u',
		insert: 'c',
		delete: 'd',
		records: 'r',
		rec: 'rec',
	}

	rec: SpreadsheetRec;
	conds: AnlistColAttrs<JSX.Element, {}>[];
	page: PageInf;

	constructor(query?: QueryPage, rec?: MyCurriculum) {
		super();

		this.conds = query.query;
		this.page = query.pageInf;
		this.rec = rec;
	}
}

class MyBookResp extends AnsonResp {

}

export { MyWorkbookTier, MyCurriculum, MyBookReq, MyBookResp };
