import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Box from '@material-ui/core/Box';

import { gCamera, gCameraViewBox } from './my-icon';
import { DetailFormW, Comprops } from '../crud';
import { invalidStyles } from '../anreact';

import { Semantier } from '@anclient/semantier/semantier';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
	imgBox: {
		height: 48,
		border: "solid 1px #aaa2" }
	}
) );

/**
 */
interface ExtImageProps extends Comprops {
	blankIcon: object;

    port: string;

	/** Date record's field name */
	field: string;

    /** ext-file record id */
    recId: string;
}

class ExtImageComp extends DetailFormW<ExtImageProps> {
	state = {
	}

    tier = new ImageTier({});

	constructor(props: ExtImageProps) {
		super(props);
	}

	componentDidMount() {
		if (this.props.file) {
		}
	}

    showLargeImage() {
    }

    scr(recId: string): string {
        throw new Error('Method not implemented.');
    }

    srcSet(recId: string) : string {
        this.tier.imgUrl(recId);
        return '';
    }

	render() {
		let dataimg = this.props.src64 ? this.props.src64 :
				// blank avatar
				`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'
				viewBox='${gCameraViewBox}' width='64px' height='64px' fill='rgb(62 80 180)'>${gCamera}</svg>`

		let bg = {
			backgroundImage: `url(\"${dataimg}\")`,
			width: "100%",
			height: "100%",
			position: "relative",
			top: -52,
			opacity: 0
		} as React.CSSProperties;

		let { classes } = this.props;

		return (
		  <Box className={ classes?.imgUploadBox }>
            <img src={this.scr(this.props.recId)}
                srcSet={this.srcSet(this.props.recId)}
                alt={this.props.title} loading="lazy" />
			{/* <img
				src={dataimg}
				style={{ width: this.props.width || "auto", height: "100%", minHeight: 48 }}
				ref={(ref) => this.imgPreview = ref} />
			<input type='file' style={ bg } disabled={this.props.disabled}
		 		ref={ (ref) => this.fileInput = ref } accept="image/*"
		 		onChange={ this.showLargeImage } /> */}
		  </Box>);
	}
}

/**
 * Simple image wrapper, using lazy loading from jserv.docs for stream downloading a picture.
 * 
 * This control requires port "" to lazy-load a picture saved in DB as a ext-file.
 */
const ExtImage = withWidth()(withStyles(styles)(ExtImageComp));
export { ExtImage as ImageBox, ExtImageComp, ExtImageProps as ImageBoxProps };


class ImageTier extends Semantier {

    imgUrl(recId: string) {
        throw new Error('Method not implemented.');
    }

}