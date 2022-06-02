import { PageInf} from '@anclient/semantier';

import { Spreadsheetier, SpreadsheetRec, SpreadsheetReq } from '@anclient/anreact';
import { CSSProperties } from 'react';

export class Course implements SpreadsheetRec {
	static pk = 'cId';

	[f: string]: string | boolean | number | object;
	id?: string;
	css?: CSSProperties;

	/** evelope type */
	type: string;

    cId: string;
    clevel?: string;
    cate?: string;
    module?: string;
    subject?: string;
    parentId?: string;

	currName: string;
	remarks?: string;

	dirty: boolean;

	constructor(rec: {cId: string, remarks: string}) {
		this.type = "io.oz.curr.north.Course";

		this.cId = rec?.cId;
		this.remarks = rec?.remarks;
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

export { Course as Curriculum, CourseReq };
