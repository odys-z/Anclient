import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Box from '@material-ui/core/Box';

import * as an from 'anclient'
import {ConfirmDialog} from './common/Messagebox'
import {L, Langstrs} from './utils/langstr'

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
class LoginComponent extends React.Component {
    state = {
		loggedin: false,
		pswd: '',
		userid: 'admin',

		alert: '',
		showAlert: false,
    };

	/**
	 * initialize a instance of Anclient visition jserv service.
	 * @param {object} props
	 * @param {string} props.jserv="http://127.0.0.1:8080/jserv-sample"); url to service root.
	 * @constructor
	 */
	constructor(props) {
		super(props);

		this.an = an.an;
		this.an.init(props.jserv ? props.jserv : "http://127.0.0.1:8080/jserv-sample");

		this.onLogout = this.onLogout.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.alert = this.alert.bind(this);
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
			this.an.login( uid, pwd, reload, onError );
		}
		else // what's happening here?
			;
			// reload(this.ssClient);

		function reload (client) {
			that.ssClient = client;
			that.loggedin = true;
			if (typeof that.props.onLoginOk === 'function')
				that.props.onLoginOk(client);
			else console.log(client);
		}

		function onError (code, resp) {
			if (typeof that.props.onLoginErr === 'function')
				that.props.onLoginErr(code, resp);
			else if (code === an.Protocol.MsgCode.exIo)
				console.error('Network Failed!');
			else if (resp.body[0])
				console.error(code + ': ' + resp.body[0].m);
			else console.error(resp);
		}
	}

	onLogout() {
	}

	update(val) {
		this.setState(val);
	}

	render() {
	  const classes = this.props;
		// This <form> only to disable chrome warning:
		// [DOM] Password forms should have (optionally hidden) username fields for accessibility...
		return (<div className={classes.root}>
		<>
			<TextField required id="jserv"
					   label="Jserv URL" fullWidth={true}
					   defaultValue="http://localhost:8080/jserv-sample/" />
		</>
		<form>
        <TextField required id="userid" label="User Id"
                autoComplete="username"
                defaultValue={this.state.userid}
                onChange={event => this.setState({userid: event.target.value})} />
        <TextField id="pswd" label="Password"
                type="password"
                autoComplete="new-password"
                onChange={event => this.setState({pswd: event.target.value})} />
        <Button variant="contained" color="primary"
                onClick={this.onLogin} >Log in</Button>
		<Box display="none">
        <Button variant="contained" color="primary"
                onClick={this.onLogout} >Log out</Button>
		</Box>
		</form>
		<ConfirmDialog ok='はい' title='Info' cancel={false}
				open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
				msg={this.state.alert} />
      </div>);
    }
}

const Login = withStyles(styles)(LoginComponent);
export {Login};
