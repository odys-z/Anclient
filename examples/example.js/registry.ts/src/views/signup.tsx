import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { AnClient, AnsonMsg, AnsonResp, ErrorCtx, PageInf, Tierec } from '@anclient/semantier';
import { L, ExternalHosts, AnTablist, DatasetCombo, ComboItem, jsample } from '@anclient/anreact';

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
 * Sign up a domain admin (r01), posted to the central's signup.serv (SignupTier) without a session.
 * Laid out as anreact's Login (react/login.tsx).
 *
 * The first row (read only) is the central's market (SignupReq.A.market).
 * Every user belongs to exactly one community: the user creates a new community (id and name),
 * or joins an existing one of the market, selected in the combobox (SignupReq.A.qryOrgs), or
 * searched by name with the [...] button.
 *
 * The same checks as the central's: ids of 2 - 20 (user) / 12 (community) letters, digits,
 * '-', '_' or '.'; a password of at least 6 characters.
 */
export class Signup extends React.Component<SignupProps> {
	state = {
		uid: '', userName: '', pswd: '', pswd2: '',
		/** create a new community, or join an existing one */
		newOrg: true,
		orgId: '', orgName: '',
		/** communities of the market to join, combobox options */
		orgs: [] as ComboItem[],
		/** showing the community picker */
		picking: false,
		/** the central's market, '<name> (<id>)' */
		market: '',
		err: undefined as string | undefined,
	};

	client: AnClient | undefined;

	constructor(props: SignupProps) {
		super(props);
		this.toSignup = this.toSignup.bind(this);
	}

	componentDidMount() {
		let client = this.anclient();
		if (!client) return;

		let req = client.getReq<SignupReq>('signup',
				new SignupReq({uri: this.props.uri, a: SignupReq.A.market}));
		client.post(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let rsp = resp.Body() as SignupResp;
				this.setState({market: rsp.marketName ? `${rsp.marketName} (${rsp.market})` : rsp.market});
			},
			this.props.errCtx);

		Signup.qryOrgs(client, this.props.uri, this.props.errCtx, undefined,
			(rows) => this.setState({orgs: rows.map(Signup.orgItem)}));
	}

	static orgItem(r: Tierec): ComboItem {
		return {n: `${r.orgName} (${r.orgId})`, v: r.orgId as string};
	}

	/**
	 * Communities of the market to join (SignupReq.A.qryOrgs), without a session.
	 * @param name part of the name, undefined for all (not paged)
	 */
	static qryOrgs(client: AnClient, uri: string, errCtx: ErrorCtx, name: string | undefined,
			onLoad: (rows: Tierec[]) => void) {
		let pageInf = new PageInf(0, -1);
		if (name)
			pageInf.addCondt(SignupReq.Condts.orgName, name);

		client.post(client.getReq<SignupReq>('signup',
				new SignupReq({uri, a: SignupReq.A.qryOrgs, pageInf})),
			(resp: AnsonMsg<AnsonResp>) => onLoad(AnsonResp.rs2arr(resp.Body().Rs()).rows as Tierec[]),
			errCtx);
	}

	/**
	 * A client without a session, of the jserv root of servs[servId] (as anreact Login.toLogin()).
	 * @returns undefined if not configured (state.err is set)
	 */
	anclient(): AnClient | undefined {
		if (this.client) return this.client;

		let hosturl = (this.props.servs as any)[this.props.servId] as string;
		if (!hosturl || !hosturl.startsWith('http')) {
			this.setState({err: L('No jserv configured for {serv}.', {serv: this.props.servId})});
			return undefined;
		}
		this.client = new AnClient(hosturl).understandPorts(RegistryTsPorts);
		return this.client;
	}

	static checkId(id: string, max: number) {
		return new RegExp(`^[A-Za-z0-9_.\\-]{2,${max}}$`).test(id);
	}

	/** @returns error message, or undefined if valid */
	check(): string | undefined {
		let {uid, pswd, pswd2, newOrg, orgId} = this.state;
		if (!Signup.checkId(uid, 20))
			return L("User id: 2 - 20 letters, digits, '-', '_' or '.'.");
		if (!pswd || pswd.length < 6)
			return L('Password must be at least 6 characters.');
		if (pswd !== pswd2)
			return L("Passwords don't match.");
		if (newOrg && !Signup.checkId(orgId, 12))
			return L("Community id: 2 - 12 letters, digits, '-', '_' or '.'.");
		if (!newOrg && !orgId)
			return L('Please pick a community to join.');
		return undefined;
	}

	toSignup() {
		let err = this.check();
		this.setState({err});
		if (err) return;

		let client = this.anclient();
		if (!client) return;

		let {uid, userName, pswd, newOrg, orgId, orgName} = this.state;
		let req = client.getReq<SignupReq>('signup',
				new SignupReq({uri: this.props.uri, a: SignupReq.A.signup,
					uid, userName, pswd, orgId, newOrg, orgName: newOrg ? orgName : undefined}));

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

		return (<>
		  <Box component='form' noValidate onSubmit={(e) => { e.preventDefault(); this.toSignup(); }}>
			<TextField fullWidth margin='dense' size='small' label={L('Market')}
				value={s.market} slotProps={{input: {readOnly: true}}} />
			{field('uid', L('User ID'))}
			{field('userName', L('User Name'), 'text', false)}
			{field('pswd', L('Password'), 'password')}
			{field('pswd2', L('Confirm Password'), 'password')}

			<RadioGroup row value={s.newOrg ? 'new' : 'join'}
				onChange={(e) => this.setState({newOrg: e.target.value === 'new', orgId: '', err: undefined})}>
				<FormControlLabel value='new'  control={<Radio size='small' />} label={L('New community')} />
				<FormControlLabel value='join' control={<Radio size='small' />} label={L('Join a community')} />
			</RadioGroup>

			{s.newOrg ? <>
				{field('orgId', L('Community ID'))}
				{field('orgName', L('Community Name'), 'text', false)}
			  </>
			: <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 0.5}}>
				{/* remounted when the options or the selection change, e.g. picked in the search dialog */}
				<DatasetCombo key={`${s.orgs.length}:${s.orgId}`} uri={this.props.uri}
					label={L('Community')} noAllItem
					options={s.orgs} val={s.orgId || undefined}
					onSelect={(it) => this.setState({orgId: it ? it.v as string : '', err: undefined})} />
				<IconButton size='small' title={L('Search communities by name')}
					onClick={() => this.setState({picking: true})}>...</IconButton>
			  </Box>}

			<Typography variant='caption' color={s.err ? 'error' : 'textSecondary'} sx={{display: 'block', mt: 1}}>
				{s.err || (s.newOrg
					? L('You will be a domain admin of the new community.')
					: L('You will be a domain admin of the community, besides its other domain admins.'))}
			</Typography>

			<Box sx={{display: 'flex', gap: 1, mt: 2}}>
				<Button type='submit' variant='contained' color='primary'>{L('Sign Up')}</Button>
				<Button onClick={this.props.onCancel}>{L('Back to Login')}</Button>
			</Box>
		  </Box>

		  {s.picking && this.anclient() &&
			<OrgPicker uri={this.props.uri} client={this.anclient() as AnClient} errCtx={this.props.errCtx}
				onPick={(org) => this.setState({picking: false, orgId: org.orgId, err: undefined,
							// the picked one may be beyond the combobox's first rows
							orgs: s.orgs.find(o => o.v === org.orgId) ? s.orgs
								: [Signup.orgItem(org as unknown as Tierec), ...s.orgs]})}
				onClose={() => this.setState({picking: false})} />}
		</>);
	}
}

/**
 * Pick a community of the market to join, searched by name (SignupReq.A.qryOrgs), without a session.
 */
class OrgPicker extends React.Component<{uri: string, client: AnClient, errCtx: ErrorCtx,
		onPick: (org: {orgId: string, orgName: string}) => void, onClose: () => void}> {
	state = {
		name: '',
		rows: [] as Tierec[],
		loaded: false,
		selected: {ids: new Map<string, Tierec>()},
	};

	componentDidMount() {
		this.toSearch();
	}

	toSearch() {
		Signup.qryOrgs(this.props.client, this.props.uri, this.props.errCtx, this.state.name || undefined,
			(rows) => {
				this.state.selected.ids.clear();
				this.setState({rows, loaded: true});
			});
	}

	render() {
		let picked = this.state.selected.ids.values().next().value as Tierec | undefined;
		return (
		  <Dialog open fullWidth maxWidth='sm' onClose={this.props.onClose}>
			<DialogTitle color='primary'>{L('Communities')}</DialogTitle>
			<DialogContent>
				<Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
					<TextField fullWidth margin='dense' size='small' label={L('Community Name')}
						value={this.state.name}
						onChange={(e) => this.setState({name: e.target.value})}
						onKeyDown={(e) => { if (e.key === 'Enter') this.toSearch(); }} />
					<Button variant='contained' startIcon={<jsample.JsampleIcons.Search />}
						onClick={() => this.toSearch()}>{L('Search')}</Button>
				</Box>
				<AnTablist uri={this.props.uri} pk='orgId' checkbox singleCheck maxHeight='50vh'
					selected={this.state.selected}
					rows={this.state.rows}
					onSelectChange={() => this.setState({})}
					emptyMsg={this.state.loaded ? L('No communities found.') : undefined}
					columns={[
						{ field: 'orgId',   label: '', grid: {} },
						{ field: 'orgId',   label: L('Community ID'), grid: {} },
						{ field: 'orgName', label: L('Community Name'), grid: {} },
					]} />
			</DialogContent>
			<DialogActions>
				<Button variant='contained' disabled={!picked}
					onClick={() => picked && this.props.onPick({orgId: picked.orgId as string,
								orgName: picked.orgName as string})}>{L('OK')}</Button>
				<Button onClick={this.props.onClose}>{L('Cancel')}</Button>
			</DialogActions>
		  </Dialog>);
	}
}
