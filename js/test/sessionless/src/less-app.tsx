import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient, AnsonResp, AnsonMsg } from '@anclient/semantier-st';

import { Langstrs,
	AnContext, AnError, AnReactExt,
	jsample
} from '@anclient/anreact';

import Welcome from './welcome';

const { Userst, JsampleTheme } = jsample;

type Props = {
	servs: any;
	servId: string;
	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: any; // window object
}

type State = {
	servs?: any;
	servId: string;
	iportal?: string;
	hasError?: boolean;
	nextAction?: string;
}

/** The application main, context singleton and error handler */
class App extends React.Component<Props, State> {
	state = {
		/** {@link InsercureClient} */
		inclient: undefined,
		anReact: undefined,  // helper for React
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login
		error: undefined,

		/** json object specifying host's urls */
		servs: undefined,
		/** the serv id for picking url */
		servId: '',
	};

	/**Restore session from window.localStorage
	 */
	constructor(props: Props | Readonly<Props>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;
		// this.state.jserv = this.props.servs[this.state.servId];

		this.state.inclient = new Inseclient({urlRoot: this.state.servs[this.props.servId]});

		this.state.error = {onError: this.onError, msg: ''};

		this.state = Object.assign(this.state, {
			nextAction: 're-login',
			hasError: false,
			msg: undefined
		});

		this.state.anReact = new AnReactExt(this.state.inclient, this.state.error)
								.extendPorts({
									userstier: "users.less", // see jserv-sandbox/UsersTier, port name: usersteir, filter: users.less
								});
	}

	onError(c: any, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
		this.state.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			// this.logout();
		}
	}

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				anReact: this.state.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				// jserv: this.state.jserv,
				anClient: this.state.inclient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.state.error,
				ssInf: undefined,
				// an: AnClient;
				// uuid: AnContext.uuid
			}} >
				{<Userst port='userstier' uri={'/less/users'}/>}
				<hr/>
				{<Welcome port='welcomeless' uri={'/less/welcome'}/>}
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={false} uri={"/login"} tier={undefined} />}
				<hr/>
				アプリ コンポーネントの内容は, 上記のすべて...<br/> {Date().toString()}
			</AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * @param opts={} serv id
	 */
	static bindHtml(elem: string, opts: { portal?: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		let portal = opts.portal ?? 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: any) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export { App };
