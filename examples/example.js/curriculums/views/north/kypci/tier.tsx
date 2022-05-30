import { Protocol, AnsonResp, PageInf} from '@anclient/semantier';

import { Spreadsheetier, SpreadsheetRec, SpreadsheetReq } from '@anclient/anreact';
import { CSSProperties } from 'react';

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
class CourseTier extends Spreadsheetier<CourseReq> {
	static curriculPk = {pk: 'cid', v: undefined, tabl: 'b_curriculums'};

	constructor(props: {uri: string, cols?: SheetCol[]}) {
		super('workbook',
			Object.assign(props, 
			// not used, but is usefull for session client - which using prot 'update'.
			{pkval: CourseTier.curriculPk}));

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

	updateCell(p: CellEditingStoppedEvent): void {
		let rec = {cid: p.data.cid};
		let {value, oldValue} = p;
		if (value !== oldValue) {
			value = this.encode(p.colDef.field, value);

			rec[p.colDef.field] = value;
			this.update(CRUD.u, rec, undefined, this.errCtx);
		}
	}

	del(opts: {
        ids: Array<string>;
        posts?: Array<AnsonBody>;
    }, onOk: OnCommitOk): void {
		if (!this.client?.ssInf?.ssid)
			throw Error('TODO override for session less');
		else super.del(opts, onOk);
	}
}
 */

export class Course implements SpreadsheetRec {
	[f: string]: string | object;
	id?: string;
	css?: CSSProperties;

	type: string;
    cId: string;
    cate?: string;
    module?: string;
    subject?: string;
    parentId?: string;

	constructor() {
		this.type = "io.oz.curr.north.Course";
	}
}

class CourseReq<T extends SpreadsheetRec> extends SpreadsheetReq {
	static A = {
		update: 'u',
		insert: 'c',
		delete: 'd',
		records: 'r',
		rec: 'rec',
	}

	rec: T;
	page: PageInf;

	constructor(query?: PageInf, rec?: T) {
		super({type: 'io.oz.curr.north.CourseReq', query});

		this.page = query;
		this.rec = rec;

		console.log(this.type);
	}

}

Spreadsheetier.registerReq((conds: PageInf) => { return new CourseReq(conds) });

class CourseResp extends AnsonResp {
}

Protocol.registerBody('io.odysz.jsample.semantier.SpreadsheetResp',
					  (jsonBd) => { return new CourseResp(jsonBd); });

export { Course as Curriculum, CourseReq, CourseResp };
