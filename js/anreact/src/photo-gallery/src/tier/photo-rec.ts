
import { Anson, SyncDoc } from '@anclient/semantier';

// export class PhotoCSS {
// 	type: string = 'io.oz.album.peer.PhotoCSS';
// 	size: number[] = [0, 0, 0, 0];
// }

export class PhotoRec extends SyncDoc {

	static __type__ = 'io.oz.album.peer.PhotoRec';

	// type: string = PhotoRec.__type0__;

	/** pid */
	// recId?;

	/** card title */
	// pname?: string;
	/** Java type: Exifield */
	exif?: object | string;
	// mime?: string;
	geox?: string;
	geoy?: string;
	css? : MediaCss | string;
    wh?  : number[];

	srcSet?: Array<string>;
	width: number;
	height: number

	constructor (opt: {
            recId: string; src?: string; device?: string;
            css: string | MediaCss | undefined;
            wh: number[] }) {
		super(Object.assign(opt, {type: PhotoRec.__type__}));

        this.css = opt.css;
        this.wh = opt.wh;
        this.width = opt.wh[0];
        this.height = opt.wh[1];
	}
};

export class MediaCss extends Anson {
	static __type__ = 'io.oz.album.peer.PhotoRec$MediaCss';

	constructor() {
		super(MediaCss.__type__);
	}

	wh: number[] = [4, 3];
	widthHeight: number[] = [4, 3];
	rotation: number = 0;
}

/*
 * AlbumReq, AlbumResp, AlbumPage, AlbumRec and PhotoCollect, the peers of jserv-album-lib (io.oz.album.peer),
 * are moved to example.js/album/src/tiers/album-req.ts, where AlbumReq is registered with SynDocollPort.docoll.
 * Anreact widgets only use DocsReq (semantier), e.g. GalleryView.imgSrcReq().
 */
