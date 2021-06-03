import {Protocol, UserReq, AnsonMsg} from "anclient"

export const vec3conn = "raw-vec";

export const examports = {
	vec3: 'vec3.serv'
}

const vec_a = {
	vec: 'vec',
	xyz: 'xyz',
	cube: 'cube'
}

export
/** Helper handling protocol / data type of vec3.serv */
class Jvector {
	/**@param {SessionClient} ssClient client created via login
	 */
	constructor (ssClient) {
		ssClient.An.understandPorts(examports);
		this.client = ssClient;
		this.ssInf = ssClient.ssInf;
	}

	serv (a, onload) {
		let reqVec3 = new UserReq(vec3conn)
			.a(a); // this is a reading request

		let header = Protocol.formatHeader(this.ssInf);

		// for logging user action at server side.
		this.client.usrAct({ func: 'query',
						cmd: 'select',
						cate: 'r',
						remarks: 'session query'});

		var jreq = new AnsonMsg(Protocol.Port.vec3, header, reqVec3);

		this.client.An.post(jreq, onload);
		return jreq;
	}

	/** Create a query request and post back to server.
	 * This function show the general query sample - goes to the Protocol's query
	 * port: "r.serv(11)".
	 * @param {function} onOk on query ok callback, called with parameter of query responds
	 * */
	query(onOk) {
		let that = this;
		let req = this.client.query(vec3conn, "vector", "v");
		req.body[0]
			.expr("vid").expr("val", "amount")
			.expr("dim1", "agegrp").expr("dim2", "tex").expr("dim3", "indust")
			.expr("dim4").expr("dim5").expr("dim6")
			.whereCond("=", "agegrp", "'80-'");

		this.client.an.post(req, onOk);
	}

	getVectors (onload) {
		this.serv(vec_a.vec, onload);
	}

	/**Data type parser for vec3.serv
	 * @param {AnsonResp} respMsg
	 * @return {array} [[{col1: val1, col2, val2, ...}, ...]]
	 *<pre>
      [{"type": "io.odysz.semantic.jprotocol.AnsonResp",
        "rs": [{"type": "io.odysz.module.rs.AnResultset",
                "stringFormats": null,
                "total": 6,
                "rowCnt": 6,
                "colCnt": 2,
                "colnames": {
                    "AMOUNT": [ 1, "amount" ],
                    "AGE": [ 2, "age" ]
                },
                "rowIdx": 0,
                "results": [ [ 113, "80-" ], [ 100, "80-" ], [ 111, "80-" ],
                    [ 206, "80-" ], [ 210, "80-" ], [ 106, "80-" ] ]
            }
        ],
        "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
        "a": null,
        "conn": null,
        "m": null,
        "map": null
      }]</pre>
	 */
	vectorsOf(respMsg) {
		// this.respObj = respMsg;
		return Protocol.rs2arr(respMsg.body[0].rs[0]);
	}

	getCubes (onload) {
		this.serv(vec_a.cube, onload);
	}
	/**
	 * @param {AnsonResp} respMsg
	 * @return {object} [[{col1: val1, col2, val2, ...}, ...]]
	 */
	cubesOf(respMsg) {
		return Protocol.rs2arr(respMsg.body[0].rs[0]);
	}

	x(respMsg) { }
	y(respMsg) { }
	z(respMsg) { }
}
