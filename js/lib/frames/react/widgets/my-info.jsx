import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
// import CardActions from '@material-ui/core/CardActions';
// import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

// import QRCode from 'qrcode'

import {L} from '../utils/langstr';

const styles = theme => ({
  root: {
	backgroundColor: "mint-cream",
	textAlign: "center",
	"&:hover": {
		backgroundColor: "linen"
	}
  },
  centerbox: {
	  "justify-content": "center"
  }
});

class MyInfoComp extends React.Component {
	state = {
		// closed: false,
	};

	constructor (props = {}) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.textInfo = this.textInfo.bind(this);
	}

	handleClose(e) {
		this.setState({closed: true});
		if (typeof this.props.onClose === 'function')
			this.props.onClose(e.currentTarget);
	};

	textInfo(ssInf) {
		return (
			<DialogContentText id="myinfo-txt" >
				{ssInf ? ssInf.userName : 'User Info'}
			</DialogContentText>
		);
	}

	render () {
		let props = this.props;
		// let open = !this.state.closed;
		this.state.closed = false;
		let title = props.title ? props.title : '';

		let txtLines = this.textInfo(this.context.ssInf);

		const { classes } = this.props;

		return (
			<Dialog className={classes.root}
				open={true} // should be controld by upper level
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="myinfo-title">{title}</DialogTitle>
				<DialogContent> {txtLines} </DialogContent>
				<DialogActions>
					<Button onClick={this.handleClose} color="inherit">
						{L('Save')}
					</Button>
					<Button onClick={this.handleClose} color="inherit" autoFocus>
						{L('Cancel')}
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}
const MyInfo = withStyles(styles)(MyInfoComp);
export {MyInfo, MyInfoComp};
