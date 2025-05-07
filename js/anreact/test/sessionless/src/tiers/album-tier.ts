import { PageInf, SessionClient, StreeTier } from '@anclient/semantier';
import { Comprops, CrudComp, PhotoCollect, GalleryView, AlbumReq, AlbumResp
} from '../../../../src/an-components';

export class AlbumTier extends StreeTier {
	comp: CrudComp<Comprops>;
	/**
	 * Since 0.6.0 use jserv-album 0.7 for test, and sessionless tests are no-longer tested aginst sandbox
	 * as docker is not working. Use portfolio-synode for test.
	 * 
	 * (This doc will be deprecated once sandbox is ported to Jetty.)
	 */
	port: string = "docoll";

	page: PageInf;
	collects?: PhotoCollect[];

	synuri: string;

	/**
	 * @param props
	 */
	constructor(props: {uri: string, synuri: string, port?: string, client: SessionClient, album?: string, comp: CrudComp<Comprops>}) {
		super(props);

		if (props.port)
			this.port = props.port;
		this.synuri = props.synuri;

		console.log(this.uri, this.port);

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
					new AlbumReq( {uri: this.uri, synuri: this.synuri, page: conds} )
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

	/**
	 * Compose src of img tag, with AlbumReq request as anson64 parameter.
	 *
	 * @param recId potho id
	 * @returns src of img tag
	 */
	imgSrc(recId: string) : string {
		return GalleryView.imgSrcReq(recId, "h_photo", {...this, docuri: ()=> this.synuri});
	}
};