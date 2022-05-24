import React, { useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import Photo, { photoPropType, PhotoProps } from './Photo';
import { computeColumnLayout } from './layouts/columns';
import { computeRowLayout } from './layouts/justified';
import { findIdealNodeSearch } from './utils/findIdealNodeSearch';

export interface GalleryProps<CustomPhotoProps extends object = {}> {
    photos: Array<PhotoProps<CustomPhotoProps>>
    /**
     * applies to column layouts only (direction=column)
     * number of columns or a function which receives the container width
     * and should return the desired number of columns; defaults to Gallery's breakpoint choosing
     */
    columns?: number | ((containerWidth: number) => number)
    /**
     * applies to row layouts only (direction=row)
     * the ideal height of each row or a function which receives the container width
     * and should return the desired ideal height for each row; defaults to 300px
     */
    targetRowHeight?: number | ((containerWidth: number) => number)
    /**
     * applies to row layouts only (direction=row)
     * the maximum amount of neighboring nodes to measure per current node visiting
     * don't change unless you understand the algorithm, see docs
     * defaults to a couple breakpoints
     */
    limitNodeSearch?: number | ((containerWidth: number) => number)
    /**
     * do something when the user clicks a photo;
     * receives arguments event and an object containing the index,
     * photo obj originally sent and the next and previous photos in the gallery if they exist
     */
    onClick?: PhotoClickHandler<CustomPhotoProps>
  
    /**
     * number of margin pixels around each entire image
     */
    margin?: number
    /**
     * column or row based layout
     */
    direction?: string
  
    renderImage?: React.ComponentType<RenderImageProps<CustomPhotoProps>>
  }

export interface PhotoSlide<T extends {}> {
    index: number
    next: PhotoProps<T> | null
    photo: PhotoProps<T>
    previous: PhotoProps<T> | null
}

export type PhotoClickHandler<CustomPhotoProps extends object = {}> = (
  event: React.MouseEvent,
  photos: PhotoSlide<CustomPhotoProps>,
) => void

export default class Gallery<T> extends React.Component<GalleryProps<T>> {
}