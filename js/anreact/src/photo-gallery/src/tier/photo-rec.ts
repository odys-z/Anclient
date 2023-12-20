
import { NV, AnDatasetResp, AnTreeNode, DatasetierReq, DocsReq, PageInf, Protocol, StreeTier, SyncDoc, Tierec
} from '@anclient/semantier';
import { PhotoProps } from '../photo-ts';

export class PhotoCSS {
	type: string = 'io.oz.album.tier.PhotoCSS';
	size: number[] = [0, 0, 0, 0];
}

export class PhotoRec extends SyncDoc {

	static __type__: 'io.oz.album.tier.PhotoRec';

	type: string = PhotoRec.__type0__;

	/** pid */
	// recId?;

	/** card title */
	// pname?: string;
	css?: PhotoCSS | string;

	srcSet?: Array<string>;
	width: number;
	height: number
    wh?: number[];

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
	static __type__ = 'io.oz.album.tier.AlbumReq';

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

	pageInf   : PageInf;
	albumId   : string | undefined;
	cids?     : string[];
	pids?     : string[];
	sk        : string;
	clearels? : boolean;
	checkRels?: Array<NV[]>;

	constructor (opt: {uri?: string, page?: AlbumPage, sk?: string}) {
		super(opt.uri, {docId: ''});
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
		this.subfolder = folder;
		return this;
	}
}
StreeTier.registTierequest('album', (opts) => new AlbumReq(opts));

export class AlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.album.tier.AlbumResp';
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
