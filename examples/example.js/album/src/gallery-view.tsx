import React from 'react';

import Gallery from '../react-photo-gallery/src/Gallery';

import { Comprops, CrudComp } from '@anclient/anreact';
import { GalleryTier, PhotoCollect } from './gallerytier-less';
import { photos } from "./temp-photos";
import { PhotoProps } from '../react-photo-gallery/src/Photo';

export interface PhotoSlide<T extends {}> {
    index: number
    next: PhotoProps<T> | null
    photo: PhotoProps<T>
    previous: PhotoProps<T> | null
}

export default class GalleryView extends CrudComp<Comprops>{
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

		this.tier = new GalleryTier({uri});
	}

	openLightbox (event: React.MouseEvent, photo: PhotoSlide<{}>) {
		this.currentImx = photo.index;
		this.showCarousel = true;
	}

	closeLightbox () {
		this.currentImx = 0;
		this.showCarousel = false;
	};

	gallery(collections: Array<PhotoCollect>) {
	  
		return (
		  <div>
			<Gallery photos={photos} onClick={this.openLightbox} />
			{/* <ModalGateway>
			  {this.showCarousel ? (
				<Modal onClose={this.closeLightbox}>
				  <Carousel
					currentIndex={this.currentImx}
					views={photos.map(x => ({
					  ...x,
					  srcset: x.src,
					  caption: x.title || '',
					  source: x.source || ''
					}))}
				  />
				</Modal>
			  ) : null}
			</ModalGateway> */}
		  </div>
		);
	}

	render() {
		return (<div>Welcome Example - I bet you will love this!
			{this.tier && this.gallery(this.tier.myAlbum())}
		</div>);
	}
}
