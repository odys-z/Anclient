
import {
    Protocol, AnsonResp, AnsonBody, Semantier, Tierec, UIComponent, Semantext,
    QueryConditions, OnLoadOk, OnCommitOk, TierCol
} from '@anclient/semantier';

export interface GPARec extends Tierec {
	gday: string,
	[kid: string]: string
};

export class GPATier extends Semantier {
	port = 'gpatier';
	client = undefined;
	rows = [{ gday: 'yyyy' } as GPARec];
	ths_ = [];

	constructor(comp: UIComponent) {
		super(comp);
	}

	records(conds: QueryConditions, onLoad: OnLoadOk<GPARec> ) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, this.port,
					// new GPAReq( this.uri, conds )
					new GPAReq( {uri: this.uri} )
					.A(GPAReq.A.gpas) );

		client.commit(req, onLoad, this.errCtx);
	}

	updateRow(opts: {uri: string, oldGday: string, gpaRow: Tierec}, onOk: OnCommitOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, gpaRow, oldGday } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( {uri, gpaRow, gday: oldGday} )
						.A(GPAReq.A.updateRow) );

		client.commit(req, onOk, this.errCtx);
	}

	changeDay(opts: {uri: string, oldGday: string, newGday: string}, onOk: OnCommitOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, oldGday, newGday } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( {uri, gday: newGday, olday: oldGday} )
						.A(GPAReq.A.changeDay) );

		client.commit(req, onOk, this.errCtx);
	}


	updateCell(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, gday, kid, gpa } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( {uri, gpa, gday, kid} )
						.A(GPAReq.A.update) );

		client.commit(req, onOk, this.errCtx);
	}

	/**
	 * @param opts { uri, ids : Set<string>}
	 * @param onOk: function(AnsonResp);
	 */
	del(opts: { ids: Array<string> }, onOk: OnCommitOk ) {
		if (!this.client) return;
		let client = this.client;
		let { ids } = opts;

		if (ids && ids.length > 0) {
			let req = this.client.userReq(this.uri, this.port,
				// new GPAReq( uri, { deletings: [...ids] } )
				new GPAReq( {uri: this.uri, gday: ids[0]} )
				.A(GPAReq.A.delDay) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

export class GPAResp extends AnsonResp {
	static type = 'io.oz.ever.conn.n.gpa.GPAResp';
    gpas: any;
    kids: any;
    cols: any;

	constructor(jsonbd) {
		super(jsonbd);

		this.gpas = jsonbd.gpas;
		this.kids = jsonbd.kids;
		this.cols = jsonbd.cols;
	}

	static GPAs(body: GPAResp) : {kids: Tierec[], cols: string[], rows: GPARec[]} {
		let gpas = AnsonResp.rs2arr(body.gpas);
		let kids = AnsonResp.rs2arr(body.kids);
		return {kids: kids.rows, cols: gpas.cols, rows: gpas.rows as GPARec[]};
	}
}

export class GPAReq extends AnsonBody {
	static type = 'io.oz.ever.conn.n.gpa.GPAReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(GPAReq.type, (jsonBd) => {
			return new GPAReq(jsonBd);
		});
		// because resp arrived before register triggered
		Protocol.registerBody(GPAResp.type, (jsonBd) => {
			return new GPAResp(jsonBd);
		});
		return undefined;
	}();

	static A = {
		gpas: 'r/gpas',
		update: 'u',
		delDay: 'd/gday',
		updateRow: 'u/row',
		changeDay: 'u/gday',
		insert: 'c',
	};

    gpaRow: Tierec;
    kid: string;
    gpa: string;
    gday: string;
    olday: string;

	constructor(opts: {uri: string, gpaRow?: Tierec, kid?: string, gpa?: string, gday?: string, olday?: string}) {
		super( { type: GPAReq.type, uri: opts.uri } );

		// this.type = GPAReq.type;

		this.gpaRow = opts.gpaRow;
		this.kid = opts.kid;
		this.gpa = opts.gpa;
		this.gday = opts.gday;
		this.olday = opts.olday;
	}
}
