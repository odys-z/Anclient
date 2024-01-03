import React from 'react';
import ReactDOM from 'react-dom';

import { AnsonMsg, AnsonResp, SessionClient } from '@anclient/semantier'
import { L, Langstrs, AnContext, AnError, AnReact, Login, jsample } from '@anclient/anreact';
import { Northprops } from './common/north';
import { Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => (Object.assign(
  jsample.jstyles(theme),
  { root: {
	    '& *': { margin: theme.spacing(1) }
	  },
  })
);

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component<Northprops> {
	state = {
		anClient: undefined,
		hasError: false,
		home: 'index.html',

		servId: undefined as string,
		jserv: '',

		err: undefined as string
	};

	constructor(props: Northprops) {
		super(props);

		this.state.servId = props.servId ? props.servId : 'host';
		this.state.jserv = props.servs ? props.servs[this.state.servId] : undefined,

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(c : string, r: AnsonMsg<AnsonResp>) {
		console.error(c, r);
		this.setState({hasError: !!c, err: r.Body().msg()});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	onLogin(client) {
		SessionClient.persistorage(client.ssInf);
		if (this.props.iparent) {
			let mainpage = client.ssInf.home || this.props.ihome;
			if (!mainpage)
				console.error('Login succeed, but no home page is found.');
			else {
				this.props.iparent.location = `${mainpage}?serv=${this.state.servId}`;
				this.setState({anClient: client});
			}
		}
	}

	render() {
		return (
			<AnContext.Provider value={{
				ssInf: undefined,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				anReact: undefined,
				iparent: parent,
				ihome: undefined,
				hasError: this.state.hasError,
				error: {onError: this.onError, msg: this.state.err},
			}} >
				<Login onLoginOk={this.onLogin}/>
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={true} msg={this.state.err} title={L('Error')} />}
			</AnContext.Provider>
		);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private/host.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * @param opts default: {serv: 'host', portal: 'index.html'}
	 * - serv: string,
	 * - portal: string
	 */
	static bindHtml(elem, opts = {}) {
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, opts, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
				<LoginApp servs={json} servId={opts.serv} iparent={opts.parent} ihome={opts.home} />, dom);
		}
	}
}
export {LoginApp};
