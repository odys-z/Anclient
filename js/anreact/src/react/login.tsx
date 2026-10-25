
import React from 'react';
import clsx from 'clsx';
	import { Theme } from '@mui/material/styles';
	import { withStyles } from './mui-compat';
	import Collapse from '@mui/material/Collapse';
	import Button from '@mui/material/Button';
	import TextField from '@mui/material/TextField';
	import Box from '@mui/material/Box';

import { AnClient, AnsonMsg, AnsonResp, OnLoginOk, Protocol, an, SessionClient } from '@anclient/semantier';

	import {AnContext, AnContextType, ExternalHosts, JsonHosts} from './reactext';
	import {ConfirmDialog} from './widgets/messagebox'
	import {L} from '../utils/langstr'
	import {jstyles} from '../jsample/styles'
import { Comprops } from './crud';
import { ClassNames } from './anreact';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

const styles = (theme: Theme) => Object.assign(jstyles(theme), {
	root: {
	    '& *': { margin: theme.spacing(1) },
		/* the user id and password boxes (and the button) on the same bottom line:
		 * no margins inside the inputs, e.g. the password's visibility button, which made
		 * the password box taller than the user id's */
		'& .MuiCollapse-wrapperInner': { display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' },
		'& .MuiInput-root *, & .MuiInputAdornment-root': { margin: 0 },
	},
	container: {
		maxWidth: "20vw",
		maxHeight: "20vh"
	},
	/** Layout for LoginProps.stacked: one column, fields and button at full width. */
	stacked: {
		'& .MuiCollapse-wrapperInner': {
			display: 'flex', flexDirection: 'column', gap: theme.spacing(1),
		},
		'& .MuiButton-root': { marginTop: theme.spacing(1.5) },
	}
});

interface LoginProps extends Comprops {
	/** Requried since Semantic.jserv 1.5.0 */
	uri: string;

	/** Providing a callback to handle login-ok event will override auto re-direction. */
	onLogin?: OnLoginOk;
	// onLogin: OnCommitOk;

	/** Default pswd and user-id, usually for debug. */
	config: {pswd?: string, userid?: string};

	/** Stack user id, password and the login button in one full-width column
	 * (for a login card), instead of the default inline row. */
	stacked?: boolean;
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
	ssClient?: SessionClient;
	confirm?: JSX.Element;

	state: {
		userId: string,
		pswd: string,
		showPswd?: boolean
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

		console.log(this.props.uri)
	}

	alert(classes: ClassNames) {
		let that = this;
		this.confirm = <ConfirmDialog className={classes.container}
			ok={L('OK')} title={L('Info')} cancel={false}
			open={true} onClose={ () => {
				that.confirm = undefined;
				// TODO verify in sessionless
				this.setState({});
			} }
			msg={ L('User Id or password is not correct.') } />
		// TODO verify in sessionless
		this.setState({});
	}

	onErrorClose() {
	}

	/**
	 * Login and go main page (sys.jsx). Target html page is first specified by
	 * login.serv (SessionInf.home).
	 */
	toLogin(classes : ClassNames) {
		let that = this;
		let uid = this.state.userId;
		let pwd = this.state.pswd;
		if (!uid || !pwd) {
			this.alert(classes);
			return;
		}

		const ctx = this.context as unknown as AnContextType;

		if (!this.config.loggedin) {
			let serv = ctx.servId || 'host';
			let hosturl = ctx.servs[serv] as string;

			if (ctx.servs.syndomx) {
				// @ts-ignore - Synode 0.7.1
				hosturl = ctx.servs.syndomx[serv] || hosturl;
			}
			if (hosturl === undefined || !hosturl.startsWith('http')) {
				console.error(ctx.servs);
				throw new Error(`No jserv-root configured for ${serv} in AnContext. Check private/host.json.`);
			}

			an.init(hosturl);
			// an.login( uid, pwd, reload, {onError} );
			an.loginWithUri(this.props.uri, uid, pwd, reload, {onError});
		}

		function reload (client: SessionClient) {
			that.ssClient = client;
			that.setState( {loggedin: true} );
			if (typeof that.props.onLogin === 'function')
				that.props.onLogin(client);
			else if (ctx.iparent) {
				ctx.ssInf = client.ssInf;
				SessionClient.persistorage(client.ssInf);
				ctx.iparent.location = `${ctx.ihome}?serv=${ctx.servId}`;
			}
			else
				console.error('Logged in successfully but results be ignored: ', client);
		}

		function onError (code: string, resp: AnsonMsg<AnsonResp>) {
			if (typeof ctx.error === 'object') {
				let errCtx = ctx.error;
				errCtx.msg = resp.Body()?.msg();
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

	render() {
		let that = this;
		let { classes, stacked } = this.props;
		classes = classes!;
		const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') that.toLogin(classes!); };
		return (<div className={stacked ? classes!.stacked : classes!.root}>
			<Box sx={{display: !this.config.show ? "flex" : "none"}}>
				<Button variant="contained" color="primary"
						style={{'whiteSpace': 'nowrap'}}
						onClick={() => { that.setState({show: !that.config.show}) } } >
					{this.config.show ? L('Cancel') : L('Login')}
				</Button>
			</Box>
			<Collapse in={this.config.show} timeout="auto" >
				<FormControl className={clsx(classes.margin, classes.textField)} fullWidth={stacked}>
					<InputLabel htmlFor="userid">{L("User Id")}</InputLabel>
					<Input 
						autoFocus required id="userid"
						onKeyUp={onEnter}
						// label={L("User Id")}
						autoComplete="username"
						defaultValue={this.config.userid}
						onChange={event => this.setState({userId: event.target.value})} />
				</FormControl>
				<FormControl className={clsx(classes.margin, classes.textField)} fullWidth={stacked}>
					<InputLabel htmlFor="pswd">{L("Password")}</InputLabel>
					<Input
						id="pswd"
						autoComplete="current-password"
						onKeyUp={onEnter}
						type={this.state.showPswd ? 'text' : 'password'}
						defaultValue = {this.config.pswd}
						onChange={event => this.setState({pswd: event.target.value})}
						endAdornment={
						<InputAdornment position="end">
							<IconButton size="small"
							aria-label="toggle password visibility"
							onClick={() => this.setState({ showPswd: !this.state.showPswd })}
							onMouseDown={(e) => e.preventDefault()}
							>
							{this.state.showPswd ? <Visibility /> : <VisibilityOff />}
							</IconButton>
						</InputAdornment>
						}
					/>
				</FormControl>
				{/* <Box alignItems="flex-end" className={classes!.field2} sx={{display: "flex"}}>
				<TextField className={classes!.field2}
					id="pswd" label={L("Password")}
					type={this.state.showPswd ? "text" : "password"}
					autoComplete="new-password"
					onKeyUp={(e) => {if (e.code === "Enter") that.toLogin(classes!);} }
					defaultValue={this.config.pswd}
					onChange={event => this.setState({pswd: event.target.value})}
				/>
				<IconButton className={classes!.field3}
					aria-label="toggle password visibility"
					onClick={() => this.setState({ showPswd: !this.state.showPswd })}
					onMouseDown={(e) => e.preventDefault()}
					// style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
				>
					{this.state.showPswd ? <VisibilityOff /> : <Visibility />}
				</IconButton>
				</Box> */}
				<Button className={stacked ? undefined : classes!.field2}
					fullWidth={stacked}
					variant="contained"
					color="primary"
					onClick={() => this.toLogin(classes!)} >{L('Login')}</Button>
			</Collapse>
			{this.confirm}
		</div>);
    }
}
LoginComp.contextType = AnContext;

const Login = withStyles(styles)(LoginComp);
export { Login, LoginComp, LoginProps };
