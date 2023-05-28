import { Comprops, CrudComp } from '../../../../src/an-components';
import { Protocol, AnsonMsg, AnsonBody, PageInf,
	Semantier, SessionClient, Tierec, UserReq, AnDatasetResp, AnTreeNode
} from '@anclient/semantier';
import { PhotoProps } from '../../../../src/photo-gallery/src/Photo';
import { StreeTier } from './stree-tier';

const debug = true;

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
};

export interface PhotoRec extends Tierec {
	/** pid */
	recId?: string,
	/** card title */
	pname?: string,
	shareby?: string | undefined,
	sharedate?: string,
	css?: any,
	device?: string,

	src: string,
	srcSet?: Array<string>,
	width: number,
	height: number
};

export class GalleryTier extends Semantier {
	comp: CrudComp<Comprops>;
	port: string = "album";

	page: AlbumPage;
	collectRecords?: PhotoCollect[];

	/**
	 * @param props
	 */
	constructor(props: {uri: string, client: SessionClient, album: string, comp: CrudComp<Comprops>}, ) {
		super(props);
		console.log(this.uri);
		this.comp = props.comp;
		this.client = props.client;

		this.page = new AlbumPage({album: props.album});
	}

	/**
	 * Get photo for my album. 
	 * File system uri is not replaced with file. The img tag should use delay attributes and load file according to uri.
	 * The file uri is an identifier of files managed by jserv, not same as function uri for Anclient component.
	 * 
	 * @override(Semantier)
	 */
    collects(conds: PageInf, onLoad: ((collects?: PhotoCollect[]) => void)) : void {
		if (!this.client) {
			console.error("Anclient is not ready yet.");
			return;
		}

		let client = this.client;

		let req = client.userReq( this.uri, this.port,
					new AlbumReq( {uri: this.uri, page: conds} )
					.A(AlbumReq.A.records) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as AlbumResp;
				if (body) {
					// let {cols, rows} = AnsonResp.rs2arr(body.Rs());
					this.collectRecords = body.collects;
					onLoad(this.collectRecords);
				}
			},
			this.errCtx);
		onLoad(this.collectRecords);
	}

    myAlbum(onLoad: ((collects?: PhotoCollect[]) => void)): void {
        this.collects(this.page, onLoad);
    }

	toGalleryImgs(idx: number) {
		let that = this;
		let imgs = [] as PhotoProps<PhotoRec>[];
		if (this.collectRecords) {
			let album = this.collectRecords[idx];
			album.photos.forEach( (p, x) => {
				console.log(p);
				if (!p.recId) return;

				let src = that.imgSrc(p.recId);
				let srcSet = [src];

				let css = JSON.parse(p.css);
				let size = css?.size;
				let width = size && size.length > 2 ? size[2] : 4;
				let height = size && size.length > 3 ? size[3] : 3;

				let alt = `${p.title? ' # ' + p.title : p.sharedate || ''} by ${p.shareby || 'Anonym'}`;

				imgs.push( {
					src: "",
					srcSet,
					width,
					height,
					alt,
					title: alt, 
					key: x.toString()
				} );
			} );
		}
		return imgs;
	}

	/**
	 * Compose src of img tag, with AlbumReq request as anson64 parameter.
	 * 
	 * @param recId potho id
	 * @returns 
	 */
	imgSrc(recId: string) : string {
		let req = new AlbumReq({uri: this.uri, page: this.page});
		req.a = AlbumReq.A.download;
		req.pageInf.albumId = recId;

		let msg = this.client.an.getReq<AlbumReq>(this.port, req);

		return GalleryTier.servUrl(this.client.an.servUrl(this.port), msg);
	}

	static servUrl(jserv: string, msg: AnsonMsg<AlbumReq>) {
		if (debug)
			console.log(msg);

		// use <img src='anson64'/> to GET Http resource
		return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
	}
};

interface AlbumRec extends Tierec {
	/** Album Id (h_albems.aid) */
	album?: string;

	/** Collects' ids */
	collects?: Array<PhotoCollect>;

	/** Collects' default length (first page size) */
	collectSize?: number;

	/** Photos ids, but what's for? */
	collect?: Array<string>;
}

class AlbumPage extends PageInf {
	/** A temperoray solution before PageInf.condts evolved to Tierec. */
	qrec?: AlbumRec;

	collectIds?: string[];
	pids?: string[];
	albumId?: string | undefined;

	constructor (query?: AlbumRec) {
		super();
		this.qrec = query;
	}
}

class AlbumReq extends UserReq {
 	static __type__ = 'io.oz.sandbox.album.AlbumReq';
	static A = {
		records: 'r/collects',
		collect: 'r/photos',
		rec: 'r/photo',
		download: 'r/download',
		update: 'u',
		insert: 'c',
		upload: 'c/doc',
		del: 'd',
	};

	pageInf: AlbumPage;
	sk: string;

	constructor (opts: {uri: string, sk?: string, page?: AlbumPage}) {
		super(opts.uri, undefined);
		this.type = AlbumReq.__type__; // 'io.oz.album.tier.AlbumReq';

		let {page, sk} = opts;
		this.pageInf = opts.page;
		this.sk = sk;

		if (page?.qrec) {
			this.pageInf.albumId = page.qrec.album;
			this.pageInf.collectIds = page.qrec.collectIds as string[];
			this.pageInf.pids = page.qrec.collect;
		}
	}
}
StreeTier.registTierequest('album', (opts) => { return new AlbumReq(opts); });

class Profiles extends AnsonBody {

	home: string;
	maxUsers: number;
	servtype: number;

	constructor (obj: { servtype: number; maxUsers: number; home: string }) {
		super( { type: 'io.oz.album.tier.Profiles' } );
		this.home = obj.home;
		this.maxUsers = obj.maxUsers;
		this.servtype = obj.servtype;
	}
}

Protocol.registerBody('io.oz.album.tier.Profiles', (jsonBd) => { return new Profiles(jsonBd); });

class AlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.sandbox.album.AlbumResp';
	album?: AlbumRec;

	profils?: Profiles;

	collect?: Array<string>;
	collects?: Array<PhotoCollect>;

	photo?: PhotoRec;

	constructor (resp: AlbumRec & {forest: AnTreeNode[], profiles?: Profiles, photo?: PhotoRec, collect?: Array<string>}) {
		super({
			forest: resp.forest
		});

		this.album = resp;
		this.collect = resp.collect;
		this.profils = resp.profiles;
		this.collects = resp.collects;
	}
}

Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
