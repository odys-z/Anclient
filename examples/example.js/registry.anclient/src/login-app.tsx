import React from 'react';
import ReactDOM from 'react-dom';

import { AnsonMsg, AnsonResp, SessionClient, SessionInf } from '@anclient/semantier';
import { L, Langstrs, AnContext, AnError, AnReact, Login,
	AnreactAppOptions, ExternalHosts, JsonHosts, jsample } from '@anclient/anreact';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export interface LoginAppProps {
	servs: ExternalHosts;
	servId: string;
	/** window to be redirected after login, e.g. parent of the iframe */
	iparent?: Window;
	/** main page */
	ihome?: string;
}

/**
 * Registry Anclient login page: logs in to jserv, persists the session into localStorage,
 * then redirects to the main page.
 */
export class LoginApp extends React.Component<LoginAppProps> {
	/** Function uri. Must be mapped by jserv's connects.xml/conn-uri. */
	uri = '/sys/registry.anclient';

	state = {
		hasError: false,
	};

	errCtx = {
		msg: '',
		onError: (c: string, r: AnsonMsg<AnsonResp>) => this.onError(c, r),
	};

	constructor(props: LoginAppProps) {
		super(props);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(code: string, rsp: AnsonMsg<AnsonResp>) {
		console.error(code, rsp);
		this.errCtx.msg = rsp?.Body()?.msg() || code;
		this.setState({hasError: !!code});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	onLogin(client: { ssInf: SessionInf & {home?: string} }) {
		SessionClient.persistorage(client.ssInf);

		let mainpage = client.ssInf.home || this.props.ihome || 'index.html';
		let target = this.props.iparent || window;
		target.location.href = `${mainpage}?serv=${this.props.servId}`;
	}

	render() {
		return (
		<MuiThemeProvider theme={jsample.JsampleTheme}>
		  <AnContext.Provider value={{
			pageOrigin: window ? window.origin : 'localhost',
			servId    : this.props.servId,
			servs     : this.props.servs as unknown as JsonHosts,
			anClient  : undefined as unknown as SessionClient,
			uiHelper  : undefined,
			ssInf     : undefined,
			hasError  : this.state.hasError,
			iparent   : this.props.iparent,
			ihome     : this.props.ihome || 'index.html',
			error     : this.errCtx,
			host_json : 'private/host.json',
		  }} >
			<Paper elevation={3} style={{maxWidth: 560, margin: '10vh auto', padding: 24}}>
				<Typography variant='h5'>{L('Registry Anclient')}</Typography>
				<Typography variant='body2' color='textSecondary' gutterBottom>
					{L('Please login')}
				</Typography>
				<Login uri={this.uri} onLogin={this.onLogin} config={{}} />
			</Paper>

			{this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				title={L('Error')} msg={this.errCtx.msg} />}
		  </AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
	 * Load jserv urls (private/host.json, then github.json), then render into html element.
	 * @param elem html element id
	 * @param opts serv: key in the json, default 'host'; home: main page; parent: window to redirect
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {}) {
		try { Langstrs.load('res-vol/lang.json', navigator.language); } catch (e) {}

		AnReact.bindDom(elem, opts, (elem: string, opts: AnreactAppOptions, json: JsonHosts) => {
			ReactDOM.render(
				<LoginApp servs={json as unknown as ExternalHosts} servId={opts.serv || 'host'}
					iparent={opts.parent} ihome={opts.home} />,
				document.getElementById(elem));
		});
	}
}
