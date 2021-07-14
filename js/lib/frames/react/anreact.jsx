import $ from 'jquery';
import React from 'react';

import { L } from './utils/langstr';
import { stree_t, Protocol, DatasetReq } from '../../protocol.js';

/** React helpers of AnClient
 * AnReact uses AnContext to expose session error. So it's helpful using AnReact
 * in an An-React application (which handle error in top level).
 */
export class AnReact {
	/**@param {SessionClient} ssClient client created via login
	 * @param {object} errCtx, AnContext.error, the app error handler
	 */
	constructor (ssClient, errCtx) {
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
			func: 'quiz',
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
				errCtx.onError(true);
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

	list (conds, onLoad) {
		return this.serv(quiz_a.list, conds, onLoad, this.err);
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

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} opts serv id
	 * @param {string} [opts.serv='host'] serv id
	 * @param {function} onJsonServ function to render React Dom, i. e.
	 * <pre>(elem, json) => {
			let dom = document.getElementById(elem);
			ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
	}</pre>
	 */
	static bindDom(elem, opts, onJsonServ) {
		// this.state.servId = serv;
		if (opts.serv) opts.serv = 'host';

		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: 'private.json',
			})
			.done((json) => onJsonServ(elem, json))
			.fail(
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done((json) => onJsonServ(elem, json))
				.fail( (e) => { $(e.responseText).appendTo($('#' + elem)) } )
			)
		}
	}
}

/**Ectending AnReact with dataset & sys-menu, the same of layers extinding of jsample.
 * @class
 */
export class AnReactExt extends AnReact {
	extendPorts(ports) {
		this.client.an.understandPorts(ports);
		return this;
	}

	/** Load jsample menu. (using DatasetReq & menu.serv)
	 * @param {SessionInf} ssinf
	 * @param {function} ssinf
	 * @param {AnContext} errCtx
	 * @return {AnReactExt} this
	 */
	loadMenu(ssinf, onLoad, errCtx) {
		const sk = 'sys.menu.jsample';
		const pmenu = 'menu';

		// let reqbody = new DatasetReq({
		// 		sk,
		// 		sqlArgs: [ssinf.uid]
		// 	})
		// 	.A(stree_t.query);
		// let jreq = this.client.userReq(undefined, pmenu, reqbody);
		//
		// this.client.an.post(jreq, onLoad, (c, resp) => {
		// 	if (errCtx) {
		// 		errCtx.hasError = true;
		// 		errCtx.code = c;
		// 		errCtx.msg = resp.Body().msg();
		// 		errCtx.onError(true);
		// 	}
		// 	else console.error(c, resp);
		// });
		// return this;
		return this.dataset(
			{ssinf, port: pmenu, sk, sqlArgs: [ssinf.uid]},
			onLoad, errCtx);
	}

	dataset(ds, onLoad, errCtx) {
		let {ssinf, port, sk, sqlArgs} = ds;
		sqlArgs = sqlArgs || [];
		port = port || 'dataset';

		let reqbody = new DatasetReq({
				sk,
				sqlArgs
			})
			.A(stree_t.query);
		let jreq = this.client.userReq(undefined, port, reqbody);

		this.client.an.post(jreq, onLoad, (c, resp) => {
			if (errCtx) {
				errCtx.hasError = true;
				errCtx.code = c;
				errCtx.msg = resp.Body().msg();
				errCtx.onError(true);
			}
			else console.error(c, resp);
		});
		return this;
	}

	static parseCbbOptions(rs) {
		
	}
}
