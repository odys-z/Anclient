import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, Inseclient } from '@anclient/semantier';

import { Langstrs,
	AnContext, AnError, AnReactExt,
	uri, jsample
} from '@anclient/anreact';

import Welcome from './welcome';

const { Userst, JsampleTheme } = jsample;

/** The application main, context singleton and error handler */
class App extends React.Component {
	state = {
		/** {@link InsercureClient} */
		inseclient: undefined,
		anReact: undefined,  // helper for React
		hasError: false,
		iportal: 'portal.html',
		nextAction: undefined, // e.g. re-login
		error: undefined,
	};

	/**Restore session from window.localStorage
	 */
	constructor(props) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		// this.logout = this.logout.bind(this);

		// design: will load anclient from localStorage
		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;
		this.state.jserv = this.props.servs[this.state.servId];

		this.state.inclient = new Inseclient({urlRoot: this.state.jserv});

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

		// loaded from dataset.xml
		Protocol.sk.xvec = 'x.cube.vec';
		Protocol.sk.cbbOrg = 'org.all';
		Protocol.sk.cbbRole = 'roles';
	}

	onError(c, r) {
		console.error(c, r);
		// this.setState({hasError: !!c, nextAction: 're-login'});
		this.state.error.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
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
				jserv: this.state.jserv,
				anClient: this.state.inclient,
				hasError: this.state.hasError,
				iparent: this.props.iparent,
				iportal: this.props.iportal || 'portal.html',
				error: this.state.error,
			}} >
				{uri(<Userst port='userstier'/>, '/less/users')}
				<hr/>
				{uri(<Welcome port='welcomeless'/>, '/less/welcome')}
				{this.state.hasError && <AnError onClose={this.onErrorClose} fullScreen={false} />}
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
	 * @param {string} elem html element id, null for test
	 * @param {object} [opts={}] serv id
	 * @param {string} [opts.serv='host'] serv id
	 * @param {string} [opts.iportal='portal.html'] page showed after logout
	 */
	static bindHtml(elem, opts = {}) {
		let portal = opts.portal ? opts.portal : 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, opts, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

export { App };
