import React from 'react';
import ReactDOM from 'react-dom';

import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, ErrorCtx, TMsgCode } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, jsample, JsonServs, Spreadsheetier
} from '../../../../src/an-components';

import { Workbook } from './workbook-no-tier';
import { CellEditingStoppedEvent } from 'ag-grid-community';

const { JsampleTheme } = jsample;

type LessProps = {
	servs: JsonServs;
	servId: string;
	iportal?: string;
	iparent?: string; // parent of iframe
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
	tier: Spreadsheetier;

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
		this.onEdited = this.onEdited.bind(this);

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
                            workbook: "sheet.less",
                        });

		let onEditStop = this.onEdited;


		// Spreadsheetier.registerReq((p, r) => { return new MyBookReq(p, r); })

		this.tier = new Spreadsheetier('workbook',
			{ uri: this.uri,
			  pkval: {pk: 'cId', v: undefined, tabl: 'b_curriculums'},
			  cols: [
				{field: 'cid', label: L("Id"), width: 120, editable: false },
				{field: 'currName', label: L("curriculum"), width: 160 },
				{field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level', onEditStop },
				{field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu' },
				{field: 'cate', label: L("Category"), width: 120, type: 'cbb', sk: 'curr-cate' },
				{field: 'subject', label: L("Subject"), width: 160, type: 'cbb', sk: 'curr-subj' },
			],
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

	onEdited(p: CellEditingStoppedEvent): void {
		// TODO change color

		this.tier.updateCell(p);
	}

	render() {
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				uiHelper: this.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.inclient,
				hasError: this.state.hasError,
				iparent: this.props.iwindow,
				ihome: this.props.iportal || 'portal.html',
				error: this.error,
				ssInf: undefined,
			}} >
				{<Workbook port='sheet' uri={this.uri} tier={this.tier} conn_state={this.state.conn_state} />}
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
	 * @param opts default: {serv: 'host', portal: 'index.html'}
	 * - serv: string,
	 * - portal: string
	 */
	static bindHtml(elem: string, opts: { portal?: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		let portal = opts.portal ?? 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.initPage(elem, opts, onJsonServ);

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
