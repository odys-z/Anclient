import React from 'react';
import Modal from 'react-modal';

import Gallery from '../react-photo-gallery/src/Gallery';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { AnContextType, Comprops, CrudCompW } from '@anclient/anreact';
import { GalleryTier, PhotoCollect, PhotoRec } from './gallerytier-less';
import { PhotoProps } from '../react-photo-gallery/src/Photo';
import { photos } from './temp-photos';

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
	album: PhotoCollect[] | undefined;
	
	constructor(props: Comprops) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;

		this.openLightbox = this.openLightbox.bind(this);
		this.closeLightbox = this.closeLightbox.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		let that = this;
		console.log("super.uri", uri);

		let client = (this.context as AnContextType).anClient;

		this.tier = new GalleryTier({uri, comp: this, client})
					.setContext(this.context) as GalleryTier;

		this.tier.myAlbum((cols, rows) => {
			that.album = rows;
			that.setState({});
		})
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
		let photos = collections[0].photos;
		return (
		  <div>
			{this.showCarousel &&
				<Modal isOpen={true} ariaHideApp={false}
					onRequestClose={this.closeLightbox}
					contentLabel="Example Modal" >
					{this.photoCarousel(photos, this.currentImx)}
				</Modal>}
			<Gallery<PhotoRec> photos={photos} onClick={this.openLightbox}
					targetRowHeight={containerWidth => {
						if (containerWidth < 200)
							return containerWidth;
						else if (containerWidth < 400)
							return containerWidth / 2;
						else if (containerWidth < 800)
							return containerWidth / 3;
						else
							return containerWidth / 4; 
					} }
					limitNodeSearch={ (containerWidth: number) => {
						if (containerWidth < 800)
							return 4;
						else
							return 12;
					} }
			/>
		  </div>
		);
	}

	photoCarousel(photos: Array<PhotoProps>, imgx: number) : JSX.Element {
		return (
			<Carousel showArrows={true} dynamicHeight={true} selectedItem={imgx} >
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
			{this.tier && this.gallery( [{photos}] )}
		</div>);
	}
}
