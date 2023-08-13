import * as CSS from 'csstype';

import { SessionClient } from './anclient';

import { AnsonValue, Protocol, DatasetOpts, DatasetierReq, LogAct, PageInf, AnsonBody } from './protocol';

import { Semantier, Tierec, UIComponent, ErrorCtx } from './semantier';


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

		mime?: string;

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

export class AlbumRec {
	static __type__: "io.oz.sandbox.album.AlbumRec";

	type: string;

	/** Album Id (h_albems.aid) */
	album?: string;

	/** Collects' ids */
	collects?: Array<Tierec>;

	/** Collects' default length (first page size) */
	collectSize?: number;

	/** Photos ids, but what's for? */
	collect?: Array<string>;

	// [f: string]: string | number | boolean | object;

	contructor () {
		this.type = AlbumRec.__type__;
	}
}

/**
 * Light weight wrapper of Anreact.stree(), in consists with Semantier style.
 * A helper of binding tree data to anreact Treeditor.
 */
export class StreeTier extends Semantier {
    static reqFactories: {[t: string]: (v: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf}) => AnsonBody} = {};
    static registTierequest(port: string, factory: (v: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf}) => AnsonBody) {
        if (this.reqFactories[port])
            console.warn("Replacing new facotry of ", port, factory);

        this.reqFactories[port] = factory;

        Protocol.registerBody(factory({uri: '', sk: ''}).type, factory);
    }

    /** DESIGN MEMO: Once semantier can be generated, port will be force to be required. */
    port: string;

	forest: AnTreeNode[];

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
	stree(opts: DatasetOpts & {act?: LogAct, uri?: string}, errCtx: ErrorCtx): void {
        opts.port = opts.port || this.port;

        if (!opts.onOk)
            console.warn("StreeTier.stree(): Loading s-tree without result handling?", opts);

		// Semantier.stree(opts, this.client, onload, this.errCtx);
        // implemention 2:
        if (!opts.port)
		 	throw Error('Decision since @anclient/anreact 0.4.25, port name is needed to load a tree.');
        if (!StreeTier.reqFactories[opts.port])
		 	throw Error("To handle tree with StreeTier, user request's factory must registered. Need factory for port: " + opts.port);
        
        if (!(this.client instanceof SessionClient))
            throw Error('Needing a intance of AnClient.');

		let reqbody = StreeTier.reqFactories[opts.port](opts).A(DatasetierReq.A.stree);

		let jreq = this.client.userReq(this.uri, opts.port, reqbody, opts.act);

		this.client.an.post(jreq, opts.onOk, errCtx);
    }
}

/** SyncDoc is currently an abstract class for __type__ is absent, which makes this class can not be deserialized. */
export class SyncDoc implements Tierec {
	static __type0__: 'io.odysz.semantic.tier.docs.SynDoc';
    [f: string]: AnsonValue; // string | number | boolean | object;

	type?: string;

	/** pid */
	docId?: string;

	/** card title */
	pname?: string;
	shareby?: string | undefined;
	sharedate?: string;
	// css?: object | string;
	device?: string;

	src: string;
	// srcSet?: Array<string>;
	// width: number;
	// height: number

	constructor (opt: { recId: any; src?: any; device?: string, type: string}) {
		// this.type = SyncDoc.__type0__;
		this.type = opt.type;
		this.src = opt.src
		this.docId = opt.recId;
		this.device = opt.device;
	}

	/**
	 * A helper for compse shared-by label, with only text handling.
	 * @param p photo, doc etc. 
	 * @returns 
	 */
	static shareLable(p: {shareby?: string, device?: string}): string {
		return ((p.shareby && p.device)
			? `shared by ${p.shareby} @ ${p.device}`
			: p.shareby
			?  `shared by ${p.shareby}`
			: undefined );
	}
}

// export class PhotoRec implements Tierec {
// 	static __type__: 'io.oz.album.tier.PhotoRec';

//     [f: string]: string | number | boolean | object;

// 	type?: string;

// 	/** pid */
// 	recId?: string;
// 	/** card title */
// 	pname?: string;
// 	shareby?: string | undefined;
// 	sharedate?: string;
// 	css?: PhotoCSS | string;
// 	device?: string;

// 	src: string;
// 	srcSet?: Array<string>;
// 	width: number;
// 	height: number

// 	constructor (opt: { recId: any; src?: any; device?: string}) {
// 		this.type = PhotoRec.__type__;
// 		this.src = opt.src
// 		this.recId = opt.recId;
// 		this.device = opt.device;
// 	}

// 	shareLable() {
// 		return PhotoRec.toShareLable(this);
// 	}

// 	static toShareLable(p: {shareby?: string, device?: string}) {
// 		return ((p.shareby && p.device)
// 			? `shared by ${p.shareby} @ ${p.device}`
// 			: p.shareby ?
// 			`shared by ${p.shareby}`
// 			: undefined );
// 	}
// };

// export class AlbumReq extends DocsReq {
//  	static __type__ = 'io.oz.album.tier.AlbumReq';
// 	static A = {
// 		stree: DatasetierReq.A.stree,
// 		records: 'r/collects',
// 		collect: 'r/photos',
// 		rec: 'r/photo',
// 		download: 'r/download',
// 		update: 'u',
// 		insert: 'c',
// 		upload: 'c/doc',
// 		del: 'd',
// 	};

// 	pageInf: PageInf;
// 	sk: string;
// 	photo: PhotoRec;

// 	pid: string;

// 	constructor (opts: {uri?: string, sk?: string, qrec?: PhotoRec, page?: PageInf}) {
// 		super(opts.uri, {docId: opts.sk});
// 		this.type = AlbumReq.__type__; // 'io.oz.album.tier.AlbumReq';

// 		let {sk} = opts;
// 		this.pageInf = opts.page;
// 		this.sk = sk;

// 		this.photo = opts.qrec || new PhotoRec({recId: sk});
// 	}
// }
// StreeTier.registTierequest('album', (opts) => { return new AlbumReq(opts); });

// export class PhotoCSS {
// 	type: 'io.oz.album.tier.PhotoCSS';
// 	size: [0, 0, 0, 0];
// }
