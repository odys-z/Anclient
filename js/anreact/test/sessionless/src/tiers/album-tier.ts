import { AnDatasetResp, AnTreeNode, DatasetierReq, DocsReq, PageInf, Protocol, SessionClient, StreeTier, SyncDoc, type Tierec
} from '@anclient/semantier';
import { Comprops, CrudComp, GalleryView, type PhotoProps
} from '../../../../src/an-components';

/**
 * Port of the album jserv for the sessionless tests, i. e. SynDocollPort.docoll of the album.
 * Register it to the client with extendPorts({docoll: TestDocollPort}).
 */
export const TestDocollPort = 'docoll.syn';

/** A collect of photos, the album's (deprecated) PhotoCollect. */
type PhotoCollect = Tierec & { photos: Array<PhotoProps<SyncDoc>> };

/**
 * The album's AlbumReq, io.oz.album.peer.AlbumReq, with only what the sessionless tests send to docoll.syn,
 * the tree (sk) and download (docTabl, doc). AlbumReq is in example.js/album, which anreact can't import.
 */
class TestAlbumReq extends DocsReq {
	static __type__ = 'io.oz.album.peer.AlbumReq';

	sk?: string;

	constructor(opts: {uri?: string, synuri: string, sk?: string, page?: PageInf}) {
		super(opts.uri as string, {synuri: opts.synuri, docFieldType: SyncDoc.__type0__}, TestAlbumReq.__type__);
		this.sk = opts.sk;
		this.pageInf = opts.page;
	}
}
StreeTier.registTierequest(TestDocollPort,
	(opts) => new TestAlbumReq(opts as {uri?: string, synuri: string, sk?: string}),
	{uri: '-', synuri: '-', sk: '-'});

/** The album's AlbumResp, io.oz.album.peer.AlbumResp, with only what the tests read. */
class TestAlbumResp extends AnDatasetResp {
	static __type__ = 'io.oz.album.peer.AlbumResp';

	collects?: Array<PhotoCollect>;
	docTabl?: string;

	constructor(resp: {forest: AnTreeNode[], collects?: Array<PhotoCollect>, docTabl?: string}) {
		super({forest: resp.forest, type: TestAlbumResp.__type__});
		this.collects = resp.collects;
		this.docTabl = resp.docTabl;
	}
}
Protocol.registerBody(TestAlbumResp.__type__, (jsonBd) => new TestAlbumResp(jsonBd));

export class AlbumTier extends StreeTier {
	comp: CrudComp<Comprops>;
	/**
	 * Since 0.6.0 use jserv-album 0.7 for test, and sessionless tests are no-longer tested aginst sandbox
	 * as docker is not working. Use portfolio-synode for test.
	 * 
	 * (This doc will be deprecated once sandbox is ported to Jetty.)
	 */
	port: string = TestDocollPort;

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
					new TestAlbumReq( {uri: this.uri, synuri: this.synuri, page: conds} )
					.A(DatasetierReq.A.stree) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as TestAlbumResp;
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