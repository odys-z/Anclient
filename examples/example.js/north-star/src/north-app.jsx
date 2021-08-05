import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from "@material-ui/core/styles";

import {
	an, AnClient, SessionClient, Protocol, L, Langstrs,
	AnContext, AnError, AnReactExt, Sys, SysComp
} from 'anclient';

import { Domain } from './test-app/views/domain';
import { Roles } from './test-app/views/roles';
import { Orgs } from './test-app/views/orgs';
import { Users } from './test-app/views/users';

import { NorthPorts } from './north-ports.js';
	import { Northeme } from './styles';
	import { Dashboard } from './views/dashboard';
	import { Indicators } from './views/indicators';
	import { MyStudents } from './views/my-students';

/** The application main.
 * "North" stands for the guardian.
 */
class NorthApp extends React.Component {
	state = {
		ports: Object.assign(Protocol.Port, {
			north: 'north.serv',
			menu: "menu.serv",
		}),

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

		// https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react
		require('react-dom');
		window.React2 = require('react');
		// console.log(window.React1 === window.React2);
		if (!window.React1)
			console.error("Add this line to node_moduls/react-dom/index.js :",
			"window.React1 = require('react');");
		else if (window.React1 !== window.React2)
			console.warn("Duplicate React reference. See",
			"https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react");

		// this.state.ports = Object.assign(Protocol.Port, northports);
		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		// design: will load anclient from localStorage
		this.state.error = {onError: this.onError, msg: ''};
		this.state.anClient = new SessionClient();
		this.state.anReact = new AnReactExt(this.state.anClient, this.state.error)
								.extendPorts(NorthPorts);

		// singleton error handler
		if (!this.state.anClient || !this.state.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')});
		}

		// extending CRUD pages
		SysComp.extendLinks( [
			{path: '/sys/domain', comp: Domain},
			{path: '/sys/roles', comp: Roles},
			{path: '/sys/orgs', comp: Orgs},
			{path: '/sys/users', comp: Users},
			{path: '/n/indicators', comp: Indicators},

			{path: '/n/dashboard', comp: Dashboard},
			{path: '/n/my-students', comp: MyStudents},
		] );
	}

	onError(c, r) {
		console.error(c, r);
		// this.setState({hasError: !!c, nextAction: 're-login'});
		this.setState({hasError: !!c,
			nextAction: c === Protocol.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}
	}

	/** For navigate to portal page */
	logout() {
		// leaving
		this.state.anClient.logout(
			() => {
				if (this.props.iwindow)
					this.props.iwindow.location = this.state.iportal;
			},
			(c, e) => {
				// something wrong
				console.warn('Logou failed', c, e)
				if (this.state.anClient)
        			localStorage.setItem(SessionClient.ssInfo, null);
				if (this.props.iwindow)
					this.props.iwindow.location = this.state.iportal;
			});
		this.state.anClient = undefined;
	}

	render() {
	  return (
		<MuiThemeProvider theme={Northeme}>
			<AnContext.Provider value={{
				// FIXME we should use a better way
				// https://reactjs.org/docs/legacy-context.html#how-to-use-context
				ports: this.state.ports,
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
				<Sys menu='sys.menu.north' sys={L('North Star')} onLogout={this.logout} />
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={false} />}
			</AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.json/<serv-id>,
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
		let portal = opts.portal ? opts.portal : 'portal.html';
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<NorthApp servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}
}

export {NorthApp};
