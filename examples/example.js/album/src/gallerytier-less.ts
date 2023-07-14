import { Comprops, CrudComp, PhotoCollect } from '@anclient/anreact';
import { Protocol, AnsonMsg, AnsonResp, AnsonBody, DocsReq,
	PageInf, SessionClient, StreeTier, Tierec, AnTreeNode, PhotoRec
} from '@anclient/semantier';

const debug = true;

export class GalleryTier extends StreeTier {
	comp: CrudComp<Comprops>;
	port: string = "album";

	page: AlbumPage;
	collectRecords?: PhotoCollect[];
	albumTitle: string = 'title';

	/**
	 * @param props
	 */
	constructor(props: {uri: string, client: SessionClient, comp: CrudComp<Comprops>}, ) {
		super(props);
		console.log(this.uri);
		this.comp = props.comp;
		this.client = props.client;

		this.page = new AlbumPage({});
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
					new AlbumReq( this.uri, conds as AlbumPage )
					.A(AlbumReq.A.records) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as AlbumResp;
				if (body) {
					// let {cols, rows} = AnsonResp.rs2arr(body.Rs());
					this.collectRecords = body.collectRecords;
					onLoad(this.collectRecords);
				}
			},
			this.errCtx);
		onLoad(this.collectRecords);
	}

	root(): AnTreeNode {
		return new AnTreeNode();
	}

    myAlbum(onLoad: ((collects?: PhotoCollect[]) => void)): void {
        this.collects(this.page, onLoad);
    }

	// /**
	//  * Compose src of img tag, with AlbumReq request as anson64 parameter.
	//  * 
	//  * @param recId potho id
	//  * @returns 
	//  */
	// imgSrc(recId: string) : string {
	// 	let req = new AlbumReq(this.uri, this.page);
	// 	req.a = AlbumReq.A.download;
	// 	req.docId = recId;

	// 	let msg = this.client.an.getReq<AlbumReq>(this.port, req);

	// 	return GalleryTier.servUrl(this.client.an.servUrl(this.port), msg);
	// }

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
	collects?: Array<string>;

	/** Collects' default length (first page size) */
	collectSize?: number;

	/** Photos ids */
	photos?: Array<string>;

	/** Photo id */
	pid?: string;
}

class AlbumPage extends PageInf {
	/** A temperoray solution before PageInf.condts evolved to Tierec. */
	qrec?: AlbumRec;

	constructor (query?: AlbumRec) {
		super();
		this.qrec = query;
	}
}

class AlbumReq extends DocsReq {
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

	pageInf: PageInf;
	albumId: string | undefined;
	cids?: string[];
	pids?: string[];

	constructor (uri: string, page: AlbumPage) {
		super(uri, {docId: ''});
		this.type = 'io.oz.album.tier.AlbumReq';

		this.pageInf = new PageInf(page);

		if (page.qrec) {
			this.albumId = page.qrec.album;
			this.cids = page.qrec.collects;
			this.pids = page.qrec.photos;
		}
	}
}

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

class AlbumResp extends AnsonResp {
	albumId: string | undefined;
	ownerId: string | undefined;
	owner: string | undefined;

	photo: PhotoRec | undefined;
	photos: Array<PhotoRec[]> | undefined;
	collectRecords: Array<PhotoCollect> | undefined;
	forest: Array<PhotoCollect> | undefined;

	clientPaths: object | undefined;

	profils: Profiles | undefined;

	constructor (obj: AlbumResp) {
		super({type: 'io.oz.album.tier.AlbumResp'});
		Object.assign(this, obj);
	}
}

Protocol.registerBody('io.oz.album.tier.AlbumResp', (jsonBd) => { return new AlbumResp(jsonBd); });