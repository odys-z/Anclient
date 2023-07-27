/**
 * Credits to:
 * 
 * Justin McCandless, React Audio Player,
 * https://github.com/justinmc/react-audio-player
 * Retrieved on Jul. 26, 2023,
 * License: MIT
 * 
 * Adulik (arusikpaloyan), Audio player (forked at Code Sandbox),
 * https://codesandbox.io/s/audio-player-forked-lxuloi?file=/src/App.js
 * Retrieved on Jul. 27, 2023,
 * 
 * Modified by Ody Z.
 */
import React, { Component, ReactNode, CSSProperties } from 'react';

// import theme from "./audio-theme"
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import ClosedCaption from '@material-ui/icons/ClosedCaption';

import { Paper, Box, Grid, Dialog, DialogTitle, Typography, DialogContent, DialogActions, Button, GridSpacing } from '@material-ui/core';
import AudioPlayer from 'material-ui-audio-player';
import { AudioPlayerVariation } from 'material-ui-audio-player/dist/components/AudioPlayer';
// import { JsampleTheme } from '../../jsample/styles';
import audioTheme from './audio-theme';
import { VerticalAlignCenter } from '@material-ui/icons';

interface AudioBoxProps {
  autoPlay?: boolean
  children?: ReactNode
  className?: string
  controls?: boolean
  controlsList?: string
  crossOrigin?: "" | "anonymous" | "use-credentials"
  id?: string
  listenInterval?: number
  loop?: boolean
  muted?: boolean
  onAbort?: (e: Event) => void
  onCanPlay?: (e: Event) => void
  onCanPlayThrough?: (e: Event) => void
  onEnded?: (e: Event) => void
  onError?: (e: Event) => void
  onListen?: (time: number) => void
  onLoadedMetadata?: (e: Event) => void
  onPause?: (e: Event) => void
  onPlay?: (e: Event) => void
  onSeeked?: (e: Event) => void
  onVolumeChanged?: (e: Event) => void
  preload?: '' | 'none' | 'metadata' | 'auto'
  src?: string, // Not required b/c can use <source>
  style?: CSSProperties
  title?: string
  legend?: string,
  volume: number,

  width: string,
  height: string,
}

interface ConditionalProps {
  controlsList?: string
  [key: string]: any
}

class AudioBox extends Component<AudioBoxProps> {
  static propTypes: Object

  static defaultProps: AudioBoxProps

  audioEl = React.createRef<HTMLAudioElement>();

  listenTracker?: number

  onError = (e: Event) => this.props.onError?.(e);
  onCanPlay = (e: Event) => this.props.onCanPlay?.(e);
  onCanPlayThrough = (e: Event) => this.props.onCanPlayThrough?.(e);
  onPlay = (e: Event) => {
    this.setListenTrack();
    this.props.onPlay?.(e);
  }
  onAbort = (e: Event) => {
    this.clearListenTrack();
    this.props.onAbort?.(e);
  }
  onEnded = (e: Event) => {
    this.clearListenTrack();
    this.props.onEnded?.(e);
  }
  onPause = (e: Event) => {
    this.clearListenTrack();
    this.props.onPause?.(e);
  }
  onSeeked = (e: Event) => {
    this.props.onSeeked?.(e);
  }
  onLoadedMetadata = (e: Event) => {
    this.props.onLoadedMetadata?.(e);
  }
  onVolumeChanged = (e: Event) => {
    this.props.onVolumeChanged?.(e);
  }

  componentDidMount() {
    const audio = this.audioEl.current;

    if (!audio) return;

    this.updateVolume(this.props.volume);

    audio.addEventListener('error', this.onError);

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', this.onCanPlay);

    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', this.onCanPlayThrough);

    // When audio play starts
    audio.addEventListener('play', this.onPlay);

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', this.onAbort);

    // When the file has finished playing to the end
    audio.addEventListener('ended', this.onEnded);

    // When the user pauses playback
    audio.addEventListener('pause', this.onPause);

    // When the user drags the time indicator to a new time
    audio.addEventListener('seeked', this.onSeeked);

    audio.addEventListener('loadedmetadata', this.onLoadedMetadata);

    audio.addEventListener('volumechange', this.onVolumeChanged);
  }

  // Remove all event listeners
  componentWillUnmount() {
    const audio = this.audioEl.current;

    if (!audio) return;

    audio.removeEventListener('error', this.onError);

    // When enough of the file has downloaded to start playing
    audio.removeEventListener('canplay', this.onCanPlay);

    // When enough of the file has downloaded to play the entire file
    audio.removeEventListener('canplaythrough', this.onCanPlayThrough);

    // When audio play starts
    audio.removeEventListener('play', this.onPlay);

    // When unloading the audio player (switching to another src)
    audio.removeEventListener('abort', this.onAbort);

    // When the file has finished playing to the end
    audio.removeEventListener('ended', this.onEnded);

    // When the user pauses playback
    audio.removeEventListener('pause', this.onPause);

    // When the user drags the time indicator to a new time
    audio.removeEventListener('seeked', this.onSeeked);

    audio.removeEventListener('loadedmetadata', this.onLoadedMetadata);

    audio.removeEventListener('volumechange', this.onVolumeChanged);
  }

  componentDidUpdate(_p: AudioBoxProps) {
    this.updateVolume(this.props.volume);
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack() {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval;
      this.listenTracker = window.setInterval(() => {
        this.audioEl.current && this.props.onListen?.(this.audioEl.current.currentTime);
      }, listenInterval);
    }
  }

  /**
   * Set the volume on the audio element from props
   * @param {Number} volume
   */
  updateVolume(volume: number) {
    const audio = this.audioEl.current;
    if (audio !== null && typeof volume === 'number' && volume !== audio?.volume) {
      audio.volume = volume;
    }
  }

  /**
   * Clear the onListen interval
   */
  clearListenTrack() {
    if (this.listenTracker) {
      clearInterval(this.listenTracker);
      delete this.listenTracker;
    }
  }

  RegisPlayer = ({
    useStyles = {},
    // color = "primary" as keyof typeof AudioPlayerVariation,
    color = 'primary' as 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error',
    size = "default",
    elevation = 1,
    transcript = "",
    src="",
    ...rest
  }) => {
    const [openDialog, setOpenDialog] = React.useState(false);

    const iconSize = { small: 20, default: 24, large: 36, inherit: "inherit" }[size];

    const fontSize = {
      small  : audioTheme.typography.body2.fontSize,
      default: audioTheme.typography.body1.fontSize,
      large  : audioTheme.typography.body1.fontSize
    }[size];

    const spacing = {
      small  : { x: 1,   y: 0.5,  z: 1 },
      default: { x: 1,   y: 0.75, z: 1 },
      large  : { x: 1.5, y: 1.5,  z: 2 }
    }[size];

    const minWidth = { small: 180, default: 250, large: 320 }[size];

    let spatial = true;
    try { spatial = Number(this.props.width) > 2 * minWidth; }
    catch (e) {}

    const useClasses = makeStyles((theme) => ({
      paper: { minWidth: minWidth },
      root: {
        background: "none",
        "& .MuiGrid-item": {
          display: "flex",
          alignItems: "center"
        },
        // "& div[class*='volumeControlContainer']": { display: "none" },
        "& .MuiSvgIcon-root": { fontSize: iconSize }
      },
      progressTime: { fontSize: fontSize },
      mainSlider: { display: spatial ? "block" : "none", },
      ...useStyles
    }));

    const customIcon = makeStyles((theme) => ({
      root: {
        cursor: "pointer",
        "&:hover": {
          color:
            theme.palette[["primary", "secondary"].includes(color) ? color : "primary"].light
        }
      }
    }));

    const classes = useClasses();
    const customIconClasses = customIcon();

    return (
      <React.Fragment >
        <Paper elevation={elevation} className={classes.paper} >
          <Box px={spacing.x} py={spacing.y} my={"16px"} style={{height: "fit-content", width: "90%"}}>
            <Grid container alignItems="center">
              <Grid item xs>
                <AudioPlayer
                  {...rest}
                  src={src}
                  variation={color as keyof typeof AudioPlayerVariation}
                  elevation={0}
                  useStyles={useClasses}
                  spacing={spacing.z as GridSpacing}
                />
              </Grid>
              {transcript !== "" && (
                <Grid item style={{ display: "flex" }}>
                  <ClosedCaption
                    fontSize={size as "small" | "inherit" | "default" | "large" | "medium"}
                    className={customIconClasses.root}
                    color={color}
                    onClick={() => setOpenDialog(true)}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle disableTypography>
            <Typography variant="h3">Audio transcript</Typography>
          </DialogTitle>
          <DialogContent dividers>
            {transcript !== "" &&
              transcript.split("\n").map((item, index) => (
                <Typography paragraph key={index}>
                  {item}
                </Typography>
              ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  };

  render() {
    const incompatibilityMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    );

    // Set controls to be true by default unless explicity stated otherwise
    const controls = !(this.props.controls === false);

    // Set lockscreen / process audio title on devices
    const title = this.props.title ? this.props.title : this.props.legend;

    // Some props should only be added if specified
    const conditionalProps: ConditionalProps = {};
    if (this.props.controlsList) {
      conditionalProps.controlsList = this.props.controlsList;
    }

    return (
      // <div style={{width: '100%'}}>
      //   <img src='' style={this.props.style}/>
      //   <audio
      //     autoPlay={this.props.autoPlay}
      //     className={`react-audio-player ${this.props.className}`}
      //     controls
      //     crossOrigin={this.props.crossOrigin}
      //     id={this.props.id}
      //     loop={this.props.loop}
      //     muted={this.props.muted}
      //     preload={this.props.preload}
      //     ref={this.audioEl}
      //     src={this.props.src}
      //     style={this.props.style}
      //     title={title}
      //     {...conditionalProps}
      //   >
      //     {incompatibilityMessage}
      //   </audio>
      // </div>
      <React.Fragment >
        <ThemeProvider theme={audioTheme}>
          <Box width={this.props.width} height={this.props.height}
              style={{alignItems: "center", display: "flex", flexFlow: "column"}} >
            <Typography paragraph align='center' >
              {`${this.props.legend}`}
            </Typography>
            <this.RegisPlayer
              // color="secondary"
              size="small"
              transcript={title || this.props.legend}
              src={this.props.src}
            />
          </Box>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

AudioBox.defaultProps = {
  autoPlay: false,
  children: null,
  className: '',
  controls: false,
  controlsList: '',
  id: '',
  listenInterval: 10000,
  loop: false,
  muted: false,
  onAbort: () => {},
  onCanPlay: () => {},
  onCanPlayThrough: () => {},
  onEnded: () => {},
  onError: () => {},
  onListen: () => {},
  onPause: () => {},
  onPlay: () => {},
  onSeeked: () => {},
  onVolumeChanged: () => {},
  onLoadedMetadata: () => {},
  preload: 'metadata',
  style: {},
  title: '',
  volume: 1.0,

  width: "16wh",
  height: "9wh",
};

// AudioBox.propTypes = {
//   autoPlay: PropTypes.bool,
//   children: PropTypes.element,
//   className: PropTypes.string,
//   controls: PropTypes.bool,
//   controlsList: PropTypes.string,
//   crossOrigin: PropTypes.string,
//   id: PropTypes.string,
//   listenInterval: PropTypes.number,
//   loop: PropTypes.bool,
//   muted: PropTypes.bool,
//   onAbort: PropTypes.func,
//   onCanPlay: PropTypes.func,
//   onCanPlayThrough: PropTypes.func,
//   onEnded: PropTypes.func,
//   onError: PropTypes.func,
//   onListen: PropTypes.func,
//   onLoadedMetadata: PropTypes.func,
//   onPause: PropTypes.func,
//   onPlay: PropTypes.func,
//   onSeeked: PropTypes.func,
//   onVolumeChanged: PropTypes.func,
//   preload: PropTypes.oneOf(['', 'none', 'metadata', 'auto']),
//   src: PropTypes.string, // Not required b/c can use <source>
//   style: PropTypes.objectOf(PropTypes.string),
//   title: PropTypes.string,
//   volume: PropTypes.number,
// };

export { AudioBox, AudioBoxProps };
