import { AlbumPage, AlbumReq, AlbumResp, Comprops, CrudComp, PhotoCollect } from '@anclient/anreact';
import { Protocol, AnsonMsg, AnsonBody, 
	PageInf, SessionClient, StreeTier, AnTreeNode} from '@anclient/semantier';

const debug = true;

/**
 */
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
					new AlbumReq( {uri: this.uri, page: conds as AlbumPage} )
					.A(AlbumReq.A.records) );

		client.commit(req,
			(resp) => {
				let body = resp.Body() as AlbumResp;
				if (body) {
					this.collectRecords = body.collects;
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

	static servUrl(jserv: string, msg: AnsonMsg<AlbumReq>) {
		if (debug)
			console.log(msg);

		// use <img src='anson64'/> to GET Http resource
		return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
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
