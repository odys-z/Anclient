import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, SessionClient, Semantier, ErrorCtx, SessionInf } from '@anclient/semantier-st';

import { L, Langstrs,
	AnContext, AnError, AnReactExt,
	Sys, SysComp, jsample
} from '@anclient/anreact';
import { StandardProps } from '@material-ui/core';

const { Domain, Roles, Orgs, Userst, JsampleTheme } = jsample;

interface Approps extends StandardProps<any, string> {
	iwindow: Window;
};

/** The application main, context singleton and error handler */
class App extends React.Component<Approps> {
	state = {
		servId: 'host',
		anClient: undefined, // SessionClient
		anReact: undefined,  // helper for React
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login

		error: undefined,
	};
	errCtx: ErrorCtx;

	/**Restore session from window.localStorage
	 */
	constructor(props) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		// design: will load anclient from localStorage
		this.state.error = {onError: this.onError, msg: ''};
		this.state.anClient = new SessionClient();

		// singleton error handler
		if (!this.state.anClient || !this.state.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')
			});
		}

		this.state.anReact = new AnReactExt(this.state.anClient, this.state.error)
								.extendPorts({
									menu: "menu.serv",
									userstier: "users.tier",
									gpatier: "gpa.tier",
									mykidstier: "mykids.tier"
								});

		// loaded from dataset.xml
		this.state.anClient.getSks((sks) => {Object.assign(Protocol.sk, sks)});
		Protocol.sk.xvec = 'x.cube.vec';
		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';
		Protocol.sk.cbbMyClass = 'north.my-class';

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

	onError(c, r) {
		console.error(c, r);
		// this.setState({hasError: !!c, nextAction: 're-login'});
		this.state.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}
		this.setState({hasError: false})
	}

	/** For navigate to portal page
	 * FIXME this should be done in SysComp, while firing goLogoutPage() instead.
	 * */
	logout() {
		let that = this;
		// leaving
		try {
			this.state.anClient.logout(
				() => {
					if (this.props.iwindow)
						this.props.iwindow.location = this.state.iportal;
				},
				(c, e) => {
					// something wrong
					// console.warn('Logout failed', c, e)
					cleanup (that);
				});
		}
		catch(_) {
			cleanup (that);
		}
		finally {
			this.state.anClient = undefined;
		}

		function cleanup(app) {
			if (app.state.anClient)
				localStorage.setItem(SessionClient.ssInfo, null);
			if (app.props.iwindow)
				app.props.iwindow.location = app.state.iportal;
		}
	}

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				ssInf: undefined as SessionInf,
				// FIXME we should use a better way
				// https://reactjs.org/docs/legacy-context.html#how-to-use-context
				// samports: this.state.samports, // FXIME or Protocol?
				anReact: this.state.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				// jserv: this.state.jserv,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.errCtx,
			}} >
				<Sys menu='sys.menu.jsample'
					sys='AnReact' menuTitle='Sys Menu'
					myInfo={myInfoPanels}
					onLogout={this.logout} />
				{this.state.hasError &&
					<AnError onClose={this.onErrorClose} fullScreen={false}
							title={L('Error')} msg={this.errCtx.msg as string} />}
			</AnContext.Provider>
		</MuiThemeProvider>);

		/**Create MyInfCard.
		 * To avoid create component before context avialable, this function need the caller' context as parameter.
		 * @param {AnContext} anContext
		 */
		function myInfoPanels(anContext) {
			return [
				{ title: L('Basic'),
				  panel: <jsample.MyInfCard
							uri={'/sys/session'} anContext={anContext}
							ssInf={that.state.anClient.ssInf} /> },
				{ title: L('Password'),
				  panel: <jsample.MyPswd
							uri={'/sys/session'} anContext={anContext}
							ssInf={that.state.anClient.ssInf} /> }
			  ];
		}
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} [opts={}] serv id
	 * @param {string} [opts.serv='host'] serv id
	 * @param {string} [opts.iportal='portal.html'] page showed after logout
	 */
	static bindHtml(elem, opts = {portal: 'index.html'}) {
		let portal = opts.portal ? opts.portal : 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, opts, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export {App};
