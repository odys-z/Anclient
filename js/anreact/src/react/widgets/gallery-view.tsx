import React from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Gallery from '../../photo-gallery/src/gallery-ts';

import { AlbumReq, AnTreeNode, PhotoCSS, PhotoRec, Semantier, SessionClient, StreeTier, Tierec, isEmpty, len
} from "@anclient/semantier";

import { Comprops, CrudCompW } from '../crud';
import { ForcedStyle, PhotoProps } from '../../photo-gallery/src/photo-ts';

const _photos = [];

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
};

export interface ImageSlide  {
	index: number,
	width: number | string,
	height: number | string,
	src: string,
	srcSet?: string,
	srcArr?: string[],
	legend: string,

	/**
	 * Use maxWidth to limit picture size when too few pictures;
	 * 
	 * use width: auto, height: auto for keep original ratio.
	 * 
	 * defualt:  {maxWidth: '60%', width: 'auto', height: 'auto'}
	 */
	imgstyl?: ForcedStyle

	mime: 'video' | 'image' | 'heif' | 'audio' | string | undefined;
};

export interface GalleryProps {
	cid: string;
	photos?: AnTreeNode[];
	tier?: Semantier;
	lightbox?: (photos: AnTreeNode[], opts?: {
		/** current slide index */
		ix: number,
		/** command for enable resources loading (special performance problem caused by anson64) */
		open: boolean,
		/** callback */
		onClose: () => void}) => JSX.Element;
}

export class GalleryView extends CrudCompW<Comprops & GalleryProps> {
	tier: StreeTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;

	cid: string;
	photos: PhotoCollect | undefined; 
	slides: ImageSlide[];
	albumtier: StreeTier;
	
	constructor(props: Comprops & GalleryProps) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.cid = props.cid;

		this.albumtier = props.tier as StreeTier;

		this.openLightbox = this.openLightbox.bind(this);
		this.closeLightbox = this.closeLightbox.bind(this);
		this.parse = this.parse.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log("super.uri", uri);

		this.photos = this.props.tnode.node.children;
		this.slides = this.parse(this.props.tnode.node.children);
	}

	/**
	 *  
	 * @param nodes 
	 * @returns parsed slides for <Gallery/>, height of 1 node gallery is forced to be 20vh.
	 */
	parse(nodes: AnTreeNode[]) {
		let photos = [] as ImageSlide[];

		let imgstyl = len(nodes) === 1
					? {width:'auto', maxHeight: '20vh'}
					: undefined;

		nodes?.forEach( (p, x) => {
			let [_width, _height, w, h] = (
				JSON.parse(p.node.css as string || '{"size": [1, 1, 4, 3]}') as PhotoCSS).size;
			photos.push({
				index: x,
				legend: PhotoRec.toShareLable(p.node as PhotoRec),
				width: w, height: h,
				src: GalleryView.imgSrcReq(p.id, this.albumtier),
				imgstyl,
				mime: p.node.mime as string
			})
		});

		return photos;
	}

	/**
	 * Create an HTTP GET request for src of img tag.
	 * 
	 * TODO: depend on FileStream.A.download, having PhotoRec independent of Album.
	 * Then move AlbumReq to test. 
	 * 
	 * @param pid 
	 * @param opts 
	 * @returns src for img, i.e. jserv?anst64=message-string 
	 */
	static imgSrcReq(pid: string, opts: {uri: string, port: string, client: SessionClient}) : string {

		let {client, port} = opts;

		let msg = getDownloadReq(pid, opts);
		let jserv = client.an.servUrl(port);
		return `${jserv}?anson64=${window.btoa( JSON.stringify(msg))}`;
	}

	openLightbox (_event: React.MouseEvent, ix: number) {
		this.currentImx = ix;
		this.showCarousel = true;
		this.setState({});
	}

	closeLightbox () {
		this.currentImx = 0;
		this.showCarousel = false;
		this.setState({})
	};

	gallery(photos: Array<ImageSlide>) {
		let that = this;
		return (
		  <div>
			<Gallery photos={photos}
			  	onClick={this.openLightbox}
				targetRowHeight={containerWidth => {
					if (containerWidth < 320)
						return containerWidth;
					else if (containerWidth < 580)
						return containerWidth / 2;
					else if (containerWidth < 800)
						return containerWidth / 3;
					else if (containerWidth < 1200)
						return containerWidth / 4;
					else if (containerWidth < 1920)
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

			{this.showCarousel && (
				this.props.lightbox(this.props.tnode.node.children,
				  { ix: this.currentImx,
					open: true,
					onClose: () => {
						that.showCarousel = false;
						that.setState({});
				  } } )
			 || <Modal isOpen={true} ariaHideApp={false}
					onRequestClose={this.closeLightbox}
					contentLabel="Example Modal" >
					{this.photoCarousel(photos, this.currentImx)}
				</Modal>
			) }
		  </div>
		);
	}

	photoCarousel(photos: Array<ImageSlide>, imgx: number) : JSX.Element {
		return (
		<Carousel showArrows={true} dynamicHeight={false}
				  selectedItem={imgx} showThumbs={false} width={'80vw'} >
		  { photos.map( (ph, x) => {
			let src = (isEmpty( ph.src ) && ph?.srcSet) ? ph.srcSet[ph.srcSet.length - 1] : ph.src || '';
			let legend = ph.legend;
			return (
			<div key={x} onClick={this.closeLightbox}>
				<img src={src} loading="lazy"></img>
				{legend && <p className="legend">{legend}</p>}
			</div>);
			}
		  )}
		</Carousel>);
	}

	render() {
		let phs = this.slides || _photos;
		return (<div>
			{/* {(this.photos?.title || ' - ') + ` [${phs.length}]`} */}
			{this.gallery( phs )}
		</div>);
	}
}

const reqMsgs = {};

function getDownloadReq(pid: string, opts: {uri: string, port: string, client: SessionClient}) {
	let {uri, port, client} = opts;

	if (reqMsgs[pid] === undefined) {
		let req = StreeTier
			.reqFactories[port]({uri, sk: ''})
			.A(AlbumReq.A.download) as AlbumReq;

		req.docId = pid;
		reqMsgs[pid] = client.an.getReq<AlbumReq>(port, req);
	}
	return reqMsgs[pid];
}

