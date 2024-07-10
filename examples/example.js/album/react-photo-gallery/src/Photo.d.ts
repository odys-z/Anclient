// import React from 'react';
// import PropTypes from 'prop-types';

// /**
//  * Photos array item properties (passed into Gallery's photos property)
//  */
// export type PhotoProps<CustomPhotoProps extends object = {}> = {
//     /**
//      * the img src attribute value of the image
//      */
//     src: string
//     /**
//      * srcSet attribute of the image
//      */
//     srcSet?: string[]
//     /**
//      * sizes attribute of the image
//      */
//     sizes?: string | string[]
//     /**
//      *  original width of the gallery image (only used for calculating aspect ratio)
//      */
//     width: number
//     /**
//      *  original height of the gallery image (only used for calculating aspect ratio)
//      */
//     height: number
//     /**
//      *  alt text of the gallery image
//      */
//     alt?: string
//     /**
//      * key to be used on component
//      */
//     key?: string
// } & CustomPhotoProps
  
// export type renderImageClickHandler = (
//     event: React.MouseEvent,
//     photo: object & {
//       index: number
//     },
// ) => void
  
// /**
//  * If you're passing a function component to renderImage you will receive back these props:
//  */
// export interface RenderImageProps<CustomPhotoProps extends object = {}> {
//     /**
//      * margin prop optionally passed into Gallery by user
//      */
//     margin?: string
//     /**
//      * the index of the photo within the Gallery
//      */
//     index: number
//     /**
//      * the individual object passed into Gallery's
//      * photos array prop, with all the same props except recalculated height and width
//      */
//     photo: PhotoProps<CustomPhotoProps>
  
//     onClick: renderImageClickHandler | null
//     direction: 'row' | 'column'
//     top?: number
//     left?: number
// }

// export default Photo;
