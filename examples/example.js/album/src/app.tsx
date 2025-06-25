import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, AnsonResp, AnsonMsg, 
	ErrorCtx, an, SessionClient} from '@anclient/semantier';

import { Langstrs, AnContext, AnReactExt, 
	ClientOptions, AnreactAppOptions, CrudCompW, SynDocollPort, Sys, SysComp, L,
	ExternalHosts,
	AnError
} from '@anclient/anreact';
import { AlbumDocview } from './views/album-docview';
import { AlbumShares } from './views/album-shares';

type AlbumProps = {
	servs: ExternalHosts;
	servId: string;

	/** album id */
	aid: string;

	iportal?: string;
	login?: string; // login page, for re-login target

	iparent?: any; // parent of iframe
	iwindow?: Window | undefined; // window object

	userid?: string;
	passwd?: string;

	clientOpts?: ClientOptions;
}

/**
 * Home page,
 * application main, context singleton and error handler
 */
export class App extends CrudCompW<AlbumProps> {
    // inclient: Inseclient;

	anReact: AnReactExt | undefined;  // helper for React

	error: ErrorCtx;

	// servs: ExternalHosts;

	config = {
		/** json object specifying host's urls */
		servs: {} as ExternalHosts,
		/** the serv id for picking url */
		servId: ''
	};

	state = {
		hasError: false,
		showingDocs: false,
		sk: undefined,
		nextAction: undefined as string | undefined
	};

	editForm : undefined;
	ssclient : SessionClient | undefined;

	synuri: string;

	portfolioMenu = [
		{node: {funcId: 'home-list', id: 'home-list', funcName: "Welcome", text: '', url: '/home', css: {icon: 'home'}, sort: 0}},
		{node: {funcId: 'shares', id: 'shares', funcName: "Share Resource", text: '', url: '/share', css: {icon: 'share'}, sort: 1}} ];

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.uri = "/album/sys";
		this.synuri = "/album/syn";

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.error   = {onError: this.onError, msg: ''};
		this.config.servId = props.servId;
		this.config.servs = props.servs;
		// this.servs = props.servs;


		// this.inclient = new Inseclient({urlRoot: this.servs.syndomx[this.props.servId]});
		this.state.nextAction = 're-login',

        // DESIGN NOTES: extending ports shall be an automized processing
		AnReactExt.ExtendPort(SynDocollPort);

		SysComp.extendLinks( [
			{path: '/home', comp: AlbumDocview},
			{path: '/share', comp: AlbumShares},
		] );
	}

	componentDidMount() {
		console.log(this.uri);
		if (!this.uri)
			console.warn("Application's uri is forced required since 0.9.105 for semantic.jserv 1.5.0.");

		// const ctx = this.context as unknown as AnContextType;
		if (this.props.userid && this.props.passwd) 
			// can happen in debug mode
			this.login();
		else {
			// try restore session from localStorage
			this.ssclient = new SessionClient();
			console.log(this.ssclient.ssInf);
			this.anReact = new AnReactExt(this.ssclient, this.error)
			this.setState({});
		}
	}

	login() {
		let hosturl = this.config.servs.syndomx && this.config.servs.syndomx[this.config.servId] as string;
		// for Synode 0.7.1, use syndomx[servId] as hosturl
		if (this.servs.syndomx && hosturl && this.servs.syndomx.hasOwnProperty(hosturl)) {
			hosturl = (this.servs.syndomx as any)[hosturl] || hosturl;
		}

		if (hosturl === undefined || !hosturl.startsWith('http')) {
			console.error(this.servs);
			throw new Error(`No jserv-root configured for ${this.config.servId} in AnContext. Check private/host.json.`);
		}

		let {userid, passwd} = this.props;

		let that = this;
		let loggedin = (client: SessionClient) => {
			that.ssclient = client;

			that.anReact = new AnReactExt(client, that.error);
			that.setState({});
		}

		console.warn("Auto login with configured host-url, userid & passwd.",
					 hosturl, userid, `${passwd?.substring(0, 2)} ...`);
		an.init ( hosturl );
		an.loginWithUri( this.uri, userid as string, passwd as string, loggedin, this.error );
	}

	render() {
		return (this.ssclient &&
		  <AnContext.Provider value={{
			  servId    : this.config.servId,
			  servs     : this.props.servs,
			  anClient  : this.ssclient as SessionClient,
			  uiHelper  : this.anReact,
			  hasError  : this.state.hasError,
			  iparent   : this.props.iparent,
			  ihome     : this.props.iportal || 'portal.html',
			  error     : this.error,
			  ssInf     : undefined,
			  host_json : 'private/host.json',
			  clientOpts: this.props.clientOpts,
			  onFullScreen: (isfull: boolean) => {
				if (this.props.clientOpts?.platform === 'android'
					&& typeof (window as any).AndroidInterface !== 'undefined'
					&& (window as any).AndroidInterface.onEvent) 

					(window as any).AndroidInterface.onEvent(isfull);
			}
		  }} >
			<Sys msHideAppBar={0} tree={this.portfolioMenu} landingUrl={'/home'}
				hideAppBar={this.props.clientOpts?.platform && this.props.clientOpts?.platform !== 'browser'}
				sys={L('Portfolio 0.7')} menuTitle={L('Sys Menu')}
				/>

			{ this.state.hasError &&
				<AnError onClose={this.onErrorClose} fullScreen={false}
					uri={this.uri} tier={undefined}
					title={L('Error')} msg={this.error.msg || ''} /> }
		  </AnContext.Provider>
		|| <></>);
	}

	onError(code: string, rsp: AnsonMsg<AnsonResp> | undefined ) {
		console.error(code, rsp?.Body()?.msg(), rsp);

		this.error.msg = rsp?.Body()?.msg() || code;
		this.state.hasError = !!code;
		this.state.nextAction = code === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		this.setState({});
	}

	onErrorClose() {
        this.state.hasError = false;

		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}

		this.setState({});
	}

	/** For navigate to portal page
	 * FIXME this should be done in SysComp, while firing goLogoutPage() instead.
	 * */
	logout() {
		let that = this;
		// leaving
		try {
			this.ssclient?.logout(
				() => {
					if (this.props.iwindow)
						this.props.iwindow.location.href = this.props.iportal || '#';
				},
				{ onError: (c: any, e: any) => {
					// something wrong
					cleanup (that);
				} } );
		}
		catch(_) {
			cleanup (that);
		}
		finally {
			this.context.anClient = undefined;
			this.ssclient = undefined;
		}

		function cleanup(app: App) {
			if (app.context.anClient)
				localStorage.setItem(SessionClient.ssInfo, null as any);
			if (app.props.iwindow)
				app.props.iwindow.location = app.context.iportal;
		}
	}

	/**
	 * Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * @param opts default: {serv: 'host', portal: 'index.html', album: 'aid'}
	 * - serv: string,
	 * - portal: string
	 */
	static bindHtml(elem: string,
					opts: AnreactAppOptions & {aid: string, uid: string, pswd: string, platform?: string}) {
		let portal = opts.portal ?? 'index.html';
		let login  = opts.login ?? 'login.html';
		let { aid, uid, pswd, clientOpts } = opts;
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: ExternalHosts) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
			  <App servs={json} servId={opts.serv || 'album'} clientOpts={clientOpts}
				aid={aid} iportal={portal} login={login} iwindow={window}
				userid={uid} passwd={pswd}
			  />, dom);
		}
	}
}
