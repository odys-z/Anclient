import React from 'react';
import ReactDOM from 'react-dom';
import { AnsonMsg, AnsonResp, SessionClient } from '../../../semantier/anclient';
import { AnContext, AnError, AnReact, L, Login } from '../../../anreact/src/an-components';
import { Comprops } from '../../../anreact/src/react/crud';
import { AnreactAppOptions, JsonServs } from '../../../anreact/src/an-components';

const styles = (theme) => ({
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

interface LoginProps extends Comprops {
	servs: JsonServs;
	servId?: string;
};

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component<LoginProps> {
	state = {
		hasError: false,
		home: 'index.html',
		servId: 'host',
	};
	anClient: SessionClient;

	servId: string;

	/** jserv root url */
	jserv: string;
	errCtx = {
		msg: '',
		onError: this.onError
	};

	constructor(props: LoginProps) {
		super(props);

		this.servId = props.servId ? props.servId : 'host';
		this.jserv = props.servs[this.servId];

		this.errCtx.onError = this.errCtx.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(c : string, r: AnsonMsg<AnsonResp>) {
		console.error(c, r);
		this.setState({hasError: !!c, err: r.Body()?.msg()});
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
				ssInf: undefined,
				ihome: '',
				// anReact: undefined,
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.anClient,
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
	 * optional opts.serv='host': serv id
	 * optional opts.home='main.html': system main page
	 * optional opts.parent=undefined: parent window if for redirecting target
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {serv: 'localhost'}) {
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
				<LoginApp servs={json} servId={opts.serv} iparent={opts.parent} ihome={opts.home} />, dom);
		}
	}
}
export {LoginApp};
