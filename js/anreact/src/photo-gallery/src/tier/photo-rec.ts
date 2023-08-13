
import { AnDatasetResp, AnTreeNode, DatasetierReq, DocsReq, PageInf, Protocol, StreeTier, SyncDoc, Tierec
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
	/** A temperoray solution before PageInf.condts evolved to Tierec. */
	qrec?: AlbumRec;

	constructor (query?: AlbumRec) {
		super();
		this.qrec = query;
	}
}

export class AlbumReq extends DocsReq {
	static __type__ = 'io.oz.album.tier.AlbumReq';

	static A = {
 		stree: DatasetierReq.A.stree,
		records: 'r/collects',
		collect: 'r/photos',
		rec: 'r/photo',
		download: 'r/download',
		update: 'u',
		insert: 'c',
		upload: 'c/doc',
		del: 'd'
	};

	pageInf: PageInf;
	albumId: string | undefined;
	cids?: string[];
	pids?: string[];
	sk: string;

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
		this.collect = resp.collect;
		this.collects = resp.collects;
	}
}
Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
