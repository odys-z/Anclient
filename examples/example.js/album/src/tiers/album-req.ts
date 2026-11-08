/**
 * Peers of jserv-album-lib, io.oz.album.peer, the album's own request / response types.
 * 
 * Java: semantic-jserv/jserv-album-lib/src/main/java/io/oz/album/peer/AlbumReq.java, AlbumResp.java
 * 
 * @since 0.8.0 (anreact), moved from @anclient/anreact/photo-gallery/src/tier/photo-rec.ts,
 * where only PhotoRec & MediaCss are kept, for the widgets.
 */
import { type NV, AnDatasetResp, AnTreeNode, DatasetierReq, DocsReq, PageInf, Protocol, StreeTier, SyncDoc, type Tierec, type DatasetOpts
} from '@anclient/semantier';
import { type PhotoProps, PhotoRec } from '@anclient/anreact';
import { SynDocollPort } from './syn-docoll-port';

/**
 * @deprecated
 */
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

	sk?       : string;
	clearels? : boolean;

	/** Missing in Java */
	checkRels?: Array<NV[]>;

	photo?    : PhotoRec;

	// docTabl, e.g. h_photos, is DocsReq.docTabl, the same as Java.

	constructor (opt: {uri?: string, synuri: string, page?: AlbumPage, sk?: string}) {
		super(opt.uri as string, {docId: '', synuri: opt.synuri, docFieldType: SyncDoc.__type0__}, AlbumReq.__type__);

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
	shareTree(rows: Array<NV[]>, folder?: string) {
		this.checkRels = rows;
		// this.subfolder = folder;
		return this;
	}
}
/**
 * The album registers its own request to its own port.
 * Anreact widgets, e.g. GalleryView.imgSrcReq(), create requests of a tier's port with this factory,
 * and only know them as DocsReq.
 */
StreeTier.registTierequest(SynDocollPort.docoll,
	(opts) => new AlbumReq(opts as DatasetOpts & {sk: string, page?: AlbumPage, synuri: string}),
	{uri: '-', synuri: '-', sk: '-'});

// ISSUE: should extends DocsResp. We need a better tool to generate the class, desperately.
export class AlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.album.peer.AlbumResp';
	album?: AlbumRec;

	collect?: Array<string>;
	collects?: Array<PhotoCollect>;

	photo?: PhotoRec;

	docTabl?: string;

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
