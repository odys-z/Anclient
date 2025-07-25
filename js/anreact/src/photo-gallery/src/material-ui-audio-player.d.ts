declare module 'material-ui-audio-player' {
import { ComponentType } from 'react';

/** A temporary solution for type checking errors upon React 17, Material-ui 4 and v 1.7.1 */
export interface AudioPlayerProps {
    src: string;
    useStyles?: any;
    displaySlider?: boolean;
    variation?: 'primary' | 'secondary' | 'default';
    elevation?: number;
    spacing?: number;
    autoplay?: boolean;
    loop?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    [key: string]: any; // Allow additional props
  }

  const AudioPlayer: ComponentType<AudioPlayerProps>;
  export default AudioPlayer;
}