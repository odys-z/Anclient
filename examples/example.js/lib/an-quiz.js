/** TODO move this the anclient.js
 */
import {Protocol, UserReq, AnsonMsg} from "anclient"
export const qconn = "quiz";

const Quizports = {
	quiz: 'quiz.serv'
}

export const quiz_a = {
	list: 'list',   // load quizzes
	insert: 'insert', // create new quiz
	update: 'update', // update quiz
}

export
/** Helper handling protocol / data type of quiz.serv */
class JQuiz {
	/**@param {SessionClient} ssClient client created via login
	 */
	constructor (ssClient) {
		ssClient.An.understandPorts(Quizports);
		this.client = ssClient;
		this.ssInf = ssClient.ssInf;
	}

	serv (a, conds = {}, onload) {
		let req = new UserReq(qconn)
			.a(a); // this is a reading request

		for (let k in conds)
			req.set(k, conds[k]);

		let header = Protocol.formatHeader(this.ssInf);

		// for logging user action at server side.
		this.client.usrAct({
			func: 'query',
			cmd: 'select',
			cate: 'r',
			remarks: 'load quiz' });

		var jreq = new AnsonMsg(Protocol.Port.quiz, header, req);

		this.client.An.post(jreq, onload);
		return jreq;
	}

	/** Create a query request and post back to server.
	 * This function show the general query sample - goes to the Protocol's query
	 * port: "r.serv(11)".
	 * @param {string} qid quiz id
	 * @param {function} onOk on query ok callback, called with parameter of query responds
	 * */
	quiz(qid, onOk) {
		let that = this;
		let qreq = this.client.query(qconn, "quizzes", "q");
		qreq.body[0]
			.j('questions', 't', 't.quizid = q.qid')
			.l('s_domain', 'd', 'd.did = q.subject')
			.whereCond("=", "q.qid", `'${qid}'`);

		this.client.an.post(qreq, onOk);
	}

	list (conds, onload) {
		this.serv(quiz_a.list, conds, onload);
	}

	insert(quiz) {
		let that = this;
		let qreq = this.client.insert(qconn, "quizzes", "q");
		qreq.body[0]
			.nv('title', quiz.title)
			.nv('title', quiz.)
			.whereCond("=", "q.qid", `'${qid}'`);

		this.client.an.post(qreq, onOk);
	}

	static toQuestions(resp) {
		console.log(resp);
		// id(seq), question text, answers, type, correct index
		return [['1', 'q 1','abcd', 'single', 0]];
	}
}
