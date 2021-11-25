/** Legacy from Anclient/example.js/react-quiz
 */
import {
	Protocol, UserReq
} from '@anclient/semantier-st';

import { QuizReq, QuizProtocol, CenterProtocol } from './protocol.quiz.js';

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

		this.client.commit(reqMsg, onLoad, errCtx || this.err);

		return this;
	}

	/**[Promoting Style]
	 * Create a request and post back to server asking a new quiz, loading ind_emotion type 'A'.
	 * port: quiz
	 * @param { object } opt
	 * @param { string } opt.uri
	 * @param { string } opt.templ
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * @param {AnContext.error}
	 * */
	startQuizA(opt, onLoad, errCtx) {
		let {templ, uri} = opt;
		let option = {};
		option[QuizProtocol.templName] = templ || 'A'; // only 'A' or 'B'
		return this.serv(uri, QuizProtocol.A.start, option, onLoad, errCtx);
	}

	/**[Promiting Style - the optimized direction but parameters must reduced]
	 * @param {string} uri
	 * @param {object} pollResult
	 * @param {string} pollResult.pollId
	 * @param {array} pollResult.questions [{quizId, qid, pollId, ansewer}, ... ]
	 * @param {function} onLoad
	 * @param {AnContext.error}
	 * */
	submitPoll(uri, pollResult, onLoad, errCtx) {
		let reqBd = new UserReq();

		let { questions, pollId } = pollResult;

		let client = this.client;
		let req = client.userReq( uri, 'center',
					new UserReq( uri, "center" )
						.A(CenterProtocol.A.submitPoll)
					 	.set(CenterProtocol.pollId, pollId)
					 	.set(CenterProtocol.pollResults, ques2PollDetail(questions) ));

		let that = this;
		client.commit(req, onLoad, errCtx || this.err);

		/** Convert quiz' questions to java PollDetail
		 * @param {array} qss
		 * @return {array} [PollDetail]*/
		function ques2PollDetail (qss) {
			let details = [];
			if (qss)
				qss.forEach( (q, x) => {
					let {qid, quizId, pollId, answer} = q;
					if (Array.isArray(answer))
						answer = answer.join(',');
					details.push( {
						type: QuizProtocol.PollDetailType,
						questId: qid,
						quizId, pollId, answer } )
				} );

			console.log(details);
			return details;
		}
	}

	/**[Promiting Style]
	 * Create a query request for loading quiz'z users.
	 * port: quiz
	 * @param {objects} opts
	 * @param {string} opts.uri
	 * @param {string} opts.quizId
	 * @param {boolean} opts.isNew
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * @param {AnContext.error}
	 * */
	quizUsers(opts, onLoad, errCtx) {
		let {uri, quizId, isNew} = opts;
		return this.serv(uri, QuizProtocol.A.quizUsers, {quizId}, onLoad, errCtx);
	}

	/**[Promiting Style]
	 * Get all poll users for pollIds, with state in states.
	 * port: quiz
	 * @deprecated only used by polls.jsx/PollsComp, replaced by polls.tsx/PollsComp
	 * @param {objects} opts
	 * @param {string} opts.uri
	 * @param {array|set} opts.pollIds
	 * @param {array|set} opts.states
	 * @param {function} onLoad
	 * @param {AnContext.error}
	 * */
	pollsUsers(uri, opts, onLoad, errCtx) {
		let {pollIds, states} = opts;
		let opt = {};
		opt[QuizProtocol.pollIds] = pollIds;
		opt[QuizProtocol.states] = states;
		return this.serv(uri, QuizProtocol.A.pollsUsers, opt, onLoad, errCtx);
	}

	/**[Promiting Style]
	 * Create a query request and post back to server.
	 * port: quiz
	 * @param { string } uri
	 * @param {string} quizId quiz id
	 * @param {function} onLoad on query ok callback, called with parameter of query responds
	 * @param {AnContext.error}
	 * */
	quiz(uri, quizId, onLoad, errCtx) {
		// let that = this;
		return this.serv(uri, QuizProtocol.A.quiz, {quizId}, onLoad, errCtx);
	}

	/**@deprecated replaced by QuizzesComp.reload().
	 * @param { string } uri
	 * @param { string } uri
	 * @param {object} cond
	 * @param {AnContext.error}
	 */
	list (uri, conds, onLoad, errCtx) {
		return this.serv(uri, QuizProtocol.A.list, conds, onLoad, errCtx);
	}

	/**Insert a quiz (deprecated?)
	 * @param {string} uri
	 * @param {object} hooked { quiz: {qtitle, tags, subject, quizinf}, questions, quizUsers }
	 * @param {function} onOk
	 * @param {AnContext.error} errCtx
	 */
	insertQuiz(uri, hooked, onOk, errCtx) {
		let that = this;
		let {quiz, questions, quizUsers} = hooked;
		let date = new Date();
		this.client.usrAct('quiz', QuizProtocol.A.insert, Protocol.CRUD.c, quiz.title);

		let props = {}
		/* DESIGN NOTE
		 * DESIGN NOTE
		 * As quiz already carry the fields name, why have to define arg name in protocol?
		 * E.g. quiz-editor already defined fields for <RecordForm />, which is used for table quizzes
		 */
		props[QuizProtocol.qtitle] = quiz.title;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.subject] = quiz.subject;
		props[QuizProtocol.tags] = quiz.tags;

		props[QuizProtocol.qowner] = this.client.ssInf.uid;
		props[QuizProtocol.dcreate] = `${date.toISOString()}`;
		props[QuizProtocol.questions] = QuizReq.checkQuestions(questions);

		props[QuizProtocol.quizUsers] = quizUsers || [];

		let req = this.client.userReq(uri, JQuiz.port,
			new UserReq( uri, "quizzes", props ).A(QuizProtocol.A.insert) );

		this.client.commit(req, onOk, errCtx || this.err);
	}

	/**Update a quiz (intanced indicators)
	 * @param {string} uri
	 * @param {object} quiz {qtitle, questions, quizifno}
	 * @param {function} onOk
	 * @param {AnContext.error} errCtx
	 */
	update(uri, hooked, onOk, errCtx) {
		let that = this;
		let {quiz, questions, quizUsers} = hooked;
		this.client.usrAct('quiz', QuizProtocol.A.update, Protocol.CRUD.u, quiz.title);

		let props = {}
		props[QuizProtocol.quizId] = quiz.qid || quiz.quizId;
		props[QuizProtocol.qtitle] = quiz.title;
		props[QuizProtocol.quizinfo] = quiz.quizinfo;
		props[QuizProtocol.subject] = quiz.subject;
		props[QuizProtocol.tags] = quiz.tags;

		props[QuizProtocol.questions] = QuizReq.checkQuestions(questions, {pk: "quizId", pkval: quiz.qid});

		props[QuizProtocol.quizUsers] = quizUsers || [];

		let req = this.client.userReq(uri, JQuiz.port,
			new UserReq(uri, "quizzes", props).A(QuizProtocol.A.update) );

		this.client.commit(req, onOk, errCtx || this.err);
	}

	/**[Promiting Style]
	 * Stop all polls .
	 * @param {string} uri
	 * @param {array} pids poll's ids
	 * @param {function} onOk
	 * @param {AnContext.error} errCtx
	 */
	stopolls(uri, pids, onOk, errCtx) {
		let opt = {};
		opt[QuizProtocol.pollIds] = pids;
		return this.serv(uri, QuizProtocol.A.stopolls, opt, onOk, errCtx);
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
		return {qtype: correct.length == 1 ? QuizProtocol.Qtype.single : QuizProtocol.Qtype.multiple,
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
