import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from "@material-ui/core/styles";

import {SessionClient} from '../../lib/anclient.js'
	import { Protocol } from '../../lib/protocol.js'
	import {L, Langstrs} from '../../lib/frames/react/utils/langstr.js'
	import { Sys, SysComp } from '../../lib/frames/react/sys.jsx';
	import { AnContext, AnError } from '../../lib/frames/react/reactext.jsx'
	import { AnReactExt } from '../../lib/frames/react/anreact.jsx'

// tests extents
import { samports } from '../jsample.js'
	import { Domain } from './views/domain'
	import { Roles } from './views/roles'
	import { Orgs } from './views/orgs'
	import { Users } from './views/users'
	import { JsampleTheme } from './styles'

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

	/**Restor session from window.localStorage
	 */
	constructor(props) {
		super(props);

		this.state.samports = Object.assign(Protocol.Port, samports);
		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		// design: will load anclient from localStorage
		this.state.error = {onError: this.onError, msg: ''};
		this.state.anClient = new SessionClient();
		this.state.anReact = new AnReactExt(this.state.anClient, this.state.error)
								.extendPorts(samports);

		// singleton error handler
		if (!this.state.anClient || !this.state.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				err: L('Creating session failed! Please re-login.')});
		}

		// extending CRUD pages
		SysComp.extendLinks( [
			{path: '/views/sys/domain/domain.html', comp: Domain},
			{path: '/views/sys/role/roles.html', comp: Roles},
			{path: '/views/sys/org/orgs.html', comp: Orgs},
			{path: '/views/sys/user/users.html', comp: Users}
		] );
	}

	onError(c, r) {
		console.error(c, r);
		this.setState({hasError: !!c, nextAction: 're-login'});
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
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				// FIXME we should use a better way
				// https://reactjs.org/docs/legacy-context.html#how-to-use-context
				samports: this.state.samports, // FXIME or Protocol?
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
				<Sys onLogout={this.logout}/>
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
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}
}

export {App};
