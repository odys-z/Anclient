import React from 'react';
import Modal from 'react-modal';

import Gallery from '../react-photo-gallery/src/Gallery';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { Comprops, CrudCompW } from '@anclient/anreact';
import { GalleryTier, PhotoCollect, PhotoRec } from './gallerytier-less';
import { photos } from "./temp-photos";
import { PhotoProps } from '../react-photo-gallery/src/Photo';

const customStyles = {
	content: {
		// top: '50%',
		// left: '50%',
		height: '80%',
		right: 'auto',
		bottom: 'auto',
		// marginRight: '-50%',
		// transform: 'translate(-50%, -50%)',
	},
};

export interface PhotoSlide<T extends {}> {
    index: number
    next: PhotoProps<T> | null
    photo: PhotoProps<T>
    previous: PhotoProps<T> | null
}

export default class GalleryView extends CrudCompW<Comprops>{
	tier: GalleryTier | undefined;
	classes: any;
	uri: any;
	currentImx: number = -1;
	showCarousel: boolean = false;

	constructor(props: Comprops) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;

		this.openLightbox = this.openLightbox.bind(this);
		this.closeLightbox = this.closeLightbox.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log("super.uri", uri);

		this.tier = new GalleryTier({uri, comp: this});
		this.setState({});
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

	gallery(collections: Array<PhotoCollect>) {
	  
		return (
		  <div>
			{this.showCarousel &&
				<Modal isOpen={true}
					onRequestClose={this.closeLightbox}
					style={customStyles}
					contentLabel="Example Modal" >
				{this.photoCarousel(photos, this.currentImx)}
			</Modal>}
			<Gallery photos={collections[0].photos} onClick={this.openLightbox} />
		  </div>
		);
	}

	photoCarousel(photos: Array<any>, ix: number) : JSX.Element {
		console.log(photos.map((ph, x) => (
				  <div key={x}>
					<img src={ph.src}></img>
					<p className="legend">{ph.src}</p>
				  </div>)
		));
		return (
			<Carousel showArrows={true} >
				{photos.map( (ph, x) => (
				  <div key={x}>
					<img src={ph.src} loading="lazy"></img>
					<p className="legend">{ph.src}</p>
				  </div>)
				)}
			</Carousel>
		);
	}

	render() {
		return (<div>Album Example - Clicke to show large photo
			{this.tier && this.gallery(this.tier.myAlbum())}
		</div>);
	}
}
