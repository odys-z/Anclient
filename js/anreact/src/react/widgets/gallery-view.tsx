import React from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Gallery from '../../photo-gallery/src/gallery-ts';

import { AnTreeNode, AnsonValue, Semantier, SessionClient, StreeTier, SyncDoc, isEmpty, len
} from "@anclient/semantier";

import { Comprops, CrudCompW } from '../crud';
import { ForcedStyle } from '../../photo-gallery/src/photo-ts';
import { AlbumReq, PhotoCSS, PhotoCollect } from '../../photo-gallery/src/tier/photo-rec';

const _photos = [];

export interface ImageSlide  {
	index: number,
	width: number | string,
	height: number | string,
	src: string,
	srcSet?: string,
	srcArr?: string[],
	legend?: string | JSX.Element,
	/** AnTreeNode.node */
	node?  : object & {shareby: string, device?: string, pname?: string},

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

export type lightboxFomatter = (photos: AnTreeNode[], opts?: {
	/** current slide index */
	ix: number,
	/** command for enable resources loading (special performance problem caused by anson64) */
	open: boolean,
	/** callback */
	onClose: () => void}) => JSX.Element;

export interface GalleryProps {
	cid: string;
	photos?: AnTreeNode[];
	tier?: Semantier;

	/** Modal dialog for picture slids. */
	lightbox: lightboxFomatter;
}

export class GalleryView extends CrudCompW<Comprops & GalleryProps> {
	static verbose = true;

	tier: StreeTier | undefined;
	classes: any;
	uri: string;
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

		if (GalleryView.verbose && !this.props.lightbox)
			console.warn("[GalleryView.verbose] GalleryView created without lightbox.");
	}

	componentDidMount() {
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

		nodes?.forEach( (p: AnTreeNode, x) => {
			let [_width, _height, w, h] = (JSON.parse(p.node.css as string || '{"size": [1, 1, 4, 3]}') as PhotoCSS).size;

			photos.push({
				index: x,
				node: { ...p.node, shareby: p.node.shareby as string },
				width: w, height: h,
				src: GalleryView.imgSrcReq(p.id, p.node.doctabl as string, this.albumtier),
				imgstyl,
				mime: p.node.mime as string
			})
		});

		return photos;
	}

	/**
	 * Create an HTTP GET request for src of img tag.
	 * 
	 * @param pid 
	 * @param opts 
	 * @returns src for img, i.e. jserv?anst64=message-string 
	 */
	static imgSrcReq(pid: AnsonValue, doctable: string, opts: {uri: string, client: SessionClient, port: string}) : string {

		let {client, port} = opts;

		let msg = getDownloadReq(pid as string, opts);
		let jserv = client.an.servUrl(port);
		return `${jserv}?anson64=${window.btoa( JSON.stringify(msg))}`;

		function getDownloadReq(pid: string, opts: {uri: string, port: string, client: SessionClient}) {
			let {uri, port, client} = opts;

			if (reqMsgs[pid] === undefined) {
				let req = StreeTier
					.reqFactories[port]({uri, sk: ''})
					.A(AlbumReq.A.download) as AlbumReq;

				req.doc = new SyncDoc({ recId: pid });
				req.docTabl = doctable;
				reqMsgs[pid] = client.userReq(uri, port, req);
			}
			return reqMsgs[pid];
		}
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

			{this.showCarousel && this.props.lightbox && (
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
			{this.gallery( phs )}
		</div>);
	}
}

const reqMsgs = {};
