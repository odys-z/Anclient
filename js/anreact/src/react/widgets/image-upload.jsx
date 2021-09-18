
import React from 'react';
import Box from '@material-ui/core/Box';

import { AvatarIcon, gCamera, gCameraViewBox } from './my-icon';

export default class ImageUpload extends React.Component {
	state = {
		src: undefined,
	}

	fileInput = undefined;
	imgPreview = undefined;

	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.toShowImage = this.toShowImage.bind(this);

		if (this.props.src64 && !this.state.src64) {
			this.state.src64 = this.props.src;
		}
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

	onClick(e) {
		console.log(e);
		this.fileInput.click();
	}

	toShowImage(e) {
		let that = this;
		let file = this.fileInput.files[0];

		let imageType = /image.*/;

		if (file.type.match(imageType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				that.imgPreview.src = reader.result;
			}
			reader.readAsDataURL(file);
		} else {
			this.setState({invalid: true});
		}
	}

	render() {
		let dataimg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'
				viewBox='${gCameraViewBox}' width='64px' height='64px' fill='rgb(62 80 180)'>${gCamera}</svg>`

		let bg = {
			backgroundImage: `url(\"${dataimg}\")`,
			width: "100%",
			height: "100%",
			position: "relative",
			top: -52,
			opacity: 0
		}

		return (
		<Box style={{height: 48, border: "solid 1px #aaa2"}}>
			<img src={dataimg} style={{ width: "auto", height: "100%" }}
				ref={(ref) => this.imgPreview = ref} />
			<input type='file' style={ bg }
		 		ref={(ref) => this.fileInput = ref}
		 		onChange={ this.toShowImage } />
		</Box>);

	}
}
