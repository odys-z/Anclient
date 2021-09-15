import $ from 'jquery';

import React from 'react';
	import ReactDOM from 'react-dom';
	import { withStyles } from '@material-ui/core/styles';
	import Collapse from '@material-ui/core/Collapse';
	import Button from '@material-ui/core/Button';
	import TextField from '@material-ui/core/TextField';
	import FormControl from '@material-ui/core/FormControl';
	import Box from '@material-ui/core/Box';

import {an, SessionClient} from '../../semantier/anclient.js'
	import {Protocol} from '../../semantier/protocol'
	import {AnContext} from './reactext.jsx';
	import {ConfirmDialog} from './widgets/messagebox.jsx'
	import {L, Langstrs} from '../utils/langstr.js'

const styles = (theme) => ({
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

/**
 * Anclinet logging-in component
 * @class
 */
class LoginComp extends React.Component {
    state = {
		loggedin: false,
		pswd: '123456',
		userid: 'admin',

		alert: '',
		showAlert: false,
		hasError: false,
		errHandler: {}
    };

	/**
	 * initialize a instance of Anclient visition jserv service.
	 * @param {object} props
	 * @param {string} props.jserv e.g. "http://127.0.0.1:8080/jserv-quiz"); url to service root.
	 * @constructor
	 */
	constructor(props) {
		super(props);

		this.props = props;
		this.an = an.an;

		this.alert = this.alert.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	// componentDidMount() {
	// 	this.configServ(this.context);
	// 	return this;
	// }

	alert() {
		this.setState({
			alert: L('User Id or password is not correct.'),
			showAlert: true,
		});
	}

	onErrorClose() {
	}

	/**
	 * Login and go main page (sys.jsx). Target html page is first specified by
	 * login.serv (SessionInf.home).
	 */
	onLogin() {
		let that = this;
		console.log(that.context);
		let uid = this.state.userid;
		let pwd = this.state.pswd;
		// let _an = an;
		if (!uid || !pwd) {
			this.alert();
			return;
		}

		if (!this.state.loggedin) {
			an.init(this.context.servs[this.context.servId || 'host']);
			an.login( uid, pwd, reload, onError );
		}

		function reload (client) {
			that.ssClient = client;
			that.setState( {loggedin: true} );
			if (typeof that.props.onLoginOk === 'function')
				that.props.onLoginOk(client);
			else if (that.context.iparent) {
				// FIXME this branch can't work for npm package anclient.
				// FIXME but why?
				that.context.ssInf = client.ssInf;
				SessionClient.persistorage(client.ssInf);
				that.context.iparent.location = client.ssInf.home ?
							client.ssInf.home : `${that.context.ihome}?serv=${that.context.servId}`;
			}
			else
				console.error('login succeed but results be ignored: ', client);
		}

		function onError (code, resp) {
			console.log(an);
			if (typeof that.context.error === 'object') {
				let errCtx = that.context.error;
				errCtx.hasError = true;
				errCtx.code = code;
				errCtx.msg = resp.Body().msg();
				if (typeof errCtx.onError === 'function')
					errCtx.onError(code, resp.Body());
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

	update(val) {
		this.setState(val);
	}

	render() {
		const { classes } = this.props;
		return (<div className={classes.root}>
			<Box display={!this.state.show ? "flex" : "none"}>
				<Button variant="contained" color="primary"
						style={{'whiteSpace': 'nowrap'}}
						onClick={() => { this.setState({show: !this.state.show}) } } >
					{this.state.show ? L('Cancel') : L('Login')}
				</Button>
			</Box>
			<Collapse in={this.state.show} timeout="auto" >
				<TextField
					required id="userid" label={L("User Id")}
					autoComplete="username"
					defaultValue={this.state.userid}
					onChange={event => this.setState({userid: event.target.value})} />
				<TextField
					id="pswd" label={L("Password")}
					type="password" value={this.state.pswd}
					autoComplete="new-password"
					onChange={event => this.setState({pswd: event.target.value})} />
				<Button
					variant="contained"
					color="primary"
					onClick={this.onLogin} >{L('Login')}</Button>
			</Collapse>
			<ConfirmDialog ok={L('OK')} title={L('Info')} cancel={false}
					open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
					msg={this.state.alert} />
		</div>);
    }
}
LoginComp.contextType = AnContext;

const Login = withStyles(styles)(LoginComp);
export { Login, LoginComp };
