import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, 
	AnTreeNode, ErrorCtx, an, SessionClient
} from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt, Lightbox,
	JsonServs, AnreactAppOptions, AnTreeditor2, CrudCompW, AnContextType,
} from '@anclient/anreact';
import { GalleryTier } from './gallerytier-less';

type AlbumProps = {
	servs: JsonServs;
	servId: string;

	/** album id */
	aid: string;

	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: Window | undefined; // window object

	userid?: string;
	passwd?: string;
}

/** The application main, context singleton and error handler */
export class App extends CrudCompW<AlbumProps> {
    inclient: Inseclient;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

	config = {
		// iportal: '#',
		// nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: {} as JsonServs,
		/** the serv id for picking url */
		servId: '',
	};
    nextAction: string | undefined;
	albumsk: string;

	state = {
		hasError: false,
		tobeLoad: true,
	};

	editForm: undefined;
	ssclient: SessionClient | undefined;
	albumtier: GalleryTier | undefined;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);
		this.uri = 'example.js/album';
		this.albumsk = "tree-album-family-folder";

		this.onError = this.onError.bind(this);
		this.error   = {onError: this.onError, msg: ''};
		this.onErrorClose = this.onErrorClose.bind(this);
		this.toSearch = this.toSearch.bind(this);

		this.config.servId = this.props.servId;
		this.config.servs = this.props.servs;

		this.inclient = new Inseclient({urlRoot: this.config.servs[this.props.servId]});

		this.nextAction = 're-login',

		this.config = Object.assign({}, this.config);

		Protocol.sk.cbbViewType = 'v-type';

        // DESIGN NOTES: exending ports shall be an automized processing
		this.anReact = new AnReactExt(this.inclient, this.error)
                        .extendPorts({
                            /* see jserv-album/album, port name: album */
                            album: "album.less",
                        });
	}

	componentDidMount() {
		console.log(this.uri);

		const ctx = this.context as unknown as AnContextType;
		this.login();
	}

	login() {
		// MEMO: a word for future modification, App is context provider, not consumer.
		// So this.context won't work here.
		// const ctx = this.context as unknown as AnContextType;
		// let serv = ctx.servId || 'host';

		let hosturl = this.config.servs[this.config.servId];
		let {userid, passwd} = this.props;

		let that = this;
		let reload = (client: SessionClient) => {
			that.ssclient = client;
			that.albumtier = new GalleryTier({uri: this.uri, comp: this, client});
			that.toSearch();
		}
	
		console.warn("Auto login with configured userid & passwd.",
					 hosturl, userid, passwd);
		an.init ( hosturl );
		an.login( userid as string, passwd as string, reload, this.error );
	}

	toSearch() {
		this.editForm = undefined;
		this.setState({tobeLoaded: true})
	}

	lightbox = (photos: AnTreeNode[], opts: {ix: number, open: boolean, onClose: (e: any) => {}}) => {
		return (<Lightbox showResourceCount photos={photos} tier={this.albumtier} {...opts} />);
	}

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body()?.msg(), r);
		this.error.msg = r.Body()?.msg();
		this.state.hasError = !!c;
		this.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		this.setState({});
	}

	onErrorClose() {
        this.state.hasError = false;
		this.setState({});
	}

	render() {
	  console.log(this.uri);
	  return (
		<AnContext.Provider value={{
			servId: this.config.servId,
			servs: this.props.servs,
			anClient: this.ssclient as SessionClient,
			uiHelper: this.anReact,
			hasError: this.state.hasError,
			iparent: this.props.iparent,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
		  { this.albumtier &&
		    <AnTreeditor2 {... this.props} reload={this.state.tobeLoad}
				pk={'pid'} sk={this.albumsk}
				tier={this.albumtier} tnode={this.albumtier.root()} title={this.albumtier.albumTitle}
				onSelectChange={() => undefined}
				uri={this.uri} 
				parent={ undefined }
				columns={[
					{ type: 'text', field: 'folder', label: 'Folders', grid: {sm: 4, md: 3} },
					{ type: 'text', field: 'tags',   label: L('Summary'), grid: {sm: 4, md: 3} },
					{ type: 'text', field: 'shareby',label: L('By'), grid: {xs: false, sm: 3} },
					// { type: 'actions', field: '',    label: '',      grid: {xs: 4, sm: 3} }
				]}
				lightbox={this.lightbox}
			/> }
		  { this.state.hasError &&
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
			ReactDOM.render(
			  <App servs={json} servId={opts.serv || 'album'}
				aid={aid} iportal={portal} iwindow={window}
				userid={'ody'} passwd={'123456'}
			  />, dom);
		}
	}
}
