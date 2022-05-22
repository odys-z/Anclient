import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, ErrorCtx, TMsgCode } from '../../../../semantier/anclient';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, jsample, JsonServs
} from '../../../../anreact/src/an-components';

import Worksheet from './workbook';
import { MyWorkbookTier } from './workbook-tier';

const { JsampleTheme } = jsample; 

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
	conn_state: TMsgCode;
}

/** The application main, context singleton and error handler */
class App extends React.Component<LessProps, State> {
	/** {@link InsercureClient} */
	inclient: Inseclient;
	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

	state = {
		conn_state: Protocol.MsgCode.ok as TMsgCode,
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined as string, // e.g. re-login

		/** json object specifying host's urls */
		servs: undefined,
		/** the serv id for selecting url from configured hosts */
		servId: '',
	};

	uri = '/less/sheet';
	tier: MyWorkbookTier;

	/**
     * Restore session from window.localStorage 
     * 
     * @param props 
     */
	constructor(props: LessProps | Readonly<LessProps>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;

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
                            /* see jserv-sandbox/UsersTier, port name: sheetier, filter: sheet.less */
                            userstier: "sheet.less",
                        });
		
		this.tier = new MyWorkbookTier({
			uri: this.uri,
			cols: [
				{field: 'cId', label: L("Id"), width: 120},
				{field: 'currName', label: L("curriculum"), width: 160},
				{field: 'clevel', label: L("Level"), width: 80},
				{field: 'module', label: L('Module'), width: 120, type: 'cbb'},
				{field: 'cate', label: L("Category"), width: 120},
				{field: 'subject', label: L("Subject"), width: 160},
			]
		});
	}

	onError(c: TMsgCode, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
		this.error.msg = r.Body().msg();
		this.setState({
			conn_state: c,
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
				{<Worksheet port='sheet' uri={this.uri} tier={this.tier} conn_state={this.state.conn_state} />}
				{this.state.hasError &&
					<AnError onClose={this.onErrorClose} fullScreen={false}
							uri={"/login"} tier={undefined}
							title={L('Error')} msg={this.error.msg} />}
			</AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id
	 * @param opts 
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
