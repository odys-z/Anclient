import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { L, isEmpty, Protocol, AnContext, DetailFormW, DatasetCombo, ConfirmDialog } from 'anclient';
import { JQuiz } from '../../common/an-quiz.js';
import { QuizEditor } from './quiz-editor';

const styles = (theme) => ({
  root: {
  }
});

class QuizFormComp extends DetailFormW {
	state = {
		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,

		dirty: false,
	};

	componentDidMount() {
		console.log(this.props.uri);
	}

	constructor (props) {
		super(props);
		this.editorHook = {state: undefined};

		this.state.crud = props.c ? Protocol.CRUD.c
						: props.u ? Protocol.CRUD.u
						: Protocol.CRUD.r;
		// this.state.creating = props.creating;
		this.state.quizId = props.quizId
		if (props.u && !props.quizId) throw new Error("Semantics Error!");

		this.toSave = this.toSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onDirty = this.onDirty.bind(this);

		this.toSave = this.toSave.bind(this);
		this.alert = this.alert.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);
		let ctx = this.context;
		this.jquiz = new JQuiz(ctx.anClient, ctx.error);
	}

	onCancel(e) {
		e.stopPropagation();
		if (typeof this.props.onCancel === 'function')
			this.props.onCancel(e.currentTarget);
	};

	alert(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	toSave(e) {
		e.stopPropagation();
		let state = {};
		this.editorHook.collect && this.editorHook.collect(state);
		let that = this;

		this.setState.quiz = state.quiz;
		this.setState.questions = state.questions;

		if ( that.state.crud === Protocol.CRUD.c ) {
			this.jquiz.insert(this.props.uri, state,
				(resp) => {
					let {quizId, title} = JQuiz.parseResp(resp);
					if (isEmpty(quizId))
						console.error ("Something Wrong!");
					Object.assign(this.state, state);
					that.state.crud = Protocol.CRUD.u;
					that.alert(L("New quiz created!\n\nQuiz Title: {title}", {title}));
				});
		}
		else {
			this.jquiz.update(this.props.uri, state,
				(resp) => {
					let {questions} = JQuiz.parseResp(resp);
					Object.assign(this.state, state);
					that.alert(L("Quiz saved!\n\nQuestions number: {questions}", {questions}));
				});
		}

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
		let txtSave = L('Publish');

		return (<>
			<Dialog
				fullWidth={true}
				maxWidth={'md'}
				open={true}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title"></DialogTitle>
				<DialogContent>
				  <QuizEditor uri={this.props.uri} stateHook={this.editorHook} {...props}
						title={title}
						quizId={props.quizId}
						creating={this.state.crud === Protocol.CRUD.c}
						questions={this.state.questions}
						onDirty={this.onDirty} />
				</DialogContent>
				<DialogActions>
				  <Button onClick={this.toSave} color="primary">
						{txtSave}
				  </Button>
				  <Box display={displayCancel}>
					<Button onClick={this.onCancel} color="primary" autoFocus>
						{txtCancel}
					</Button>
				  </Box>
				</DialogActions>
			</Dialog>
			{this.confirm}
		  </>
		);
	}
}

const QuizForm = withWidth()(withStyles(styles)(QuizFormComp));
export { QuizForm, QuizFormComp };
