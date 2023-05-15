import React from 'react';
import Modal from 'react-modal';

import Gallery, { PhotoSlide } from '../../../../src/photo-gallery/src/Gallery';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { isEmpty } from "@anclient/semantier";
import { AnContextType, Comprops, CrudCompW } from '../../../../src/an-components';
import { GalleryTier, PhotoCollect, PhotoRec } from './gallerytier-less';

const _photos = [];

export default class GalleryView extends CrudCompW<Comprops & {aid: string}>{
	tier: GalleryTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;
	album: PhotoCollect[] | undefined;
	aid: string;
	
	constructor(props: Comprops & {aid: string}) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.aid = props.aid;

		this.openLightbox = this.openLightbox.bind(this);
		this.closeLightbox = this.closeLightbox.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		let that = this;
		console.log("super.uri", uri);

		let client = (this.context as AnContextType).anClient;

		this.tier = new GalleryTier({uri, comp: this, client, album: this.aid})
					.setContext(this.context) as GalleryTier;

		this.tier.myAlbum((collects?: PhotoCollect[]) => {
			that.album = collects;
			that.setState({});
		});
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
		// let photos = collections[0].photos;
		return (
		  <div>
			{this.showCarousel &&
				<Modal isOpen={true} ariaHideApp={false}
					onRequestClose={this.closeLightbox}
					contentLabel="Example Modal" >
					{this.photoCarousel(photos, this.currentImx)}
				</Modal>}
			{this.tier &&
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
			/>}
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
		let photos = this.tier?.toGalleryImgs(0) || _photos;
		return (<div>Album Example - Clicke to show large photo
			{this.tier && this.gallery( photos )}
		</div>);
	}
}
