import { Semantier, Tierec } from '@anclient/semantier-st';

export interface PhotoRec extends Tierec {
	eid: string,
	ename: string, // card title
	publisher?: string | undefined,
	edate: string,
	css: any,
	extra: string
};

export class GalleryTier extends Semantier {
	/**
	 * @param props
	 */
	constructor(props: {uri: string}) {
		super(props);
		console.log(this.uri);
	}

	/**Get photo for my album. 
	 * Uri is not replaced with file. The img tag should use delay attributes and load according to uri.
	 * The file uri is an identifier of files managed by jserv, not same as function uri for Anclient component.
	 * @override(Semantier)
	 */
	records<PhotoCollect>() {
		let photo1 = {deviceId: '01', pid: '01', pname: 'Abc@D', pdate: '2021-10-10', owner: 'ody', exif: '100', uri: ''};
		this.rows = [{title: 'test', photos: [photo1]}];
		return this.rows as unknown as Array<PhotoCollect>;
	}

	photo(uri: string) {
		return this;
	}

    myAlbum(): PhotoCollect[] {
        return this.records();
    }
}

export interface PhotoCollect extends Tierec {
	title: string;
	thumbUps: Set<string>;
	hashtags: Array<string>;
	shareby: string;
	extlinks: any; // another table?
	photos: Array<PhotoRec>;
}
