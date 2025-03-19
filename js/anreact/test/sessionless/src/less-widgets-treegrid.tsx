import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { Protocol, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode,
	SessionClient, AnDatasetResp, size } from '@anclient/semantier';
import { L, Langstrs, AnContext, AnError, AnReactExt,
	jsample, JsonHosts, Login, CrudComp, AnTreegrid, AnTreegridCol,
	Comprops, regex, GalleryView, PdfIframe } from '../../../src/an-components';
import { AlbumTier } from './tiers/album-tier';

const { JsampleTheme } = jsample;

const testData: AnTreeNode[] = [
  { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
	"id": "f/zsu.2019_08",
	"node": {
		"folder": "f/zsu",
		"pname": "2019_08",
		"nodetype": "gallery",
		"shareby": "ody",
		"mime": "image/jpeg",
		"pid": "f/zsu.2019_08",
		"sort": "2019_08",
		"img": "1",
		"geo": "0",
		"mov": "0",
		"children": [
			{ "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
					"img": "147456",
					"folder": "f/zsu.2019_08",
					"nodetype": "p",
					"shareby": "ody",
					"pname": "my.jpg",
					"fullpath": "f/zsu.2019_08000000HC",
					"mime": "image/jpeg",
					"pid": "000000HC",
					"sort": "2019-08-18 01:38:21"
				},
				"parent": "io.odysz.anson.utils.TreeIndenode",
				"indents": [
					"childx"
				],
				"lastSibling": true,
				"level": 1,
				"id": "000000HC",
				"parentId": "f/zsu.2019_08"
			}
		],
		"fullpath": "f/zsu.2019_08",
		"fav": "0"
	},
	"parent": "io.odysz.anson.utils.TreeIndenode",
	"indents": [], "lastSibling": false,
	"level": 0,
	"parentId": null
  },
  { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
    "node": {
        "pname": "tractor-brigade",
        "img": "0",
        "nodetype": "gallery",
        "shareby": "syrskyi",
        "mime": "video/mp4",
        "pid": "f/zsu.tractor-brigade",
        "sort": "tractor-brigade",
        "geo": "0",
        "folder": "f/zsu",
        "mov": "1",
        "children": [
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"img": "4128768",
				"folder": "f/zsu.tractor-brigade",
				"nodetype": "p",
				"shareby": "syrskyi",
				"pname": "Amelia Anisovych.mp4",
				"fullpath": "f/zsu.tractor-brigade000000FM",
				"mime": "video/mp4",
				"pid": "000000FM",
				"sort": "2022-11-14 15:23:50"
			},
			"parent": "io.odysz.anson.utils.TreeIndenode",
			"indents": [
				"childx"
			],
			"lastSibling": true,
			"level": 1,
			"id": "000000FM",
			"parentId": "f/zsu.tractor-brigade"
		  }
        ],
        "fullpath": "f/zsu.tractor-brigade",
        "fav": "0"
    },
    "parent": "io.odysz.anson.utils.TreeIndenode",
    "indents": [],
    "lastSibling": false,
    "level": 0,
    "id": "f/zsu.tractor-brigade",
    "parentId": null
  }
];

type LessProps = {
	servs: JsonHosts;
	servId: string;
	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: any; // window object
}

/**
 * Widgets Tests
 */
class TreegridApp extends React.Component<LessProps> {
	/**
	 * {@link InsercureClient}
	 */
	ssclient: SessionClient;

	/** 
	 * The uiHelper of @anclient/anreact.
	 */
	anReact: AnReactExt;  // helper for React

	treetier: TestreeTier;

	errctx: ErrorCtx;

	state = {
		hasError: false,
		/** Url of page provided in context for navigation when user logged out from main app. */
		iportal: 'portal.html',

		nextAction: undefined, // e.g. re-login

		/** json object specifying host's urls */
		servs: undefined,
		/** the serv id for picking url */
		servId: '',

		reload: false
	};

	doctreesk  = 'tree-docs-folder';
	uri = '/album/tree';

	docIcon: any;
	pdfview: JSX.Element;
	gridref: typeof AnTreegrid;

	constructor(props: LessProps | Readonly<LessProps>) {
		super(props);

		this.state.iportal = this.props.iportal;

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);

		this.state.servId = this.props.servId;
		this.state.servs = this.props.servs;

		this.errctx = {onError: this.onError, msg: ''};

		this.state = Object.assign(this.state, {
			nextAction: 're-login',
			hasError: false,
			msg: undefined
		});

		/* this.ssclient = new Inseclient({urlRoot: this.state.servs[this.props.servId]});
		 *
		 * With SessionClient, AnClient.js won't work like this as the client need to be built after logged in.
		 *
			this.ssclient = new SessionClient();
			this.ssclient.an.init(this.state.servs[this.props.servId]);
			this.anReact  = new AnReactExt(this.ssclient, this.errctx)
								.extendPorts({album: 'album.less'});
			this.albumtier = new TestreeTier(this.albumUri);
		*/
	}

	onError(c: any, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body().msg(), r);
		this.errctx.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
		}
		this.setState({hasError: false});
	}

	/**
	 * Login as test robot, which is accutally a session based IUser instance.
	 * 
	 * Build AnClient & Semantier here, which is the same scenario of opening home page after logged in. 
	 * 
	 * TODO doc: this is another style of intitializing AnClient and SessionClient.
	 * 
	 * @param c instenct of AnClient.js
	 */
	onLogin(c: SessionClient): void {
		this.ssclient = c;
		this.ssclient.an.init(this.state.servs[this.props.servId]);

		this.anReact  = new AnReactExt(this.ssclient, this.errctx)
							// .extendPorts({album: 'album.less'});
							.extendPorts({docoll: 'docoll.syn'});

		this.treetier = new TestreeTier(this, c);

		this.toSearch();
	}

	toSearch() {
		let that = this;

		this.treetier.stree({ uri: this.uri, synuri: this.treetier.synuri, sk: this.doctreesk, port: this.treetier.port,
			onOk: (resp: AnsonMsg<AnDatasetResp>) => {
				that.treetier.forest = resp.Body().forest as AnTreeNode[]; 
				console.log(that.treetier.forest);
				that.setState({});
			}},
			this.errctx);

		this.onErrorClose();
	}

	typeParser(c: AnTreegridCol, n: AnTreeNode, opt: Comprops) {
		if (n.node.children?.length as number > 0) return <></>;

		else {
			let mime = n.node['mime'] || '?';
			let ext = regex.mime2type(mime as string);
			return (<>{`[${ext}]`}</>)
		}
	}

	closeButton = () => {
		let config = {iconSize: 5};

		return (
			<div style={{
				background: '#cacaca77',
				position: 'absolute',
				top: '0px', right: '0px',
				padding: '10px', cursor: 'pointer',
				color: '#FFFFFF',
				fontSize: `${config.iconSize * 0.8}px`
			  }}
			  onClick={ (e) => {
						console.log(e);
						this.pdfview = undefined;
						this.setState({});
					} }>
			  <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#FFFFFF">
				<path d="M0 0h24v24H0z" fill="none" />
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
			  </svg>
			</div>
		);
	}

	viewFile = (ids: Map<string, AnTreeNode>) => {
		// const pdfhead = (
		// 	<script src="//mozilla.github.io/pdf.js/build/pdf.mjs"></script>
		//   );
		if (size(ids) > 0) {
			let fid = ids.keys().next().value;
			let file = ids.get(fid);
			let t = regex.mime2type(file.node.mime as string);
			if (t === '.pdf') {
				console.log(fid);
				this.pdfview = (<PdfIframe
					close={ (e) => {
						// console.log(e);
						this.pdfview = undefined;
						this.setState({});
					} }
					src={GalleryView.imgSrcReq(file.id, "h_photos", {...this.treetier, docuri: () => this.treetier.synuri})}
				></PdfIframe>);

				// this.pdfview = (<><Iframe
				// 		head={() => pdfhead} styles={{height: '95vh', position: 'absolute', top: '2.5vh', width: '98vw', left: '1vh'}}
				// 		url={GalleryView.imgSrcReq(file.id, "h_photos", {...this.treetier, docuri: ()=> this.treetier.synuri})}>
				// 	</Iframe>
				// 	{this.closeButton()}</>
				// 	)
			}
			else {
				this.pdfview = undefined;
				this.errctx.msg = L(`Type ${t} is not supported yet.`);
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
	  let reload =this.state.reload;
	  this.state.reload = false;

	  return (
		<MuiThemeProvider theme={JsampleTheme}>
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				servId  : this.state.servId,
				servs   : this.props.servs,
				anClient: this.ssclient,
				uiHelper: this.anReact,
				hasError: this.state.hasError,
				iparent : this.props.iparent,
				ihome   : this.props.iportal || 'portal.html',
				error   : this.errctx,
				ssInf   : undefined,
			}} >
				<Login uri={this.uri} onLogin={this.onLogin} config={{userid: 'ody', pswd: '8964'}}/>
                {this.treetier && Date().toString()}
				<hr/>
                {this.treetier && <AnTreegrid key={this.doctreesk}
					singleCheck
					parent={undefined} lastSibling={false}
					uri={this.uri} reload={reload}
					tier={this.treetier}
					pk={'NA'} sk={this.doctreesk}
					columns={[ // noly card for folder header
						{ type: 'iconame', field: 'docname', label: L('Name'),
						  grid: {xs: 9, sm: 6, md: 4} },
						{ type: 'text', field: 'mime', label: L('type'), colFormatter: this.typeParser,
						  grid: {xs: 1, sm: 1, md: 1} },
						{ type: 'text', field: 'shareby', label: L('share by'),
						  grid: {xs: false, sm: 3, md: 2} },
						{ type: 'text', field: 'filesize', label: L('size'),
						  grid: {xs: false, sm: 2, md: 2} },
						// { type: 'actions', field: 'NA', label: '', grid: {xs: 3, md: 3} }
					]}
					onSelectChange={this.viewFile}
					onThClick={()=> this.toSearch()}
					testData={testData}
				/>}
				{ this.pdfview }
				{ this.state.hasError && <AnError
					title={L('Error')} msg={this.errctx.msg}
					uri={this.uri} tier={undefined}
				    fullScreen={false} onClose={this.onErrorClose} /> }
			</AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
     * See ./less-app.tsx/App.bindHtml()
     */
	static bindHtml(elem: string, opts: { portal?: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		let portal = opts.portal ?? 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonHosts) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<TreegridApp servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

class TestreeTier extends AlbumTier {
	forest: AnTreeNode[];

	sysroot(): AnTreeNode {
	  return {
		type: "io.odysz.semantic.DA.DatasetCfg.AnTreeNode",
		node: {
			nodetype: 'card',
			shareby: 'tester',
			mime: "image/jepg"
		},
		id: 'n01',
		level: 0,
		parent: undefined,
	  }
	}

	constructor(tree: CrudComp<any>, client?: SessionClient) {
		super({uri: '/album/sys', synuri: '/album/syn',
			port: 'docoll', // override and compitiable for both 0.7.0 and 0.6.5, supposed to be a key issue for Antson 2.0.
			client, comp: tree,
		});
		this.client = client;
	}

	treeroot(): AnTreeNode {
	  return {
		type: "io.odysz.semantic.DA.DatasetCfg.AnTreeNode",
		node: {
			nodetype: 'card',
			shareby: 'tester',
			mime: "image/jepg"
		},
		id: 'p0',
		level: 0,
		parent: undefined,
	  }
	}
}

export { TreegridApp };
