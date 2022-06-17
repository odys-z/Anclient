
import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Box from '@material-ui/core/Box';


import { gCamera, gCameraViewBox } from './my-icon';
import { dataOfurl, mimeOf } from '../../utils/file-utils';
import { DetailFormW, Comprops } from '../crud';
import { invalidStyles } from '../anreact';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
	imgUploadBox: {
		height: 48,
		border: "solid 1px #aaa2" }
	}
) );

/**
 */
interface ImageUploadProps extends Comprops {
	blankIcon: object;
	/** Date record's field name */
	field: string;

	/** callback on file loaded
	 *
	 * blob:
	 * File content wrapped with dataUrl()
	 */
	onFileLoaded?: (fileMeta: {mime: string, name: string}, blob: string) => void;
}

class ImageUploadComp extends DetailFormW<ImageUploadProps> {
	state = {
		src: undefined,
	}

	fileInput = undefined;
	imgPreview = undefined;

	field: any;

	constructor(props: ImageUploadProps) {
		super(props);

		this.toShowImage = this.toShowImage.bind(this);

		// usually element in record form must know this
		this.field = props.field;
	}

	componentDidMount() {
		if (this.props.file) {
		}
	}

	toShowImage(e) {
		let that = this;
		let file = this.fileInput.files[0];

		let imageType = /image.*/;

		if (file.type.match(imageType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				that.imgPreview.src = reader.result;

				let fileMeta = {
					mime: mimeOf( reader.result as string ),
					name: file.name
				};

				if (that.props.tier && that.field.field) {
					that.props.tier.rec[that.field.field] = reader.result;
					that.props.tier.rec.fileMeta = fileMeta;
				}

				if (that.props.onFileLoaded)
					that.props.onFileLoaded(fileMeta, dataOfurl( reader.result as string ));
			}

			reader.readAsDataURL(file);
		} else {
			this.setState({invalid: true});
		}

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
		  <Box className={ classes.imgUploadBox }>
			<img
				src={dataimg}
				style={{ width: this.props.width || "auto", height: "100%", minHeight: 48 }}
				ref={(ref) => this.imgPreview = ref} />
			<input type='file' style={ bg } disabled={this.props.disabled}
		 		ref={ (ref) => this.fileInput = ref }
		 		onChange={ this.toShowImage } />
		  </Box>);
	}
}

const ImageUpload = withWidth()(withStyles(styles)(ImageUploadComp));
export { ImageUpload, ImageUploadComp, ImageUploadProps };
