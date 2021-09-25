
import { Protocol, AnsonResp, AnsonBody, Semantier } from '@anclient/semantier';

export class GPATier extends Semantier {
	port = 'gpatier';
	client = undefined;
	// kids = [
	// 	{name: 'Alice Zhou', id: 'alice'},
	// 	{name: 'George Zhang', id: 'george'},
	// 	{name: 'James Hu', id: 'james'},
	// ];
	rows = [{date: 'yyyy', alice: 3, george: 5, james: 5}];
	ths_ = [];

	constructor(comp) {
		super(comp);
	}

	setContext(context) {
		this.client = context.anClient;
		this.errCtx = context.error;
	}

	records(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, this.port,
					new GPAReq( this.uri, conds )
					.A(GPAReq.A.gpas) );

		client.commit(req, onLoad, this.errCtx);
	}

	updateRow(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, gpaRow, oldGday } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( {uri, gpaRow, gday: oldGday} )
						.A(GPAReq.A.updateRow) );

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
	 * @param {Set} ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids } = opts;

		if (ids && ids.size > 0) {
			let req = this.client.userReq(uri, this.port,
				new GPAReq( uri, { deletings: [...ids] } )
				.A(GPAReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

export class GPAResp extends AnsonResp {
	static type = 'io.oz.ever.conn.n.gpa.GPAResp';

	constructor(jsonbd) {
		super(jsonbd);

		this.gpas = jsonbd.gpas;
		this.kids = jsonbd.kids;
		this.cols = jsonbd.cols;
	}

	static GPAs(body) {
		let gpas = AnsonResp.rs2arr(body.gpas);
		let kids = AnsonResp.rs2arr(body.kids);
		return {kids: kids.rows, cols: gpas.cols, rows: gpas.rows};
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
		updateRow: 'u/row',
		insert: 'c',
		del: 'd',
	};

	constructor(opts) {
		super();

		this.type = GPAReq.type;

		this.gpaRow = opts.gpaRow;
		this.kid = opts.kid;
		this.gpa = opts.gpa;
		this.gday = opts.gday;
	}
}
