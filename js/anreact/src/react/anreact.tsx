
import $ from 'jquery';

import { stree_t, SessionClient, AnsonResp, AnDatasetResp, ErrorCtx,
	AnsonMsg, OnCommitOk, DatasetOpts, AnsonBody, AnResultset, InvalidClassNames, NV, OnLoadOk, Semantier, PageInf, AnlistColAttrs
} from '@anclient/semantier';

import { AnConst } from '../utils/consts';
import { Comprops, CrudComp } from './crud';
import { CSSProperties } from '@material-ui/styles/withStyles/withStyles';
import { JsonServs } from './reactext';

export interface ClassNames {[c: string]: string};

export interface Media { isLg?: boolean; isMd?: boolean; isSm?: boolean; isXs?: boolean; isXl?: boolean; };

/**
 * Component's visual options, e.g. options for field formatters.
 */
export interface CompOpts {
	classes: ClassNames;
	media?: Media;
}

export interface QueryPage {
	pageInf?: PageInf;
	query?: AnlistColAttrs<JSX.Element, any>[];
}

export function toPageInf(query: QueryPage) : PageInf {
	let p = new PageInf(query.pageInf.page, query.pageInf.size);
	p.condts = [];
	query.query?.forEach( (q, x) => {
		p.condts.push( [q.field, typeof q.val === 'string' ? q.val : q.val?.v] );
	});

	return p;
}

export const invalidStyles = {
	ok: {},
	anyErr : { border: "1px solid red" },
	notNull: { backgroundColor: '#ff9800b0' },
	maxLen : { border: "1px solid red" },
	minLen : { border: "1px solid red" },
} as {[n in InvalidClassNames]: CSSProperties};

export function toReactStyles(styles: CSSStyleDeclaration | undefined): CSSProperties {
	return styles as unknown as CSSProperties;
}

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

	/**
	 * @deprecated new tiered way don't need this any more.
	 * set component.state with request's respons.rs, or call req.onLoad.
	 */
	bindTablist(req: AnsonMsg<AnsonBody>, comp: CrudComp<Comprops>, errCtx: ErrorCtx) {
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

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private/host.json<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} opts {serv, home, parent window}
	 * @param {function} onJsonServ function to render React Dom, i. e.
	 * @example
	 * // see Anclient/js/test/jsample/login-app.tsx
	 * (elem, json) => {
	 * 	let dom = document.getElementById(elem);
	 * 	ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
	 * }
	 *
	 * // see Anclient/js/test/jsample/app.tsx
	 * function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
	 * 	let dom = document.getElementById(elem);
	 * 	ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
	 * }
	 */
	static bindDom( elem: string, opts: AnreactAppOptions,
				onJsonServ: (elem: string, opts: AnreactAppOptions, json: JsonServs) => void) {

		if (!opts.serv) opts.serv = 'host';
		if (!opts.home) opts.home = 'main.html';

		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: opts.jsonPath || 'private/host.json',
			})
			.done( (json: JsonServs) => onJsonServ(elem, opts, json) )
			.fail( (e: any) => {
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done((json: JsonServs) => onJsonServ(elem, opts, json))
				.fail( (e: { responseText: any; }) => { $(e.responseText).appendTo($('#' + elem)) } )
			} )
		}
	}
}

export interface AnreactAppOptions {
	/** serv id, default: host */
	serv?: string;

	/** system main page */
	home?: string;

	/** path to json config file for jserv root url, e.g. 'parivate/host.json' */
	jsonPath?: string;

	/** not used */
	portal?: string;

	/**parent window */
	parent?: Window;
};

/**
 * Extending AnReact with dataset & sys-menu - the same of tier extending of Jsample.
 *
 * @class
 */
export class AnReactExt extends AnReact {
	loading: boolean;

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
		Semantier.dataset(ds, this.client, onLoad, this.errCtx);
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
		// let {uri, onOk} = opts;
		let {onOk} = opts;

		let onload = onOk || function (resp: AnsonMsg<AnDatasetResp>) {
			if (component)
				component.setState({forest: resp.Body().forest});
		}

		Semantier.stree(opts, this.client, onload, this.errCtx);
	}

	rebuildTree(opts: DatasetOpts, onOk: (resp: any) => void) {
		let {uri, rootId} = opts;
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
	 * TODO: All widgets should bind data by themselves, so the helper of DatasetCombo shouldn't exits.
	 * Once the Autocomplete is replaced by DatasetCombo, that function should be removed.
	 *
	 * @param opts options
	 * - opts.sk: semantic key (dataset id)
	 * - opts.sqlArs: arguments for sql
	 * - opts.cond: the component's state.conds[#] of which the options need to be updated
	 * - opts.nv: {n: 'name', v: 'value'} option's name and value, e.g. {n: 'domainName', v: 'domainId'}
	 * - opts.onLoad: on done event's handler: function f(cond)
	 * - opts.onAll: no 'ALL' otion item
	 * - errCtx: error handling context
	 * @return this
	 *
	 * @example
		let ctx = this.context as AnContextType;
		let an = ctx.uiHelper as AnReactExt;
		an.ds2cbbOptions({uri, sk, noAllItem,
			onLoad: (cols, rows) => {
				this.loading = false;
				if (onDone)
					onDone(cols, rows);
			});
	 */
	ds2cbbOptions(opts: { uri: string; sk: string; sqlArgs?: string[];
				  nv: NV | undefined;
				  onLoad?: OnLoadOk<NV>;
				  /**don't add "-- ALL --" item */
				  noAllItem?: boolean; } ): AnReactExt {
		let {uri, sk, sqlArgs, nv, onLoad, noAllItem} = opts;
		if (!uri)
			throw Error('Since v0.9.50, uri is needed to access jserv.');

		nv = nv || {n: 'name', v: 'value'};

		// let loading = true;

		this.dataset( {
				port: 'dataset',
				uri,
				sqlArgs,
				// ssInf: this.client.ssInf,
				sk },
			(dsResp) => {
				let rs = dsResp.Body().Rs();
				if (nv.n && !AnsonResp.hasColumn(rs, nv.n))
					console.error("Can't find data in rs for cbb item's label - needing column: 'name'.",
						"Must provide nv with data fileds name when using ds2cbbOtpions(), e.g. opts.nv = {n: 'labelFiled', v: 'valueFiled'}",
						 "rs columns: ", rs?.colnames);

				let { cols, rows } = AnsonResp.rs2nvs( rs, nv );
				if (!noAllItem)
					rows.unshift(AnConst.cbbAllItem);
				// this.options = rows;

				// loading = false;

				if (onLoad)
					onLoad(cols, rows);
			} );
		return this;
	}
}
