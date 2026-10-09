import React from 'react';
import ReactDOM from 'react-dom';
import { AnContext, AnError, AnReact, L, Login, Comprops, AnreactAppOptions, JsonHosts, AnQueryst, ExternalHosts, Langstrs
} from '@anclient/anreact';
import { AnsonMsg, AnsonResp, NV, SessionClient, SessionInf } from '@anclient/semantier';
import { Theme, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import QRCode from 'react-qr-code';
import { IcoLoginAlbum } from './icons/android';
import { formatJservQr } from './tiers/synode-utils';
import Paper from '@material-ui/core/Paper';

/**
 * sm and up (incl. phones in landscape): login and QR cards side by side, widths 7 : 5.
 * xs (phones in portrait): stacked, equal widths, heights 3 : 2.
 * The QR code scales with the space left, so the ratio holds on short screens too.
 */
const useLayout = makeStyles((theme: Theme) => ({
	frame: {
		minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
		background: '#f4f5fb', padding: '24px 16px', boxSizing: 'border-box',
		'@media (max-height: 500px)': { padding: '12px 16px' },
	},
	grid: {
		maxWidth: 848,
		[theme.breakpoints.down('xs')]: {
			maxWidth: 504, flexDirection: 'column', flexWrap: 'nowrap', minHeight: 'calc(100vh - 24px)',
		},
	},
	single: { maxWidth: 504 },
	item: { display: 'flex' },
	main: { [theme.breakpoints.down('xs')]: { flex: '3 1 0' } },
	qr:   { [theme.breakpoints.down('xs')]: { flex: '2 1 0' } },
	card: {
		flex: 1, padding: 32, borderRadius: 12, boxSizing: 'border-box',
		'@media (max-height: 500px)': { padding: '16px 24px' },
		[theme.breakpoints.down('xs')]: { padding: '24px 20px' },
	},
	qrCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
	/** QR edge: at most 240px, never wider than the card, and short enough for the card's height share. */
	qrBox: {
		position: 'relative', boxSizing: 'content-box', padding: 8, marginTop: 12,
		background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0',
		width: 'min(100% - 18px, max(120px, min(240px, 100vh - 210px)))',
		[theme.breakpoints.down('xs')]: {
			width: 'min(100% - 18px, max(120px, min(240px, 40vh - 150px)))',
		},
	},
	qrSvg: { display: 'block', width: '100%', height: 'auto' },
	/** Synode picker at the login form's width (AnQueryst fixes it at 300px inline). */
	compact: {
		marginTop: 16,
		'& .MuiAutocomplete-root': { width: '100% !important', marginBottom: 8 },
		'& .MuiGrid-item > *': { margin: 0 },
	},
	lock: {
		position: 'absolute', top: '50%', left: '50%', width: 40, height: 40,
		transform: 'translate(-50%, -50%)',
	},
}));

/** Synode picker and stacked login form at one width. */
function CompactForm(props: {children: React.ReactNode}) {
	const c = useLayout();
	return <div className={c.compact}>{props.children}</div>;
}

/** Scalable QR with the album lock centred on it. */
function LoginQr(props: {value: string}) {
	const c = useLayout();
	return (
		<div className={c.qrBox}>
			<QRCode value={props.value} className={c.qrSvg}
				bgColor={'#FFFFFF'} fgColor={'#000000'} size={240} level='H' />
			<div className={c.lock}><IcoLoginAlbum containersize={40} size={40} /></div>
		</div>);
}

/** Two-card shell; a function component so the class LoginApp (and its static bindHtml) stays unwrapped. */
function LoginLayout(props: {main: React.ReactNode, qr?: React.ReactNode | false}) {
	const c = useLayout();
	return (
		<div className={c.frame}>
		  <Grid container spacing={3} className={props.qr ? c.grid : `${c.grid} ${c.single}`}>
			<Grid item xs={12} sm={props.qr ? 7 : 12} className={`${c.item} ${c.main}`}>
				<Paper elevation={3} className={c.card}>{props.main}</Paper>
			</Grid>
			{props.qr &&
			<Grid item xs={12} sm={5} className={`${c.item} ${c.qr}`}>
				<Paper elevation={3} className={`${c.card} ${c.qrCard}`}>{props.qr}</Paper>
			</Grid>}
		  </Grid>
		</div>);
}

const styles = (theme: Theme) => ({
	root: {
	    '& *': { margin: theme.spacing(1) }
	},
});

export interface LoginProps extends Comprops {
	servs: ExternalHosts;
	servId?: string;
};

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component<LoginProps> {
	uri: string;

	state = {
		hasError: false,
		home: 'index.html',
	};

	anClient: SessionClient | undefined;

	errCtx = {
		msg: '',
		onError: this.onError
	};

	// domain: string;
	// /** current synode id */
	// servId: string;
	// jserv: string;
	// jservNvs: NV[];
	servdoms: ExternalHosts | undefined;

	constructor(props: LoginProps) {
		super(props);

		this.uri = "/album/sys";

		// let host: string = props.servId ? props.servId : 'host';
		this.servdoms = new ExternalHosts(props.servs); // .ServId(props.servId || 'host');

		// host = props.servs[host as keyof ExternalHosts] as string;
		// this.servId = host;

		// this.domain = (props.servs.syndomx ?? {})['domain'];
		// this.jserv = (props.servs.syndomx ?? {} )[host]; // String(this.jservNvs.find((v) => v.n === this.servId)?.v || '');
		
		// this.jservNvs = Object
		// 	.entries(props.servs.syndomx || {})
		// 	.filter(([x, v]) => x !== 'domain')
		// 	.map(([k, v]) => {return {n: k, v}});
		
		this.errCtx.onError = this.errCtx.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(c : string, r: AnsonMsg<AnsonResp>) {
		console.error(c, r);
		this.setState({hasError: !!c, err: r.Body()?.msg()});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	onLogin(clientInf: { ssInf: SessionInf & {home?: string} }) {
		SessionClient.persistorage(clientInf.ssInf);
		if (this.props.iparent) {
			let mainpage = clientInf.ssInf.home || this.props.ihome;
			if (!mainpage)
				console.error('Login succeed, but no home page be found.');
			else {
				this.props.iparent.location = this.servdoms && this.servdoms?.host
					?  `${mainpage}?serv=${this.servdoms?.host}`
					: mainpage;
				this.setState({anClient: clientInf});
			}
		}
	}

	render() {
		let that = this;
		let {domain, host, jserv, jservNvs} = this.servdoms as ExternalHosts;

		return (
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				ssInf: undefined,
				ihome: '',
				uiHelper: undefined,
				// servId: this.servId,
				servId: host,
				servs: this.props.servs as unknown as JsonHosts,
				anClient: this.anClient as SessionClient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				error: this.errCtx,

				host_json:'private/host.json',
				clientOpts: this.props.clientOpts,
			}} >
				<LoginLayout
				  main={<>
					<Typography variant='h5' style={{fontWeight: 600}}>{L('Album')}</Typography>
					<Typography variant='body2' color='textSecondary' gutterBottom>
						{L('Sign in to your synode')}
					</Typography>

					<CompactForm>
					<AnQueryst
						uri={this.uri}
						hideButtons={true} style={{minWidth: '20em'}}
						conds = { {
							query: [ {
								type: 'cbb', options: jservNvs,
								label: domain,
								field: '__delete__',
								grid: {sm: 12, md: 12, lg: 12},
								val: {n: host, v: jserv},
								onSelectChange: (v: NV) => {
									if (v && v.n) {
										(that.servdoms as ExternalHosts).host = v.n;
										(that.servdoms as ExternalHosts).jserv = v.v as string;
									}
									else
										(that.servdoms as ExternalHosts).host = undefined as any;
									this.setState({})}
							} ] } }
					/>
					<Login stacked onLogin={this.onLogin} uri={this.uri}/>
					</CompactForm>
				  </>}

				  qr={this.servdoms && this.servdoms.host && <>
					<Typography variant='subtitle1' style={{fontWeight: 600}}>
						{L('Scan here for login on Android:')}
					</Typography>
					<Typography variant='caption' color='textSecondary' align='center' gutterBottom>
						{host}
					</Typography>
					<LoginQr value={formatJservQr(host, jserv as string)} />
				  </>}
				/>

				{ this.state.hasError &&
				  <AnError
				  	onClose={this.onErrorClose}
					fullScreen={false}
					title={L('Error')}
					msg={this.errCtx.msg}
				  /> }
			</AnContext.Provider>
		);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private/host.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * optional opts.serv='host': serv id
	 * optional opts.home='main.html': system main page
	 * optional opts.parent=undefined: parent window if for redirecting target
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {serv: 'localhost'}) {
		try {
			Langstrs.load('res-vol/lang.json', navigator.language);
		} catch (e) {}

		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonHosts) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
				<LoginApp servs={json as unknown as ExternalHosts}
					servId={opts.serv} iparent={opts.parent} ihome={opts.home} />,
				dom);
		}
	}
}
export {LoginApp};
