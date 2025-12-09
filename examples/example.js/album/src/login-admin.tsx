import React from 'react';
import ReactDOM from 'react-dom';
import { AnContext, AnError, AnReact, L, Login, Comprops, AnreactAppOptions, JsonHosts, AnQueryst, ExternalHosts, Langstrs
} from '@anclient/anreact';
import { AnsonMsg, AnsonResp, NV, SessionClient, SessionInf } from '@anclient/semantier';
import { Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography/Typography';
import Card from '@material-ui/core/Card/Card';
import QRCode from 'react-qr-code';
import { IcoLoginAlbum } from './icons/android';
import Box from '@material-ui/core/Box';
import { formatJservQr } from './tiers/synode-utils';
import Link from '@material-ui/core/Link';

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
		let {domain, host, jserv, jservNvs, synodesetups} = this.servdoms as ExternalHosts;

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
				<AnQueryst
					uri={this.uri}
					hideButtons={true} style={{minWidth: '20em'}}
					conds = { {
						// pageInf: new PageInf(0, 20),
						query: [ { 
							type: 'cbb', options: jservNvs,
							label: domain, // L('Select Synode'),
							field: '__delete__',
							grid: {sm: 12, md: 7, lg: 4},
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
				<Login onLogin={this.onLogin} uri={this.uri}/>

				<Typography variant='subtitle2' color='primary' gutterBottom>
					{L('Download Synode Setup:')}.
				</Typography>
				<Typography variant='body2' color='textSecondary' gutterBottom>
					{synodesetups && Object.keys(synodesetups).map((org) => {
						return (
						<Box key={org} style={{marginBottom: '1em'}}>
							<strong>{org}</strong>: &nbsp;
							{synodesetups[org] && synodesetups[org].length > 0 && synodesetups[org].map((zip, zx) => {
								return <Link key={zx} href={zip} color="primary" underline="hover" download={true} >
										{ExternalHosts.to_arch_os_readable(zip)}
										</Link>})}
						</Box>)
					})} 	
				</Typography>

				{this.servdoms && this.servdoms.host && <>
				<Typography variant='subtitle2' color='primary' gutterBottom>{L('Scan here for login on Andriod:')}</Typography>
				<Box style={{'justifyContent': 'center', 'width': '70vw', 'display': 'flex'}}>
				<Card style={{'position': 'absolute'}}>
					<QRCode value={formatJservQr(host, jserv as string)}
							bgColor={'#FFFFFF'} fgColor={'#000000'} size={320} level='H' />
					<IcoLoginAlbum containersize={320} size={48} />
				</Card></Box></>}

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
