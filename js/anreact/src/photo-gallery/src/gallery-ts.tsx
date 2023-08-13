import React, { useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import { computeColumnLayout } from './layouts/columns';
import { computeRowLayout } from './layouts/justified';
import { findIdealNodeSearch } from './utils/findIdealNodeSearch';
import Photo, { PhotoProps, PhotoPropType } from './photo-ts';

export type PhotoClickHandler = (
  event: React.MouseEvent,
  ix: number
) => void


export interface GalleryProps {
  photos: Array<PhotoProps>
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
  onClick?: PhotoClickHandler

  /**
   * number of margin pixels around each entire image
   */
  margin?: number
  /**
   * column or row based layout
   */
  direction?: string

  videoControl?: boolean
}

const Gallery = function Gallery({
  photos,
  onClick,
  direction,
  videoControl,
  margin,
  limitNodeSearch,
  targetRowHeight,
  columns,
} : GalleryProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const galleryEl = useRef(null);

  useLayoutEffect(() => {
    let animationFrameID = null;
    const observer = new ResizeObserver(entries => {
      // only do something if width changes
      const newWidth = entries[0].contentRect.width;

      // Ody Z, 2023/6/2
      // This stops endless animation of keeping shrinking photos. Yet the problem is not understood.
      // if (containerWidth !== newWidth)
      // ->
      // if (Math.abs(containerWidth - newWidth) > 1)
      //
      // ReactJS API, useLayoutEffect:
      // Reference
      // https://react.dev/reference/react/useLayoutEffect
      // Resize Observer API, MDN:
      // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

      if (Math.abs(containerWidth - newWidth) > 1) {
          
        // put in an animation frame to stop "benign errors" from
        // ResizObserver https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
        animationFrameID = window.requestAnimationFrame(() => {
          setContainerWidth(Math.floor(newWidth));
        });
      }
    });
    observer.observe(galleryEl.current);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrameID);
    };
  });

  const handleClick = (event, { index }) => onClick(event, index);

  // no containerWidth until after first render with refs, skip calculations and render nothing
  if (!containerWidth) return <div ref={galleryEl}>&nbsp;</div>;
  // subtract 1 pixel because the browser may round up a pixel
  const width = containerWidth - 1;
  let galleryStyle, thumbs;

  if (direction === 'row') {
    // allow user to calculate limitNodeSearch from containerWidth
    if (typeof limitNodeSearch === 'function') {
      limitNodeSearch = limitNodeSearch(containerWidth);
    }
    if (typeof targetRowHeight === 'function') {
      targetRowHeight = targetRowHeight(containerWidth);
    }
    // set how many neighboring nodes the graph will visit
    if (limitNodeSearch === undefined) {
      limitNodeSearch = 2;
      if (containerWidth >= 450) {
        limitNodeSearch = findIdealNodeSearch({ containerWidth, targetRowHeight });
      }
    }

    galleryStyle = { display: 'flex', flexWrap: 'wrap', flexDirection: 'row' };
    thumbs = computeRowLayout({ containerWidth: width, limitNodeSearch, targetRowHeight, margin, photos });
  }
  if (direction === 'column') {
    // allow user to calculate columns from containerWidth
    if (typeof columns === 'function') {
      columns = columns(containerWidth);
    }
    // set default breakpoints if user doesn't specify columns prop
    if (columns === undefined) {
      columns = 1;
      if (containerWidth >= 500) columns = 2;
      if (containerWidth >= 900) columns = 3;
      if (containerWidth >= 1500) columns = 4;
    }
    galleryStyle = { position: 'relative' };
    thumbs = computeColumnLayout({ containerWidth: width, columns, margin, photos });
    galleryStyle.height = thumbs[thumbs.length - 1].containerHeight;
  }

  return (
    <div className="react-photo-gallery--gallery">
      <div ref={galleryEl} style={galleryStyle}>
        {thumbs.map((thumb, index) => {
          const { mime, left, top, containerHeight, ...photo } = thumb;
          return Photo({
            index, key: thumb.key || thumb.src,
            left, top, containerHeight,
            margin, direction, videoControl,
            onClick: onClick ? handleClick : null,
            onSlideLoad: (p) => {},
            mime, photo
          });
        })}
      </div>
    </div>
  );
}

Gallery.propTypes = {
  photos: PropTypes.arrayOf(PhotoPropType).isRequired,
  direction: PropTypes.string,
  videoControl: PropTypes.bool,
  onClick: PropTypes.func,
  columns: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  targetRowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  limitNodeSearch: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  margin: PropTypes.number,
  renderImage: PropTypes.func,
};

Gallery.defaultProps = {
  margin: 2,
  direction: 'row',
  targetRowHeight: 300,
};

const GalleryMem = React.memo(Gallery);

export { Photo };
export default GalleryMem;
