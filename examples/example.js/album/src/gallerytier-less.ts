import { Comprops, CrudComp } from '@anclient/anreact';
import { Protocol, AnsonResp, AnsonBody, PageInf, Semantier, SessionClient, Tierec
} from '@anclient/semantier';
import { PhotoProps } from '../react-photo-gallery/src/Photo';

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
};

export interface PhotoRec extends Tierec {
	pid?: string,
	/** card title */
	pname?: string,
	shareby?: string | undefined,
	sharedate?: string,
	css?: any,
	device?: string,

	src: string,
};

export class GalleryTier extends Semantier {
	comp: CrudComp<Comprops>;
	port: string = "album";

	page: AlbumPage;
	collectRecords?: PhotoCollect[];

	/**
	 * @param props
	 */
	constructor(props: {uri: string, client: SessionClient, comp: CrudComp<Comprops>}, ) {
		super(props);
		console.log(this.uri);
		this.comp = props.comp;
		this.client = props.client;

		this.page = new AlbumPage();
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

	photo(uri: string) {
		return this;
	}

    myAlbum(onLoad: ((collects?: PhotoCollect[]) => void)): void {
        this.collects(this.page, onLoad);
    }

	toGalleryImgs(idx: number) {
		let that = this;
		let imgs = [] as PhotoProps<PhotoRec>[];
		if (this.collectRecords) {
			let photos = this.collectRecords[idx] as unknown as PhotoRec[];
			photos.forEach( (p, x) => {
				console.log(p);
				let src = that.imgSrc(p.src);
				let srcSet = [src];
				imgs.push( {
					src: "",
					srcSet,
					// sizes: p.s,
					width: 4,
					height: 3,
					alt: `${p.owner} ${p.title? ' # ' + p.title : ''}`,
					key: x.toString()
				} );
			} );
		}
		return imgs;
	}

	imgSrc(furi: string) {
		let req = new AlbumReq(this.uri, this.page);

		return this.uiHelper.getReq();
	}
};

interface AlbumRec extends Tierec {
	/** Album Id (h_albems.aid) */
	album?: string;

	/** Collects' ids */
	collects?: Array<string>;

	/** Collects' default length (first page size) */
	collectSize: number;

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

class AlbumReq extends AnsonBody {
	static A = {
		records: 'r/collects',
		collect: 'r/photos',
		rec: 'r/photo',
		update: 'u',
		insert: 'c',
		del: 'd',
	};

	pageInf: PageInf;
	aid?: string;
	cids?: string[];
	pids?: string[];

	constructor (uri: string, page: AlbumPage) {
		super({uri, type: 'io.oz.album.tier.AlbumReq'});

		this.pageInf = new PageInf(page);

		if (page.qrec) {
			this.aid = page.qrec.album;
			this.cids = page.qrec.collects;
			this.pids = page.qrec.photos;
		}
	}
}

class Profiles extends AnsonBody {

	home: string;
	maxUsers: number;
	servtype: number;

	constructor (obj: {
			servtype: number;
			maxUsers: number;home: string }) {
		super( { type: 'io.oz.album.tier.Profiles' } );
		this.home = obj.home;
		this.maxUsers = obj.maxUsers;
		this.servtype = obj.servtype;
	}
}

Protocol.registerBody('io.oz.album.tier.Profiles', (jsonBd) => { return new Profiles(jsonBd); })

class AlbumResp extends AnsonResp {
	albumId: string;
	ownerId: string;
	owner: string;
	collectRecords: Array<PhotoCollect>;
	profils: Profiles;

	photos: Array<PhotoRec[]>;

	clientPaths: object;
	
	photo: PhotoRec;

	constructor (obj: any) {
		super({type: 'io.oz.album.tier.AlbumResp'});

		this.albumId = obj.albumId;
		this.ownerId = obj.ownerId;
		this.owner = obj.owner;
		this.collectRecords = obj.collectRecords;
		this.profils = obj.profils;
		this.photos = obj.photos;
		this.clientPaths = obj.clientPaths;
		this.photo = obj.photo;
	}
}

Protocol.registerBody('io.oz.album.tier.AlbumResp', (jsonBd) => { return new AlbumResp(jsonBd); })