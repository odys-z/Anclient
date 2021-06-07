import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {Editor} from './Editor.js'

export class QuizForm extends React.Component {
	state = {
		closed: false,
	};

	constructor (props) {
		super(props);

		// this.handleClickOpen = this.handleClickOpen.bind(this);
		this.onOk = this.onOk.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}

	onCancel(e) {
		e.stopPropagation();
		this.setState({closed: true});
		if (typeof this.props.onCancel === 'function')
			this.props.onCancel(e.currentTarget);
	};

	onOk(e) {
		e.stopPropagation();
		this.setState({closed: true});
		if (typeof this.props.onOk === 'function')
			this.props.onOk(e.currentTarget);
	}

	render () {
		let props = this.props;
		let open = props.open && !this.state.closed;
		this.state.closed = false;
		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : "Cancel";
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";

		return (
			<Dialog
				fullWidth={true}
				maxWidth={'xl'}
				open={open}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title">
				  {title}</DialogTitle>
				<DialogContent>
				  <Editor />
				</DialogContent>
				<DialogActions>
				  <Button onClick={this.onOk} color="primary">
						{txtOk}
				  </Button>
				  <Box display={displayCancel}>
					<Button onClick={this.onCancel} color="primary" autoFocus>
						{txtCancel}
					</Button>
				  </Box>
				</DialogActions>
			</Dialog>
		);
	}
}
