import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt,
	jsample,
	JsonServs
} from '@anclient/anreact';

import Welcome from './welcome';

const { Userst, JsampleTheme } = jsample;

type LessProps = {
	servs: JsonServs;
	servId: string;
	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: any; // window object
}

type State = {
	servs?: JsonServs;
	servId: string;
	iportal?: string;
	hasError?: boolean;
	nextAction?: string;
}

/** The application main, context singleton and error handler */
class App extends React.Component<LessProps, State> {
	/** {@link InsercureClient} */
	inclient: Inseclient;
	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

	state = {
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: undefined,
		/** the serv id for picking url */
		servId: '',
	};

	/**Restore session from window.localStorage
	 */
	constructor(props: LessProps | Readonly<LessProps>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;
		// this.state.jserv = this.props.servs[this.state.servId];

		this.inclient = new Inseclient({urlRoot: this.state.servs[this.props.servId]});

		this.error = {onError: this.onError, msg: ''};

		this.state = Object.assign(this.state, {
			nextAction: 're-login',
			hasError: false,
			msg: undefined
		});

		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';

		this.anReact = new AnReactExt(this.inclient, this.error)
								.extendPorts({
									userstier: "users.less", // see jserv-sandbox/UsersTier, port name: usersteir, filter: users.less
								});
	}

	onError(c: any, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
		this.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
		}
		this.setState({hasError: false});
	}

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				anReact: this.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.inclient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.error,
				ssInf: undefined,
			}} >
				{<Userst port='userstier' uri={'/less/users'}/>}
				<hr/>
				{<Welcome port='welcomeless' uri={'/less/welcome'}/>}
				{this.state.hasError &&
					<AnError onClose={this.onErrorClose} fullScreen={false}
							uri={"/login"} tier={undefined}
							title={L('Error')} msg={this.error.msg} />}
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

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export { App };
