import { Protocol, PageInf, SessionClient,
	AnDatasetResp, AnTreeNode, StreeTier, AlbumReq, AlbumRec, PhotoRec
} from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView
} from '../../../../src/an-components';

const debug = true;

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

	/**
	 * Compose src of img tag, with AlbumReq request as anson64 parameter.
	 * 
	 * @param recId potho id
	 * @returns src of img tag 
	 */
	imgSrc(recId: string) : string {
		/*
		let req = new AlbumReq({uri: this.uri, page: this.page});
		req.a = AlbumReq.A.download;
		req.queryRec.album = recId;

		let msg = this.client.an.getReq<AlbumReq>(this.port, req);

		return AlbumTier.servUrl(this.client.an.servUrl(this.port), msg);
		*/
		return GalleryView.imgSrcReq(recId, this);
		// return GalleryView.imgSrcReq(recId, { uri: this.uri, port: this.port, client: this.client});
	}
};

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
		this.collects = resp.collects as PhotoCollect[];
	}
}
Protocol.registerBody(AlbumResp.__type__, (jsonBd) => { return new AlbumResp(jsonBd); });
