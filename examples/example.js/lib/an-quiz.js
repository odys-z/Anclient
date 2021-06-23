/** TODO move this the anclient.js
 */
import {
	Protocol, UserReq, AnsonMsg
} from "anclient"

import {QuizReq} from './protocol.quiz.js';

export const qconn = "quiz";

const Quizports = {
	quiz: 'quiz.serv'
}

export const quiz_a = {
	quiz: 'quiz',     //
	list: 'list',     // load quizzes
	insert: 'insert', // create new quiz
	update: 'update', // update quiz

	poll: 'poll',     // submit poll results
}

export const QuestionType = {
	single: "1",
	multiple: "x"
}

export
/**<pre>
	public class QuizProtocol {
		public static String questions = "questions";
		public static String qtitle = "qtitle";
		public static String quizinfo = "quizinfo";
		public static String qowner = "qowner";
		public static String dcreate = "dcreate";
	}</pre>
 */
const QuizProtocol = {
	quizId: "quizId",
	questions: "questions",
	qtitle: "qtitle",
	quizinfo: "quizinfo",
	qowner: "qowner",
	dcreate: "dcreate",

	poll: "poll",
	pollUser: "pollUser",
}

export
/** Helper handling protocol / data type of quiz.serv */
class JQuiz {
	/**@param {SessionClient} ssClient client created via login
	 * @param {AnContext.errors} errCtx error handler's context.
	 */
	constructor (ssClient, errCtx) {
		ssClient.an.understandPorts(Quizports);
		this.client = ssClient;
		this.ssInf = ssClient.ssInf;
		this.err = errCtx;
	}

	static get port() { return 'quiz'; }

	serv (a, conds = {}, onLoad, errCtx) {
		let req = new UserReq(qconn)
			.A(a); // this is a reading request

		for (let k in conds)
			req.set(k, conds[k]);

		let header = Protocol.formatHeader(this.ssInf);

		// for logging user action at server side.
		this.client.usrAct({
			func: 'read',
			cmd: a,
			cate: Protocol.CRUD.r,
			remarks: 'quiz.serv' });

		var jreq = new AnsonMsg({
					port: JQuiz.port,
					header,
					body: [req]
				});

		this.client.an.post(jreq, onLoad, (c, resp) => {
			if (errCtx) {
				errCtx.hasError = true;
				errCtx.code = c;
				errCtx.msg = resp.Body().msg();
			}
			else console.error(c, resp);
		});
		return this;
	}

	/** Create a query request and post back to server.
	 * This function show the general query sample - goes to the Protocol's query
	 * port: "r.serv(11)".
	 * @param {string} quizId quiz id
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * */
	quiz(quizId, onLoad, errCtx) {
		let that = this;
		return this.serv(quiz_a.quiz, {quizId}, onLoad, errCtx);
	}

	list (conds, onLoad, errCtx) {
		return this.serv(quiz_a.list, conds, onLoad, errCtx);
	}

	insert(quiz, onOk) {
		let that = this;
		let date = new Date();
		this.client.usrAct('quiz', quiz_a.insert, Protocol.CRUD.c, quiz.qtitle);

		let props = {}
		props[QuizProtocol.qtitle] = quiz.qtitle;
		props[QuizProtocol.qowner] = this.client.ssInf.uid;
		props[QuizProtocol.dcreate] = `${date.toISOString()}`;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.questions] = QuizReq.questionToNvs(quiz.questions);

		let req = this.client.userReq(qconn, JQuiz.port,
			new UserReq( qconn, "quizzes", props ).A(quiz_a.insert) );

		this.client.an.post(req, onOk, (c, resp) => {
			if (that.err) {
				that.err.code = c;
				that.err.msg = resp.Body().msg();
				that.err.onError(true);
			}
			else console.error(c, resp);
		});
	}

	update(quiz, onOk) {
		let that = this;
		this.client.usrAct('quiz', quiz_a.update, Protocol.CRUD.u, quiz.qtitle);

		let props = {}
		props[QuizProtocol.quizId] = quiz.quizId;
		props[QuizProtocol.qtitle] = quiz.qtitle;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.questions] = QuizReq.questionToNvs(quiz.questions);

		let req = this.client.userReq(qconn, JQuiz.port,
			new UserReq(qconn, "quizzes", props).A(quiz_a.update) );

		this.client.an.post(req, onOk, (c, resp) => {
			if (that.err) {
				that.err.code = c;
				that.err.msg = resp.Body().msg();
				that.err.onError(true);
			}
			else console.error(c, resp);
		});
	}

	/**
	 * @return {object} return {qtype, correct};
	 */
	static figureAnswers(ans) {
		if (!ans) return "";

		let correct = [];
		let anss = ans.split("\n");
		anss.forEach( (a, x) => {
			if (a.trim().startsWith("\*"))
				correct.push(String(x))
		});
		return {qtype: correct.length <= 1 ? QuestionType.single : QuestionType.multiple,
				correct: correct.join(',')};
	}

	/**
	 * @return {object} return {quizId, title, questions};
	 */
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
		let data = resp.body[0].data.props;
		let quizId = data[QuizProtocol.quizId];
		let title = data[QuizProtocol.qtitle];
		let questions = data[QuizProtocol.questions]
		return {quizId, title, questions};
	}
}
