import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { L, Langstrs,
	Protocol, SessionClient,
	Sys, SysComp,
	AnContext, AnError, AnReactExt,
	jsample
} from 'anclient';
const { Domain, Roles, Orgs, Users, JsampleTheme, SsInfCard } = jsample;

import { StarPorts } from './common/port';

import { Dashboard } from './views/n/dashboard';
import { Indicators } from './views/n/indicators';
import { MyClassTree } from './views/n/my-classes';
import { Quizzes } from './views/n/quizzes';
import { Polls } from './views/n/polls';
import { MyStatus } from './views/c/status';
import { MyPolls } from './views/c/my-polls';

/** The application main, context singleton and error handler */
class App extends React.Component {
	state = {
		anClient: undefined, // SessionClient
		anReact: undefined,  // helper for React
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login

		error: undefined,
	};

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
		this.state.anReact = new AnReactExt(this.state.anClient, this.state.error)
								.extendPorts(StarPorts);

		// singleton error handler
		if (!this.state.anClient || !this.state.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')
			});
		}

		// extending CRUD pages
		SysComp.extendLinks( [
			{path: '/sys/domain', comp: Domain},
			{path: '/sys/roles', comp: Roles},
			{path: '/sys/orgs', comp: Orgs},
			{path: '/sys/users', comp: Users},
			{path: '/xv/indicators', comp: Indicators},
			{path: '/n/dashboard', comp: Dashboard},
			{path: '/n/indicators', comp: Indicators},
			{path: '/n/quizzes', comp: Quizzes },
			{path: '/n/polls', comp: Polls },
			{path: '/c/status', comp: MyStatus },
			{path: '/c/mypolls', comp: MyPolls }
		] );
	}

	onError(c, r) {
		console.error(c, r);
		// this.setState({hasError: !!c, nextAction: 're-login'});
		this.state.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}
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
				// FIXME we should use a better way
				// https://reactjs.org/docs/legacy-context.html#how-to-use-context
				// samports: this.state.samports, // FXIME or Protocol?
				anReact: this.state.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				jserv: this.state.jserv,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				iportal: this.props.iportal || 'portal.html',
				error: this.state.error,
			}} >
				<Sys menu='sys.menu.jsample'
					sys='AnReact' menuTitle='Sys Menu'
					myInfo={myInfoPanels('/sys')}
					onLogout={this.logout} />
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={false} />}
			</AnContext.Provider>
		</MuiThemeProvider>);

		function myInfoPanels(uri) {
			return [
				{title: L('Basic'),      panel: <SsInfCard uri={uri} ssInf={that.state.anClient.ssInf} />},
				// {title: L('My Classes'), panel: <MyClassTree />},
				{title: L('My Status'),  panel: <Typography>Tasks cleared!</Typography>}
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
	static bindHtml(elem, opts = {}) {
		let portal = opts.portal ? opts.portal : 'index.html';
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}
}

export {App};
