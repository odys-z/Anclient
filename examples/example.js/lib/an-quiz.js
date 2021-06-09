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
			func: a,
			cmd: a,
			cate: a,
			remarks: 'quiz.serv' });

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

	insert(quiz, onOk) {
		let that = this;
		let date = new Date();
		this.client.usrAct('quiz', quiz_a.insert, Protocol.CRUD.c, quiz.qtitle);

		let req = this.client.userReq(qconn, Quizports.quiz,
			new UserReq(qconn, "quizzes", { props: {
				title: quiz.qtitle,
				quizinfo: quiz.quizinfo,
				qowner: this.client.ssInf.uid,
				dcreate: `${date.toISOString()}`,
				questions: quiz.questions
			} } ).a(quiz_a.insert) );

		this.client.an.post(req, onOk, (c, e) => { console.log(c, e); })
	}

	update(quiz, onOk) {
		let that = this;
		this.client.usrAct('quiz', quiz_a.update, Protocol.CRUD.u, quiz.qtitle);

		let req = this.client.userReq(qconn, Quizports.quiz,
			new UserReq(qconn, "quizzes", {
				quizId: quiz.quizId,
				title: quiz.qtitle,
				quizinfo: quiz.quizinfo,
				questions: quiz.questions
			} ).a(quiz_a.update) );

		this.client.an.post(req, onOk, (c, e) => { console.log(c, e); })
	}

	static parseResp(resp) {
		/* {
		   "type": "io.odysz.semantic.jprotocol.AnsonMsg",
		   "code": "ok", "opts": null, "port": "quiz.serv", "header": null,
		   "body": [{"type": "io.odysz.semantic.jprotocol.AnsonResp",
		             "rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
					 "conn": null,
					 "m": "0",
					 "map": null
				   }],
			"version": "1.0", "seq": 0}
		*/
		let quizId = 'quizId';
		let title = 'title';
		return {quizId, title, questions: 0};
	}
}
