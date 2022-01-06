import { Comprops, CrudComp } from '@anclient/anreact';
import { AnsonBody, AnsonResp, OnLoadOk, QueryConditions, Semantier, Tierec, UserReq } from '@anclient/semantier-st';
import { PhotoProps } from '../react-photo-gallery/src/Photo';
import { photos } from "./temp-photos";

export interface PhotoCollect extends Tierec {
	title: string;
	thumbUps: Set<string>;
	hashtags: Array<string>;
	shareby: string;
	extlinks: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
}

export interface PhotoRec extends Tierec {
	eid: string,
	ename: string, // card title
	publisher?: string | undefined,
	edate: string,
	css: any,
	extra: string,

	src: string,
};

export class GalleryTier extends Semantier {
	comp: CrudComp<Comprops>;
	port: string = "album";
	/**
	 * @param props
	 */
	constructor(props: {uri: string, comp: CrudComp<Comprops>}, ) {
		super(props);
		this.comp = props.comp;
		console.log(this.uri);
	}

	/**Get photo for my album. 
	 * Uri is not replaced with file. The img tag should use delay attributes and load according to uri.
	 * The file uri is an identifier of files managed by jserv, not same as function uri for Anclient component.
	 * @override(Semantier)
	 */
    records<T extends Tierec>(conds: QueryConditions, onLoad: OnLoadOk<T>) : void {
		// let photo1 = {deviceId: '01', pid: '01', pname: 'Abc@D', pdate: '2021-10-10', owner: 'ody', exif: '100', uri: ''};
		// this.rows = [{title: 'test', photos}];
		// return this.rows as unknown as Array<PhotoCollect>;

		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new AlbumReq( this.uri, conds as AlbumArgs )
					.A(AlbumReq.A.records) );

		client.commit(req,
			(resp) => {
				let body = resp.Body();
				if (body) {
					let {cols, rows} = AnsonResp.rs2arr(body.Rs());
					that.rows = rows;
					onLoad(cols, rows as T[]);
				}
			},
			this.errCtx);
		onLoad([], this.rows as T[]);
	}

	photo(uri: string) {
		return this;
	}

    myAlbum(onLoad: OnLoadOk<PhotoCollect>) {
        this.records<PhotoCollect>({}, onLoad);
    }
}

type AlbumArgs = {

}

class AlbumReq extends UserReq {
	static A: {
		records: 'r/collects',
		collect: 'r/photos',
		rec: 'r/photo',
		update: 'u',
		insert: 'c',
		del: 'd',
	};

	constructor (uri: string, args: AlbumArgs = {}) {
		super(uri, "c_albums");
	}
}