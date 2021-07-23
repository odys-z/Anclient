import $ from 'jquery';
import React from 'react';

import { L } from './utils/langstr';
	import { AnConst } from './utils/consts';
	import { stree_t, Protocol, DatasetReq, AnsonResp } from '../../protocol.js';

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

	// static get port() { return 'quiz'; }

	// serv (a, conds = {}, onLoad, errCtx) {
	// 	let req = new UserReq(qconn)
	// 		.A(a); // this is a reading request
	//
	// 	for (let k in conds)
	// 		req.set(k, conds[k]);
	//
	// 	let header = Protocol.formatHeader(this.ssInf);
	//
	// 	// for logging user action at server side.
	// 	this.client.usrAct({
	// 		func: 'quiz',
	// 		cmd: a,
	// 		cate: Protocol.CRUD.r,
	// 		remarks: 'quiz.serv' });
	//
	// 	var jreq = new AnsonMsg({
	// 				port: JQuiz.port,
	// 				header,
	// 				body: [req]
	// 			});
	//
	// 	this.client.an.post(jreq, onLoad, (c, resp) => {
	// 		if (errCtx) {
	// 			errCtx.hasError = true;
	// 			errCtx.code = c;
	// 			errCtx.msg = resp.Body().msg();
	// 			errCtx.onError(true);
	// 		}
	// 		else console.error(c, resp);
	// 	});
	// 	return this;
	// }

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

	// update(quiz, onOk) {
	// 	let that = this;
	// 	this.client.usrAct('quiz', quiz_a.update, Protocol.CRUD.u, quiz.qtitle);
	//
	// 	let props = {}
	// 	props[QuizProtocol.quizId] = quiz.quizId;
	// 	props[QuizProtocol.qtitle] = quiz.qtitle;
	// 	props[QuizProtocol.quizinfo] = quiz.quizinfo;
	// 	props[QuizProtocol.questions] = QuizReq.questionToNvs(quiz.questions);
	//
	// 	let req = this.client.userReq(qconn, JQuiz.port,
	// 		new UserReq(qconn, "quizzes", props).A(quiz_a.update) );
	//
	// 	this.client.an.post(req, onOk, (c, resp) => {
	// 		if (that.err) {
	// 			that.err.code = c;
	// 			that.err.msg = resp.Body().msg();
	// 			that.err.onError(true);
	// 		}
	// 		else console.error(c, resp);
	// 	});
	// }
	update(rec, onOk) {
		throw new Error('don\'t use this - a stub for future extension');
	}

	bindSimpleForm(qmsg, errCtx, compont) {
		let onload = qmsg.onOk || qmsg.onLoad ||
			// try figure the fields
			function (r) {
				if (compont) {
					let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
					if (rows && rows.length > 0)
						console.error('Bind form with more than 1 records', r);

					if (rows && rows.length == 1)
						compont.setState({record: rows[0]});
					else console.error('Can\'t bind empty row:', r);
				}
				else console.error('Can\'t hook back response:', r);
			}
		;

		let {req} = qmsg;
		this.client.an.post(req, onload, (c, resp) => {
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

	/**Generate an insert request according to tree/forest checked items.
	 * @param {object} forest of node, the forest / tree data, tree node: {id, node}
	 * @param {object} opts options
	 * @param {object} opts.check checking column name
	 * @param {object} opts.columns, column's value to be inserted
	 * @param {object} opts.rows, n-v rows to be inserted
	 * @param {object} opts.reshape set middle tree node while traverse.
	 * @return {InsertReq} subclass of AnsonBody
	 */
	insertTreeChecked (forest, opts) {
		let ins = new InsertReq();
		ins.a = Protocol.CRUD.c;

		let cols = [];
		let rows = [];

		forest.forEach( (tree, i) => {
			rows.push(toNvRow(tree.node, opts.columns));
		});

		ins.columns(cols);
		ins.nvRows(rows);
		return ins;

		function toNvRow(node, columns) {
			let row = [];
			columns.forEach( (col, j) => {
				
			} );
		}
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

	// TODO move TO super class
	bindTablist(req, comp, errCtx) {
		this.client.commit(req, (qrsp) => {
			let rs = qrsp.Body().Rs();
			let {rows} = AnsonResp.rs2arr( rs );
			comp.state.pageInf.total = rs.total;
			comp.setState({rows});
		}, errCtx.onError );
	}

	/** Load jsample menu. (using DatasetReq & menu.serv)
	 * @param {SessionInf} ssInf
	 * @param {function} ssInf
	 * @param {AnContext} errCtx
	 * @return {AnReactExt} this
	 */
	loadMenu(onLoad, errCtx) {
		const sk = 'sys.menu.jsample';
		const pmenu = 'menu';

		return this.dataset(
			{port: pmenu, sk, sqlArgs: [this.client.ssInf ? this.client.ssInf.uid : '']},
			onLoad, errCtx);
	}

	/** Load jsample.serv dataset. (using DatasetReq or menu.serv)
	 * @param {object} ds dataset info {port, sk, sqlArgs}
	 * @param {AnContext} errCtx
	 * @param {CrudComp} component
	 * @return {AnReactExt} this
	 */
	dataset(ds, onLoad, errCtx) {
		let ssInf = this.client.ssInf;
		let {port, sk, sqlArgs, t} = ds;
		sqlArgs = sqlArgs || [];
		port = port || 'dataset';

		let reqbody = new DatasetReq({
				sk,
				sqlArgs
			})
			.A(t || stree_t.query);
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

	/** Load jsample.serv dataset. (using DatasetReq or menu.serv).
	 * If opts.onOk is provided, will try to bind stree like this:
	 <pre>
	let onload = onOk || function (c, resp) {
		if (compont)
			compont.setState({stree: resp.Body().forest});
	}</pre>
	 * @param {object} opts dataset info {sk, sqlArgs, onOk}
	 * @param {AnContext} errCtx
	 * @param {CrudComp} component
	 * @return {AnReactExt} this
	 */
	stree(opts, errCtx, component) {
		let {onOk} = opts;
		opts.port = 'stree';

		let onload = onOk || function (resp) {
			if (component)
				component.setState({forest: resp.Body().forest});
		}

		this.dataset(opts, onload, errCtx);
	}

	/**Bind dataset to combobox options (comp.state.condCbb).
	 * Option object is defined by opts.nv.
	 *
	 * <p> See DomainComp.componentDidMount() for example. </p>
	 *
	 * @param {object} opts options
	 * @param {string} opts.sk semantic key (dataset id)
	 * @param {object} opts.cond the component's state.conds[#] of which the options need to be updated
	 * @param {object} [opts.nv={n: 'name', v: 'value'}] option's name and value, e.g. {n: 'domainName', v: 'domainId'}
	 * @param {boolean} [opts.onAll] no 'ALL' otion item
	 * @param {AnContext.error} errCtx error handling context
	 * @param {React.Component} [compont] the component needs to be updated on ok, if provided
	 * @return {AnReactExt} this
	 */
	ds2cbbOptions(opts, errCtx, compont) {
		let {sk, nv, cond, noAll} = opts;
		nv = nv || {n: 'name', v: 'value'};

		this.dataset( {
				ssInf: this.client.ssInf,
				sk },
			(dsResp) => {
				let rs = dsResp.Body().Rs();
				if (nv.n === 'name' && !AnsonResp.hasColumn(rs, 'name'))
					console.warn("Can't find data in rs for option label. column: 'name'.",
						"Must provide nv with data fileds name when using ds2cbbOtpions(), e.g. opts.nv = {n: 'labelFiled', v: 'valueFiled'}");

				let {rows} = AnsonResp.rs2nvs( rs, nv );
				if (!noAll)
					rows.unshift(AnConst.cbbAllItem);
				cond.options = rows;

				if (compont)
					compont.setState({});
			}, errCtx );
		return this;
	}
}
