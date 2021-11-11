import React from 'react';
import { StandardProps } from '@material-ui/core';
import ReactDOM from 'react-dom';
import { SessionClient } from '@anclient/semantier-st';
import { AnContext, AnError, AnReact, L, Login } from '@anclient/anreact';

const styles = (theme) => ({
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

interface LoginProps extends StandardProps<any, string> {
};

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component<LoginProps> {
	state = {
		anClient: undefined,
		hasError: false,
		home: 'index.html',
		servId: 'host',
	};

	servId: string;

	/** jserv root url */
	jserv: string;
	errCtx = {
		msg: '',
		onError: this.onError // .bind(this),
	};

	constructor(props) {
		super(props);

		this.servId = props.servId ? props.servId : 'host';
		this.jserv = props.servs ? props.servs[this.servId] : undefined,

		this.errCtx.onError = this.errCtx.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(c, r) {
		console.error(c, r);
		this.setState({hasError: !!c, err: r.msg()});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	onLogin(clientInf: { ssInf: { home: string; }; }) {
		SessionClient.persistorage(clientInf.ssInf);
		if (this.props.iparent) {
			let mainpage = clientInf.ssInf.home || this.props.ihome;
			if (!mainpage)
				console.error('Login succeed, but no home page be found.');
			else {
				this.props.iparent.location = `${mainpage}?serv=${this.state.servId}`;
				this.setState({anClient: clientInf});
			}
		}
	}

	render() {
		return (
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				ssInf: undefined,   // not need
				ihome: '',
				anReact: undefined, // not neeed
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				error: this.errCtx,
			}} >
				<Login onLoginOk={this.onLogin}/>
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={true} title={L('Error')} msg={this.errCtx.msg} />}
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
	 * @param {string} [opts.home='main.html'] system main page
	 * @param {Window} [opts.parent=undefined] parent window if for redirecting target
	 */
	static bindHtml(elem, opts = {}) {
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, opts, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
				<LoginApp servs={json} servId={opts.serv} iparent={opts.parent} ihome={opts.home} />, dom);
		}
	}
}
export {LoginApp};
