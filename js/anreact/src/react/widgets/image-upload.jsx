
import React from 'react';
import Box from '@material-ui/core/Box';

import { AvatarIcon  } from './my-icon';

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
		let file = fileInput.files[0];

		let imageType = /image.*/;

		if (file.type.match(imageType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				// let img = new Image();
				// img.src = reader.result;
				// img.classList.add('preview');
				// this.imgPreview.children = [img];

				// this.imgPreview.appendChild(img);
				// console.log(reader.result);
				that.imgPreview.src = reader.result;
			}
			reader.readAsDataURL(file);
		} else {
			// fileDisplayArea.innerHTML = "File not supported!"
			this.setState({invalid: true});
		}
	}

	render() {

		return (<Box >
			<input type="file"
				ref={(ref) => this.fileInput = ref}
				style={{ display: 'none' }}
				change={ this.toShowImage }
			/>
			{ this.state.src ? <div
					ref={(ref) => this.imgPreview = ref}
					src={ this.state.src }
					style={{ width: 32, height: 32 }}
					onclick={ this.onClick } /> :
				AvatarIcon({
					color: this.state.invalid ? "secondary" : "primary",
					width: 32, height: 32,
					onClick: this.onClick })
			}
		</Box>);
	}
}
