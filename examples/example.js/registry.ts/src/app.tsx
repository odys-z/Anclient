import React from 'react';
import { createRoot } from 'react-dom/client';

import { Protocol, AnsonMsg, AnsonResp, ErrorCtx, SessionClient } from '@anclient/semantier';
import { L, Langstrs, Sys, SysComp, AnContext, AnError, AnReactExt,
	AnreactAppOptions, ExternalHosts, ClientOptions, jsample
} from '@anclient/anreact';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { RegistryTsPorts } from './common/ports';
import { Home } from './views/home';
import { MarketOrgs } from './views/market-orgs';
import { OrgDomains } from './views/org-domains';
import { DomainSynodes } from './views/domain-synodes';
import { DeadDomains } from './views/dead-domains';
import { CentralProfile } from './common/registry';

export interface AppProps {
	servs: ExternalHosts;
	servId: string;

	/** portal (login) page, the target for logging out & re-login */
	iportal?: string;
	iwindow?: Window;
	iparent?: any;

	clientOpts?: ClientOptions;
}

/**
 * Registry Client main page:
 * the AnContext singleton, Sys frame (menu & routes) and the error handler.
 */
export class App extends React.Component<AppProps> {
	/** Function uri. Must be mapped by jserv's connects.xml/conn-uri. */
	uri = '/sys/registry.ts';

	state = {
		hasError: false,
		/** e.g. 're-login' */
		nextAction: undefined as string | undefined,
	};

	ssclient: SessionClient | undefined;
	anReact: AnReactExt | undefined;
	error: ErrorCtx;

	/** Menu items used when no menu dataset (sk) is loaded from jserv. */
	menuTree = [
		{node: {funcId: 'home', id: 'home', funcName: L('Home'), text: '', url: '/home', css: {icon: 'home'}, sort: 0}},
	];

	constructor(props: AppProps) {
		super(props);

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		this.error = {onError: this.onError, msg: ''};

		// restore the session persisted by LoginApp into window.localStorage
		this.ssclient = new SessionClient();
		this.anReact = new AnReactExt(this.ssclient, this.error);
		this.ssclient.an.understandPorts(RegistryTsPorts);

		if (!this.ssclient.ssInf) {
			this.state.hasError = true;
			this.state.nextAction = 're-login';
			this.error.msg = L('Setup session failed! Please re-login.');
		}

		// link pages to menu urls
		SysComp.extendLinks([
			{path: '/home', comp: Home},
			{path: '/market/orgs',    comp: MarketOrgs},
			{path: '/org/domains',    comp: OrgDomains},
			{path: '/domain/synodes', comp: DomainSynodes},
			{path: '/market/dead-domains', comp: DeadDomains},
		]);
	}

	/**
	 * Session timeout (exSession) or the central can't be reached (exIo):
	 * report and go back to the login page once the dialog is closed.
	 */
	onError(code: string, rsp: AnsonMsg<AnsonResp> | undefined) {
		console.error(code, rsp);
		this.error.msg = rsp?.Body()?.msg() || code;
		this.setState({
			hasError: !!code,
			nextAction: code === Protocol.MsgCode.exSession || code === Protocol.MsgCode.exIo
						? 're-login' : 'ignore'
		});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			// the session is invalid or the central is unreachable: no logout request
			this.logout(false);
		}
		this.setState({hasError: false});
	}

	/**
	 * Logout and navigate to the portal (login) page. Also called by SysComp.onLogout.
	 * @param remote false for only cleaning the local session (re-login)
	 */
	logout(remote: boolean = true) {
		let that = this;
		let portal = this.props.iportal || 'login.html';
		try {
			if (remote && this.ssclient?.ssInf)
				this.ssclient.logout(
					() => { if (that.props.iwindow) that.props.iwindow.location.href = portal; },
					{ onError: (_c: any, _e: any) => cleanup(that) } );
			else cleanup(that);
		}
		catch (_) { cleanup(that); }
		finally { this.ssclient = undefined; }

		function cleanup(app: App) {
			localStorage.removeItem(SessionClient.ssInfo);
			if (app.props.iwindow)
				app.props.iwindow.location.href = portal;
		}
	}

	render() {
		return (
		<MuiThemeProvider theme={jsample.JsampleTheme}>
		  <AnContext.Provider value={{
			pageOrigin: window ? window.origin : 'localhost',
			servId    : this.props.servId,
			servs     : this.props.servs as any,
			anClient  : this.ssclient as SessionClient,
			uiHelper  : this.anReact,
			ssInf     : this.ssclient?.ssInf,
			hasError  : this.state.hasError,
			iparent   : this.props.iparent,
			ihome     : this.props.iportal || 'login.html',
			error     : this.error,
			host_json : 'private/host.json',
			clientOpts: this.props.clientOpts,
		  }} >
			{this.ssclient?.ssInf &&
			<Sys uri={this.uri}
				menu={'sys.menu.central'}
				// the page to land on, decided by the central on login, see CentralProfile
				landingUrl={(this.ssclient?.ssInf?.profile as CentralProfile | undefined)?.home}
				sys={L('Registry Client')} menuTitle={L('Sys Menu')}
				onLogout={this.logout} />}

			{this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				uri={this.uri} tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} />}
		  </AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
	 * Load jserv urls (private/host.json, then github.json), then render into html element.
	 * @param elem html element id
	 * @param opts serv: key in the json, default 'host'; portal: login page
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {}) {
		let portal = opts.portal || 'login.html';
		try { Langstrs.load('res-vol/lang.json', navigator.language); } catch (e) {}

		AnReactExt.loadServs(elem, opts, (elem: string, opts: AnreactAppOptions, json: ExternalHosts) => {
			// React 19: createRoot(), ReactDOM.render() is removed
			createRoot(document.getElementById(elem) as HTMLElement).render(
				<App servs={json} servId={opts.serv || 'host'} iportal={portal}
					iwindow={window} clientOpts={opts.clientOpts} />);
		});
	}
}
