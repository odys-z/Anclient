import { AnlistColAttrs, AnsonBody, AnsonResp, CRUD, ErrorCtx,
	OnCommitOk, OnLoadOk, PageInf, QueryPage, Semantier
} from '../../../../semantier/anclient';

import { L, SheetCol, SpreadsheetRec, } from '../../../../anreact/src/an-components';

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
class MyWorkbookTier extends Semantier {
	static port = 'sheet.less';
	/**
	 * @param props
	 */
	constructor(props: {uri: string, cols?: SheetCol[]}) {
		super(props);
		console.log(this.uri);

		this.rows = [{id: '1911-10-10'}];
		this._cols = props.cols? props.cols : [{field: 'id', label: '#'}];
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
