import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, 
	ErrorCtx, an, SessionClient} from '@anclient/semantier';

import { Langstrs, AnContext, AnReactExt, 
	JsonServs, AnreactAppOptions, CrudCompW, SynDocollPort } from '@anclient/anreact';
import { AlbumDocview } from './views/album-docview';

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

/**
 * Home page,
 * application main, context singleton and error handler
 */
export class App extends CrudCompW<AlbumProps> {
    inclient: Inseclient;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

	servs: JsonServs;
	config = {
		/** json object specifying host's urls */
		servs: {} as JsonServs,
		/** the serv id for picking url */
		servId: '',
	};
    nextAction: string | undefined;

	state = {
		hasError: false,
		showingDocs: false,
		sk: undefined,
	};

	editForm : undefined;
	ssclient : SessionClient | undefined;

	synuri: string | undefined;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.uri = "/sys/album";
		this.synuri = "/syn/album";

		this.onError = this.onError.bind(this);
		this.error   = {onError: this.onError, msg: ''};
		this.config.servId = this.props.servId;
		this.config.servs = this.props.servs;
		this.servs = this.props.servs;
		this.inclient = new Inseclient({urlRoot: this.servs[this.props.servId]});
		this.nextAction = 're-login',
		// Protocol.sk.cbbViewType = 'v-type';

        // DESIGN NOTES: extending ports shall be an automized processing
		this.anReact = new AnReactExt(this.inclient, this.error)
                        .extendPorts(SynDocollPort);
	}

	componentDidMount() {
		console.log(this.uri);
		if (!this.uri)
			console.warn("Application's uri is forced required since 0.9.105 for semantic.jserv 1.5.0.");

		// const ctx = this.context as unknown as AnContextType;
		this.login();
	}

	login() {
		let hosturl = this.config.servs[this.config.servId];
		let {userid, passwd} = this.props;

		let that = this;
		let loggedin = (client: SessionClient) => {
			that.ssclient = client;

			that.anReact = new AnReactExt(client, that.error)
							.extendPorts(SynDocollPort);
			that.setState({});
		}

		console.warn("Auto login with configured host-url, userid & passwd.",
					 hosturl, userid, `${passwd?.substring(0, 2)} ...`);
		an.init ( hosturl );
		an.loginWithUri( this.uri, userid as string, passwd as string, loggedin, this.error );
	}

	/*
	toSearch() {
		let that = this;
		let tier = this.albumtier as GalleryTier;

		if (!tier) return;

		tier.stree({ uri: this.uri,
			sk: this.state.showingDocs ? this.doctreesk : this.albumsk,
			onOk: (rep: AnsonMsg<AnsonResp>) => {
				tier.forest = (rep.Body() as AnDatasetResp).forest as AnTreeNode[];
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
		return (<Lightbox {...opts} showResourceCount photos={photos} tier={this.albumtier} />);
	}

	viewFile = (ids: Map<string, Tierec>) => {
		if (size(ids) > 0 && this.albumtier) {
			let fid = ids.keys().next().value;
			let file = ids.get(fid) as AnTreeNode;
			let t = regex.mime2type(file.node.mime as string || "");
			if (t === '.pdf') {
				this.pdfview = (<PdfViewer
					close={(e) => {
						this.pdfview = undefined;
						this.setState({});
					} }
					src={GalleryView.imgSrcReq(file?.id, this.albumtier)}
				></PdfViewer>);
			}
			else {
				this.pdfview = undefined;
				this.error.msg = L('Type {t} is not supported yet.', {t});
				this.setState({
					hasError: true,
					nextAction: 'ignore'});
			}
		}
		else {
			this.pdfview = undefined;
		}
		this.setState({});
	};

	render() {
	  let that = this;
	  return (
		<AnContext.Provider value={{
			servId  : this.config.servId,
			servs   : this.props.servs,
			anClient: this.ssclient as SessionClient,
			uiHelper: this.anReact,
			hasError: this.state.hasError,
			iparent : this.props.iparent,
			ihome   : this.props.iportal || 'portal.html',
			error   : this.error,
			ssInf   : undefined,
		}} >
		  { this.albumtier && (
			this.state.showingDocs ?
		    <AnTreegrid
				pk={''} singleCheck
				tier={this.albumtier}
				columns={[
				  { type: 'iconame', field: 'pname', label: L('File Name'),
					grid: {xs: 6, sm: 6, md: 5} },
				  { type: 'text', field: 'mime', label: L('type'),
					colFormatter: typeParser, // Customize a cell
					grid: {xs: 1} },
				  { type: 'text', field: 'shareby', label: L('share by'),
					grid: {xs: false, sm: 3, md: 2} },
				  { type: 'text', field: 'filesize', label: L('size'), 
					grid: {xs: false, sm: 2, md: 2}, thFormatter: this.switchDocMedias }
				]}
				onSelectChange={this.viewFile}
			/> :
		    <AnTreeditor {... this.props} reload={!this.state.showingDocs}
				pk={'pid'} sk={this.albumsk}
				tier={this.albumtier}
				tnode={this.albumtier.root()} title={this.albumtier.albumTitle}
				onSelectChange={() => undefined}
				uri={this.uri}
				columns={[
					{ type: 'text',     field: 'pname',  label: L('Folders'), grid: {xs: 5, sm: 4, md: 3} },
					{ type: 'icon-sum', field: '',       label: L('Summary'), grid: {sm: 4, md: 3} },
					{ type: 'text',     field: 'shareby',label: L('Share'),   grid: {sm: false, md: 3} },
					{ type: 'actions',  field: '',       label: '',           grid: {xs: 3, sm: 4, md: 3},
					  thFormatter: this.switchDocMedias, formatter: ()=>{} }
				]}
				lightbox={this.lightbox}
			/>) }
		  { this.pdfview }
		  { this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				uri={"/login"} tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
		</AnContext.Provider>
		);

		function typeParser(c: AnTreegridCol, n: AnTreeNode, opt?: CompOpts) {
			if (n.node.children?.length as number > 0) return <></>;
			else return that.docIcon.typeParser(c, n, opt);
		}
	} */

	render() {
		return (this.ssclient &&
		  <AnContext.Provider value={{
			  servId  : this.config.servId,
			  servs   : this.props.servs,
			  anClient: this.ssclient as SessionClient,
			  uiHelper: this.anReact,
			  hasError: this.state.hasError,
			  iparent : this.props.iparent,
			  ihome   : this.props.iportal || 'portal.html',
			  error   : this.error,
			  ssInf   : undefined,
		  }} >
			{/*<AlbumDocview uri={Admin.func_AlbumDocview} aid={''} />*/}
			<AlbumDocview uri={this.synuri} aid={''} />
		  </AnContext.Provider>
		|| <></>);
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
	static bindHtml(elem: string,
					opts: AnreactAppOptions & {aid: string, uid: string, pswd: string}) {
		let portal = opts.portal ?? 'index.html';
		let { aid, uid, pswd } = opts;
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
			  <App servs={json} servId={opts.serv || 'album'}
				aid={aid} iportal={portal} iwindow={window}
				userid={uid} passwd={pswd}
			  />, dom);
		}
	}
}
