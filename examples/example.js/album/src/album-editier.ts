import { Protocol, AnsonBody, PageInf, QueryReq, AnsonResp, AnsonMsg,
	SessionClient, AnDatasetResp, AnTreeNode, StreeTier, Tierec, OnLoadOk} from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView, PhotoProps, PhotoRec, AlbumRec, AlbumReq, AlbumPage, AlbumResp
} from '@anclient/anreact';

const debug = true;

export class AlbumEditier extends StreeTier {
	comp: CrudComp<Comprops>;
	port: string = "album";

	page: PageInf;
	collects?: PhotoCollect[];

	_fields = [{field: 'shareFlag', label: 'Public'}];

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
    loadCollects(pageInf: PageInf, onLoad: ((collects?: PhotoCollect[]) => void)) : void {
		if (!this.client) {
			console.error("Anclient is not ready yet.");
			return;
		}

		let that = this;

		/*
		let client = this.client;
		let req = client.userReq( this.uri, this.port,
					new AlbumReq( {uri: this.uri, page: conds} )
					.A(AlbumReq.A.stree) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as AlbumResp;
				if (body) {
					that.collects = body.collects;
					onLoad(that.collects);
				}
			},
			this.errCtx);
		*/
		let sk = Protocol.sk.collectree;
		let {client, uri, port} = this;

		AlbumEditier.stree(
			{uri, port, sk, pageInf},
			client,
			(rep) => {
				that.collects = (rep.Body(0) as (AlbumResp)).forest as PhotoCollect[]; 
				onLoad(that.collects);
			}, this.errCtx);
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

	loadSharePolicy(pageInf: PageInf, onLoad: ((collects?: PhotoCollect[]) => void)) : void {
		if (!this.client) {
			console.error("Anclient is not ready yet.");
			return;
		}

		let that = this;
		let sk = Protocol.sk.stree_sharings;
		let {uri, port} = this;

		this.stree( {
			uri, port, sk, pageInf,
			onOk: (rep) => {
					that.forest = (rep.Body(0) as (AlbumResp)).forest as AnTreeNode[];
					onLoad(that.collects);
				}
			}, this.errCtx);
	}

	/**
	 * TRecordForm use this method to load record.
	 * 
	 * @param conds 
	 * @param onLoad 
	 */
	record(conds: PageInf, onLoad: OnLoadOk<Tierec>) : void {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let page = new AlbumPage({pid: this.pkval.v as string});
		let reqbd = new AlbumReq({page})
					.A(AlbumReq.A.rec);

		let req = client.userReq(this.uri, this.port, reqbd);
		client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {photo} = (resp.Body() as AlbumResp);
				let {cols} = AnsonResp.rs2arr((resp.Body() as AnsonResp).Rs());
				that.rec = photo;
				onLoad(cols, [photo || {}]);
			},
			this.errCtx);
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

// class AlbumResp extends AnDatasetResp {
// 	static __type__ = 'io.oz.sandbox.album.AlbumResp';
// 	album?: AlbumRec;

// 	profils?: Profiles;

// 	collect?: Array<string>;
// 	collects?: Array<PhotoCollect>;

// 	photo?: PhotoRec;

// 	constructor (resp: AlbumRec & {
// 			forest: AnTreeNode[], profiles?: Profiles,
// 			photo?: PhotoRec, collect?: Array<string>}) {
// 		super({
// 			forest: resp.forest
// 		});

// 		this.album = resp;
// 		this.collect = resp.collect;
// 		this.profils = resp.profiles;
// 		this.collects = resp.collects as PhotoCollect[];
// 	}
// }
// Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
