import {Protocol, UserReq, AnsonMsg} from "anclient"

export const vec3conn = "raw-vec";

export const examports = {
	vec3: 'vec3.serv'
}

const vec_a = {
	vec: 'vec',
	xyz: 'xyz'
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

	getVectors (onload) {
		let reqVec3 = new UserReq(vec3conn)
			.a(vec_a.vec); // this is a reading request

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
}
