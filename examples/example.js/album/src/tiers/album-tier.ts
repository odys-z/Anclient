import { Protocol, AnsonBody, PageInf, AnsonResp, AnsonMsg, Semantier, NameValue, relStree,
	SessionClient, AnTreeNode, StreeTier, Tierec, OnLoadOk} from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView, PhotoProps, PhotoRec, AlbumReq, AlbumPage, AlbumResp
} from '@anclient/anreact';

const debug = true;

export const Share = {
	pub : 'pub',
	priv: 'priv',
}

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
	 * @param _conds 
	 * @param onLoad 
	 */
	record(_conds: PageInf, onLoad: OnLoadOk<Tierec>) : void {
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

	saveFolderPolicy(opts: {clearelation: boolean}, onSaved: (resp: AnsonMsg<AnsonResp>) => void) {
		if (!this.client) {
			console.error("Sholdn't reach here: saving without logged in?");
			return;
		}

		if (!this.pkval.pk) {
			console.error("Sholdn't reach here: saving without folder Id?");
			return;
		}


		let client = this.client;
		let reqbd = new AlbumReq({})
					.clearelations(opts.clearelation)
					.shareFolder(this.collectRels(this.forest), this.pkval.pk as string)
					.A(AlbumReq.A.updateFolderel);

		let req = client.userReq(this.uri, this.port, reqbd);
		client.commit(req, onSaved, this.errCtx);
	}

	collectRels(forest: AnTreeNode[]) {
		let columnMap: {[k: string]: any} = {};
		let rel = this.relMeta["h_photo_org"].stree as relStree;
		columnMap[rel.col] = rel.colProp || rel.col; // columnMap[rel.col] = 'nodeId';

		// semantics handler can only resulve fk at inserting when master pk is auto-pk
		columnMap[this.pkval.pk as string] = this.pkval.v;

		let rows = [] as  Array<NameValue[]>;
		Semantier.collectTree(forest, rows, columnMap, rel.col);
		return rows;
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
