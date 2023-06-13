import React from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Gallery, { PhotoSlide } from '../../photo-gallery/src/Gallery';

import { AlbumReq, AnTreeNode, PhotoCSS, PhotoRec, SessionClient, StreeTier, Tierec, isEmpty, len
} from "@anclient/semantier";

import { Comprops, CrudCompW } from '../crud';
import { CustomImgStyle, PhotoProps } from '../../photo-gallery/src/Photo';

const _photos = [];

export interface PhotoCollect extends Tierec {
	title?: string;
	thumbUps?: Set<string>;
	hashtags?: Array<string>;
	shareby?: string;
	extlinks?: any; // another table?
	photos: Array<PhotoProps<PhotoRec>>;
};

export interface ImageSlide {
	width: number,
	height: number,
	src: string,
	srcSet?: string[],
	legend: string,

	/**
	 * Use maxWidth to limit picture size when too few pictures;
	 * 
	 * use width: auto, height: auto for keep original ratio.
	 * 
	 * defualt:  {maxWidth: '60%', width: 'auto', height: 'auto'}
	 */
	imgstyl?: CustomImgStyle
}


export class GalleryView extends CrudCompW<Comprops & {cid: string, photos?: AnTreeNode[]}> {
	tier: StreeTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;

	cid: string;
	photos: PhotoCollect | undefined; 
	slides: ImageSlide[];
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

		this.photos = this.props.tnode.node.children;
		this.slides = this.parse(this.props.tnode.node.children);
	}

	parse(nodes: AnTreeNode[]) {
		let photos = [] as ImageSlide[];
		let imgstyl = len(nodes) === 1
					? {width:'auto', maxHeight: '20vh'}
					: undefined;
		console.log(len(nodes), imgstyl, nodes);
		nodes?.forEach( (p, x) => {
			let [_width, _height, w, h] = (
				JSON.parse(p.node.css as string || '{"size": [1, 1, 4, 3]}') as PhotoCSS).size;
			photos.push({
				src: GalleryView.imgSrcReq(p.id, this.albumtier),
				width: w, height: h,
				legend: PhotoRec.toShareLable(p.node as PhotoRec),
				imgstyl
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
	static imgSrcReq(pid: string, opts: {uri: string, port: string, client: SessionClient}) : string {
		let {uri, port, client} = opts;
		let req = StreeTier.reqFactories[port]({uri, sk: ''}).A(AlbumReq.A.download) as AlbumReq;
		req.docId = pid;

		let msg = client.an.getReq<AlbumReq>(port, req);

		let jserv = client.an.servUrl(port);
		return `${jserv}?anson64=${btoa( JSON.stringify(msg) )}`;
	}

	/**
	 * FIXME or this one?
	 * 
	 * https://www.cssscript.com/fullscreen-image-viewer-lightbox/
	 * 
	 * @param event 
	 * @param photo 
	 */
	openLightbox (event: React.MouseEvent, photo: PhotoSlide<{}>) {
		// console.log(event);
		this.currentImx = photo.index;
		this.showCarousel = true;
		this.setState({});
	}

	closeLightbox () {
		this.currentImx = 0;
		this.showCarousel = false;
		this.setState({})
	};

	gallery(photos: Array<ImageSlide>) {
		return (
		  <div>
			{this.showCarousel &&
				<Modal isOpen={true} ariaHideApp={false}
					onRequestClose={this.closeLightbox}
					contentLabel="Example Modal" >
					{this.photoCarousel(photos, this.currentImx)}
				</Modal>
			}
			<Gallery<ImageSlide> photos={photos}
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

	photoCarousel(photos: Array<ImageSlide>, imgx: number) : JSX.Element {
		return (
			<Carousel showArrows={true} dynamicHeight={false} selectedItem={imgx} showThumbs={false} width={'80vw'} >
				{photos.map( (ph, x) => {
				  let src = (isEmpty( ph.src ) && ph?.srcSet) ? ph.srcSet[ph.srcSet.length - 1] : ph.src || '';
				  let legend = ph.legend;
				  return (
					<div key={x} onClick={this.closeLightbox}>
						<img src={src} loading="lazy"></img>
						{legend && <p className="legend">{legend}</p>}
					</div>);
				  }
				)}
			</Carousel>
		);
	}

	render() {
		let phs = this.slides || _photos;
		return (<div>
			{/* {(this.photos?.title || ' - ') + ` [${phs.length}]`} */}
			{this.gallery( phs )}
		</div>);
	}
}
