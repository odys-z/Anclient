import { Protocol, AnsonResp, AnsonBody } from '@anclient/semantier';

export class NChartReq extends AnsonBody {
	static __init__ = function() {
		Protocol.registerBody('io.oz.ever.conn.n.NChartReq', (jsonBd) => {
			return new NChartReq(jsonBd);
		});
		Protocol.registerBody('io.oz.ever.conn.n.NChartResp', (jsonBd) => {
			return new NChartResp(jsonBd);
		});
	}();

	static A = {
		happyHist: "happy-hist",
		gpaCorrelo: "gpa-correlo",
	}


	constructor (uri) {
		super();
		this.type = "io.oz.ever.conn.n.NChartReq";
		this.uri = uri;
	}
}

export class NChartResp extends AnsonResp {
	constructor (jsonBody) {
		super(jsonBody);
		if (jsonBody.type !== "io.oz.ever.conn.n.NChartResp")
			throw Error("Instancing NChartReq object with wrong type: " + jsonBody.type);
		this.type = "io.oz.ever.conn.n.NChartResp";
		this.happy = jsonBody.happyhist && jsonBody.happyhist[0];
		this.gpaEmotion = jsonBody.gpaEmotion && jsonBody.gpaEmotion.results;
	}

	happyHist() {
		return AnsonResp.rs2arr(this.happy);
	}

}

export class Chartier {
	port = 'nchart';

	constructor(comp) {
		this.uri = comp.uri || comp.props.uri;
	}

	setContext(context) {
		this.client = context.anClient;
		this.errCtx = context.error;
	}

	gpaCorrelo(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, this.port,
					new NChartReq( this.uri, conds )
					.A(NChartReq.A.gpaCorrelo) );

		client.commit(req, onLoad, this.errCtx);
	}

}
