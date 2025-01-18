
import { NV, AnDatasetResp, AnTreeNode, DatasetierReq, DocsReq, PageInf, Protocol, StreeTier, SyncDoc, Tierec, DatasetOpts
} from '@anclient/semantier';
import { PhotoProps } from '../photo-ts';

export class PhotoCSS {
	type: string = 'io.oz.album.peer.PhotoCSS';
	size: number[] = [0, 0, 0, 0];
}

export class PhotoRec extends SyncDoc {

	static __type__: 'io.oz.album.peer.PhotoRec';

	// type: string = PhotoRec.__type0__;

	/** pid */
	// recId?;

	/** card title */
	// pname?: string;
	/** Java type: Exifield */
	exif?: object | string;
	// mime?: string;
	geox?: string;
	geoy?: string;
	css? : PhotoCSS | string;
    wh?  : number[];

	srcSet?: Array<string>;
	width: number;
	height: number

	constructor (opt: {
            recId: string; src?: string; device?: string;
            css: string | PhotoCSS | undefined;
            wh: number[] }) {
		super(Object.assign(opt, {type: PhotoRec.__type__}));

		this.type = PhotoRec.__type__;

        this.css = opt.css;
        this.wh = opt.wh;
        this.width = opt.wh[0];
        this.height = opt.wh[1];
	}
};

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<SyncDoc>>;
};


export interface AlbumRec extends Tierec {
	/** Album Id (h_albems.aid) */
	album?: string;

	/** Collects' ids */
	collects?: Array<PhotoCollect>;

	/** Collects' default length (first page size) */
	collectSize?: number;

	/** Photos ids */
	photos?: Array<string>;

	/** Photo id */
	pid?: string;
}

export class AlbumPage extends PageInf {
	/** A temperoray solution before PageInf.condts evolved to Tierec.
	 * @deprecated
	 */
	qrec?: AlbumRec;

	constructor (query?: AlbumRec) {
		super();
		this.mapCondts = query;
	}
}

export class AlbumReq extends DocsReq {
	static __type__ = 'io.oz.album.peer.AlbumReq';

	static A = {
 		stree   : DatasetierReq.A.stree,
		records : 'r/collects',
		collect : 'r/photos',
		rec     : 'r/photo',
		folder  : 'r/folder',
		download: 'r/download',
		update  : 'u',
		insert  : 'c',
		upload  : 'c/doc',
		del     : 'd',

		shareRelation : 'r/share-relat',
		folderel      : 'r/rel-folder-org',
		updateFolderel: 'u/folder-rel',
	};

	// pageInf   : PageInf;
	albumId   : string | undefined;

	/** Missing in Java */
	cids?     : string[];

	/** Missing in Java */
	pids?     : string[];

	sk        : string;
	clearels? : boolean;

	/** Missing in Java */
	checkRels?: Array<NV[]>;

	photo?    : PhotoRec;

	constructor (opt: {uri?: string, synuri: string, page?: AlbumPage, sk?: string}) {
		super(opt.uri, {docId: '', synuri: opt.synuri, docFieldType: SyncDoc.__type0__});
		this.type = AlbumReq.__type__;

		let {page, sk} = opt;
		this.pageInf = opt.page;
		this.sk = sk;

		if (page?.qrec) {
			this.albumId = page.qrec.album;
			this.cids = page.qrec.collects?.map((c) => c.recId as string);
			this.pids = page.qrec.photos;
		}
	}

	clearelations(clearel: boolean) {
		this.clearels = clearel;
		return this;
	}
	
	/**
	 * 
	 * @param rows relation table records
	 * @param folder the current folder to update checked rows (of child relation table)
	 * @returns this
	 */
	shareTree(rows: Array<NV[]>, folder) {
		this.checkRels = rows;
		// this.subfolder = folder;
		return this;
	}
}
// v 0.6.5
StreeTier.registTierequest('album', (opts: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf, synuri: string}) => new AlbumReq(opts));
// v 0.7
StreeTier.registTierequest('docoll', (opts: DatasetOpts & {sk: string, sqlArgs?: string[], page?: PageInf, synuri: string}) => new AlbumReq(opts));

export class AlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.album.peer.AlbumResp';
	album?: AlbumRec;

	collect?: Array<string>;
	collects?: Array<PhotoCollect>;

	photo?: PhotoRec;

	constructor (resp: AlbumRec & {
			forest: AnTreeNode[], // profiles?: Profiles,
			photo?: PhotoRec, collect?: Array<string>}) {
		super({
			forest: resp.forest
		});

		this.album = resp;
		this.photo = resp.photo;
		this.collect = resp.collect;
		this.collects = resp.collects;
	}
}
Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
