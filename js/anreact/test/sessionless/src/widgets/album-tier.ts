import { Protocol, AnsonBody, PageInf,
	SessionClient, AnDatasetResp, AnTreeNode, StreeTier
} from '@anclient/semantier';
import { Comprops, CrudComp, AlbumReq, PhotoCollect, PhotoRec, GalleryView, AlbumRec
} from '../../../../src/an-components';
import { PhotoProps } from '../../../../src/photo-gallery/src/Photo';

const debug = true;

// export interface PhotoCollect extends Tierec {
// 	title?: string;
// 	thumbUps?: Set<string>;
// 	hashtags?: Array<string>;
// 	shareby?: string;
// 	extlinks?: any; // another table?
// 	photos: Array<PhotoProps<PhotoRec>>;
// };

// export interface PhotoRec extends Tierec {
// 	/** pid */
// 	recId?: string,
// 	/** card title */
// 	pname?: string,
// 	shareby?: string | undefined,
// 	sharedate?: string,
// 	css?: any,
// 	device?: string,

// 	src: string,
// 	srcSet?: Array<string>,
// 	width: number,
// 	height: number
// };

export class AlbumTier extends StreeTier {
	comp: CrudComp<Comprops>;
	port: string = "album";

	page: PageInf;
	collects?: PhotoCollect[];

	/**
	 * @param props
	 */
	constructor(props: {uri: string, client: SessionClient, album?: string, comp: CrudComp<Comprops>}) {
		super(props);
		console.log(this.uri);
		this.comp = props.comp;
		this.client = props.client;

		this.page = new PageInf();
	}

	/**
	 * Get photo for my album. 
	 * File system uri is not replaced with file. The img tag should use delay attributes and load file according to uri.
	 * The file uri is an identifier of files managed by jserv, not same as function uri for Anclient component.
	 * 
	 * @override(Semantier)
	 */
    loadCollects(conds: PageInf, onLoad: ((collects?: PhotoCollect[]) => void)) : void {
		if (!this.client) {
			console.error("Anclient is not ready yet.");
			return;
		}

		let client = this.client;

		let req = client.userReq( this.uri, this.port,
					new AlbumReq( {uri: this.uri, page: conds} )
					.A(AlbumReq.A.stree) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as AlbumResp;
				if (body) {
					// let {cols, rows} = AnsonResp.rs2arr(body.Rs());
					this.collects = body.collects;
					onLoad(this.collects);
				}
			},
			this.errCtx);
		onLoad(this.collects);
	}

    loadCollect(onLoad: ((collect?: PhotoCollect) => void)): void {
        // this.records(this.page, onLoad);
    }

	toGalleryImgs(idx: number) {
		let that = this;
		let imgs = [] as PhotoProps<PhotoRec>[];
		if (this.collects) {
			let album = this.collects[idx];
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
					src,
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
		/*
		let req = new AlbumReq({uri: this.uri, page: this.page});
		req.a = AlbumReq.A.download;
		req.queryRec.album = recId;

		let msg = this.client.an.getReq<AlbumReq>(this.port, req);

		return AlbumTier.servUrl(this.client.an.servUrl(this.port), msg);
		*/
		return GalleryView.imgSrcReq(recId, { uri: this.uri, port: this.port, client: this.client});
	}

	// /**
	//  * Create an HTTP GET request for src of img tag.
	//  * 
	//  * @param uri 
	//  * @param pid 
	//  * @param port 
	//  * @param client 
	//  * @returns src for img, i.e. jserv?anst64=message-string 
	//  */
	// static imgReq(uri: string, pid: string, port: string, client: SessionClient) : string {
	// 	let req = new AlbumReq({uri, page: undefined});
	// 	req.a = AlbumReq.A.download;
	// 	req.pid = pid;

	// 	let msg = client.an.getReq<AlbumReq>(port, req);

	// 	// return AlbumTier.servUrl(client.an.servUrl(port), msg);
	// 	let jserv = client.an.servUrl(port);
	// 	return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
	// }

	// static servUrl(jserv: string, msg: AnsonMsg<AlbumReq>) {
	// 	if (debug)
	// 		console.log(msg);

	// 	// use <img src='anson64'/> to GET Http resource
	// 	return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
	// }
};

// class AlbumRec {
// 	static __type__: "io.oz.sandbox.album.AlbumRec";

// 	type: string;

// 	/** Album Id (h_albems.aid) */
// 	album?: string;

// 	/** Collects' ids */
// 	collects?: Array<PhotoCollect>;

// 	/** Collects' default length (first page size) */
// 	collectSize?: number;

// 	/** Photos ids, but what's for? */
// 	collect?: Array<string>;

// 	// [f: string]: string | number | boolean | object;

// 	contructor () {
// 		this.type = AlbumRec.__type__;
// 	}
// }

// /*
// class AlbumPage extends PageInf {
// 	static __type__: string;

// 	/** A temperoray solution before PageInf.condts evolved to Tierec. * /
// 	qrec?: AlbumRec;

// 	collectIds?: string[];
// 	pids?: string[];
// 	albumId?: string | undefined;

// 	constructor (query?: AlbumRec) {
// 		super();
// 		this.type = AlbumPage.__type__;
// 		this.qrec = query;
// 	}
// }
// */

// class AlbumReq extends UserReq {
//  	static __type__ = 'io.oz.sandbox.album.AlbumReq';
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

// 	// pageInf: AlbumPage;
// 	pageInf: PageInf;
// 	sk: string;
// 	queryRec: AlbumRec;

// 	pid: string;

// 	constructor (opts: {uri: string, sk?: string, qrec?: AlbumRec, page?: PageInf}) {
// 		super(opts.uri, undefined);
// 		this.type = AlbumReq.__type__; // 'io.oz.album.tier.AlbumReq';

// 		let {sk} = opts;
// 		this.pageInf = opts.page;
// 		this.sk = sk;

// 		// if (opts?.qrec) {
// 			this.queryRec = opts.qrec || new AlbumRec();
// 		// }
// 	}
// }
// StreeTier.registTierequest('album', (opts) => { return new AlbumReq(opts); });

// class Profiles extends AnsonBody {
// 	home: string;
// 	maxUsers: number;
// 	servtype: number;

// 	constructor (obj: { servtype: number; maxUsers: number; home: string }) {
// 		super( { type: 'io.oz.album.tier.Profiles' } );
// 		this.home = obj.home;
// 		this.maxUsers = obj.maxUsers;
// 		this.servtype = obj.servtype;
// 	}
// }
// Protocol.registerBody('io.oz.album.tier.Profiles', (jsonBd) => { return new Profiles(jsonBd); });

class AlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.sandbox.album.AlbumResp';
	album?: AlbumRec;

	// profils?: Profiles;

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
		// this.profils = resp.profiles;
		this.collects = resp.collects;
	}
}
Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
