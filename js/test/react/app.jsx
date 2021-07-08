import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {SessionClient} from '../../lib/anclient.js'
	import {L, Langstrs} from '../../lib/frames/react/utils/langstr.js'
	import { Sys } from '../../lib/frames/react/sys.jsx';
	import { AnReact, AnContext, AnError } from '../../lib/frames/react/reactext.jsx'

/** The application main, context singleton and error handler */
class App extends React.Component {
	state = {
		anClient: undefined,
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login
	};

	/**Restor session from window.localStorage
	 */
	constructor(props) {
		super(props);

		this.state.iportal = this.props.iportal;
		// design: will load anclient from localStorage
		this.state.anClient = new SessionClient();

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);
	}

	componentDidMount () {
		if (!this.state.anClient || !this.state.anClient.ssInf) {
			this.setState({
				nextAction: 're-login',
				hasError: true,
				err: L('Creating session failed! Please re-login.')});
		}
	}

	onError() { }

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
		<AnContext.Provider value={{
			pageOrigin: window ? window.origin : 'localhost',
			servId: this.state.servId,
			servs: this.props.servs,
			jserv: this.state.jserv,
			anClient: this.state.anClient,
			hasError: this.state.hasError,
			iparent: this.props.iparent,
			iportal: this.props.iportal || 'portal.html',
			error: {onError: this.onError, msg: this.state.err},
		}} >
			<Sys onLogout={this.logout}/>
			{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={false} />}
		</AnContext.Provider>);
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
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}
}

export {App};
