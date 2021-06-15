import React from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export class ConfirmDialog extends React.Component {
	state = {
		closed: false,
	};

	constructor (props) {
		super(props);

		this.handleClose = this.handleClose.bind(this);
	}

	handleClose(e) {
		this.setState({closed: true});
		this.props.onClose(e.currentTarget);
	};

	textLines(msg) {
		let lines = msg.split('\n')

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
