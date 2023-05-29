import React from 'react';
import Modal from 'react-modal';

import Gallery, { PhotoSlide } from '../../../../src/photo-gallery/src/Gallery';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { AnTreeNode, isEmpty } from "@anclient/semantier";
import { AlbumTier, PhotoCollect, PhotoRec } from './album-tier';
import { Comprops, CrudCompW } from '../../../../src/react/crud';

const _photos = [];

export default class GalleryView extends CrudCompW<Comprops & {tier: AlbumTier, cid: string, photos?: AnTreeNode[]}> {
	tier: AlbumTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;

	cid: string;
	photos: PhotoCollect | undefined; 
	albumtier: AlbumTier;
	
	constructor(props: Comprops & {tier: AlbumTier, cid?: string, photos?: AnTreeNode[]}) {
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
		/*
		let that = this;
		let client = (this.context as AnContextType).anClient;
		this.tier = new GalleryTier({uri, comp: this, client, album: this.aid})
					.setContext(this.context) as GalleryTier;

		this.tier.collect((collect?: PhotoCollect) => {
			that.collect = collect;
			that.setState({});
		});
		*/
	}

	parse(nodes: AnTreeNode[]) {
		let photos = [] as PhotoRec[];
		nodes?.forEach( (p, x) => {
			// photos.push({src: p.node.pid, width: 60, height: 48});
			photos.push({src: this.albumtier.imgSrc(p.node.pid), width: p.node.width, height: p.node.height});
		});

		return {photos};
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
						return 4;
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
		// let photos = this.tier?.toGalleryImgs(0) || _photos;
		let phs = this.photos?.photos || _photos;
		return (<div>
			{(this.photos?.title || ' - ') + ` [${phs.length}]`}
			{this.gallery( phs )}
		</div>);
	}
}
