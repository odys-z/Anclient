
export const vec3conn = "raw-vec";

const examports = {
	vec3: 'vec3.serv'
}

export default
/** Helper handling protocol / data type of vec3.serv */
class Jvector {
	static init(anclient, json) {
		anclient.understandPorts(examports);
	}

	static getVectors (anclien, onload) {
		let reqVec3 = new UserReq(vec3conn);

		let header = Protocol.formatHeader(this.ssInf);

		// for logging user action at server side.
		header.usrAct({ func: 'query',
						cmd: 'select',
						cate: 'r',
						remarks: 'session query'});

		var jreq = new AnsonMsg(Protocol.Port.vec3, header, reqVec3);

		anclient.post(vec3conn);
		return jreq;
	}
}
