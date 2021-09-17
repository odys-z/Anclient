import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {L} from '../../../lib/utils/langstr';
import {AnContext, quiz_a} from '../../../lib/an-react';
import {JQuiz} from '../../../lib/an-quiz';
import {Editor} from './Editor.js';

export class QuizForm extends React.Component {
	state = {
		closed: false,
		an: undefined,

		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,
	};

	componentDidMount() {
		this.state.an = this.context.client ? this.context.client.an : undefined;
	}

	constructor (props) {
		super(props);

		this.state.creating = props.creating;
		// this.state.quizId = props.quizId;

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
			this.props.onOk({quizId: this.state.quizId});
	}

	render () {
		let props = this.props;
		let open = props.open && !this.state.closed;
		this.state.closed = false;
		if (!open) return (<></>);

		let quizId = this.props.quizId
		if (!quizId)
			this.state.quizId = quizId;

		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : "Cancel";
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";

		return (
			<Dialog
				fullWidth={true}
				maxWidth={'md'}
				open={open}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title"></DialogTitle>
				<DialogContent>
				  <Editor title={title}
				  		quizId={quizId}
						creating={this.state.creating}
						questions={this.state.questions} />
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
