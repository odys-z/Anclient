/**
 * Credit to: https://github.com/Ngineer101/react-image-video-lightbox/blob/master/src/index.js
 * 2023.6.27 baseline, MIT @ Ngineer
 */
import * as React from 'react';
import { Protocol, SessionClient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';
import { Comprops, CrudCompW } from '../../react/crud';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SETTLE_RANGE = 0.001;
const ADDITIONAL_LIMIT = 0.2;
const DOUBLE_TAP_THRESHOLD = 300;
const ANIMATION_SPEED = 0.04;
const RESET_ANIMATION_SPEED = 0.08;
const INITIAL_X = 0;
const INITIAL_Y = 0;
const INITIAL_SCALE = 1;
const MOBILE_ICON_SIZE = 35;
const DESKTOP_ICON_SIZE = 50;

export type BoxProps = {
}

export const settle = (val: number, target: number, range: number) => {
  const lowerRange = val > target - range && val < target;
  const upperRange = val < target + range && val > target;
  return lowerRange || upperRange ? target : val;
}

export const getPointFromTouch = (touch: Touch) => {
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

export const getDistanceBetweenPoints = (pointA: { x: any; y: any; }, pointB: { x: any; y: any; }) => {
  return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2));
}

export const between = (min: number, max: number, value: number) => {
  return Math.min(max, Math.max(min, value));
}

// class Lightbox extends React.Component {
export class Lightbox extends CrudCompW<BoxProps & Comprops> {
  width: number;
  height: number;
  onNavigationCallback: any;
  animation!: number;
  lastTouchEnd!: number;
  swipeStartX: any;
  swipeStartY: any;
  lastDistance: any;

  config: { x: number; y: number; scale: number; width: number; height: number; index: any; swiping: boolean; loading: boolean; iconSize: number; };

  constructor(props: BoxProps & Comprops) {
    super(props);

    this.config = {
      x: INITIAL_X,
      y: INITIAL_Y,
      scale: INITIAL_SCALE,
      width: window.innerWidth,
      height: window.innerHeight,
      index: this.props.startIndex,
      swiping: false,
      loading: true,
      iconSize: window.innerWidth <= 500 ? MOBILE_ICON_SIZE : DESKTOP_ICON_SIZE
    };

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.onNavigationCallback = this.props.onNavigationCallback && typeof this.props.onNavigationCallback === 'function'
      ? this.props.onNavigationCallback
      : () => { };
  }

  zoomTo(scale: number) {
    const frame = () => {
      if (this.config.scale === scale) return;

      const distance = scale - this.config.scale;
      const targetScale = this.config.scale + (ANIMATION_SPEED * distance);

      this.zoom(settle(targetScale, scale, SETTLE_RANGE));
      this.animation = requestAnimationFrame(frame);
    };

    this.animation = requestAnimationFrame(frame);
  }

  reset() {
    const frame = () => {
      if (this.config.scale === INITIAL_SCALE && this.config.x === INITIAL_X && this.config.y === INITIAL_Y) return;

      const scaleDelta = INITIAL_SCALE - this.config.scale;
      const targetScale = settle(this.config.scale + (RESET_ANIMATION_SPEED * scaleDelta), INITIAL_SCALE, SETTLE_RANGE);

      const nextWidth = this.width * targetScale;
      const nextHeight = this.height * targetScale;

      this.setState({
        scale: targetScale,
        width: nextWidth,
        height: nextHeight,
        x: INITIAL_X,
        y: INITIAL_Y
      }, () => {
        this.animation = requestAnimationFrame(frame);
      });
    };

    this.animation = requestAnimationFrame(frame);
  }

  handleTouchStart(event: TouchEvent ) {
    this.animation && cancelAnimationFrame(this.animation);
    if (event.touches.length === 2) this.handlePinchStart(event);
    if (event.touches.length === 1) this.handleTapStart(event);
  }

  handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) this.handlePinchMove(event);
    if (event.touches.length === 1) this.handlePanMove(event);
  }

  handleTouchEnd(event: TouchEvent) {
    if (event.touches.length > 0) return null;

    if (this.config.scale > MAX_SCALE) return this.zoomTo(MAX_SCALE);
    if (this.config.scale < MIN_SCALE) return this.zoomTo(MIN_SCALE);

    if (this.lastTouchEnd && this.lastTouchEnd + DOUBLE_TAP_THRESHOLD > event.timeStamp) {
      this.reset();
    }

    if (this.config.swiping && this.config.scale === 1) {
      this.handleSwipe(event);
    }

    this.lastTouchEnd = event.timeStamp;
  }

  handleSwipe(event: TouchEvent) {
    var swipeDelta = event.changedTouches[0].clientX - this.swipeStartX;
    if (swipeDelta < -(this.width / 3)) {
      this.swipeRight();
    } else if (swipeDelta > (this.width / 3)) {
      this.swipeLeft();
    } else {
      this.reset();
    }
  }

  swipeLeft() {
    var currentIndex = this.config.index;
    if (currentIndex > 0) {
      setTimeout(() => {
        this.setState({
          index: currentIndex - 1,
          swiping: false,
          x: INITIAL_X,
          loading: true
        }, () => this.onNavigationCallback(currentIndex - 1));
      }, 500);
    } else {
      this.reset();
    }
  }

  swipeRight() {
    var currentIndex = this.config.index;
    if (currentIndex < (this.props.data.length - 1)) {
      setTimeout(() => {
        this.setState({
          index: currentIndex + 1,
          swiping: false,
          x: INITIAL_X,
          loading: true
        }, () => this.onNavigationCallback(currentIndex + 1));
      }, 500);
    } else {
      this.reset();
    }
  }

  handleTapStart(event: TouchEvent) {
    this.swipeStartX = event.touches[0].clientX;
    this.swipeStartY = event.touches[0].clientY;
    if (this.config.scale === 1) {
      this.setState({
        swiping: true
      });
    }
  }

  handlePanMove(event: TouchEvent) {
    if (this.config.scale === 1) {
      this.setState({
        x: event.touches[0].clientX - this.swipeStartX
      });
    } else {
      event.preventDefault();
      this.setState({
        x: event.touches[0].clientX - this.swipeStartX,
        y: event.touches[0].clientY - this.swipeStartY
      });
    }
  }

  handlePinchStart(event: TouchEvent) {
    const pointA = getPointFromTouch(event.touches[0]);
    const pointB = getPointFromTouch(event.touches[1]);
    this.lastDistance = getDistanceBetweenPoints(pointA, pointB);
  }

  handlePinchMove(event: TouchEvent) {
    event.preventDefault();
    const pointA = getPointFromTouch(event.touches[0]);
    const pointB = getPointFromTouch(event.touches[1]);
    const distance = getDistanceBetweenPoints(pointA, pointB);
    const scale = between(MIN_SCALE - ADDITIONAL_LIMIT, MAX_SCALE + ADDITIONAL_LIMIT, this.config.scale * (distance / this.lastDistance));
    this.zoom(scale);
    this.lastDistance = distance;
  }

  zoom(scale: number) {
    const nextWidth = this.width * scale;
    const nextHeight = this.height * scale;

    this.setState({
      width: nextWidth,
      height: nextHeight,
      scale
    });
  }

  getResources() {
    var items = [];
    var data = this.props.data;
    for (var i = 0; i < data.length; i++) {
      var resource = data[i];
      if (resource.type === 'photo') {
        items.push(<img key={i}
          alt={resource.altTag}
          src={resource.url}
          style={{
            pointerEvents: this.config.scale === 1 ? 'auto' : 'none',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `translate(${this.config.x}px, ${this.config.y}px) scale(${this.config.scale})`,
            transition: 'transform 0.5s ease-out'
          }}
          onLoad={() => { this.setState({ loading: false }); }} />);
      }

      if (resource.type === 'video') {
        items.push(<iframe key={i}
          width="560"
          height="315"
          src={resource.url}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title={resource.title}
          allowFullScreen
          style={{
            pointerEvents: this.config.scale === 1 ? 'auto' : 'none',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `translate(${this.config.x}px, ${this.config.y}px)`,
            transition: 'transform 0.5s ease-out'
          }}
          onLoad={() => { this.setState({ loading: false }); }}></iframe>);
      }
    }

    return items;
  }

  UNSAFE_componentWillMount() {
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 500) {
        this.setState({ iconSize: MOBILE_ICON_SIZE });
      } else {
        this.setState({ iconSize: DESKTOP_ICON_SIZE });
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      if (window.innerWidth <= 500) {
        this.setState({ iconSize: MOBILE_ICON_SIZE });
      } else {
        this.setState({ iconSize: DESKTOP_ICON_SIZE });
      }
    });
  }

  render() {
    var resources = this.getResources();
    return (
      <div
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        style={{
          top: '0px',
          left: '0px',
          overflow: 'hidden',
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,1)'
        }}>

        {
          this.props.showResourceCount &&
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              padding: '15px',
              color: 'white',
              fontWeight: 'bold'
            }}>
            <span>{this.config.index + 1}</span> / <span>{this.props.data.length}</span>
          </div>
        }

        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            padding: '10px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: `${this.config.iconSize * 0.8}px`
          }}
          onClick={this.props.onCloseCallback}>
          <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#FFFFFF">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>
        {
          (this.config.index + 1 != 1) ?
            <div
              style={{
                position: 'absolute',
                left: '0px',
                zIndex: 1,
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: `${this.config.iconSize}px`
              }}
              onClick={() => { this.swipeLeft(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </div>
            :
            <></>
        }
        {
          (this.config.index + 1 != this.props.data.length) ?
            <div
              style={{
                position: 'absolute',
                right: '0px',
                zIndex: 1,
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: `${this.config.iconSize}px`
              }}
              onClick={() => { this.swipeRight(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </div>
            :
            <></>
        }
        {
          this.config.loading &&
          <div style={{ margin: 'auto', position: 'fixed' }}>
            <style>
              {
                `@keyframes react_image_video_spinner {
                  0% {
                    transform: translate3d(-50 %, -50 %, 0) rotate(0deg);
                  }
                  100% {
                    transform: translate3d(-50%, -50%, 0) rotate(360deg);
                  }
                }`
              }
            </style>
            <div style={{
              animation: '1.0s linear infinite react_image_video_spinner',
              border: 'solid 5px #ffffff',
              borderBottomColor: '#cfd0d1',
              borderRadius: '50%',
              height: 30,
              width: 30,
              position: 'fixed',
              transform: 'translate3d(-50%, -50%, 0)',
            }}></div>
          </div>
        }

        {
          resources[this.config.index]
        }
      </div>
    );
  }
}

export default Lightbox;
