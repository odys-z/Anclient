// TODO replace with anreact.Login
import $ from 'jquery';

import React from 'react';
	import { withStyles } from '@material-ui/core/styles';
	import Collapse from '@material-ui/core/Collapse';
	import Button from '@material-ui/core/Button';
	import TextField from '@material-ui/core/TextField';
	import FormControl from '@material-ui/core/FormControl';
	import Box from '@material-ui/core/Box';

import * as an from 'anclient'
	import {AnContext} from '../../../lib/an-react';
	import {ConfirmDialog} from '../../../lib/widgets/Messagebox'
	import {L, Langstrs} from '../../../lib/utils/langstr'

// https://github.com/mui-org/material-ui/issues/15820
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
		this.onLogout = this.onLogout.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.configServ = this.configServ.bind(this);
	}

	componentDidMount() {
		this.configServ(this.context);
		return this;
	}

	configServ(ctx) {
		let servId = ctx.servId;
		this.inputRef.value = ctx.servs[servId];
		this.state.jserv = ctx.servs[servId];
	}

	alert() {
		this.setState({
			alert: L('User Id or password is not correct.'),
			showAlert: true,
		});
	}

	onLogin() {
		let that = this;
		let uid = this.state.userid;
		let pwd = this.state.pswd;
		if (!uid || !pwd) {
			this.alert();
			return;
		}

		if (!this.state.loggedin) {
			this.state.jserv = this.inputRef.value;
			this.an.init(this.state.jserv);
			this.an.login( uid, pwd, reload, onError );
		}

		function reload (client) {
			that.ssClient = client;
			if (typeof that.props.onLoginOk === 'function')
				that.props.onLoginOk(client);
			else console.log('login succeed but client ignored: ', client);
			that.setState( {loggedin: true} );
		}

		function onError (code, resp) {
			if (typeof that.context.errHandler === 'object') {
				let errCtx = that.context.errHandler;
				errCtx.hasError = true;
				errCtx.code = code;
				errCtx.msg = resp.Body().msg();
				errCtx.onError(true); // FIXME but Editor doesn't use this, bug?
			}
			else if (code === an.Protocol.MsgCode.exIo)
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
		// This <form> only to disable chrome warning:
		// [DOM] Password forms should have (optionally hidden) username fields for accessibility...
		return (<div className={classes.root}>
			<div style={{display: 'flex'}}>
				<TextField required id="jserv" inputRef={ref => { this.inputRef = ref; }}
						   label="Jserv URL" fullWidth={true}
						   defaultValue="http://localhost:8080/jserv-quiz/" />
				<Box display={this.state.loggedin ? "flex" : "none"}>
					<Button variant="contained" color="primary" style={{'whiteSpace': 'nowrap'}}
							onClick={this.onLogout} >Log out</Button>
				</Box>
			</div>
			<Collapse in={!this.state.loggedin} timeout="auto" >
				<TextField
					required id="userid" label="User Id"
					autoComplete="username"
					defaultValue={this.state.userid}
					onChange={event => this.setState({userid: event.target.value})} />
				<TextField
					id="pswd" label="Password"
					type="password" value='123456'
					autoComplete="new-password"
					onChange={event => this.setState({pswd: event.target.value})} />
				<Button
					variant="contained"
					color="primary"
					onClick={this.onLogin} >Log in</Button>
			</Collapse>
			<ConfirmDialog ok='はい' title='Info' cancel={false}
					open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
					msg={this.state.alert} />
		</div>);
    }
}

LoginComp.contextType = AnContext;

const Login = withStyles(styles)(LoginComp);
export { Login, LoginComp };
