
import React from 'react';
	import { Theme, withStyles } from '@material-ui/core/styles';
	import Collapse from '@material-ui/core/Collapse';
	import Button from '@material-ui/core/Button';
	import TextField from '@material-ui/core/TextField';
	import Box from '@material-ui/core/Box';

import { AnClient, AnsonMsg, AnsonResp, OnCommitOk, OnLoginOk, Protocol } from '@anclient/semantier';

import { an, SessionClient } from '@anclient/semantier';
	import {AnContext, AnContextType} from './reactext';
	import {ConfirmDialog} from './widgets/messagebox'
	import {L} from '../utils/langstr'
	import {jstyles} from '../jsample/styles'
import { Comprops } from './crud';

const styles = (theme: Theme) => Object.assign(jstyles(theme), {
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

interface LoginProps extends Comprops {
	/** Providing a callback to handle login-ok event will override auto re-direction. */
	onLogin?: OnLoginOk;
	// onLogin: OnCommitOk;

	/** Default pswd and user-id, usually for debug. */
	config: {pswd?: string, userid?: string}
}

/**
 * Anclinet logging-in component
 * @class
 */
class LoginComp extends React.Component<LoginProps> {
    config = {
		loggedin: false,
		show: true,  // show textarear or only "login"
		pswd: '',
		userid: '',

		alert: '',
		showAlert: false,
		hasError: false,
		errHandler: {}
    };

	an: AnClient;
	ssClient: SessionClient;
	confirm: JSX.Element;

	state: {
		userId: string,
		pswd: string
	};

	/**
	 * Initialize an instance of Anclient with which visiting jserv service.
	 * @param props
	 * @param props.jserv e.g. "http://127.0.0.1:8080/jserv-quiz"); url to the jserv web root.
	 * @constructor
	 */
	constructor(props: LoginProps) {
		super(props);

		this.an = an;

		this.config = Object.assign(this.config, props.config);

		this.state = {userId: this.config.userid, pswd: this.config.pswd};

		// backward tolerence
		if (!props.onLogin && props.onLoginOk)
			throw Error("LoginProps.onLoginOk is renamed to onLogin");

		this.alert = this.alert.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.toLogin = this.toLogin.bind(this);
	}

	componentDidMount() {
		this.state.pswd = this.config.pswd;
		this.state.userId = this.config.userid;
	}

	alert() {
		let that = this;
		this.confirm = <ConfirmDialog ok={L('OK')} title={L('Info')} cancel={false}
					open={true} onClose={ () => { that.confirm = undefined; } }
					msg={ L('User Id or password is not correct.') } />
	}

	onErrorClose() {
	}

	/**
	 * Login and go main page (sys.jsx). Target html page is first specified by
	 * login.serv (SessionInf.home).
	 */
	toLogin() {
		let that = this;
		let uid = this.state.userId;
		let pwd = this.state.pswd;
		if (!uid || !pwd) {
			this.alert();
			return;
		}

		const ctx = this.context as unknown as AnContextType;

		if (!this.config.loggedin) {
			let serv = ctx.servId || 'host';
			let hosturl = ctx.servs[serv];
			console.log("login url & serv-id: ", hosturl, serv);

			an.init(hosturl);
			an.login( uid, pwd, reload, {onError} );
		}

		function reload (client: SessionClient) {
			that.ssClient = client;
			that.setState( {loggedin: true} );
			if (typeof that.props.onLogin === 'function')
				// that.props.onLoginOk(client);
				that.props.onLogin(client);
			else if (ctx.iparent) {
				ctx.ssInf = client.ssInf;
				SessionClient.persistorage(client.ssInf);
				// ctx.iparent.location = client.ssInf.home ?
				// 			client.ssInf.home : `${ctx.ihome}?serv=${ctx.servId}`;
				ctx.iparent.location = `${ctx.ihome}?serv=${ctx.servId}`;
			}
			else
				console.error('Logged in successfully but results be ignored: ', client);
		}

		function onError (code: string, resp: AnsonMsg<AnsonResp>) {
			console.log(an);
			if (typeof ctx.error === 'object') {
				let errCtx = ctx.error;
				errCtx.msg = resp.Body().msg();
				if (typeof errCtx.onError === 'function')
					errCtx.onError(code, resp);
			}
			else if (code === Protocol.MsgCode.exIo)
				console.error('Network Failed!');
			else if (resp.body[0])
				console.error(code + ': ' + resp.body[0].m);
			else console.error(resp);
		}
	}

	onLogout() {
		this.setState({ loggedin: false });
		if (typeof this.props.onLogout === 'function')
			this.props.onLogout();
	}

	update(val: any) {
		this.setState(val);
	}

	render() {
		let that = this;
		const { classes } = this.props;
		return (<div className={classes.root}>
			<Box display={!this.config.show ? "flex" : "none"}>
				<Button variant="contained" color="primary"
						style={{'whiteSpace': 'nowrap'}}
						onClick={() => { that.setState({show: !that.config.show}) } } >
					{this.config.show ? L('Cancel') : L('Login')}
				</Button>
			</Box>
			<Collapse in={this.config.show} timeout="auto" >
				<TextField className={classes.field2}
					autoFocus
					required id="userid" label={L("User Id")}
					autoComplete="username"
					defaultValue={this.config.userid}
					onChange={event => this.setState({userId: event.target.value})} />
				<TextField className={classes.field2}
					id="pswd" label={L("Password")}
					type="password"
					autoComplete="new-password"
					onKeyUp={(e) => {if (e.code === "Enter") that.toLogin();} }
					defaultValue={this.config.pswd}
					onChange={event => this.setState({pswd: event.target.value})} />
				<Button className={classes.field2}
					variant="contained"
					color="primary"
					onClick={this.toLogin} >{L('Login')}</Button>
			</Collapse>
			{this.confirm}
		</div>);
    }
}
LoginComp.contextType = AnContext;

const Login = withStyles(styles)(LoginComp);
export { Login, LoginComp, LoginProps };
