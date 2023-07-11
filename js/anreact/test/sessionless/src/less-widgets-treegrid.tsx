import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode, SessionClient } from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt,
	jsample, JsonServs, Login, CrudComp, AnTreegrid
} from '../../../src/an-components';
import { AlbumTier } from './tiers/album-tier';
import { MuiThemeProvider } from '@material-ui/core/styles';

const { JsampleTheme } = jsample;

type LessProps = {
	servs: JsonServs;
	servId: string;
	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: any; // window object
}

/**
 * Widgets Tests
 */
class Widgets extends React.Component<LessProps> {
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

	doctreesk  = 'tree-dock-folder';
	uri = '/album/tree';

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

	/**
	 * Login as test robot, which is accutally a session based IUser instance.
	 * 
	 * Build AnClient & Semantier here, which is the same scenario of opening home page after logged in. 
	 * 
	 * TODO doc: this is another style of intitializing AnClient and SessionClient.
	 * 
	 * @param c instenct of AnClient.js
	 */
	onLogin(c: SessionClient): void {
		this.ssclient = c;
		this.ssclient.an.init(this.state.servs[this.props.servId]);

		this.anReact  = new AnReactExt(this.ssclient, this.errctx)
							.extendPorts({album: 'album.less'});

		this.albumtier = new TestreeTier(this.uri, this, c);

		this.setState({reload: true});
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
				<Login onLogin={this.onLogin} config={{userid: 'ody', pswd: '123456'}}/>
                {this.albumtier && Date().toString()}
				<hr/>
                {this.albumtier && <AnTreegrid key={this.doctreesk}
					parent={undefined} lastSibling={false}
					uri={this.uri} reload={reload}
					tier={this.albumtier}
					pk={'NA'} sk={this.doctreesk}
					columns={[ // noly card for folder header
						{ type: 'iconame', field: 'folder', label: L('Name'),
						  grid: {sm: 4, md: 2} },
						{ type: 'text', field: 'text', label: L('Summary'),
						  grid: {xs: false, sm: 4, md: 2} },
						{ type: 'text', field: 'text', label: L('Summary'),
						  grid: {xs: false, sm: 4, md: 2} },
						// { type: 'actions', field: 'NA', label: '', grid: {xs: 3, md: 3} }
					]}
					onSelectChange={undefined}
				/>}
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
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<Widgets servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
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
			},
			id: 'n01',
			level: 0,
			parent: undefined,
		}
	}

	constructor(uri: string, tree: CrudComp<any>, client?: SessionClient) {
		super({uri, client, comp: tree});
		this.client = client;
	}

	treeroot(): AnTreeNode {
		return {
			type: "io.odysz.semantic.DA.DatasetCfg.AnTreeNode",
			node: {
				nodetype: 'card',
			},
			id: 'p0',
			level: 0,
			parent: undefined,
		}
	}
}

export { Widgets };
