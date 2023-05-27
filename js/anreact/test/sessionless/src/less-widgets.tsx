import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode, DatasetReq, DatasetOpts, UserReq, SessionClient } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, jsample, JsonServs, Login
} from '../../../src/an-components';
import { AnTreeditor2 } from './widgets/treeditor';
import { StreeTier } from './widgets/stree-tier';
import { Button } from '@material-ui/core';

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

	albumSk = 'tree-album-family-folder';
	albumUri = '/album/tree';

	constructor(props: LessProps | Readonly<LessProps>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;

		this.ssclient = new Inseclient({urlRoot: this.state.servs[this.props.servId]});

		this.errctx = {onError: this.onError, msg: ''};

		this.state = Object.assign(this.state, {
			nextAction: 're-login',
			hasError: false,
			msg: undefined
		});

		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';

		this.ssclient = new SessionClient();
		this.ssclient.an.init(this.state.servs[this.props.servId]);

		this.anReact  = new AnReactExt(this.ssclient, this.errctx)
							.extendPorts({album: 'album.less'});


		this.albumtier = new TestreeTier(this.albumUri);

		this.anReact = new AnReactExt(this.ssclient, this.errctx)
				// see jserv-sandbox
				.extendPorts({
					gallerytier: "gallerytree.less",
				});
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
	 * Login as test robot.
	 * @param _e 
	 */
	onLogin(_e: React.UIEvent): void {
		this.ssclient = new SessionClient(); // rebuild token
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
				<Login onLoginOk={this.onLogin} config={{userid: 'ody', pswd: '123456'}}/>
                <AnTreeditor2 parent={undefined}
					uri={this.albumUri} reload={reload}
					tnode={this.albumtier.treeroot()} tier={this.albumtier}
					pk={'NA'} sk={this.albumSk}
					columns={[
						{ type: 'text', field: 'folder', label: L('Folder'),
						  validator: {len: 200, notNull: true}, grid: {sm: 6} },
					]}
					onSelectChange={()=> undefined}
				/>
				<hr/>
				{this.state.hasError &&
					<AnError onClose={this.onErrorClose} fullScreen={false}
							uri={"/login"} tier={undefined}
							title={L('Error')} msg={this.errctx.msg} />}
				<hr/>
                {Date().toString()}
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

class TestreeTier extends StreeTier {

	constructor(uri: string) {
		super({uri, port: 'album'});
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
