
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, SessionClient, ErrorCtx, SessionInf,
	AnsonMsg, AnsonResp
} from '@anclient/semantier';

import { L, Langstrs } from '../../../anreact/src/utils/langstr';
import { AnContext, AnContextType, JsonServs } from '../../../anreact/src/react/reactext';
import { AnReact, AnReactExt, AnreactAppOptions } from '../../../anreact/src/react/anreact';
import { AnError } from '../../../anreact/src/react/widgets/messagebox';
import { Sys, SysComp } from '../../../anreact/src/react/sys';
import { Userst } from '../../../anreact/src/jsample/views/users';
import { Domain } from '../../../anreact/src/jsample/views/domain';
import { Roles } from '../../../anreact/src/jsample/views/roles';
import { Orgs } from '../../../anreact/src/jsample/views/orgs';

import { StandardProps } from '@material-ui/core';
import { JsampleTheme } from '../../../anreact/src/jsample/styles';
import { MyInfCard } from '../../../anreact/src/jsample/views/my-infcard';
import { MyPswd } from '../../../anreact/src/jsample/views/my-pswdcard';

interface Approps extends StandardProps<any, string> {
	iwindow: Window;
	servs: JsonServs;
	servId?: string;
};

/** The application main, context singleton and error handler */
class App extends React.Component<Approps> {
	state = {
		servId: 'host',
		hasError: false,
		iportal: 'portal.html',
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
		this.onLogout = this.onLogout.bind(this);

		this.errorCtx = {onError: this.onError, msg: ''};
		// Will load anclient from localStorage.
		this.anClient = new SessionClient();
		this.anReact = new AnReactExt(this.anClient, this.errorCtx);
								// .extendPorts(StarPorts);

		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogout = this.onLogout.bind(this);


		// singleton error handler
		if (!this.anClient || !this.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')
			});
		}

		this.anReact = new AnReactExt(this.anClient, this.errorCtx)
						.extendPorts({
							menu: "menu.serv",
							userstier: "users.tier",
							gpatier: "gpa.tier",
							mykidstier: "mykids.tier"
						});

		// loaded from dataset.xml
		this.anClient.getSks((sks) => {
			Object.assign(Protocol.sk, sks);
			console.log(sks);
		}, this.errorCtx);

		Protocol.sk.xvec = 'x.cube.vec';
		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';
		Protocol.sk.cbbMyClass = 'north.my-class';
		console.log(Protocol.sk);

		// extending pages
		// Each Component is added as the route, with uri = path
		SysComp.extendLinks( [
			{path: '/sys/domain', comp: Domain},
			{path: '/sys/roles', comp: Roles},
			{path: '/sys/orgs', comp: Orgs},
			{path: '/sys/users', comp: Userst},
			{path: '/tier/users', comp: Userst},
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
		if (code === Protocol.MsgCode.exSession) {
			this.onLogout();
		}
		this.errorMsgbox = undefined;
		this.setState({});
	}

	/**
	 * For navigate to portal page
	 */
	onLogout() {
		// let that = this;
		// // leaving
		// try {
		// 	this.anClient.logout(
		// 		() => {
		// 			if (this.props.iwindow)
		// 				this.props.iwindow.location = this.state.iportal;
		// 		},
		// 		{ onError: (c, e) => { cleanup (that); } }
		// 		);
		// }
		// catch(_) {
		// 	cleanup (that);
		// }
		// finally {
		// 	this.anClient.ssInf = undefined as unknown as SessionInf;
		// }

		// function cleanup(app: App) {
		// 	if (app.anClient.ssInf) {
		// 		localStorage.removeItem(SessionClient.ssInfo);
		// 		this.anClient.ssInf = undefined;
		// 	}
		// 	if (app.props.iwindow)
		// 		app.props.iwindow.location = app.state.iportal;
		// }
			if (this.props.iwindow)
				this.props.iwindow.location = this.state.iportal;
	}

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				ssInf: undefined,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.anClient,
				uiHelper: this.anReact,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.errorCtx,
			}} >
				<Sys menu='sys.menu.jsample'
					sys={L('AnReact')} menuTitle={L('Sys Menu')}
					myInfo={myInfoPanels}
					onLogout={this.onLogout} />
				{this.errorMsgbox}
			</AnContext.Provider>
		</MuiThemeProvider>);

		/**
		 * Create MyInfCard.
		 * To avoid create component before context avialable, this function need the caller' context as parameter.
		 * @param anContext
		 */
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
	}

	/**
	 * Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * [opts.serv='host'] serv id
	 * [opts.iportal='index.html'] page showed after logout
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions) : void {
	// static bindHtml(elem: string, opts: {serv: string, portal?: string}) : void {
		let portal = opts.portal || 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export {App};
