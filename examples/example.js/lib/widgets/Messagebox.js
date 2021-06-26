import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import QRCode from 'qrcode'

import {L, copyToClipboard} from '../utils/langstr';

export class ConfirmDialog extends React.Component {
	state = {
		closed: false,
	};

	constructor (props = {}) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
	}

	handleClose(e) {
		this.setState({closed: true});
		if (typeof this.props.onClose === 'function')
			this.props.onClose(e.currentTarget);
	};

	textLines(msg) {
		let lines = msg ? msg.split('\n') : [];

		return lines.map( (l, x) => (
		  <DialogContentText id="alert-dialog-description" key={x}>
		    {l}
		  </DialogContentText>
		));
	}

	render () {
		let props = this.props;
		let open = props.open && !this.state.closed;
		this.state.closed = false;
		let title = props.title ? props.title : '';
		this.state.title = title;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : "Cancel";
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";

		// let msg = props.msg;
		let txtLines = this.textLines(props.msg);

		return (
			<Dialog
				open={open}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title">
				  {title}</DialogTitle>
				<DialogContent>
					{txtLines}
				</DialogContent>
				<DialogActions>
				  <Button onClick={this.handleClose} color="primary">
						{txtOk}
				  </Button>
				  <Box display={displayCancel}>
					<Button onClick={this.handleClose} color="primary" autoFocus>
						{txtCancel}
					</Button>
				  </Box>
				</DialogActions>
			</Dialog>
		);
	}
}

const styles = theme => ({
  root: {
	backgroundColor: "mint-cream",
	textAlign: "center",
	"&:hover": {
		backgroundColor: "linen"
	}
  }
});

class QrSharingComp extends React.Component {
	state = {
		closed: false,
	};

	constructor (props = {}) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.url = this.url.bind(this);
		this.onCopy = this.onCopy.bind(this);
	}

	url() {
		let qr = this.props.qr;
		let url = `${qr.origin}/${qr.path}/${qr.page}?`;
		url += qr.serv ? `serv=${qr.serv}` : '&serv=';
		url += qr.quiz ? `&quiz=${qr.quiz}` : '&quiz=';
		return url;
	}

	onCopy() {
		// navigator.clipboard.writeText(this.url());
		let txt = this.url();
		copyToClipboard(txt)
		    .then(() => console.log(txt))
		    .catch(() => console.error('error copying: ', txt));
	}

	handleClose(e) {
		this.setState({closed: true});
		if (typeof this.props.onClose === 'function')
			this.props.onClose(e.currentTarget);
	};

	render () {
		let props = this.props;
		let open = props.open && !this.state.closed;
		this.state.closed = false;
		let title = props.title ? props.title : '';
		this.state.title = title;
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";

    	const { classes } = this.props;

		var opts = {
			errorCorrectionLevel: 'H',
			type: 'image/jpeg',
			quality: 0.3,
			margin: 1,
			color: {
				dark:"#010599FF",
				light:"#FFBF60FF"
			}
		}

		let urlTxt = this.url();
		this.state.url = urlTxt;
		let imgId = this.props.imgId;
		QRCode.toDataURL(urlTxt, opts, function (err, url) {
			if (err) throw err
			let img = document.getElementById('qrcode ' + imgId)
			if(img) img.src = url
		})

		return (
			<Card className={classes.root}>
			  <CardActionArea>
				<CardMedia className={classes.media} >
					<img id={'qrcode ' + this.props.imgId}/>
				</CardMedia>
			    <CardContent onClick={this.onCopy}>
			      <Typography gutterBottom variant="h5" component="h2">
			        Click to Copy:
			      </Typography>
			      <Typography variant="body2" color="textSecondary" component="p">
				    {this.state.url}
			      </Typography>
			    </CardContent>
			  </CardActionArea>
			</Card>
		);
	}
}

const QrSharing = withStyles(styles)(QrSharingComp);
export {QrSharing, QrSharingComp};
