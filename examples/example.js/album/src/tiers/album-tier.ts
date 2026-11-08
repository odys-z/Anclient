import { Protocol, AnsonBody, PageInf, AnsonResp, AnsonMsg, Semantier, NV, relStree,
	SessionClient, AnTreeNode, StreeTier, Tierec, OnLoadOk} from '@anclient/semantier';
import { Comprops, CrudComp, GalleryView, PhotoProps, PhotoRec
} from '@anclient/anreact';
import { PhotoCollect, AlbumReq, AlbumPage, AlbumResp } from './album-req';
import { SynDocollPort } from './syn-docoll-port';

const debug = true;

export const Share = {
	pub : 'pub',
	priv: 'priv',
}

/**
 * @deprecated This tier needs to be overhauled, with the same architecture to AlbumDocview.
 */
export class AlbumEditier extends StreeTier {
	comp: CrudComp<Comprops>;
	// port: string = "album";
	port = SynDocollPort.docoll;

	page: PageInf;
	collects?: PhotoCollect[];

	/** Doc table of the photos, the docTabl of download requests. See AlbumResp.docTabl. */
	docTabl = 'h_photos';

	/** Doc (synchronizing) uri, the docuri() of download requests. Default: this.uri, as record() uses. */
	synuri: string;

	_fields = [{field: 'shareFlag', label: 'Public'}];

	/**
	 * @param props
	 */
	constructor(props: {uri: string, synuri?: string, client: SessionClient, album?: string, comp: CrudComp<Comprops>}) {
		super(props);
		console.log(this.uri);
		this.synuri = props.synuri || this.uri;
		this.comp = props.comp;
		this.client = props.client;

		this.page = new PageInf();
	}

	root() {
		return undefined;
	}

	synodeLable(): string | undefined {
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

				let src = that.imgSrc(p.recId || 'missing');
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
		if (!this.client) {
			console.error("Anclient is not ready yet.");
			return '';
		}
		let {uri, port, client, synuri} = this;
		return GalleryView.imgSrcReq(recId, this.docTabl, { uri, port, client, docuri: () => synuri });
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
	record(conds: PageInf, onLoad: OnLoadOk<Tierec>) : void {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let page = new AlbumPage({pid: this.pkval.v as string});

		let reqbd = new AlbumReq({synuri: this.uri, page})
					.A(this.pkval.pk === 'folder' ? AlbumReq.A.folder : AlbumReq.A.rec);

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

	saveFolderPolicy(opts: {clearelation: boolean, subfolder: string},
					 onSaved: (resp: AnsonMsg<AnsonResp>) => void) {
		if (!this.client) {
			console.error("Sholdn't reach here: saving without logged in?");
			return;
		}

		if (!this.pkval.pk) {
			console.error("Sholdn't reach here: saving without folder Id?");
			return;
		}

		let {clearelation, subfolder} = opts;
		let client = this.client;
		let reqbd = new AlbumReq({ synuri: this.uri })
					.clearelations(clearelation)
					.shareTree(this.collectRels(), subfolder)
					.A(AlbumReq.A.updateFolderel);

		let req = client.userReq(this.uri, this.port, reqbd);
		client.commit(req, onSaved, this.errCtx);
	}

	collectRels() {
		let columnMap: {[k: string]: any} = {};
		let rel = this.relMeta?.["h_photo_org"]?.stree as relStree | undefined;
		if (!rel)
			throw Error("AlbumEditier.collectRels(): relMeta.h_photo_org.stree is not set. Can't save the folder's sharing relations.");

		let forest: AnTreeNode[] = this.rels["h_photo_org"];

		columnMap[rel.col] = rel.colProp || rel.col;           // columnMap[rel.col] = 'nodeId';
		columnMap[this.pkval.pk as string] = this.rec?.folder; // this.pkval.v; // pid the col name, 2003-12 the folder value

		let rows = [] as  Array<NV[]>;
		Semantier.collectTree(forest, rows, columnMap, "checked");
		return rows;
	}
};

class Profiles extends AnsonBody {
	home: string;
	maxUsers: number;
	servtype: number;

	constructor (obj: { servtype: number; maxUsers: number; home: string }) {
		super( { type: 'io.oz.album.tier.Profiles', uri: '' } );
		this.home = obj.home;
		this.maxUsers = obj.maxUsers;
		this.servtype = obj.servtype;
	}
}
Protocol.registerBody('io.oz.album.tier.Profiles', (jsonBd) => { return new Profiles(jsonBd); });
