import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, SessionClient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, JsonServs, AnreactAppOptions,
	AnTreeditor
} from '@anclient/anreact';

type AlbumProps = {
	servs: JsonServs;
	servId: string;

	orgId: string;

	ihome: string;
	iportal?: string;
	/** parent of iframe */
	iparent?: object | Window;
	iwindow?: Window | undefined; // window object
}

/** The application main, context singleton and error handler */
export class Admin extends React.Component<AlbumProps> {
	servId: string;

    inclient: SessionClient;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

    hasError: any;
    nextAction: string | undefined;

	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.servId = props.servId || 'host';
		this.nextAction = 're-login',

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.inclient = new SessionClient(SessionClient.loadStorage());

		this.error = {onError: this.onError, msg: ''};
		this.hasError = false,

		Protocol.sk.cbbViewType = 'v-type';

        // design note: exendPorts shall be an automized processing
		this.anReact = new AnReactExt(this.inclient, this.error)
                        .extendPorts({
                            /* see jserv-album/album, port name: album */
                            album: "album.less",
                        });
	}

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
		this.error.msg = r.Body()?.msg();
		this.hasError = !!c;
		this.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		this.setState({});
	}

	onErrorClose() {
        this.hasError = false;
		this.setState({});
	}

	render() {
	  return (
		<AnContext.Provider value={{
			servId: this.servId,
			servs: this.props.servs,
			anClient: this.inclient,
			uiHelper: this.anReact,
			hasError: this.hasError,
			iparent: this.props.iparent,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
			{<AnTreeditor pk={'/local/album'}
				title={""}
				columns={[{label: "v", field: ""}]}
				onSelectChange={(ids: String[])=>{}}/>}
			{this.hasError &&
				<AnError onClose={this.onErrorClose} fullScreen={false}
					uri={"/login"} tier={undefined}
					title={L('Error')} msg={this.error.msg || ''} />}
		</AnContext.Provider>
		);
	}

	/**
	 * see App.bindHtml()
	 * @param opts
	 * opts.home: home page
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions & {org: string, home?: string}) : void {
		let portal = opts.portal ?? 'index.html';
		let org = opts.org;
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
			  <Admin
				servs={json} servId={opts.serv || 'host'}
				orgId={org}
				ihome='index.html'
				iportal={portal} iwindow={window}
			  />, dom);
		}
	}


}