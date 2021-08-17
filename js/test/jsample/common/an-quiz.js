/** Legacy from Anclient/example.js/react-quiz
 */
import {
	Protocol, UserReq, AnsonMsg
} from "anclient"

import { QuizReq, QuizResp } from './protocol.quiz.js';

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
	 * @param {object} errHandler, AnContext.error, the app error handler
	 */
	constructor (ssClient, errHandler) {
		this.client = ssClient;
		this.ssInf = ssClient.ssInf;
		this.err = errHandler;
	}

	static get port() { return 'quiz'; }

	serv (uri, a, conds = {}, onLoad, errCtx) {
		let req = new UserReq(uri)
			.A(a); // this is a reading request

		for (let k in conds)
			req.set(k, conds[k]);

		let header = Protocol.formatHeader(this.ssInf);

		// for logging user action at server side.
		this.client.usrAct({
			func: 'quiz',
			cmd: a,
			cate: Protocol.CRUD.r,
			remarks: 'quiz.serv' });

		let reqMsg = this.client.userReq(uri, JQuiz.port, req);

		this.client.commit(reqMsg, onLoad, errCtx);

		return this;
	}

	/** Create a request and post back to server asking a new quiz.
	 * port: quiz
	 * @param { string } uri
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * @param {AnContext.error}
	 * */
	startQuiz(uri, onLoad, errCtx) {
		return this.serv(uri, quiz_a.start, {}, onLoad, errCtx);
	}

	/** Create a query request and post back to server.
	 * This function show the general query sample - goes to the Protocol's query
	 * port: quiz
	 * @param { string } uri
	 * @param {string} quizId quiz id
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * @param {AnContext.error}
	 * */
	quiz(uri, quizId, onLoad, errCtx) {
		// let that = this;
		return this.serv(uri, quiz_a.quiz, {quizId}, onLoad, errCtx);
	}

	/**@deprecated replaced by QuizzesComp.reload().
	 * @param { string } uri
	 * @param { string } uri
	 * @param {object} cond
	 * @param {AnContext.error}
	 */
	list (uri, conds, onLoad, errCtx) {
		return this.serv(uri, quiz_a.list, conds, onLoad, errCtx);
	}

	/**
	 * @param {string} uri
	 * @param {object} quiz {qtitle, questions, quizifno, toClass}
	 * @param {function} onOk
	 * @param {AnContext.error} errCtx
	 */
	insert(uri, quiz, onOk, errCtx) {
		let that = this;
		let date = new Date();
		this.client.usrAct('quiz', quiz_a.insert, Protocol.CRUD.c, quiz.qtitle);

		let props = {}
		props[QuizProtocol.qtitle] = quiz.qtitle;
		props[QuizProtocol.qowner] = this.client.ssInf.uid;
		props[QuizProtocol.dcreate] = `${date.toISOString()}`;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.questions] = QuizReq.questionToNvs(quiz.questions);

		let pollIds = shrink(quiz.pollUsers);
		console.log(pollIds);
		props[QuizProtocol.pollUser] = pollIds;

		let req = this.client.userReq(uri, JQuiz.port,
			new UserReq( uri, "quizzes", props ).A(quiz_a.insert) );

		this.client.commit(req, onOk, errCtx);

		function shrink(arr) {
			console.error(arr);
			return arr;
		}
	}

	/**
	 * @param {string} uri
	 * @param {object} quiz {qtitle, questions, quizifno}
	 * @param {function} onOk
	 * @param {AnContext.error} errCtx
	 */
	update(uri, quiz, onOk, errCtx) {
		let that = this;
		this.client.usrAct('quiz', quiz_a.update, Protocol.CRUD.u, quiz.qtitle);

		let props = {}
		props[QuizProtocol.quizId] = quiz.quizId;
		props[QuizProtocol.qtitle] = quiz.qtitle;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.questions] = QuizReq.questionToNvs(quiz.questions);

		let req = this.client.userReq(uri, JQuiz.port,
			new UserReq(uri, "quizzes", props).A(quiz_a.update) );

		this.client.commit(req, onOk, errCtx);
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
		   "body":[{"type": "io.odysz.semantic.jprotocol.AnsonResp",
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
