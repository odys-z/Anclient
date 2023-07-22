import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, AnDatasetResp, 
	AnTreeNode, ErrorCtx, an, SessionClient
} from '@anclient/semantier';

import { L, Langstrs, AnContext, AnError, AnReactExt, Lightbox,
	JsonServs, AnreactAppOptions, AnTreeditor2, CrudCompW, AnContextType,
	AnTreegridCol, Media, ClassNames, AnTreegrid
} from '@anclient/anreact';
import { GalleryTier } from './gallerytier-less';
import { Button, Grid } from '@material-ui/core';
import { DocIcon } from './icons/doc-ico';

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
		/** json object specifying host's urls */
		servs: {} as JsonServs,
		/** the serv id for picking url */
		servId: '',
	};
    nextAction: string | undefined;

	albumsk = "tree-album-family-folder";
	doctreesk = 'tree-docs-folder';
	uri = 'example.js/album';

	state = {
		hasError: false,
		showingDocs: false,
		sk: undefined,
	};

	editForm : undefined;
	ssclient : SessionClient | undefined;
	albumtier: GalleryTier | undefined;
	docIcon: DocIcon;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.onError = this.onError.bind(this);
		this.error   = {onError: this.onError, msg: ''};
		this.onErrorClose = this.onErrorClose.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.switchDocMedias = this.switchDocMedias.bind(this);

		this.config.servId = this.props.servId;
		this.config.servs = this.props.servs;

		this.inclient = new Inseclient({urlRoot: this.config.servs[this.props.servId]});

		this.nextAction = 're-login',

		this.config = Object.assign({}, this.config);

		this.docIcon = new DocIcon();

		Protocol.sk.cbbViewType = 'v-type';

        // DESIGN NOTES: extending ports shall be an automized processing
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
		// TODO doc: App is context provider, not consumer.
		// So this.context won't work here.
		// const ctx = this.context as unknown as AnContextType;
		// let serv = ctx.servId || 'host';

		let hosturl = this.config.servs[this.config.servId];
		let {userid, passwd} = this.props;

		let that = this;
		let loggedin = (client: SessionClient) => {
			that.ssclient = client;

			this.anReact  = new AnReactExt(client, that.error)
				.extendPorts({album: 'album.less'});

			that.albumtier = new GalleryTier({uri: this.uri, comp: this, client});
			that.toSearch();
		}
	
		console.warn("Auto login with configured userid & passwd.",
					 hosturl, userid, passwd);
		an.init ( hosturl );
		an.login( userid as string, passwd as string, loggedin, this.error );
	}

	toSearch() {
		let that = this;
		let tier = this.albumtier as GalleryTier;

		if (!tier) return;

		tier.stree({ uri: this.uri,
			sk: this.state.showingDocs ? this.doctreesk : this.albumsk,
			onOk: (rep: AnsonMsg<AnsonResp>) => {
				tier.forest = (rep.Body() as AnDatasetResp).forest as AnTreeNode[]; 
				console.log(tier.forest);
				that.setState({});
			}},
			this.error);

		this.onErrorClose();
	}

	switchDocMedias (col: AnTreegridCol, ix: number, opts: {classes?: ClassNames, media?: Media} | undefined) {
		let that = this;
		return (
			<Grid item key={ix as number} {...col.grid}>
			<Button onClick={onToggle}
				className={opts?.classes?.toggle}
				startIcon={that.docIcon.toggleButton(opts)}
				// startIcon={<JsampleIcons.ThirdStateCheck />}
				color="primary" >
				{opts?.media?.isMd && L(`Filter: ${this.state.showingDocs ? L('Docs') : L('Medias')}`)}
			</Button>
			</Grid> );

		function onToggle(_e: React.MouseEvent) {
			that.state.showingDocs = !that.state.showingDocs;
			that.toSearch();
		}
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
	  let that = this;
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
		  { this.albumtier && (
			this.state.showingDocs ?
		    <AnTreegrid
				pk={''} onSelectChange={()=>{}}
				tier={this.albumtier}
				columns={[
				  { type: 'iconame', field: 'pname', label: L('Name'),
					grid: {sm: 6, md: 5} },
				  { type: 'text', field: 'mime', label: L('type'), colFormatter: typeParser,
					grid: {xs: 1} },
				  { type: 'text', field: 'shareby', label: L('share by'),
					grid: {xs: false, sm: 3, md: 2} },
				  { type: 'text', field: 'img', label: L('size'), colFormatter: folderSum,
					grid: {xs: false, sm: 2, md: 2}, thFormatter: this.switchDocMedias }
				]}
			/> :
		    <AnTreeditor2 {... this.props} reload={!this.state.showingDocs}
				pk={'pid'} sk={this.albumsk}
				tier={this.albumtier} tnode={this.albumtier.root()} title={this.albumtier.albumTitle}
				onSelectChange={() => undefined}
				uri={this.uri}
				columns={[
					{ type: 'text', field: 'folder', label: 'Folders', grid: {sm: 4, md: 3} },
					{ type: 'text', field: 'tags',   label: L('Summary'), grid: {sm: 4, md: 3} },
					{ type: 'text', field: 'shareby',label: L('By'), grid: {sm: false, md: 3} },
					// { type: 'actions', field: '',    label: '',      grid: {xs: 4, sm: 3} }
					{ type: 'actions', field: '', label: '', thFormatter: this.switchDocMedias, grid: {xs: 4, sm: 3} }
				]}
				lightbox={this.lightbox}
			/>) }
		  { this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				uri={"/login"} tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} />}
		</AnContext.Provider>
		);

		function typeParser(c: AnTreegridCol, n: AnTreeNode, opt: {classes: ClassNames, media: Media}) {
			if (n.node.children?.length as number > 0) return <></>;
			else return that.docIcon.typeParser(c, n, opt);
		}

		function folderSum() {
		}
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
