import * as CSS from 'csstype';

import { AnsonValue, DatasetOpts, DatasetierReq,
    ErrorCtx, LogAct, PageInf, AnClient, 
    Protocol, SessionClient, UIComponent, UserReq, isEmpty
} from './anclient';

import { Semantier, Tierec } from './semantier';

/**
 * expand: 'T'; collpase: e.g. '+', ...,
 * 
 * A tree widget uses this to find indent structure, then translate to icons via AnTreeIconsType.
 */
export type IndentIconame = 'expand' | 'collapse' | 'childi' | 'childx' | 'vlink' | 'spacex' | 'hlink' | 'deflt';
export type AnTreeIconsType =
        'deflt' | '+' | '-' | 'T' | '.' | '|-' | 'L' | 'E' | 'F' | '|' |
        'menu-lv0' | 'menu-lv1' | 'menu-leaf' | 'collapse' | 'expand' | 'pic-lib' | '!' | '[]' | '>' | 'b';

/**
 * Icons to compose tree item's indent, like indent of command npm ls:
 * @example
 * anclient/anreact
 	├─ anclient/anreact
	│  ├─ anclient/semantier
	│  ├─ babel/cli
	│  └─ webpack-cli
 	└─ anclient/super
       └─ webpack-cli
 */
export type IndentIcons = {
	[i in IndentIconame]: AnTreeIconsType;
}

/** Tree data node */
export class AnTreeNode implements Tierec {
    [f: string]: string | number | boolean | object;

	type = "io.odysz.semantic.DA.DatasetCfg.AnTreeNode";
	/** json data node, for ui node composition */
	node : {
		nodetype?: string;
		// id: string;
		children?: Array<AnTreeNode>;
		expandChildren?: boolean;

		/** With icon as a special field? */
		css?: CSS.Properties & {icon?: AnTreeIconsType, size?: number[]};

		/** Any data by jserv */
		[d: string]: AnsonValue;
	};
	id: string;
	parent: string;
	islastSibling?: boolean;
	level: number;
	/** Indent icon names */
	indents?: Array<IndentIconame>;
}

/**
 * defaults icons:
 * 
 * expand: 'T';
 * collapse: "+";
 * hlink: '-';
 * spacex: '.';
 * vlink: '|';
 * child0: '|-',
 * childx: 'L', last child;
 */
export const defltIcons: IndentIcons = {
    expand: 'T', collapse: '+', childi: '|-', childx: 'L',
    vlink: '|', spacex: '.', hlink: '-', deflt: '.'
};

/**
 * Light weight wrapper of Anreact.stree(), in consists with Semantier style.
 * A helper of binding tree data to anreact Treeditor.
 */
export class StreeTier extends Semantier {
    static reqFactories: {[t: string]: (v: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf}) => UserReq} = {};
    static registTierequest(port: string, factory: (v: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf}) => UserReq) {
        if (this.reqFactories[port])
            console.warn("Replacing new facotry of ", port, factory);

        this.reqFactories[port] = factory;

        Protocol.registerBody(factory({uri: '', sk: ''}).type, factory);
    }

    /** DESIGN MEMO: Once semantier can be generated, port will be force to be required. */
    port: string;

    /**
     * @param opts uri: client id; port: jserv port
     * DESIGN MEMO: Once semantier can be generated, port will be force to be required.
     */
    constructor(opts: UIComponent & {uri: string, port?: string}) {
        super(opts);
        this.port = opts.port || 'stree';
    }

    /**
     * New version Semantier.stree(), using the pattern of tier + UserReq, to load a semantic
     * tree, using request type of differnt tier, instead of fixed the type, AnDatasetReq.
     * 
     * Note: Response of stree() must be subclass of AnDatasetResp.
     * 
     * @param opts 
     * @param comp 
     */
	stree(opts: DatasetOpts & {act?: LogAct, uiHelper: AnClient}, errCtx: ErrorCtx): void {
        if (isEmpty(this.uiHelper))
            this.uiHelper = opts.uiHelper;
        opts.port = opts.port || this.port;

        if (!opts.onOk)
            console.warn("StreeTier.stree(): Loading s-tree without result handling?", opts);

		// let onload = opts.onOk || function (resp: AnsonMsg<AnDatasetResp>) {
		// 	comp?.setState({forest: resp.Body().forest});
		// }

		// Semantier.stree(opts, this.client, onload, this.errCtx);
        // implemention 2:
        if (!opts.port)
		 	throw Error('Decision since @anclient/anreact 0.4.25, port name is needed to load a tree.');
        if (!StreeTier.reqFactories[opts.port])
		 	throw Error("User request's factory must registered. Need factory for port: " + opts.port);
        
        if (!(this.client instanceof SessionClient))
            throw Error('Needing a intance of AnClient.');

		let reqbody = StreeTier.reqFactories[opts.port](opts).A(DatasetierReq.A.stree);

		let jreq = this.client.userReq(this.uri, opts.port, reqbody, opts.act);

        // let context = comp.context as AnContextType;
		// this.client.an.post(jreq, onload, context.error);
		this.client.an.post(jreq, opts.onOk, errCtx);
    }
}
