
import $ from 'jquery';

import * as CSS from 'csstype';
import { stree_t, SessionClient, AnsonResp, AnDatasetResp, ErrorCtx,
	AnsonMsg, OnCommitOk, DatasetOpts, AnsonBody, AnResultset, InvalidClassNames,
	NV, OnLoadOk, Semantier, PageInf, AnlistColAttrs
} from '@anclient/semantier';

import { AnConst } from '../utils/consts';
import { Comprops, CrudComp } from './crud';
import { CSSProperties } from '@material-ui/styles/withStyles/withStyles';
import { JsonServs } from './reactext';

export interface ClassNames {[c: string]: string};

export interface Media { isLg?: boolean; isMd?: boolean; isSm?: boolean; isXs?: boolean; isXl?: boolean; };

export type GridSize = 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Find out hide an element or not for the grid setting and media width.
 *
 * TIP: to avoid ReactJS reporting warning like this:
 *
 * Invalid prop supplied to `ForwardRef(Grid)`, expected a ReactNode,
 *
 * do not return boolean in render() like this:
 *
 * <Grid>hide(col.grid, this.props.media) || <></></Grid>
 *
 * @param grid
 * @param media
 * @returns expample:
 *
 * grid {xs: false, sm: false}
 *
 * for
 * media {xs: true, sm: true, md: true}, will return false
 *
 * for
 * media {xs: true, sm: true, md: false}, will return true
 */
export function hide(grid: {
		xs?: boolean | GridSize; sm?: boolean | GridSize;
		md?: boolean | GridSize; lg?: boolean | GridSize; },
		media: Media = {}) {
	let {isXl, isLg, isMd, isSm, isXs} = media;
	return (
	 	grid.lg === false && !isXl && (isLg || isMd || isSm || isXs)
	 || grid.md === false && !isLg && !isXl && (isMd || isSm || isXs)
	 || grid.sm === false && !isMd && !isLg && !isXl && (isSm || isXs)
	 || grid.xs === false && !isSm && !isMd && !isLg && !isXl && isXs
	);
}

/**
 * Component's visual options, e.g. options for field formatters.
 */
export interface CompOpts {
	classes?: ClassNames;
	media?: Media;
}

export interface QueryPage {
	pageInf?: PageInf;
	query?: AnlistColAttrs<JSX.Element, any>[];
}

export function toPageInf(query: QueryPage) : PageInf {
	let p = new PageInf(query.pageInf.page, query.pageInf.size);
	query.query?.forEach( (q, x) => {
		p.nv(q.field, typeof q.val === 'string' ? q.val : q.val?.v);
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

export function toReactStyles(styles: CSS.Properties ) {
// export function toReactStyles(styles: CSSStyleDeclaration | undefined): CSSProperties {
	return styles as unknown as CSSProperties;
}

/** React helpers of AnClient
 * AnReact uses AnContext to expose session error. So it's helpful using AnReact
 * in an An-React application (which handle error in top level).
 */
export class AnReact {

	/**
	 * @deprecated This pattern is planned to be deprecated in the future of 0.4.35,
	 * because this instance will be a redundant one of the tier.client and will cause trouble like ssinf lost.
	 */
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
			let rs = qrsp.Body().Rs();
			let {rows} = AnsonResp.rs2arr( rs );
			comp.setState({rows});
		}, errCtx );
	}

	/**
	 * Post a request, qmsg.req of AnsonMsg, to jserv.
	 * If suceed, call qmsg.onOk (onLoad) or set rs' rows in respons to component's state.
	 * This is a helper of simple form load & bind a record.
	 */
	bindStateRec( qmsg: { onOk?; onLoad?; req?; }, errCtx: ErrorCtx,
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

	/**
	 * Try two step of loading host.json.
	 * First try ./private/host.json<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 * 
	 * If one of the resource is loaded, call onJsonServ.
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} opts {serv, home, parent window}
	 * @param {function} onJsonServ function to render React Dom, i. e.
	 * @since 0.4.50
	 * @example
	 * // see Anclient/js/anreact/test/jsample/login-app.tsx
	 * (elem, json) => {
	 * 	let dom = document.getElementById(elem);
	 * 	ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
	 * }
	 *
	 * // see Anclient/js/anreact/test/jsample/app.tsx
	 * function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
	 * 	let dom = document.getElementById(elem);
	 * 	ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
	 * }
	 */
	static loadServs( elem: string, opts: AnreactAppOptions,
				onJsonServ: (elem: string, opts: AnreactAppOptions, json: JsonServs) => void) {

		if (!opts.serv) opts.serv = 'host';
		if (!opts.home) opts.home = 'main.html';

		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: opts.jsonPath || 'private/host.json',
			})
			.done( (json: JsonServs) => onJsonServ(elem, opts, json) )
			.fail( (_e: any) => {
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done((json: JsonServs) => onJsonServ(elem, opts, json))
				.fail( (e: { responseText: any; }) => { $(e.responseText).appendTo($('#' + elem)) } )
			} )
		}
	}

	/**
	 * @deprecated for the name is confusing. Use initPage() instead.
	 * @since 0.4.50
	 * @param elem 
	 * @param opts 
	 * @param onJsonLoaded 
	 * @returns 
	 */
	static bindDom( elem: string, opts: AnreactAppOptions,
				onJsonLoaded: (elem: string, opts: AnreactAppOptions, json: JsonServs) => void) {
		return AnReact.loadServs(elem, opts, onJsonLoaded);
	}
}

export interface AnreactAppOptions {
	/**
	 * @since 0.4.50, jserv services from host.json.
	 * Sometimes a main page can login before context is aviliable.
	 */
	servs?: {[s:string]:string}
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

	/**
	 * Load jsample.serv dataset. (using DatasetReq or menu.serv).
	 * If opts.onOk is provided, will try to bind stree like this:
	 @example
	let onload = onOk || function (c, resp) {
		if (compont)
			compont.setState({stree: resp.Body().forest});
	}

	// usage:
	let that = this;
	let ds = {uri, sk: this.sk, t: 'tagtrees',
	  port?: 'optional-port-name', // default s-tree.serv
	  onOk: (e) => {
	    that.confirm = (<ConfirmDialog
			title={L('Info')}
			ok={L('OK')} cancel={false} open
			onOk={ that.del }
			onClose={() => {that.confirm = undefined;} }
			msg={L('Updating quiz teamplates finished!')}
	    />);
	    that.setState({});
	  }};
	this.context.uiHelper.stree(ds, this.context.error);

	 * @param opts dataset info {sk, sqlArgs, onOk}
	 * @param component
	 * @return this
	 */
	stree(opts: DatasetOpts, component: CrudComp<Comprops>): void {
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
			throw Error('opts.uri is required. Since v0.9.50, Anclient requests need client function uri to find datasource.');

		if (!rootId)
			console.warn('Rebuild tree without rootId ?');

		opts.port = 'stree';

		if (opts.sk && !opts.t) {
			console.error("Let's remove this lagacy of without type checking", opts.t, stree_t.retree);
			opts.t = stree_t.retree;
		}

		let onload = onOk || function (resp: any) {
			// console.log("Rebuilt successfully: ", resp);
		}

		this.dataset(opts, onload);
	}

	/**
	 * Bind dataset to combobox options (comp.state.condCbb).
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

				if (onLoad)
					onLoad(cols, rows);
			} );
		return this;
	}
}
