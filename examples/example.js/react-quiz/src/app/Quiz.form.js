import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {AnContext} from '../../../lib/an-react';
import {JQuiz} from '../../../lib/an-quiz';
import {Editor} from './Editor.js';

export class QuizForm extends React.Component {
	state = {
		closed: false,
		an: undefined,

		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,
		title: '',
	};

	componentDidMount() {
		this.state.an = this.context.client ? this.context.client.an : undefined;
	}

	constructor (props) {
		super(props);

		this.state.creating = props.create;
		this.state.quizId = props.quizId;

		this.onOk = this.onOk.bind(this);
		this.onSave = this.onSave.bind(this);
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

	onSave(e) {
		e.stopPropagation();
		if (this.state.creating) {
			this.state.creating = false;
			saveNew();
		}
		else updateQuiz();

		function saveNew() {

		}

		function updateQuiz() {

		}
	}

	render () {
		let props = this.props;
		let open = props.open && !this.state.closed;
		this.state.closed = false;
		if (!open) return (<></>);

		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : "Cancel";
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";

		if (!this.state.creating) {
			this.state.title = 'loading...';
			let jquiz = new JQuiz(client);
			jquiz.quiz(this.state.quizId, loadQuiz);
		}
		else this.state.title = 'new question';

		return (
			<Dialog
				fullWidth={true}
				maxWidth={'md'}
				open={open}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title">
				  {title}</DialogTitle>
				<DialogContent>
				  <Editor title={this.state.title} quizId={this.state.quizId}
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

		function loadQuiz(ansonResp) {
			setState( {questions: JQuiz.toQuestions(ansonResp)} );
		}
	}
}

QuizForm.contextType = AnContext;
