import React from 'react';

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
    srcSet?: string[]
    /**
     * sizes attribute of the image
     */
    sizes?: string | string[]
    /**
     *  original width of the gallery image (only used for calculating aspect ratio)
     */
    width: number
    /**
     *  original height of the gallery image (only used for calculating aspect ratio)
     */
    height: number
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
  
export type renderImageClickHandler = (
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
  
    onClick: renderImageClickHandler | null
    direction: 'row' | 'column'
    top?: number
    left?: number
}