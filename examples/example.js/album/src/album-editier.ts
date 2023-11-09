import { Protocol, AnsonBody, PageInf,
	SessionClient, AnDatasetResp, AnTreeNode, StreeTier
} from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView, PhotoProps, AlbumReq, PhotoRec, AlbumRec
} from '@anclient/anreact';

const debug = true;

export class AlbumEditier extends StreeTier {
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

	root() {
		// throw new Error('Method not implemented.');
		return undefined;
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

				let src = that.imgSrc(p.docId || 'missing');
				let srcSet = [src] as any;

				let css = JSON.parse(p.css as string);
				let size = css?.size;
				let width = size && size.length > 2 ? size[2] : 4;
				let height = size && size.length > 3 ? size[3] : 3;

				let alt = `${p.title? ' # ' + p.title : p.sharedate || ''} by ${p.shareby || 'Anonym'}`;

				imgs.push( {
					type: PhotoRec.__type__,
					src, srcSet, width, height,
					shareLable: p.shareLable,
					alt, title: alt, key: x.toString() } );
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
		return GalleryView.imgSrcReq(recId, { uri: this.uri, port: this.port, client: this.client});
	}

};

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

	constructor (resp: AlbumRec & {
			forest: AnTreeNode[], profiles?: Profiles,
			photo?: PhotoRec, collect?: Array<string>}) {
		super({
			forest: resp.forest
		});

		this.album = resp;
		this.collect = resp.collect;
		this.profils = resp.profiles;
		this.collects = resp.collects as PhotoCollect[];
	}
}
Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
