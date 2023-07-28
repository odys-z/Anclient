/**
 * Credit to: https://github.com/Ngineer101/react-image-video-lightbox/blob/master/src/index.js
 * 2023.6.27 baseline, by Ngineer, License: MIT
 *
 * ISSUE: Performance problem since v0.4.26.
 * It could be the anson64's random string makes browser always load the same images, see
 * <a href='https://stackoverflow.com/q/10240110'>discussions</a>.
 *
 * FIXME: Resource should be cached.
 */
import * as React from 'react';
import {TouchEvent, Touch} from 'react'; // override global types
import { AnTreeNode, StreeTier, PhotoRec } from '@anclient/semantier';
import { Comprops, CrudCompW } from '../../react/crud';
import { GalleryView } from '../../react/widgets/gallery-view';
import { regex } from '../../utils/regex';
import { Typography } from '@material-ui/core';
import { AudioBox } from './audio-box';

let { mime2type } = regex;

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

export type NgineerSlideProps = {
  mime: string;
  id?: string;
  src: string;
  title?: string;
  altag?: string;
  poster?: string;
}

export const settle = (val: number, target: number, range: number) => {
  const lowerRange = val > target - range && val < target;
  const upperRange = val < target + range && val > target;
  return lowerRange || upperRange ? target : val;
}

export function getTouchPt (touch: Touch) {
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

/**
 *
 * @param pointA
 * @param pointB
 * @returns distance
 */
export function d (pointA: { x: number; y: number; }, pointB: { x: number; y: number; }) {
  return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2));
}

export const between = (min: number, max: number, value: number) => {
  return Math.min(max, Math.max(min, value));
}

/**
 * Show a fullscreen carousel.
 *
 * This function have a performance issue.
 */
export class Lightbox extends CrudCompW<Comprops & {
    /* accepting command of parent to stop loading resources */
    open: boolean }> {
  width: number;
  height: number;
  onNavigationCallback: any;
  animation!: number;
  lastTouchEnd!: number;
  swipeStartX: any;
  swipeStartY: any;
  lastDistance: any;

  config: {
    index: number;
    x: number; y: number;
    scale: number; iconSize: number;
    width: number; height: number;
    // swiping: boolean;// loading: boolean;
    paused: boolean;
  };

  tier: StreeTier;

  constructor(props: Comprops) {
    super(props);

    this.tier = props.tier as StreeTier;

    this.config = {
      x: INITIAL_X,
      y: INITIAL_Y,
      scale: INITIAL_SCALE,
      width: window.innerWidth,
      height: window.innerHeight,
      index: this.props.ix,
      iconSize: window.innerWidth <= 500 ? MOBILE_ICON_SIZE : DESKTOP_ICON_SIZE,
      paused: true
    };

    this.state.loading = true;
    this.state.swiping = false;

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

      this.config = Object.assign(this.config, {
        scale: targetScale,
        width: nextWidth,
        height: nextHeight,
        x: INITIAL_X,
        y: INITIAL_Y
      });

      this.setState({swiping: false, loading: true}, () => {
        this.animation = requestAnimationFrame(frame);
      });
    };

    this.animation = requestAnimationFrame(frame);
  }

  handleTouchStart(event: any ) {
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

    if (this.state.swiping && this.config.scale === 1) {
      this.handleSwipe(event);
    }

    this.lastTouchEnd = event.timeStamp;
  }

  handleSwipe(event: TouchEvent) {
    if (this.state.swiping) {
      var swipeDelta = event.changedTouches[0].clientX - this.swipeStartX;
      if (swipeDelta < -(this.width / 3)) {
        this.swipeRight();
      } else if (swipeDelta > (this.width / 3)) {
        this.swipeLeft();
      } else {
        this.reset();
      }
    }
  }

  swipeLeft() {
    var currentIndex = this.config.index;
    if (currentIndex > 0) {
      setTimeout(() => {
        this.config = Object.assign(this.config, {
          index: currentIndex - 1,
          x: INITIAL_X,
        });
        this.setState({
          swiping: false,
          loading: true
        }, () => this.onNavigationCallback(currentIndex - 1));
      }, 500);
    } else {
      this.reset();
    }
  }

  swipeRight() {
    var currentIndex = this.config.index;
    if (currentIndex < (this.props.photos.length - 1)) {
      setTimeout(() => {
        this.config = Object.assign(this.config, {
          index: currentIndex + 1,
          x: INITIAL_X,
        });
        this.setState({
          swiping: false,
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
      this.config.x = event.touches[0].clientX - this.swipeStartX
      this.setState({ });
    } else {
      event.preventDefault();
      this.config.x = event.touches[0].clientX - this.swipeStartX,
      this.config.y = event.touches[0].clientY - this.swipeStartY
      this.setState({ });
    }
  }

  handlePinchStart(event: TouchEvent) {
    const pointA = getTouchPt(event.touches[0]);
    const pointB = getTouchPt(event.touches[1]);
    this.lastDistance = d(pointA, pointB);
  }

  handlePinchMove(event: TouchEvent) {
    event.preventDefault();
    const pointA = getTouchPt(event.touches[0]);
    const pointB = getTouchPt(event.touches[1]);
    const distance = d(pointA, pointB);
    const scale = between(MIN_SCALE - ADDITIONAL_LIMIT, MAX_SCALE + ADDITIONAL_LIMIT,
                          this.config.scale * (distance / this.lastDistance));
    this.zoom(scale);
    this.lastDistance = distance;
  }

  zoom(scale: number) {
    const nextWidth = this.width * scale;
    const nextHeight = this.height * scale;

    this.config.width = nextWidth;
    this.config.height = nextHeight;
    this.config.scale = scale;
    this.setState({ });
  }

  parse = (photos: AnTreeNode[]) : NgineerSlideProps[] => {
    let slids = [];
    photos.forEach( (p, x) => {
      slids.push({
        altTag: p.title,
        poster: p.preview,
        src: GalleryView.imgSrcReq(p.id, this.tier),
        mime: p.node.mime,
        title: PhotoRec.toShareLable(p.node as PhotoRec),
      });
    } );

    return slids;
  }

  vidRef: HTMLVideoElement;
  audRef: AudioBox;
  
  getResources() {
    let items = [];
    let data = this.parse(this.props.photos);
    for (var i = 0; i < data.length; i++) {
      let resource = data[i];
      let mime = mime2type(resource.mime);
      if (!resource.mime || mime === 'image') {
        items.push(<img key={i}
          alt={resource.altag}
          src={resource.src}
          loading='lazy'
          style={{
            pointerEvents: this.config.scale === 1 ? 'auto' : 'none',
            maxWidth: '100%', maxHeight: '100%',
            transform: `translate(${this.config.x}px, ${this.config.y}px) scale(${this.config.scale})`,
            transition: 'transform 0.5s ease-out'
          }}
          onLoad={() => {
            if (this.state.swiping || this.state.loading)
              this.setState({ loading: false }); }}
        />);
      }
      else if (mime === 'video') {
        items.push(<video key={i}
          ref={(ref) => this.vidRef = ref}

          preload='false' controls
          poster={resource.poster}
          style={{
            pointerEvents: this.config.scale === 1 ? 'auto' : 'none',
            maxWidth: '100%', maxHeight: '100%',
            transform: `translate(${this.config.x}px, ${this.config.y}px) scale(${this.config.scale})`,
            transition: 'transform 0.5s ease-out'
          }}
          onLoad={(e) => {
            console.log('video loaded', e.currentTarget);
            if (this.state.swiping || this.state.loading)
              this.setState({ loading: false }); }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (this.config.paused)
              this.vidRef.play();
            else
              this.vidRef.pause();

            this.config.paused = !this.config.paused;
          }}
          onEnded={e => this.config.paused = true}
        >
          <source src={resource.src} type={resource.mime}/>
        </video>);
      }
      else if (mime === 'audio') {
        items.push(
        <AudioBox lightMode
          key={i}
          ref={(ref) => this.audRef = ref}
          poster={resource.poster}
          width='80%'
          height='50%'
          onCanPlay={()=> {
            if (this.state.swiping || this.state.loading)
              this.setState({ loading: false }); }}
        > <Typography >{resource.title}</Typography>
        </AudioBox>);
      }
      /* TODO third party online resources
      else if (resource.mime === 'video') {
        items.push(<iframe key={i}
          allowFullScreen width="560" height="315"
          src={resource.url}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title={resource.title}
          style={{
            pointerEvents: this.config.scale === 1 ? 'auto' : 'none',
            maxWidth: '100%', maxHeight: '100%',
            transform: `translate(${this.config.x}px, ${this.config.y}px)`,
            transition: 'transform 0.5s ease-out'
          }}
          onLoad={() => { this.setState({ loading: false }); }}></iframe>);
      }
      */
    }

    return items;
  }

  UNSAFE_componentWillMount() {
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 500) {
        this.config.iconSize = MOBILE_ICON_SIZE;
        this.setState({ });
      } else {
        this.config.iconSize = DESKTOP_ICON_SIZE;
        this.setState({ });
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      if (window.innerWidth <= 500) {
        this.config.iconSize = MOBILE_ICON_SIZE;
        this.setState({ });
      } else {
        this.config.iconSize = DESKTOP_ICON_SIZE;
        this.setState({ });
      }
    });
  }

  render() {
    if (!this.props.open)
      return <></>;

    let resources = this.getResources();
    return (
      <div
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        style={{
          top: '0px', left: '0px',
          overflow: 'hidden', position: 'fixed', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
          height: '100%', width: '100%',
          backgroundColor: 'rgba(0,0,0,1)'
        }}>

        { this.props.showResourceCount &&
          <div
            style={{
              position: 'absolute', top: '0px', left: '0px',
              padding: '15px', color: 'white', fontWeight: 'bold'
            }}>
            <span>{this.config.index + 1}</span> / <span>{this.props.photos.length}</span>
          </div>
        }

        { this.state.loading &&
          <div style={{ margin: 'auto', position: 'fixed' }}>
            <style>
              { `@keyframes react_image_video_spinner {
                 0% { transform: translate3d(-50 %, -50 %, 0) rotate(0deg); }
                 100% { transform: translate3d(-50%, -50%, 0) rotate(360deg); }
                }`
              }
            </style>
            <div style={{
              animation: '1.0s linear infinite react_image_video_spinner',
              border: 'solid 5px #ffffff',
              borderBottomColor: '#cfd0d1', borderRadius: '50%',
              height: 30, width: 30, position: 'fixed',
              transform: 'translate3d(-50%, -50%, 0)',
            }}></div>
          </div>
        }
        { resources[this.config.index || 0] }

        <div
          style={{
            position: 'absolute',
            top: '0px', right: '0px',
            padding: '10px', cursor: 'pointer',
            color: '#FFFFFF',
            fontSize: `${this.config.iconSize * 0.8}px`
          }}
          onClick={() => {
            this.props.onClose();
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#FFFFFF">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>

        { (this.config.index + 1 != 1) ?
            <div
              style={{
                position: 'absolute', left: '0px',
                zIndex: 1, cursor: 'pointer',
                color: '#FFFFFF',
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
        { (this.config.index + 1 != this.props.photos.length) ?
            <div
              style={{
                position: 'absolute',
                right: '0px', zIndex: 1,
                color: '#FFFFFF', cursor: 'pointer',
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
      </div>
    );
  }
}

export default Lightbox;
function useRef(arg0: null) {
  throw new Error('Function not implemented.');
}
