import React from 'react';
import ReactDOM from 'react-dom';
import jwt from 'jsonwebtoken';

import { Protocol, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode,
	SessionClient, size, 
    Semantier,
    SyncDoc,
    PageInf,
    OnLoadOk} from '@anclient/semantier';
import { L, Langstrs, AnContext, AnError, AnReactExt,
	jsample, JsonServs, Login, CrudComp, AnTreegrid, AnTreegridCol,
	Comprops, regex, GalleryView,
    ClassNames} from '../../../src/an-components';
import { AlbumTier } from './tiers/album-tier';


// console.log('Process available:', typeof process !== 'undefined' ? process : 'undefined');

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

type DocViewProps = {
	servs: JsonServs;
	servId: string;

    /** OnlyOffice js resource link */
    onlyjs: string;

    /** doc (url) */
    docurl: string;
}

/**
 * Widgets Tests
 */
class Widgets extends React.Component<DocViewProps> {
    tier: DocTier;
    classes: ClassNames;
    props: any;

	errctx: ErrorCtx;

	state = {
        scriptLoaded: false,
	};

	uri = '/test/docview';

	docIcon: any;
	pdfview: JSX.Element;
	gridref: typeof AnTreegrid;

    script: HTMLScriptElement;

    doc: { onlyjs: string; url: string; };
    DocsAPI: any;
    docdiv: string = 'docview';

	constructor(props: Readonly<DocViewProps>) {
		super(props);

        // console.log("process", typeof process);

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.errctx = {onError: this.onError, msg: ''};

        this.doc = {onlyjs: props.onlyjs, url: props.docurl};

		this.state = Object.assign(this.state, {
			hasError: false,
			msg: undefined
		});
	}

	onError(c: any, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body().msg(), r);
		this.errctx.msg = r.Body().msg();
		this.setState({
			hasError: !!c,
			nextAction: c === Protocol.MsgCode.exSession ? 're-login' : 'ignore'});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	typeParser(c: AnTreegridCol, n: AnTreeNode, opt: Comprops) {
		if (n.node.children?.length as number > 0) return <></>;

		else {
			let mime = n.node['mime'] || '?';
			let ext = regex.mime2type(mime as string);
			return (<>{`[${ext}]`}</>)
		}
	}

    componentDidMount() {
        const script = document.createElement('script');
        // script.src = 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js';
        script.src = this.doc.onlyjs; // 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js';
        script.async = true;

        script.onload = () => {
            this.setState({ scriptLoaded: true });
            this.loadOnlyOffice();
            console.log('Load successfully', this.doc.onlyjs);
        };

        script.onerror = () => {
            console.error('Failed to load script', this.doc.onlyjs);
            this.onErrorClose();
        };

        document.body.appendChild(script);
        this.script = script;
    }

    loadOnlyOffice() {
        const config = {
            "document": {
                "fileType": "doc",
                "key": "unique-key-" + new Date().getTime(), // Unique key for each session
                "title": "Sample Document",
                "url": "http://ieee802.org:80/secmail/docIZSEwEqHFr.doc"
            },
            "documentType": "word", // Can be "word", "cell" (spreadsheet), or "slide" (presentation)
            "editorConfig": {
                "mode": "view", // "view" for read-only, "edit" for editing
                // "callbackUrl": "http://localhost:3000/save" // Where changes are sent (optional)
            },
            "height": "100%",
            "width": "100%",
            // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudCI6eyJmaWxlVHlwZSI6ImRvYyIsImtleSI6InVuaXF1ZS1rZXktMTc0MTg2MDQzMTc3NyIsInRpdGxlIjoiU2FtcGxlIERvY3VtZW50IiwidXJsIjoiaHR0cDovL2llZWU4MDIub3JnOjgwL3NlY21haWwvZG9jSVpTRXdFcUhGci5kb2MifSwiZG9jdW1lbnRUeXBlIjoid29yZCIsImVkaXRvckNvbmZpZyI6eyJtb2RlIjoidmlldyJ9LCJoZWlnaHQiOiIxMDAlIiwid2lkdGgiOiIxMDAlIiwiaWF0IjoxNzQxODYwNDMxfQ.ky49wyqles2wls2AWMQlJAfL_2WJDG_ybQXOeri-Y0I"
        } as OnlyConfig;

        // const onlyoffice_token = jwt.sign(config, this.tier.onlySecret, { algorithm: 'HS256' });
        this.tier.onlysign(config);

        if (!this.DocsAPI)
            this.DocsAPI = new (window as any).DocsAPI.DocEditor(this.docdiv, config);
    }

	render() {
        const { scriptLoaded } = this.state;
        if (scriptLoaded && (window as any).DocsAPI) {
            return (
                <div>
                    <div id={this.docdiv}/>
                </div>
            );
        }
	}

	/**
     * See ./less-app.tsx/App.bindHtml()
     */
	static bindHtml(elem: string, opts: { portal?: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		let portal = opts.portal ?? 'index.html';
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<Widgets servs={json} servId={opts.serv} iportal={portal} iwindow={window}/>, dom);
		}
	}

	static reportTranslation() {
		console.log(Langstrs.report());
	}
}

type OnlyConfig = {
    document: {
        fileType: string;
        key: string; // Unique key for each session
        title: string;
        url: string;
    };
    documentType: string; // Can be "word", "cell" (spreadsheet), or "slide" (presentation)
    editorConfig: {
        mode: string;
    };
    height: string;
    width: string;
    token: undefined;
};

class DocTier extends Semantier {
    onlysign(config: OnlyConfig, algo: { algorithm: string; } = { algorithm: 'HS256' }) {
        const onlySecret = 'mysecretkey';
        config.token = jwt.sign(config, onlySecret, algo);
        return config;
    }

    /**
     * @param props
     */
    constructor(props: {uri: string}) {
        super(props);
        console.log(this.uri);
    }

    /**
     * 
     * @param conds 
     * @param onLoad 
     * @returns 
     */
    override records<T extends SyncDoc>(conds: PageInf, onLoad: OnLoadOk<T>) {
        this.rows = [{eid: '01', ename: 'Abc@D', edate: '2021-10-10', extra: '100'}];
        onLoad([], this.rows as unknown as Array<T>);
        return this.rows;
    }

	docs(): Map<string, SyncDoc> {
		return new Map([['01',
			{type: '...', eid: '01', ename: 'Action Required', css: {important: true}, edate: '2021-10-10', mime: 'application/'} as SyncDoc]]);
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

	constructor(uri: string, tree: CrudComp<any>, client?: SessionClient) {
		super({uri, client, comp: tree});
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

export { Widgets };
