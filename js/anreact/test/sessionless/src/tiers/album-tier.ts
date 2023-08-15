import { PageInf, SessionClient, StreeTier } from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView, AlbumReq, AlbumResp
} from '../../../../src/an-components';

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
		return GalleryView.imgSrcReq(recId, this);
	}
};