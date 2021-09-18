
import React from 'react';
import Box from '@material-ui/core/Box';

import { AvatarIcon  } from './my-icon';
import { gCamera } from './my-icon';

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

		// return (<Box style={{height: 48}}>
		// 	{ this.state.src ? <div
		// 			ref={(ref) => this.imgPreview = ref}
		// 			src={ this.state.src }
		// 			style={{ position: "relative", left: 0, top: 0, width: 48, height: 48 }} /> :
		// 		AvatarIcon({
		// 			color: this.state.invalid ? "secondary" : "primary",
		// 			position: "relative", left: 0, top: 0, width: 48, height: 48 })
		// 	}
		// 	<input type="file"
		// 		ref={(ref) => this.fileInput = ref}
		// 		style={{ opacity: 0, position: "relative", width: 48, left: -48, top: -30, height: 48 }}
		// 		onClick={ this.toOpenFile }
		// 		onChange={ this.toShowImage }
		// 	/>
		// </Box>);

		// return (<box style={{height: 48, border: "solid 1px red"}}>
		// 	<img
		// 			ref={(ref) => this.imgpreview = ref}
		// 			src={ this.state.src }
		// 			style={{ position: "relative", left: 0, top: 0, width: 48, height: 48 }} />
		// 	{!this.state.src
		// 	 && avataricon({
		// 			color: this.state.invalid ? "secondary" : "primary",
		// 			position: "relative", left: -48, top: 0, width: 48, height: 48 })
		// 	}
		// 	<input type="file"
		// 		ref={(ref) => this.fileinput = ref}
		// 		style={{ opacity: 0.5, border: "solid 1px blue", position: "relative", left: -48 * 2, top: -30, width: 48 * 2, height: 48 }}
		// 		onclick={ this.toopenfile }
		// 		onchange={ this.toshowimage }
		// 	/>
		// </box>);

		// return (<Box style={{height: 48, border: "solid 1px red"}}>
		// 	<input type="file"
		// 		ref={(ref) => this.fileInput = ref}
		// 		style={{ opacity: 0.5, border: "solid 1px blue", position: "relative", left: 0, top: 0, width: "100%", height: "100%" }}
		// 		onClick={ this.toOpenFile }
		// 		onChange={ this.toShowImage }
		// 	/>
		// </Box>);

		let viewBox = "0 0 512 512";

		let dataimg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'
				viewBox='${viewBox}' width='64px' height='64px' fill='rgb(62 80 180)'>${gCamera}</svg>`

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
