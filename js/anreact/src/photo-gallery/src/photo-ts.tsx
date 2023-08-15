import React from 'react';
import PropTypes from 'prop-types';
import { regex } from '../../utils/regex';
import { AudioBox } from './audio-box';
import { ImageSlide } from '../../react/widgets/gallery-view';

const { mime2type } = regex;

const imgWithClick = { cursor: 'pointer' };

/**
 * Use this style to force some change of calculation. Currrently only for 1 pic gallery.
 */
export type ForcedStyle = {
    width?: string;
    height?: string;
    maxWidth?: string
    maxHeight?: string
}


/**
 * Photos array item properties (passed into Gallery's photos property)
 */
export type PhotoProps<CustomPhotoProps extends object = {}> = {
    /**
     * the img src attribute value of the image
     */
    src: string
    /**
     * srcSet attribute of the image
     */
    srcSet?: string
    /**
     * sizes attribute of the image
     */
    sizes?: string | string[]
    /**
     *  original width of the gallery image (only used for calculating aspect ratio)
     */
    width: number | string
    /**
     *  original height of the gallery image (only used for calculating aspect ratio)
     */
    height: number | string
    /**
     *  alt text of the gallery image
     */
    alt?: string
    /**
     * key to be used on component
     */
    key?: string

    /**
     * Change by ody.
     * 
     * Force image style
     * 
	 * defualt: undefined.
     * 
     * For one pic row align's reference value: {maxHeight: '20vh', width: 'auto'}
     */
    imgstyl?: ForcedStyle
} & CustomPhotoProps
  
export type RenderImageClickHandler = (
    event: React.MouseEvent,
    photo: object & {
      index: number
    },
) => void
  
/**
 * If you're passing a function component to renderImage you will receive back these props:
 */
export interface RenderImageProps<CustomPhotoProps extends object = {}> {
    /**
     * margin prop optionally passed into Gallery by user
     */
    margin?: string
    /**
     * the index of the photo within the Gallery
     */
    index: number
    /**
     * the individual object passed into Gallery's
     * photos array prop, with all the same props except recalculated height and width
     */
    photo: PhotoProps<CustomPhotoProps>
  
    onClick: RenderImageClickHandler | null
    direction: 'row' | 'column'
    top?: number
    left?: number
}

const Photo = ({ mime, index, onClick, photo, margin, direction, top, left, containerHeight, key, onSlideLoad }
    : {photo: ImageSlide, [x: string]: any}) => {

  // ody: add user styles: photo.imgstyl
  const imgStyle = { margin: margin, display: 'block', ...photo.imgstyl } as any;
  if (direction === 'column') {
    imgStyle.position = 'absolute';
    imgStyle.left = left;
    imgStyle.top = top;
  };

  const handleClick = (event: React.UIEvent) => {
    onClick(event, { photo, index });
  };

  return (
    mime2type(mime) === 'video' ?
    <video
      key={key}
      style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
      // {...photo}
      onClick={onClick ? handleClick : null}
    ><source src={photo.src}/>
    </video>
    : mime2type(mime) === 'audio' ?
    <AudioBox key={key} width={"90%"} height={"50%"}
      style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
      {...photo}
      onCanPlay={() => onSlideLoad(photo)}
      onClick={onClick ? handleClick : null}
    />
    :
    <img
      key={key}
      style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
      {...photo}
      onClick={onClick ? handleClick : null}
      loading="lazy"
    />
  );
};

export const PhotoPropType = PropTypes.shape({
  key: PropTypes.string,
  src: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
  srcSet: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  sizes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
});

Photo.propTypes = {
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  photo: PhotoPropType.isRequired,
  margin: PropTypes.number,

  top: props => {
    if (props.direction === 'column' && typeof props.top !== 'number') {
      return new Error('top is a required number when direction is set to `column`');
    }
  },

  left: props => {
    if (props.direction === 'column' && typeof props.left !== 'number') {
      return new Error('left is a required number when direction is set to `column`');
    }
  },
  direction: PropTypes.string,
};

export default Photo;
