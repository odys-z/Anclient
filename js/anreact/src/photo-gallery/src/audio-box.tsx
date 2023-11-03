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

import { Paper, Box, Grid, Dialog, DialogTitle, Typography, DialogContent, DialogActions,
  Button, GridSpacing, Card } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import ClosedCaption from '@material-ui/icons/ClosedCaption';
import AudioPlayer from 'material-ui-audio-player';
import { AudioPlayerVariation } from 'material-ui-audio-player/dist/components/AudioPlayer';

import audioTheme, { audioSVG } from './audio-theme';
import { isEmpty } from '@anclient/semantier/helpers';
import { svgImgSrc } from '../../utils/file-utils';

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
  // onAbort?: (e: Event) => void
  onCanPlay?: (e: Event) => void
  // onCanPlayThrough?: (e: Event) => void
  onFinished?: (e: Event) => void
  // onError?: (e: Event) => void
  // onListen?: (time: number) => void
  // onLoadedMetadata?: (e: Event) => void
  onPause?: (e: Event) => void
  onPlay?: (e: Event) => void
  onSeeked?: (e: Event) => void
  onVolumeChanged?: (e: Event) => void
  preload?: '' | 'none' | 'metadata' | 'auto'
  src: string, 
  style?: CSSProperties
  volume: number,

  lightMode?: boolean, 
  title?: string
  legend?: JSX.Element | string,
  /** AnTreeNode.node */
  node: {shareby: string, device?: string, pname?: string},
  /** copyright */
  transcript?: string,
  poster?: string | ((v: AudioBoxProps) => string),

  width: number | string,
  height: number | string,
  // onLoad: (p: ImageSlide) => void,
  onClick?: (e: React.UIEvent) => void
}

interface ConditionalProps {
  controlsList?: string
  [key: string]: any
}

/**
 * AudioBox in gallery typically requires jserv to return an aspect ratio of 64:27.
 * Ratio of w < h can be ugly ranged in gallery when only 1 child exists.
 */
class AudioBox extends Component<AudioBoxProps> {
  static propTypes: Object

  static defaultProps: AudioBoxProps

  audioEl = React.createRef<HTMLAudioElement>();

  listenTracker?: number

  onCanPlay = (e: Event) => this.props.onCanPlay?.(e);


  componentDidMount() {
    this.props.onCanPlay(undefined);
  }

  // Remove all event listeners
  componentWillUnmount() {
  }

  componentDidUpdate(_p: AudioBoxProps) {
    // this.updateVolume(this.props.volume);
  }

  RegisPlayer = ({
    useStyles = {},
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

    let spatial = () => {
      try { return Number(this.props.width) > 2 * minWidth; }
      catch (e) {}
      return false;
    };

    let useClasses = makeStyles((theme) => ({
      paper: {
        minWidth: minWidth,
        width: "100%",
        margin: theme.spacing(0.25)
      },
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
      ...useStyles
    }));

    let customIcon = makeStyles((theme) => ({
      root: {
        cursor: "pointer",
        "&:hover": {
          color:
            theme.palette[["primary", "secondary"].includes(color) ? color : "primary"].light
        }
      }
    }));

    let classes = useClasses();
    let customIconClasses = customIcon();

    return (
      <React.Fragment >
        <Paper elevation={elevation} className={classes.paper} >
          <Box px={spacing.x} py={spacing.y} my={"16px"} style={{height: "fit-content", width: "90%"}}
					    onClick={(e) => e.stopPropagation()}>
            <Grid container alignItems="center">
              <Grid item xs>
                <AudioPlayer
                  {...rest}
                  src={src}
                  displaySlider={this.props.lightMode || spatial()}
                  variation={color as keyof typeof AudioPlayerVariation}
                  elevation={0}
                  useStyles={useClasses}
                  spacing={spacing.z as GridSpacing}
                />
              </Grid>
              {/* {transcript !== "" && ( */}
              {!isEmpty(transcript) && (
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
            {!isEmpty(transcript) &&
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
    const conditionalProps: ConditionalProps = {};
    if (this.props.controlsList) {
      conditionalProps.controlsList = this.props.controlsList;
    }

    function poster(src?: string | ((v: AudioBoxProps) => string)): string {
      if (typeof src === 'function')
        return src(this.props);
      else if (src !== undefined)
        return src;
      else return svgImgSrc(audioSVG);
    }

    return (
      <React.Fragment >
        <ThemeProvider theme={audioTheme}>
          <Box width={this.props.width} height={this.props.height} 
              style={{alignItems: "center", display: "flex", flexFlow: "column", justifyContent: "center",
              backgroundImage: `url(${JSON.stringify(svgImgSrc(audioSVG))}`,
              backgroundRepeat: 'no-repeat', backgroundPosition: '50% 5%', backgroundSize: audioTheme.spacing(3)
            }}
              onClick={this.props.onClick}>
            { this.props.lightMode ?
              lightLegend(this.props, this.props.node) :
              legend(this.props.node)
            }
            <this.RegisPlayer
              size="small"
              transcript={this.props.transcript}
              src={this.props.src}
            />
          </Box>
        </ThemeProvider>
      </React.Fragment>
    );

    /**
     * A helper for compse shared-by label, with only text handling.
     * @param node AnTreeNode.node. 
     * @returns 
     */
    function legend(node: {shareby: string, device?: string, pname?: string}) {
      let {shareby, device, pname} = node;
      device = device ? ` @ ${device}` : '';
      return (<>
        <Typography variant='h5' align='center' style={{opacity: 1}}>
            {pname || ''}
        </Typography>
        <Typography paragraph align='center' style={{opacity: 1}} >
          {`${shareby || ''} ${device}`}
        </Typography>
        </>);
    }

    /**
     * A helper for compse shared-by label.
     * 
     * @param node type of AnTreeNode.node
     */
    function lightLegend(props: AudioBoxProps, node: {shareby: string, device?: string, pname?: string}) {
      let {shareby, device, pname} = node;
      return (
        <Card style={{opacity: 1, width: "100%", alignItems: "center", display: "flex", flexFlow: "column"}}>
          {[0,1,2].map((e, x) => {
            if (x === 0) return (
              <img key={x} src={poster(props.poster)}
                  style={{width: "fit-content", height: audioTheme.spacing(12), margin: audioTheme.spacing(1)}}/>);
            else if (x === 1) return (
              <Typography key={x} paragraph align='center' style={{minHeight: audioTheme.spacing(12)}}> 
                {pname || ''}
              </Typography>);
            else if (x === 2) return (
              <Typography key={x} paragraph align='center'>
                {`shared by ${shareby || ''} @ ${device || ''}`}
              </Typography>);
          })}
        </Card>);
    }
  }
}

AudioBox.defaultProps = {
  src: undefined,
  autoPlay: false,
  children: null,
  className: '',
  controls: false,
  controlsList: '',
  id: '',
  listenInterval: 10000,
  loop: false,
  muted: false,
  onCanPlay: () => {},
  onPause: () => {},
  onPlay: () => {},
  onSeeked: () => {},
  onVolumeChanged: () => {},
  preload: 'metadata',
  style: {},
  // title: '',
  volume: 1.0,
  node: {shareby: ''},

  width: "16wh",
  height: "9wh"
};

export { AudioBox, AudioBoxProps };
