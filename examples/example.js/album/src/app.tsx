import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt,
	JsonServs, AnreactAppOptions, AnTreeditor2, CrudCompW,
} from '@anclient/anreact';

type AlbumProps = {
	servs: JsonServs;
	servId: string;

	/** album id */
	aid: string;

	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: Window | undefined; // window object
}

/** The application main, context singleton and error handler */
export class App extends CrudCompW<AlbumProps> {
    inclient: Inseclient;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

	config = {
		hasError: false,
		iportal: '#',
		nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: {} as JsonServs,
		/** the serv id for picking url */
		servId: '',
	};
    hasError: any;
    nextAction: string | undefined;
	tier: any;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.config.iportal = this.props.iportal as string;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.config.servId = this.props.servId;
		this.config.servs = this.props.servs;

		this.inclient = new Inseclient({urlRoot: this.config.servs[this.props.servId]});

		this.error = {onError: this.onError, msg: ''};
		this.nextAction = 're-login',
		this.hasError = false,

		this.config = Object.assign({}, this.config);

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
			servId: this.config.servId,
			servs: this.props.servs,
			anClient: this.inclient,
			uiHelper: this.anReact,
			hasError: this.config.hasError,
			iparent: this.props.iparent,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
		  {/* {<GalleryView cid={''} port='album' uri={'/local/album'} aid={this.props.aid}/>} */}
		  { <AnTreeditor2 {... this.props}
				pk={'pid'}
				sk={Protocol.sk.collectree} tnode={this.tier.root()}
				onSelectChange={ids => undefined}
				uri={this.uri} mtabl='ind_emotion'
				// pk={{ type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
				// parent={{ type: 'text', field: 'parent', label: L('Album'), hide: 1, validator: {len: 12} }}
				parent={ undefined }
				columns={[
					{ type: 'text', field: 'folder', label: 'Photo Folders', grid: {sm: 4, md: 2} },
					{ type: 'text', field: 'tags',   label: L('Summary'), grid: {sm: 4, md: 2} },
					{ type: 'text', field: 'shareby',label: L('By'), grid: {xs: false, sm: 2} },
					{ type: 'actions', field: '',    label: '',      grid: {xs: 3, md: 2} }
				]}
				isMidNode={(n: { rowtype: string; }) => n.rowtype === 'cate' || !n.rowtype}
			/> }
			{this.hasError &&
				<AnError onClose={this.onErrorClose} fullScreen={false}
					uri={"/login"} tier={undefined}
					title={L('Error')} msg={this.error.msg || ''} />}
		</AnContext.Provider>
		);
	}

	/**
	 * Try figure out serv root, then bind to html tag.
	 * First try ./private.host/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param elem html element id, null for test
	 * @param opts default: {serv: 'host', portal: 'index.html', album: 'aid'}
	 * - serv: string,
	 * - portal: string
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions & {aid: string}) : void {
		let portal = opts.portal ?? 'index.html';
		let aid = opts.aid;
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<App servs={json} servId={opts.serv || 'host'} aid={aid} iportal={portal} iwindow={window}/>, dom);
		}
	}
}
