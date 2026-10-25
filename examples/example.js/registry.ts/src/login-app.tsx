import React from 'react';
import { createRoot } from 'react-dom/client';

import { AnsonMsg, AnsonResp, SessionClient, SessionInf } from '@anclient/semantier';
import { L, Langstrs, AnContext, AnError, AnReact, Login,
	AnreactAppOptions, ExternalHosts, JsonHosts, jsample } from '@anclient/anreact';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { Signup } from './views/signup';
import { SignupResp } from './common/registry';

export interface LoginAppProps {
	servs: ExternalHosts;
	servId: string;
	/** window to be redirected after login, e.g. parent of the iframe */
	iparent?: Window;
	/** main page */
	ihome?: string;
}

/**
 * Registry Client login page: logs in to jserv, persists the session into localStorage,
 * then redirects to the main page.
 *
 * New users sign up on the same page (views/signup.tsx, the central's signup.serv), as the
 * domain admin of a new community, then log in.
 */
export class LoginApp extends React.Component<LoginAppProps> {
	/** Function uri. Must be mapped by jserv's connects.xml/conn-uri. */
	uri = '/sys/registry.ts';

	state = {
		hasError: false,
		/** showing the sign-up form */
		signingUp: false,
		/** the user just signed up, filled into the login form */
		signedUp: undefined as string | undefined,
	};

	errCtx = {
		msg: '',
		onError: (c: string, r: AnsonMsg<AnsonResp>) => this.onError(c, r),
	};

	constructor(props: LoginAppProps) {
		super(props);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.onSignup = this.onSignup.bind(this);
	}

	onSignup(rsp: SignupResp) {
		this.setState({signingUp: false, signedUp: rsp.uid});
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
				<Typography variant='h5'>{L('Registry Client')}</Typography>
			  {this.state.signingUp
			  ? <>
				<Typography variant='body2' color='textSecondary' gutterBottom>
					{L('Sign up a new community')}
				</Typography>
				<Signup uri={this.uri} servs={this.props.servs} servId={this.props.servId}
					errCtx={this.errCtx} onSignup={this.onSignup}
					onCancel={() => this.setState({signingUp: false})} />
				</>
			  : <>
				<Typography variant='body2' color='textSecondary' gutterBottom>
					{this.state.signedUp
					  ? L('Signed up: {uid}. Please login.', {uid: this.state.signedUp})
					  : L('Please login')}
				</Typography>
				<Login uri={this.uri} onLogin={this.onLogin} key={this.state.signedUp || 'login'}
					config={this.state.signedUp
						? {userid: this.state.signedUp, pswd: ''}
						: {userid: 'admin', pswd: '123456'}} />
				<Typography variant='body2' sx={{mt: 2}}>
					{L('New user?')}{' '}
					<Link component='button' variant='body2'
						onClick={() => this.setState({signingUp: true})}>{L('Sign up')}</Link>
				</Typography>
				</>}
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
			// React 19: createRoot(), ReactDOM.render() is removed
			createRoot(document.getElementById(elem) as HTMLElement).render(
				<LoginApp servs={json as unknown as ExternalHosts} servId={opts.serv || 'host'}
					iparent={opts.parent} ihome={opts.home} />);
		});
	}
}
