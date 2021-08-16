import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { L, AnContext, DetailFormW, DatasetCombo } from 'anclient';
import { QuizEditor } from './quiz-editor';

const styles = (theme) => ({
  root: {
  }
});

class QuizFormComp extends DetailFormW {
	state = {
		closed: false,
		an: undefined,

		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,

		dirty: false,
	};

	componentDidMount() {
		// this.state.an = this.context.client ? this.context.client.an : undefined;
	}

	constructor (props) {
		super(props);

		this.state.creating = props.creating;
		// this.state.quizId = props.quizId;

		this.onOk = this.onOk.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onDirty = this.onDirty.bind(this);
	}

	onCancel(e) {
		e.stopPropagation();
		if (typeof this.props.onCancel === 'function')
			this.props.onCancel(e.currentTarget);
		// this.setState({closed: true});
	};

	onOk(e) {
		e.stopPropagation();
		this.setState({closed: true});
		if (typeof this.props.onOk === 'function')
			this.props.onOk({quizId: this.state.quizId});
	}

	onDirty(dirty) {
		this.setState({dirty});
	}

	render () {
		let props = this.props;

		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : L('Close');
		let txtOk = props.ok || props.OK ? props.ok || props.OK : L('OK');

		return (
			<Dialog
				fullWidth={true}
				maxWidth={'md'}
				open={true}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title"></DialogTitle>
				<DialogContent>
				  <QuizEditor uri={this.props.uri} {...props}
						title={title}
						quizId={props.quizId}
						creating={this.state.creating}
						questions={this.state.questions}
						onDirty={this.onDirty} />
				</DialogContent>
				<DialogActions>
				  <Button onClick={this.onOk} disabled={this.state.dirty} color="primary">
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
const QuizForm = withWidth()(withStyles(styles)(QuizFormComp));
export { QuizForm, QuizFormComp };
