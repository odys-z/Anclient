import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode,
	SessionClient, DatasetOpts, LogAct, AnDatasetResp
} from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt,
	jsample, JsonHosts, Login, CrudComp, AnTreeditor, Lightbox
} from '../../../src/an-components';
import { AlbumTier } from './tiers/album-tier';
import { MuiThemeProvider } from '@material-ui/core/styles';

const { JsampleTheme } = jsample;

type LessProps = {
	servs: JsonHosts;
	servId: string;
	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: any; // window object
}

/**
 * Widgets Tests
 */
class WidgetsApp extends React.Component<LessProps> {
	/** {@link InsercureClient} */
	ssclient: SessionClient;
	anReact: AnReactExt;  // helper for React

	albumtier: TestreeTier;

	errctx: ErrorCtx;

	state = {
		hasError: false,
		/** Url of page provided in context for navigation when user logged out from main app. */
		iportal: 'portal.html',

		nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: undefined,
		/** the serv id for picking url */
		servId: '',

		reload: false
	};

	albumSk = 'tree-album-family-folder';
	rolefuncsk = 'trees.role_funcs';
	uri = '/album/tree';
	synuri = '/album/syn';

	constructor(props: LessProps | Readonly<LessProps>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;

		this.errctx = {onError: this.onError, msg: ''};

		this.state = Object.assign(this.state, {
			nextAction: 're-login',
			hasError: false,
			msg: undefined
		});

		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';

		/* this.ssclient = new Inseclient({urlRoot: this.state.servs[this.props.servId]});
		 *
		 * With SessionClient, AnClient.js won't work like this as the client need to be built after logged in.
		 *
			this.ssclient = new SessionClient();
			this.ssclient.an.init(this.state.servs[this.props.servId]);
			this.anReact  = new AnReactExt(this.ssclient, this.errctx)
								.extendPorts({album: 'album.less'});
			this.albumtier = new TestreeTier(this.albumUri);
		*/
	}

	onError(c: any, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body().msg(), r);
		this.errctx.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
		}
		this.setState({hasError: false});
	}

	onLogin(c: SessionClient): void {
		this.ssclient = c;
		this.ssclient.an.init(this.state.servs[this.props.servId]);

		this.anReact  = new AnReactExt(this.ssclient, this.errctx)
							// .extendPorts({album: 'album.less'});
							.extendPorts({docoll: 'docoll.syn'});

		this.albumtier = new TestreeTier(this.uri, this.synuri, this, c);

		this.setState({reload: true});
	}

	lightbox = (photos: AnTreeNode[], opts: {ix: number, open: boolean, onClose: (e: any) => {}}) => {
		return (<Lightbox photos={photos} showResourceCount tier={this.albumtier} {...opts} />);
	}

	render() {
	  let reload =this.state.reload;
	  this.state.reload = false;

	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.ssclient,
				uiHelper: this.anReact,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.errctx,
				ssInf: undefined,
			}} >
				<Login uri={this.uri} onLogin={this.onLogin} config={{userid: 'ody', pswd: '8964'}}/>
                {this.albumtier && Date().toString()}
				<hr/>
                {this.albumtier && <AnTreeditor key={this.albumSk}
					parent={undefined} lastSibling={false}
					uri={this.uri} docuri={this.synuri}
					reload={reload}
					tnode={this.albumtier.treeroot()} tier={this.albumtier}
					pk={'NA'} sk={this.albumSk}
					columns={[ // noly card for folder header
						{ type: 'text', field: 'pname', label: 'Folder',
						  grid: {xs: 6, sm: 6, md: 4} },
						{ type: 'icon-sum', field: '', label: L('Summary'),
						  grid: {sm: 6, md: 4} },
						{ type: 'text', field: 'text', label: L('Tags'),
						  grid: {sm: false, md: 3} },
						// { type: 'actions', field: 'NA', label: '', grid: {xs: 3, md: 3} }
					]}
					lightbox={this.lightbox}
					onSelectChange={undefined}
				/>}
				<hr/>
				{this.albumtier && <AnTreeditor key={this.rolefuncsk}
					parent={undefined} lastSibling={false}
					uri={this.uri} docuri={this.synuri}
					reload={reload}
					tnode={this.albumtier.sysroot()} tier={this.albumtier}
					pk={'NA'} sk={this.rolefuncsk}
					columns={[
						{ type: 'text', field: 'nodeId', label: '',
						  grid: {xs: 12, sm: 6, md: 3} },
						{ type: 'text', field: 'text', label: L('Name'),
						  grid: {xs: false, sm: 6, md: 3} },
					]}
					onSelectChange={undefined}
				/>}
				<hr/>
				{ this.state.hasError && <AnError
					title={L('Error')} msg={this.errctx.msg}
					uri={this.uri} tier={undefined}
				    fullScreen={false} onClose={this.onErrorClose} />}
			</AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
     * See ./less-app.tsx/App.bindHtml()
     */
	static bindHtml(elem: string, opts: { portal?: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		let portal = opts.portal ?? 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonHosts) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<WidgetsApp servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

class TestreeTier extends AlbumTier {
	sysroot(): AnTreeNode {
		return {
			type: "io.odysz.semantic.DA.DatasetCfg.AnTreeNode",
			node: {
				nodetype: 'card',
				shareby: 'tester'
			},
			id: 'n01',
			level: 0,
			parent: undefined,
		}
	}

	constructor(uri: string, synuri: string, tree: CrudComp<any>, client?: SessionClient) {
		super({
			uri, client, comp: tree,
			synuri
		});
		this.client = client;
	}

	/**
	 * Override super.stree(), print responsed forest.
	 * 
	 * @param opts 
	 * @param errCtx 
	 */
	override stree(opts: DatasetOpts & {act?: LogAct, uri?: string}, errCtx: ErrorCtx): void {
		let onOk = opts.onOk;
		opts.onOk = (resp: AnsonMsg<AnDatasetResp>) => {
			console.log({forest: resp.Body().forest});
			onOk(resp);
		}
		opts.synuri = this.synuri;
		super.stree(opts, errCtx);
	}

	treeroot(): AnTreeNode {
		return {
			type: "io.odysz.semantic.DA.DatasetCfg.AnTreeNode",
			node: {
				nodetype: 'card',
				shareby: 'tester'
			},
			id: 'p0',
			level: 0,
			parent: undefined,
		}
	}
}

export { WidgetsApp };
