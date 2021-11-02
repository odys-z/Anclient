
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import Box from '@material-ui/core/Box';

import { Semantier } from '@anclient/semantier-st';

import { AvatarIcon, gCamera, gCameraViewBox } from './my-icon';
import { uarr2Base64, mimeOf } from '../../utils/file-utils';

const styles = (theme) => (Object.assign(
	Semantier.invalidStyles, {
	imgUploadBox: {
		height: 48,
		border: "solid 1px #aaa2" }
	}
) );

class ImageUploadComp extends React.Component {
	state = {
		src: undefined,
	}

	fileInput = undefined;
	imgPreview = undefined;

	constructor(props) {
		super(props);

		this.toShowImage = this.toShowImage.bind(this);

		// usually element in record form must know this
		this.field = props.field;
	}

	componentDidMount() {
		if (this.props.file) {
			let freader = new FileReader();
			freader.onload = function (e) {
				var b64 = fileclient.Uint8ToBase64(new Uint8Array(freader.result));
				if (typeof onok === 'function') {
					onok(fileclient.file, b64);
				}
			}
			if (fileclient.file) {
				freader.readAsArrayBuffer(fileclient.file);
			}

			this.state.src = this.props.src;
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
				if (that.props.tier && that.field.field) {
					that.props.tier.rec[that.field.field] = reader.result;
					that.props.tier.rec.fileMeta = {
						mime: mimeOf( reader.result ),
						name: file.name};
				}
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
		}

		let { classes } = this.props;

		return (
		  //<Box style={{height: 48, border: "solid 1px #aaa2"}}>
		  <Box className={ this.props.classBox || classes.imgUploadBox }>
			<img src={dataimg} style={{ width: "auto", height: "100%" }}
				ref={(ref) => this.imgPreview = ref} />
			<input type='file' style={ bg }
		 		ref={ (ref) => this.fileInput = ref }
		 		onChange={ this.toShowImage } />
		  </Box>);
	}
}

ImageUploadComp.propTypes = {
	tier: PropTypes.object.isRequired,
	nv: PropTypes.object, // the record field and value
};

const ImageUpload = withWidth()(withStyles(styles)(ImageUploadComp));
export { ImageUpload, ImageUploadComp };
