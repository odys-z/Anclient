import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { SessionClient } from '@anclient/semantier';
import { AnContext, AnError, AnReact, Login } from '@anclient/anreact';

const styles = (theme) => ({
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component {
	state = {
		anClient: undefined,
		hasError: false,
		home: 'index.html',
	};

	constructor(props) {
		super(props);

		this.state.servId = props.servId ? props.servId : 'host';
		this.state.jserv = props.servs ? props.servs[this.state.servId] : undefined,

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(c, r) {
		console.error(c, r);
		this.setState({hasError: !!c, err: r.msg()});
	}

	onErrorClose() {
	}

	onLogin(client) {
		SessionClient.persistorage(client.ssInf);
		if (this.props.iparent) {
			let mainpage = client.ssInf.home || this.props.ihome;
			if (!mainpage)
				console.error('Login succeed, but no home page be found.');
			else {
				this.props.iparent.location = `${mainpage}?serv=${this.state.servId}`;
				this.setState({anClient: client});
			}
		}
	}

	render() {
		return (
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				// FIXME why Login.context.iparent == undefined?
				// iparent: this.props.iparent,
				// ihome: this.props.ihome || 'index.html',
				error: {onError: this.onError, msg: this.state.err},
			}} >
				<Login onLoginOk={this.onLogin}/>
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={true} />}
			</AnContext.Provider>
		);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private/host.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} [opts={}] serv id
	 * @param {string} [opts.serv='host'] serv id
	 * @param {string} [opts.home='index.html'] system main page
	 * @param {Window} [opts.parent=undefined] parent window if for redirecting target
	 */
	static bindHtml(elem, opts = {}) {
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
				<LoginApp servs={json} servId={opts.serv} iparent={opts.parent} ihome={opts.home} />, dom);
		}
	}
}
export {LoginApp};