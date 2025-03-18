import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, AnsonResp, AnsonMsg, ErrorCtx, AnTreeNode,
	SessionClient, 
    Semantier,
    SyncDoc,
    PageInf,
    OnLoadOk} from '@anclient/semantier';
import { Langstrs, AnReactExt,
	jsample, JsonHosts, CrudComp, AnTreegrid, AnTreegridCol,
	Comprops, regex, 
    ClassNames} from '../../../src/an-components';
import { AlbumTier } from './tiers/album-tier';

/** Run ext/gen_jwtoken.mjs first. */
import {config_docx as config, dockey_docx, token_docx} from './ext/doc-res-config.mjs';

const { JsampleTheme } = jsample;

type DocViewProps = {
	servs: JsonHosts;
	servId: string;

    /** OnlyOffice js resource link */
    onlyjs: string;

    /** doc (url) */
    docurl: string;

	/** OnlyOffice token */
	token: string;
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

    DocsAPI: any;
    docdiv: string = 'docview';

	constructor(props: Readonly<DocViewProps>) {
		super(props);

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.errctx = {onError: this.onError, msg: ''};

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
		if (this.props.onlyjs) {
			script.src = this.props.onlyjs;
			script.async = true;

			script.onload = () => {
				this.setState({ scriptLoaded: true });
				this.loadOnlyOffice(this.props.token);
				console.log('Load successfully', this.props.onlyjs);
			};

			script.onerror = () => {
				console.error('Failed to load script', this.props.onlyjs);
				this.onErrorClose();
			};

			document.body.appendChild(script);
			this.script = script;
		}
    }

    loadOnlyOffice(token: string) {
		let conf = structuredClone(config);
		conf.document.key = this.props.dockey
		conf.token = token;

        if (!this.DocsAPI)
            this.DocsAPI = new (window as any).DocsAPI.DocEditor(this.docdiv, conf);
    }

	render() {
        const { scriptLoaded } = this.state;
        if (scriptLoaded && (window as any).DocsAPI) {
            return <div id={this.docdiv} style={{height: 'calc(100vh)'}}/>;
        }
	}

	/**
     * See ./less-app.tsx/App.bindHtml()
     */
	static bindHtml(elem: string, opts: { docurl: string; serv?: "host"; home?: string; jsonUrl: string; }) {
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.loadServs(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: { serv: string; }, json: JsonHosts) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<Widgets servs={json} servId={opts.serv} iwindow={window}
				onlyjs='http://dev.inforise.com.cn:8960/web-apps/apps/api/documents/api.js'
				dockey={dockey_docx}
				token={token_docx}
			/>, dom);
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
    // onlysign(config: OnlyConfig, algo: { algorithm: string; } = { algorithm: 'HS256' }) {
    //     const onlySecret = 'mysecretkey';
    //     config.token = jwt.sign(config, onlySecret, algo);
    //     return config;
    // }

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
		super({uri, synuri: 'not-used', client, comp: tree});
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
