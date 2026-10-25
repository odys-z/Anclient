import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { AnClient, AnsonMsg, AnsonResp, ErrorCtx } from '@anclient/semantier';
import { L, ExternalHosts } from '@anclient/anreact';

import { RegistryTsPorts } from '../common/ports';
import { SignupReq, SignupResp } from '../common/registry';

export interface SignupProps {
	/** Function uri, mapped by jserv's connects.xml/conn-uri. */
	uri: string;
	servs: ExternalHosts;
	servId: string;
	errCtx: ErrorCtx;
	/** Signed up: the user can log in now. */
	onSignup: (rsp: SignupResp) => void;
	onCancel: () => void;
}

/**
 * Sign up a domain admin with a new community, posted to the central's signup.serv
 * (Signupier) without a session. Laid out as anreact's Login (react/login.tsx).
 *
 * The same checks as the central's: ids of 2 - 20 (user) / 12 (community) letters, digits,
 * '-', '_' or '.'; a password of at least 6 characters.
 */
export class Signup extends React.Component<SignupProps> {
	state = {
		uid: '', userName: '', pswd: '', pswd2: '',
		orgId: '', orgName: '',
		err: undefined as string | undefined,
	};

	constructor(props: SignupProps) {
		super(props);
		this.toSignup = this.toSignup.bind(this);
	}

	static checkId(id: string, max: number) {
		return new RegExp(`^[A-Za-z0-9_.\\-]{2,${max}}$`).test(id);
	}

	/** @returns error message, or undefined if valid */
	check(): string | undefined {
		let {uid, pswd, pswd2, orgId} = this.state;
		if (!Signup.checkId(uid, 20))
			return L("User id: 2 - 20 letters, digits, '-', '_' or '.'.");
		if (!Signup.checkId(orgId, 12))
			return L("Community id: 2 - 12 letters, digits, '-', '_' or '.'.");
		if (!pswd || pswd.length < 6)
			return L('Password must be at least 6 characters.');
		if (pswd !== pswd2)
			return L("Passwords don't match.");
		return undefined;
	}

	toSignup() {
		let err = this.check();
		this.setState({err});
		if (err) return;

		// as anreact Login.toLogin(): the jserv root of servs[servId]
		let hosturl = (this.props.servs as any)[this.props.servId] as string;
		if (!hosturl || !hosturl.startsWith('http')) {
			this.setState({err: L('No jserv configured for {serv}.', {serv: this.props.servId})});
			return;
		}

		// no session: a plain client
		let client = new AnClient(hosturl).understandPorts(RegistryTsPorts);
		let {uid, userName, pswd, orgId, orgName} = this.state;
		let req = client.getReq<SignupReq>('signup',
				new SignupReq({uri: this.props.uri, uid, userName, pswd, orgId, orgName}));

		client.post(req,
			(resp: AnsonMsg<AnsonResp>) => this.props.onSignup(resp.Body() as SignupResp),
			this.props.errCtx);
	}

	render() {
		let s = this.state;
		let field = (name: string, label: string, type = 'text', required = true) =>
			<TextField fullWidth margin='dense' size='small' required={required}
				type={type} label={label} value={(s as any)[name]}
				onChange={(e) => this.setState({[name]: e.target.value, err: undefined})} />;

		return (
		  <Box component='form' noValidate onSubmit={(e) => { e.preventDefault(); this.toSignup(); }}>
			{field('uid', L('User ID'))}
			{field('userName', L('User Name'), 'text', false)}
			{field('pswd', L('Password'), 'password')}
			{field('pswd2', L('Confirm Password'), 'password')}
			{field('orgId', L('Community ID'))}
			{field('orgName', L('Community Name'), 'text', false)}

			<Typography variant='caption' color={s.err ? 'error' : 'textSecondary'} sx={{display: 'block', mt: 1}}>
				{s.err || L('You will be the domain admin of the new community.')}
			</Typography>

			<Box sx={{display: 'flex', gap: 1, mt: 2}}>
				<Button type='submit' variant='contained' color='primary'>{L('Sign Up')}</Button>
				<Button onClick={this.props.onCancel}>{L('Back to Login')}</Button>
			</Box>
		  </Box>);
	}
}
