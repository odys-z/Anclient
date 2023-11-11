
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { StandardProps } from '@material-ui/core';

import { Protocol, SessionClient, ErrorCtx, 
	AnsonMsg, AnsonResp, an} from '@anclient/semantier';

import {
	L, Langstrs, AnContext, JsonServs,
	AnReact, AnReactExt, AnreactAppOptions, AnError,
	jsample, Sys, SysComp, Login
} from '@anclient/anreact';

import { JsampleTheme } from '@anclient/anreact/src/jsample/styles';
import { SharePolicies } from './views/share-policies';

const {MyInfCard, MyPswd} = jsample;

interface Approps extends StandardProps<any, string> {
	iwindow: Window;
	servs: JsonServs;
	servId?: string;
};

/** The application main, context singleton and error handler */
class Admin extends React.Component<Approps> {
	state = {
		servId: 'host',
		hasError: false,
		iportal: '#',

		loggedin: false
	};

	anClient: SessionClient;
	anReact: AnReact;

	errorMsgbox: JSX.Element | undefined;
	errorCtx: ErrorCtx;

	/**
	 * Application main entrance.
	 *
	 * Set up:
	 * - error context,
	 * - AnContext,
	 * - extend url link routes,
	 * - protocol sk of dataset.
	 *
	 * Also restore session from window.localStorage
	 *
	 * @param props
	 */
	constructor(props: Approps) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);

		this.errorCtx = {onError: this.onError, msg: ''};

		this.anClient = props.client;
		this.anReact = new AnReactExt(this.anClient, this.errorCtx);


		// singleton error handler
		if (!this.anClient || !this.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				loggedin: true,
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')
			});
		}
		else {
			this.state.loggedin = true;
			this.anReact = new AnReactExt(this.anClient, this.errorCtx)
				.extendPorts({
					menu     : "menu.serv",
					userstier: "users.tier",
					album    : "album.less",
				});

			// loaded from dataset.xml
			this.anClient.getSks((sks) => {
				Object.assign(Protocol.sk, sks);
				console.log(sks);
			}, this.errorCtx);
		}

		Protocol.sk = Object.assign( Protocol.sk, {
			//cbbOrg   : 'org.all', cbbRole  : 'roles',
			stree_sharings: 'tree-album-sharing'
		});

		// extending pages
		// Each Component is added as the route, with uri = path
		SysComp.extendLinks( [
			// {path: '/sys/domain', comp: Domain},
			// {path: '/sys/roles', comp: Roles},
			// {path: '/sys/orgs', comp: Orgs},
			// {path: '/sys/users', comp: Userst},
			// {path: '/tier/users', comp: Userst},
			{path: '/c/myconn', comp: SharePolicies},
		] );
	}

	onError(c: string, r: AnsonMsg<AnsonResp>) {
		console.error(c, r);

		this.errorCtx.msg = r.Body()?.msg();
		this.errorMsgbox = <AnError
							onClose={() => this.onErrorClose(c)} fullScreen={false}
							title={L('Error')}
							msg={this.errorCtx.msg as string} />

		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose(code: string) {
		// if (code === Protocol.MsgCode.exSession) {
		// 	this.goPortal();
		// }
		this.errorMsgbox = undefined;
		this.setState({});
	}

	onLogin () {

	}

	/**
	 * For navigating to portal page
	goPortal() {
		if (this.props.iwindow)
			this.props.iwindow.location = this.state.iportal;
	}
	 * */

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				ssInf : undefined,
				servId: this.state.servId,
				servs : this.props.servs,
				anClient: this.anClient,
				uiHelper: this.anReact,
				hasError: this.state.hasError,
				iparent : this.props.iparent,
				ihome: "#", // this.props.iportal || 'portal.html',
				error: this.errorCtx,
			}} >
			  { !this.state.loggedin ?
				<Login onLogin={this.onLogin} config={{userid: '', pswd: '123456'}}/>
				:
				<Sys menu='sys.menu.jsample'
					landingUrl='/c/myconn'
					sys={L('Album 0.3')} menuTitle={L('Menu')}
				/>
			  }
			  { this.errorMsgbox }
			</AnContext.Provider>
		</MuiThemeProvider>);

		/**
		 * Create MyInfCard.
		 * To avoid create component before context avialable, this function need the caller' context as parameter.
		 * @param anContext
		function myInfoPanels(anContext: AnContextType) {
			return [
				{ title: L('Basic'),
				  panel: <MyInfCard
							uri={'/sys/session'} anContext={anContext}
							ssInf={that.anClient.ssInf} /> },
				{ title: L('Password'),
				  panel: <MyPswd
							uri={'/sys/session'} anContext={anContext}
							ssInf={that.anClient.ssInf} /> }
			  ];
		}
		 */
	}

	/**
	 * This function automatically login, then load app dom. Since jserv-root is not got via login,
	 * this 
	 * @param uid 
	 * @param pswd 
	 * @param jservRoot e.g. http://localhost:8081/jserv-album 
	 * @param elem 
	 * @param opts 
	 */
	static bindHtml(uid: string, pswd: string,
					elem: string, opts: AnreactAppOptions) : void {
		AnReact.initPage(elem, opts, login);

		function onJsonServ(elem: string, opts: AnreactAppOptions & {client: SessionClient}, json: JsonServs) {
			let portal = opts.portal || 'index.html';
			let dom = document.getElementById(elem);
			ReactDOM.render(<Admin client={opts.client} servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
		
		function login(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let jserv = json[opts.serv || 'host'];
			an.init(jserv)
			  .login( uid, pswd,
				(client: SessionClient) => {
					onJsonServ(elem, Object.assign(opts, {client}), json);
				},
				{onError: (c, r) => { console.error(c, r); }} );
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export {Admin};