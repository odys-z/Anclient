import $ from 'jquery';
import React from 'react';

import { L } from '../utils/langstr';
	import { AnConst } from '../utils/consts';
	import { toBool } from '../utils/helpers';
	import { stree_t, Protocol, UpdateReq, InsertReq, DatasetReq, AnsonResp } from '../../semantier/protocol';

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

	bindTablist(req, comp, errCtx) {
		this.client.commit(req, (qrsp) => {
			if (req.onLoad)
				req.onLoad(qresp);
			else if (req.onOk)
				req.onLoad(qresp);
			else {
				let rs = qrsp.Body().Rs();
				let {rows} = AnsonResp.rs2arr( rs );
				comp.state.pageInf.total = rs.total;
				comp.setState({rows});
			}
		}, errCtx.onError );
	}

	/**
	 * Post a request, qmsg.req of AnsonMsg to jserv.
	 * If suceed, call qmsg.onOk (onLoad) or set rs in respons to component's state.
	 * This is a helper of simple form load & bind a record.
	 * @param {object} qmsg
	 * @param {AnContext.error} errCtx
	 * @param {React.Component} compont
	 * @return {AnReact} this
	 * */
	bindStateRec(qmsg, errCtx, compont) {
		let onload = qmsg.onOk || qmsg.onLoad ||
			// try figure out the fields
			function (resp) {
				if (compont) {
					let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
					if (rows && rows.length > 1)
						console.error('Bind form with more than 1 records', resp);

					if (rows)
						compont.setState({record: rows[0]});
					else console.error('Can\'t bind empty row:', resp);
				}
				else console.error('Component shouldn\t be null. Can\'t hook back response:', resp);
			};

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
	inserTreeChecked (forest, opts) {
		let {table, columnMap, check, reshape} = opts;

		// FIXME shouldn't we map this at server side?
		let dbCols = Object.keys(columnMap);

		let ins = new InsertReq(null, table)
			.A(Protocol.CRUD.c)
			.columns(dbCols);

		let rows = [];

		collectTree(forest, rows);

		ins.nvRows(rows);
		return ins;

		/**Design Notes:
		 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
		 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
		*/
		function collectTree(forest, rows) {
			forest.forEach( (tree, i) => {
				if (tree && tree.node) {
					if ( toBool(tree.node[check]) )
						rows.push(toNvRow(tree.node, dbCols, columnMap));
					if (tree.node.children && tree.node.children.length > 0)
						collectTree(tree.node.children, rows);
				}
			});
		}

		function toNvRow(node, dbcols, colMap) {
			let r = [];
			dbcols.forEach( (col, j) => {
				let mapto = colMap[col];
				if (node.hasOwnProperty(mapto))
					// e.g. roleName: 'text'
					r.push({name: col, value: node[mapto]});
				else
					// e.g. roleId: '0001'
					r.push({name: col, value: mapto});
			} );
			return r;
		}
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private/host.json<serv-id>,
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
				url: 'private/host.json',
			})
			.done( (json) => onJsonServ(elem, json) )
			.fail( (e) => {
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done((json) => onJsonServ(elem, json))
				.fail( (e) => { $(e.responseText).appendTo($('#' + elem)) } )
			} )
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
	 * @param {string} sk menu sk (semantics key, see dataset.xml), e.g. 'sys.menu.jsample'
	 * @param {function} onLoad
	 * @param {AnContext} errCtx
	 * @return {AnReactExt} this
	 */
	loadMenu(sk, onLoad, errCtx) {
		if (!sk)
			throw new Error("Arg 'sk' is null - AnReact requires a dataset semantics for system menu.");
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
		let {port, uri, sk, sqlArgs, t, rootId} = ds;
		sqlArgs = sqlArgs || [];
		port = port || 'dataset';

		let reqbody = new DatasetReq({
				sk,
				sqlArgs,
				rootId
			})
			.A(t || stree_t.query);
		let jreq = this.client.userReq(uri, port, reqbody);

		this.client.an.post(jreq, onLoad, (c, resp) => {
			if (errCtx) {
				errCtx.hasError = true;
				errCtx.code = c;
				errCtx.msg = resp.Body().msg();
				errCtx.onError(c, resp);
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
	 * @param {string} opts.sk
	 * @param {string} opts.sqlArgs
	 * @param {function} opts.onOk
	 * @param {AnContext} errCtx
	 * @param {CrudComp} component
	 * @return {AnReactExt} this
	 */
	stree(opts, errCtx, component) {
		let {uri, onOk} = opts;

		if (!uri)
			throw Error('Since v0.9.50, Anclient need request need uri to find datasource.');

		opts.port = 'stree';

		if (opts.sk && !opts.t)
			opts.t = stree_t.sqltree;

		let onload = onOk || function (resp) {
			if (component)
				component.setState({forest: resp.Body().forest});
		}

		this.dataset(opts, onload, errCtx);
	}

	rebuildTree(opts, onOk) {
		let {uri, rootId, sk} = opts;
		if (!uri)
			throw Error('Since v0.9.50, Anclient need request need uri to find datasource.');

		if (!rootId)
			console.log('Rebuild tree without rootId ?');

		opts.port = 'stree';

		if (opts.sk && !opts.t)
			opts.t = stree_t.retree;

		let onload = onOk || function (resp) {
			console.log("Rebuilt successfully: ", resp);
		}

		this.dataset(opts, onload, super.err);
	}

	/**Bind dataset to combobox options (comp.state.condCbb).
	 * Option object is defined by opts.nv.
	 *
	 * <h6>About React Rendering Events</h6>
	 * This method will update opts.cond.loading and clean.
	 * When success, set loading false, clean true. this 2 flags are helper for
	 * handling react rendering / data-loading events asynchronously.
	 *
	 * <p> See AnQueryFormComp.componentDidMount() for example. </p>
	 *
	 * @param {object} opts options
	 * @param {string} opts.sk semantic key (dataset id)
	 * @param {object} opts.cond the component's state.conds[#] of which the options need to be updated
	 * @param {object} [opts.nv={n: 'name', v: 'value'}] option's name and value, e.g. {n: 'domainName', v: 'domainId'}
	 * @param {function} [opts.onDone] on done event's handler: function f(cond)
	 * @param {boolean} [opts.onAll] no 'ALL' otion item
	 * @param {AnContext.error} errCtx error handling context
	 * @param {React.Component} [compont] the component needs to be updated on ok, if provided
	 * @return {AnReactExt} this
	 */
	ds2cbbOptions(opts, errCtx, compont) {
		let {uri, sk, sqlArgs, nv, cond, onDone, noAll} = opts;
		if (!uri)
			throw Error('Since v0.9.50, uri is needed to access jserv.');

		nv = nv || {n: 'name', v: 'value'};

		cond.loading = true;

		this.dataset( {
				uri,
				sqlArgs,
				ssInf: this.client.ssInf,
				sk },
			(dsResp) => {
				let rs = dsResp.Body().Rs();
				if (nv.n && !AnsonResp.hasColumn(rs, nv.n))
					console.error("Can't find data in rs for option label. column: 'name'.",
						"Must provide nv with data fileds name when using ds2cbbOtpions(), e.g. opts.nv = {n: 'labelFiled', v: 'valueFiled'}");

				let {rows} = AnsonResp.rs2nvs( rs, nv );
				if (!noAll)
					rows.unshift(AnConst.cbbAllItem);
				cond.options = rows;

				cond.loading = false;
				cond.clean = true;

				if (compont)
					compont.setState({});

				if (onDone)
					onDone(cond);
			}, errCtx );
		return this;
	}
}
