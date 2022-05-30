import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, AnsonMsg, SessionClient, AnsonResp } from '@anclient/semantier'
import { L, Langstrs,
	Sys, SysComp,
	AnContext, AnError, AnReactExt, jsample, AnContextType, Home
} from '@anclient/anreact';
const { Domain, Roles, Orgs, Userst, JsampleTheme } = jsample;

import { StarPorts } from './common/port';

import { Course } from './views/north/kypci/courses';
import { Progress } from './views/north/progress';
import { My } from './views/center/my-decision-print';
import { APEvents } from './views/north/kypci/events';

export interface Approps {
    iportal?: string;
    servId: string;
    servs?: {host?: string, [h: string]: string};

    iwindow?: typeof window;
    iparent?: typeof parent;
    ilocation?: string;
	ihome?: string;
}

/** 📦  @anclient/semantier@0.9.69 */
class App extends React.Component<Approps, any> {
	state = {
		anClient: undefined, // SessionClient
		anReact: undefined,  // helper for React

		iportal: 'portal.html',
        jserv: undefined,
        servs: {},
        servId: '',

		hasError: false,
		nextAction: undefined, // e.g. re-login
		error: undefined,
	};

	/**Restore session from window.localStorage
	 */
	constructor(props: Approps) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		// design: will load anclient from localStorage
		this.state.error = {onError: this.onError, msg: ''};
		this.state.anClient = new SessionClient();
		this.state.anReact = new AnReactExt(this.state.anClient, this.state.error)
								.extendPorts(StarPorts);

		// Protocol.sk.xvec = 'x.cube.vec';
		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';
		Protocol.sk.cbbMyClass = 'north.my-class';

		// singleton error handler
		if ( !this.state.anClient || !this.state.anClient.ssInf
		  || !this.state.anClient || !this.state.anClient.ssInf) {
			this.state = Object.assign(this.state, {
				nextAction: 're-login',
				hasError: true,
				msg: L('Setup session failed! Please re-login.')
			});
		}

		// extending pages
		SysComp.extendLinks( [
			{path: '/sys/domain', comp: Domain},
			{path: '/sys/roles', comp: Roles},
			{path: '/sys/orgs', comp: Orgs},
			{path: '/sys/users', comp: Userst},

			{path: '/n/podiyi', comp: APEvents},
			{path: '/n/kypci', comp: Course},
			{path: '/n/ohlyad', comp: Progress},
			{path: '/c/status', comp: Home},
			{path: '/c/my', comp: My},
		] );
	}

	componentDidMount() {
		console.log(this.state);
	}

	/**
	 *
	 * @param c error code
	 * @param r AnsonMessage<AnsonResp>
	 */
	onError(c: string, r: AnsonMsg<AnsonResp>) {
		console.error(c, r);
		this.state.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}

		this.setState({hasError: false})
	}

	/** For navigate to portal page
	 * FIXME this should be done in SysComp, while firing goLogoutPage() instead.
	 * */
	logout() {
		let that = this;
		// leaving
		try {
			this.state.anClient.logout(
				() => {
					if (this.props.iwindow)
						this.props.iwindow.location.href = this.state.iportal;
				},
				(c, e) => {
					// something wrong
					cleanup (that);
				});
		}
		catch(_) {
			cleanup (that);
		}
		finally {
			this.state.anClient = undefined;
		}

		function cleanup(app) {
			if (app.state.anClient)
				localStorage.setItem(SessionClient.ssInfo, null);
			if (app.props.iwindow)
				app.props.iwindow.location = app.state.iportal;
		}
	}

	render() {
	  let that = this;
	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				ssInf: this.state.anClient.ssInf,
				anReact: this.state.anReact,
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.state.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				ihome: this.props.iportal || 'portal.html',
				error: this.state.error,
			}} >
				<Sys menu='sys.menu.jsample'
					sys={L('AP Courses')} menuTitle={L('Sys Menu')}
					myInfo={myInfoPanels}
					hrefDoc={'docs/index.html'}
					// welcome={welcome}
					onLogout={this.logout} />
				{this.state.hasError &&
					<AnError onClose={this.onErrorClose} fullScreen={false}
						msg={this.state.error.msg} title={L('Error')} />}
			</AnContext.Provider>
		</MuiThemeProvider>);

		function myInfoPanels(anContext: React.Context<AnContextType>) {
			return [
				{ title: L('Basic'),
				  panel: <jsample.MyInfCard uri={'/sys/session'}
								anContext={anContext}
								ssInf={that.state.anClient.ssInf} /> },
				{ title: L('Password'),
				  panel: <jsample.MyPswd uri={'/sys/session'}
								anContext={anContext}
								ssInf={that.state.anClient.ssInf} /> }
			  ];
		}
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * @param opts default: {serv: 'host', portal: 'index.html'}
	 * - serv: string,
	 * - portal: string
	 */
	static bindHtml(elem: string, opts = {portal: 'indexe.html'}): void {
		let portal = opts.portal ? opts.portal : 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: {serv: string, portal: string}, json: any) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export {App};
