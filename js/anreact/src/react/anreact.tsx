
import $ from 'jquery';

import { stree_t, Tierec,
	SessionClient, InsertReq,
	DatasetReq, AnsonResp, AnDatasetResp, ErrorCtx,
	AnsonMsg, OnCommitOk, DatasetOpts, CRUD, AnsonBody, AnResultset, AnTreeNode, InvalidClassNames
} from '@anclient/semantier-st';

import { AnConst } from '../utils/consts';
import { toBool } from '../utils/helpers';
import { Comprops, CrudComp } from './crud';
import { CSSProperties } from '@material-ui/styles/withStyles/withStyles';

export interface ClassNames {[c: string]: string};

export interface Media { isLg?: boolean; isMd?: boolean; isSm?: boolean; isXs?: boolean; isXl?: boolean; };

/**
 * Component's visual options, e.g. options for field formatters.
 */
export interface CompOpts {
	classes: ClassNames;
	media: Media;
}

export const invalidStyles = {
	ok: {},
	anyErr : { border: "1px solid red" },
	notNull: { backgroundColor: '#ff9800b0' },
	maxLen : { border: "1px solid red" },
	minLen : { border: "1px solid red" },
} as {[n in InvalidClassNames]: CSSProperties};


/**JSX.Element like row formatter results */
export interface AnRow extends JSX.Element { }

/**(list) row formatter
 * E.g. @anclient/anreact.Tablist will use this to format a row. see also {@link AnFieldFormatter}
 */
export type AnRowFormatter = ((rec: Tierec, rowIndx: number, classes? : any, media?: Media)=> AnRow);

/** React helpers of AnClient
 * AnReact uses AnContext to expose session error. So it's helpful using AnReact
 * in an An-React application (which handle error in top level).
 */
export class AnReact {

    client: SessionClient;
    ssInf: any;
	errCtx: ErrorCtx;
	/**@param {SessionClient} ssClient client created via login
	 * @param {object} errCtx, AnContext.error, the app error handler
	 */
	constructor (ssClient: SessionClient, errCtx: ErrorCtx) {
		this.client = ssClient;
		this.ssInf = ssClient.ssInf;
		this.errCtx = errCtx;
	}

	/** @deprecated new tiered way don't need any more.
	 * set component.state with request's respons.rs, or call req.onLoad.
	 */
	bindTablist(req: AnsonMsg<AnsonBody>, comp: CrudComp<any>, errCtx: ErrorCtx) {
		this.client.commit(req, (qrsp) => {
			// if (req.onLoad)
			// 	req.onLoad(qrsp);
			// else if (req.onOk)
			// 	req.onLoad(qrsp);
			// else {
				let rs = qrsp.Body().Rs();
				let {rows} = AnsonResp.rs2arr( rs );
				// comp.pageInf?.total! = rs.total;
				comp.setState({rows});
			// }
		}, errCtx );
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
	bindStateRec( qmsg: { onOk?: any; onLoad?: any; req?: any; }, errCtx: ErrorCtx,
				  compont: { setState: (arg0: { record: {}; }) => void; }) {
		let onload = qmsg.onOk || qmsg.onLoad ||
			// try figure out the fields
			function (resp: { Body: () => { (): any; new(): any; Rs: { (): AnResultset; new(): any; }; }; }) {
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
		this.client.an.post(req, onload, errCtx);
		return this;
	}

	/**TODO move this to a semantics handler, e.g. shFK.
	 * Generate an insert request according to tree/forest checked items.
	 * @param {object} forest forest of tree nodes, the forest / tree data, tree node: {id, node}
	 * @param {object} opts options
	 * @param {object} opts.check checking column name
	 * @param {object} opts.columns, column's value to be inserted
	 * @param {object} opts.rows, n-v rows to be inserted
	 * @param {object} opts.reshape set middle tree node while traverse.
	 * @return {InsertReq} subclass of AnsonBody
	 */
	inserTreeChecked (forest: AnTreeNode[], opts: { table: string; columnMap: any; check: string; reshape: boolean; }) {
		let {table, columnMap, check, reshape} = opts;

		// FIXME shouldn't we map this at server side?
		let dbCols = Object.keys(columnMap);

		let ins = new InsertReq(null, table)
			.A<InsertReq>(CRUD.c)
			.columns(dbCols);

		let rows = [];

		collectTree(forest, rows);

		ins.nvRows(rows);
		return ins;

		/**Design Notes:
		 * Actrually we only need this final data for protocol. Let's avoid redundent conversion.
		 * [[["funcId", "sys"], ["roleId", "R911"]], [["funcId", "sys-1.1"], ["roleId", "R911"]]]
		*/
		function collectTree(forest: AnTreeNode[], rows: Array<{name: string, value: string}[]>) {
			let cnt = 0;
			forest.forEach( (tree: AnTreeNode, _i: number) => {
				if (tree && tree.node) {
					if (tree.node.children && tree.node.children.length > 0) {
						let childCnt = collectTree(tree.node.children, rows);

						if (childCnt > 0)
							tree.node[check] = 1;
						else
							tree.node[check] = 0;
					}
					if ( toBool(tree.node[check]) ) {
						rows.push(toNvRow(tree.node, dbCols, columnMap));
						cnt++;
					}
				}
			});
			return cnt;
		}

		/**convert to [name-value, ...] as a row (Array<{name, value}>), e.g.
		 * [ { "name": "funcId", "value": "sys-domain" },
		 *   { "name": "roleId", "value": "r003" } ]
		 */
		function toNvRow(node: AnTreeNode["node"],
				  dbcols: string[], colMap: { [x: string]: any; })
				: Array<{name: string, value: string}> {

			let r = [];
			dbcols.forEach( (col: string, j: number) => {
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
	 * @param {object} opts {serv, home, parent window}
	 * @param {function} onJsonServ function to render React Dom, i. e.
	 * <pre>(elem, json) => {
			let dom = document.getElementById(elem);
			ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
	}</pre>
	 */
	static bindDom( elem: string, opts: {
					/** not used */
					portal?: string;
					/** serv id */
					serv?: string;
					/** system main page */
					home?: string;
					/** path to json config file */
					jsonUrl?: string; },
					onJsonServ: (elem: string, opts: object, json: object) => any) {

		if (!opts.serv) opts.serv = 'host';
		if (!opts.home) opts.home = 'main.html';

		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: opts.jsonUrl || 'private/host.json',
			})
			.done( (json: object) => onJsonServ(elem, opts, json) )
			.fail( (e: any) => {
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done((json: object) => onJsonServ(elem, opts, json))
				.fail( (e: { responseText: any; }) => { $(e.responseText).appendTo($('#' + elem)) } )
			} )
		}
	}
}

/**Ectending AnReact with dataset & sys-menu, the same of layers extinding of jsample.
 * @class
 */
export class AnReactExt extends AnReact {

	extendPorts(ports: {[p: string]: string}) {
		this.client.an.understandPorts(ports);
		return this;
	}

	/** Load jsample menu. (using DatasetReq & menu.serv)
	 * Since v0.9.32, AnReact(Ext) won't care error handling anymore.
	 * @param sk menu sk (semantics key, see dataset.xml), e.g. 'sys.menu.jsample'
	 * @param uri
	 * @param onLoad
	 * @return this
	 */
	loadMenu(sk: string, uri: string, onLoad: OnCommitOk): AnReactExt {
		if (!sk)
			throw new Error("Arg 'sk' is null - AnReact requires a dataset semantics for system menu.");
		const pmenu = 'menu';

		return this.dataset(
			{port: pmenu, uri, sk, sqlArgs: [this.client.ssInf ? this.client.ssInf.uid : '']},
			onLoad);
	}

	/** Load jsample.serv dataset. (using DatasetReq or menu.serv)
	 * @param ds dataset info {port, sk, sqlArgs}
	 * @param onLoad
	 * @param errCtx
	 * @return this
	 */
	dataset(ds: DatasetOpts, onLoad: OnCommitOk): AnReactExt {
		// let ssInf = this.client.ssInf;
		let {uri, sk, sqlArgs, t, rootId} = ds;
		sqlArgs = sqlArgs || [];
		let port = ds.port ||'dataset';

		let reqbody = new DatasetReq({
				uri, port,
				mtabl: undefined,
				sk, sqlArgs, rootId
			})
			.TA(t || stree_t.query);
		let jreq = this.client.userReq(uri, port, reqbody, undefined);

		this.client.an.post(jreq, onLoad, this.errCtx);
		return this;
	}

	/** Load jsample.serv dataset. (using DatasetReq or menu.serv).
	 * If opts.onOk is provided, will try to bind stree like this:
	 <pre>
	let onload = onOk || function (c, resp) {
		if (compont)
			compont.setState({stree: resp.Body().forest});
	}</pre>
	 * @param opts dataset info {sk, sqlArgs, onOk}
	 * @param component
	 * @return this
	 */
	stree(opts: DatasetOpts, component: CrudComp<Comprops>): void {
		let {uri, onOk} = opts;

		if (!uri)
			throw Error('Since v0.9.50, Anclient request needs function uri to find datasource.');

		if (opts.sk && !opts.t)
			opts.a = stree_t.sqltree;

		let onload = onOk || function (resp: AnsonMsg<AnDatasetResp>) {
			if (component)
				component.setState({forest: resp.Body().forest});
		}

		opts.port = 'stree';

		this.dataset(opts, onload);
	}

	rebuildTree(opts: DatasetOpts, onOk: (resp: any) => void) {
		let {uri, rootId, sk} = opts;
		if (!uri)
			throw Error('Since v0.9.50, Anclient need request need uri to find datasource.');

		if (!rootId)
			console.log('Rebuild tree without rootId ?');

		opts.port = 'stree';

		if (opts.sk && !opts.t) {
			console.error("Let's remove this lagacy of without type checking", opts.t, stree_t.retree);
			opts.t = stree_t.retree;
		}

		let onload = onOk || function (resp: any) {
			console.log("Rebuilt successfully: ", resp);
		}

		this.dataset(opts, onload);
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
	 * @param opts options
	 * @param opts.sk semantic key (dataset id)
	 * @param opts.cond the component's state.conds[#] of which the options need to be updated
	 * @param opts.nv {n: 'name', v: 'value'} option's name and value, e.g. {n: 'domainName', v: 'domainId'}
	 * @param opts.onDone on done event's handler: function f(cond)
	 * @param opts.onAll no 'ALL' otion item
	 * @param errCtx error handling context
	 * @return {AnReactExt} this
	 */
	ds2cbbOptions(opts: { uri: string; sk: string; sqlArgs?: string[];
				  nv: {n: string, v: string};
				  cond?: any; onDone: OnCommitOk;
				  /**don't add "-- ALL --" item */
				  noAllItem?: boolean; } ) {
		let {uri, sk, sqlArgs, nv, cond, onDone, noAllItem} = opts;
		if (!uri)
			throw Error('Since v0.9.50, uri is needed to access jserv.');

		nv = nv || {n: 'name', v: 'value'};

		cond.loading = true;

		this.dataset( {
				port: 'dataset',
				uri,
				sqlArgs,
				// ssInf: this.client.ssInf,
				sk },
			(dsResp) => {
				let rs = dsResp.Body().Rs();
				if (nv.n && !AnsonResp.hasColumn(rs, nv.n))
					console.error("Can't find data in rs for option label. column: 'name'.",
						"Must provide nv with data fileds name when using ds2cbbOtpions(), e.g. opts.nv = {n: 'labelFiled', v: 'valueFiled'}");

				let {rows} = AnsonResp.rs2nvs( rs, nv );
				if (!noAllItem)
					rows.unshift(AnConst.cbbAllItem);
				cond.options = rows;

				cond.loading = false;
				cond.clean = true;

				if (onDone)
					onDone(cond);
			} );
		return this;
	}
}
