import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, AnDatasetResp, AnsonBody,
	AnTreeNode, ErrorCtx, an, SessionClient
} from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt,
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
		// hasError: false,
		// iportal: '#',
		// nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: {} as JsonServs,
		/** the serv id for picking url */
		servId: '',
	};
    nextAction: string | undefined;
	tier: GalleryTier;
	albumsk: string;

	state = {
		hasError: false,
		tobeLoad: true,
		forest: [] as AnTreeNode[],
	};

	editForm: undefined;
	ssclient: any;
	albumtier: any;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);
		this.uri = 'example.js/album';
		this.albumsk = "??";

		// this.config.iportal = this.props.iportal as string;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.toSearch = this.toSearch.bind(this);

		this.config.servId = this.props.servId;
		this.config.servs = this.props.servs;

		this.inclient = new Inseclient({urlRoot: this.config.servs[this.props.servId]});

		this.error = {onError: this.onError, msg: ''};
		this.nextAction = 're-login',
		// this.hasError = false,

		this.config = Object.assign({}, this.config);

		Protocol.sk.cbbViewType = 'v-type';

		this.tier = new GalleryTier({uri: this.uri, client: this.inclient, comp: this});

        // design note: exendPorts shall be an automized processing
		this.anReact = new AnReactExt(this.inclient, this.error)
                        .extendPorts({
                            /* see jserv-album/album, port name: album */
                            album: "album.less",
                        });
	}

	componentDidMount() {
		console.log(this.uri);

		const ctx = this.context as unknown as AnContextType;
		this.anReact = ctx.uiHelper;
		this.state.tobeLoad = true;
		this.login();
	}

	login() {
		const ctx = this.context as unknown as AnContextType;
		let serv = ctx.servId || 'album';
		let hosturl = ctx.servs[serv];
		let {userid, passwd} = this.props;

		let reload = (client: SessionClient) => {
			this.ssclient = client;
			this.ssclient.an.init(hosturl);

			this.albumtier = new GalleryTier({uri: this.uri, comp: this, client});

			this.setState({reload: true});
		}
	
		an.init ( hosturl );
		an.login( userid as string, passwd as string, reload, ctx.error );
	}

	toSearch() {
		let that = this;
		// let {uiHelper, error} = this.context.uiHelper;

		this.state.tobeLoad = false;
		this.tier?.stree({ uri: this.uri, sk: this.albumsk, an: this.inclient.an,
			onOk: (resp: AnsonMsg<AnsonBody>) => {
				that.setState({forest: (resp.Body() as AnDatasetResp)?.forest});
			}},
			this.error);

		this.editForm = undefined;
	}

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
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
			anClient: this.inclient,
			uiHelper: this.anReact,
			hasError: this.state.hasError,
			iparent: this.props.iparent,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
		  {/* {<GalleryView cid={''} port='album' uri={'/local/album'} aid={this.props.aid}/>} */}
		  { <AnTreeditor2 {... this.props}
				pk={'pid'} sk={Protocol.sk.collectree}
				tier={this.tier} tnode={this.tier.root()} title={"title"}
				onSelectChange={() => undefined}
				uri={this.uri} mtabl='ind_emotion'
				parent={ undefined }
				columns={[
					{ type: 'text', field: 'folder', label: 'Photo Folders', grid: {sm: 4, md: 2} },
					{ type: 'text', field: 'tags',   label: L('Summary'), grid: {sm: 4, md: 2} },
					{ type: 'text', field: 'shareby',label: L('By'), grid: {xs: false, sm: 2} },
					{ type: 'actions', field: '',    label: '',      grid: {xs: 3, md: 2} }
				]}
			/> }
			{this.state.hasError &&
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
