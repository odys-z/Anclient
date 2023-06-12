import React from 'react';
import Modal from 'react-modal';

import Gallery, { PhotoSlide } from '../../photo-gallery/src/Gallery';
import { Carousel } from 'react-responsive-carousel';

import { AnTreeNode, DatasetierReq, PageInf, SessionClient, StreeTier, Tierec, UserReq, isEmpty
} from "@anclient/semantier";

import { Comprops, CrudCompW } from '../crud';
import { PhotoProps } from '../../photo-gallery/src/Photo';

const _photos = [];

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
};

export interface PhotoRec extends Tierec {
	/** pid */
	recId?: string,
	/** card title */
	pname?: string,
	shareby?: string | undefined,
	sharedate?: string,
	css?: any,
	device?: string,

	src: string,
	srcSet?: Array<string>,
	width: number,
	height: number
};

export class PhotoCSS {
	type: 'io.oz.album.tier.PhotoCSS';
	size: [0, 0, 0, 0];
}

export class AlbumRec {
	static __type__: "io.oz.sandbox.album.AlbumRec";

	type: string;

	/** Album Id (h_albems.aid) */
	album?: string;

	/** Collects' ids */
	collects?: Array<PhotoCollect>;

	/** Collects' default length (first page size) */
	collectSize?: number;

	/** Photos ids, but what's for? */
	collect?: Array<string>;

	// [f: string]: string | number | boolean | object;

	contructor () {
		this.type = AlbumRec.__type__;
	}
}

/*
class AlbumPage extends PageInf {
	static __type__: string;

	/** A temperoray solution before PageInf.condts evolved to Tierec. * /
	qrec?: AlbumRec;

	collectIds?: string[];
	pids?: string[];
	albumId?: string | undefined;

	constructor (query?: AlbumRec) {
		super();
		this.type = AlbumPage.__type__;
		this.qrec = query;
	}
}
*/

export class AlbumReq extends UserReq {
 	static __type__ = 'io.oz.sandbox.album.AlbumReq';
	static A = {
		stree: DatasetierReq.A.stree,
		records: 'r/collects',
		collect: 'r/photos',
		rec: 'r/photo',
		download: 'r/download',
		update: 'u',
		insert: 'c',
		upload: 'c/doc',
		del: 'd',
	};

	// pageInf: AlbumPage;
	pageInf: PageInf;
	sk: string;
	queryRec: AlbumRec;

	pid: string;

	constructor (opts: {uri: string, sk?: string, qrec?: AlbumRec, page?: PageInf}) {
		super(opts.uri, undefined);
		this.type = AlbumReq.__type__; // 'io.oz.album.tier.AlbumReq';

		let {sk} = opts;
		this.pageInf = opts.page;
		this.sk = sk;

		this.queryRec = opts.qrec || new AlbumRec();
	}
}
StreeTier.registTierequest('album', (opts) => { return new AlbumReq(opts); });

export class GalleryView extends CrudCompW<Comprops & {cid: string, photos?: AnTreeNode[]}> {
	tier: StreeTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;

	cid: string;
	photos: PhotoCollect | undefined; 
	albumtier: StreeTier;
	
	constructor(props: Comprops & {tier: StreeTier, cid?: string, photos?: AnTreeNode[]}) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.cid = props.cid;

		this.albumtier = props.tier;

		this.openLightbox = this.openLightbox.bind(this);
		this.closeLightbox = this.closeLightbox.bind(this);
		this.parse = this.parse.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log("super.uri", uri);

		this.photos = this.parse(this.props.tnode.node.children);
	}

	parse(nodes: AnTreeNode[]) {
		let photos = [] as PhotoRec[];
		nodes?.forEach( (p, x) => {
			let [_width, _height, w, h] = (
				JSON.parse(p.node.css as string || '{"size": [1, 1, 4, 3]}') as PhotoCSS).size;
			photos.push({src: GalleryView.imgSrcReq(p.id, this.albumtier), width: w, height: h});
		});

		return {photos};
	}

	/**
	 * Create an HTTP GET request for src of img tag.
	 * 
	 * @param pid 
	 * @param opts 
	 * @returns src for img, i.e. jserv?anst64=message-string 
	 */
	static imgSrcReq(pid: string, opts: {uri: string, port: string, client: SessionClient}) : string {
		let {uri, port, client} = opts;
		let req = StreeTier.reqFactories[port]({uri, sk: ''}).A(AlbumReq.A.download) as AlbumReq;
		req.pid = pid;

		let msg = client.an.getReq<AlbumReq>(port, req);

		let jserv = client.an.servUrl(port);
		return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
	}

	openLightbox (event: React.MouseEvent, photo: PhotoSlide<{}>) {
		console.log(event);
		this.currentImx = photo.index;
		this.showCarousel = true;
		this.setState({});
	}

	closeLightbox () {
		this.currentImx = 0;
		this.showCarousel = false;
		this.setState({})
	};

	gallery(photos: Array<PhotoRec>) {
		return (
		  <div>
			{this.showCarousel &&
				<Modal isOpen={true} ariaHideApp={false}
					onRequestClose={this.closeLightbox}
					contentLabel="Example Modal" >
					{this.photoCarousel(photos, this.currentImx)}
				</Modal>}
			<Gallery<PhotoRec> photos={photos}
			  	onClick={this.openLightbox}
				targetRowHeight={containerWidth => {
					if (containerWidth < 320)
						return containerWidth;
					else if (containerWidth < 580)
						return containerWidth / 2;
					else if (containerWidth < 720)
						return containerWidth / 3;
					else if (containerWidth < 960)
						return containerWidth / 4;
					else if (containerWidth < 1200)
						return containerWidth / 5;
					else
						return containerWidth / 6;
				} }
				limitNodeSearch={ (containerWidth: number) => {
					if (containerWidth < 720)
						return 8;
					else
						return 12;
				} }
			/>
		  </div>
		);
	}

	photoCarousel(photos: Array<PhotoRec>, imgx: number) : JSX.Element {
		return (
			<Carousel showArrows={true} dynamicHeight={true} selectedItem={imgx} >
				{photos.map( (ph, x) => {
				  let src = (isEmpty( ph.src ) && ph?.srcSet) ? ph.srcSet[ph.srcSet.length - 1] : ph.src || '';
				  return (
					<div key={x}>
						<img src={src} loading="lazy"></img>
						<p className="legend">{ph.src}</p>
					</div>);
				  }
				)}
			</Carousel>
		);
	}

	render() {
		let phs = this.photos?.photos || _photos;
		return (<div>
			{(this.photos?.title || ' - ') + ` [${phs.length}]`}
			{this.gallery( phs )}
		</div>);
	}
}
