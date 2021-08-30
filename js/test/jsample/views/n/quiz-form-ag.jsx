import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";

import Typography from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Box';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Overlay } from '../../patch/react-portal-overlay';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { L, isEmpty, Protocol, AnContext, DatasetCombo, ConfirmDialog,
	jsample, Overlay, AgGridsheet } from 'anclient';
const { JsampleIcons } = jsample;

import { JQuiz } from '../../common/an-quiz';
import { QuizResp, QuizProtocol } from '../../common/protocol.quiz.js';

const styles = (theme) => ({
});
/**
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 */
class QuizFormComp extends React.Component {
	state = {
		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,

		dirty: false,

		// ag initializing
		questions: [ {indId: '', indName: '', sort: '', weight: '', qtype: '', descrpt: '', expectings: '', remarks: '' } ]
	};

	constructor (props) {
		super(props);
		this.gridHook = {state: undefined};

		this.state.crud = props.c ? Protocol.CRUD.c
						: props.u ? Protocol.CRUD.u
						: Protocol.CRUD.r;
		// this.state.creating = props.creating;
		this.state.quizId = props.quizId
		if (props.u && !props.quizId) throw new Error("Semantics Error!");

		this.bindQuiz = this.bindQuiz.bind(this);

		this.toSave = this.toSave.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onDirty = this.onDirty.bind(this);

		this.toSave = this.toSave.bind(this);
		this.alert = this.alert.bind(this);
	}

	gridHook = {};
	columns = [
		{ field: 'qtype', label: 'Type' },
		{ field: 'qid', label: 'Type', hide: true },
		{ field: 'quesiont', label: 'Question' },
		{ field: 'answers', label: 'Options' },
		{ field: 'weight', label: 'Weight' },
		{ field: 'expectings', label: 'Options' },
	];

	componentDidMount() {
		console.log(this.props.uri);
		let ctx = this.context;
		this.jquiz = new JQuiz(ctx.anClient, ctx.error);

		if (this.state.crud !== Protocol.CRUD.c)
			this.jquiz.quiz(this.props.uri, this.state.quizId, this.bindQuiz, ctx.error);
		else
			this.jquiz.startQuizA({uri: this.props.uri, templ: this.props.templ},
						this.bindQuiz, ctx.error);
	}

	bindQuiz(ansonResp) {
		let qresp = new QuizResp(ansonResp.body);
		let {quizId, quiz, questions} = qresp.quiz_questions();
		let quizUsers = qresp.quizUserIds();
		// console.log(quizUsers);
		this.setState( {
			questions: questions,
			quiz,
			quizUsers,
			currentqx: -1,
			dirty:   false
		} );

		if (this.props.onDirty)
			this.props.onDirty(true);
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
		this.gridook.collect && this.gridook.collect(state);
		let that = this;

		this.setState.quiz = state.quiz;
		this.setState.questions = state.questions;

		if ( that.state.crud === Protocol.CRUD.c ) {
			this.jquiz.insert(this.props.uri, state,
				(resp) => {
					let {quizId, title} = JQuiz.parseResp(resp);
					if (isEmpty(quizId))
						console.error ("Something Wrong!");
					state.quiz.qid = quizId;
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
		let {classes} = props;

		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : L('Close');
		let txtSave = L('Publish');

		return (
		  <Overlay open={true}
			  	style={{
					background: 'rgba(0, 0, 0, 0.3)',
					alignItems: 'center',
					justifyContent: 'center'}}>

			<div className="ag-theme-alpine" style={{height: "82%", width: "92%", margin: "auto", marginTop: 100}}>
				<AgGridsheet
						stateHook={this.gridHook}
						rows={this.state.questions}
						columns={this.columns}
						contextMenu={{'Format Answers': {
							qtype: {
								name: L('Question Type'),
								subMenu: QuizProtocol.Qtype.agridContextMenu()
							}
						} }} />

				<div style={{textAlign: 'center', background: '#f8f8f8'}}>
					{aboutPollUsers(this.state.quizUsers)}
					<Button variant="contained"
						className={classes.button} onClick={this.toSetPollUsers}
						endIcon={<JsampleIcons.Edit />}
					>{L('Change Target Users')}</Button>
					<Divider orientation="vertical" flexItem ml={30} />
				  <Button onClick={this.toSave} color="primary">
						{txtSave}
				  </Button>
				  <Button display={displayCancel} onClick={this.onCancel} color="primary" autoFocus>
						{txtCancel}
				  </Button>
				</div>
			</div>
			{this.confirm}
		  </Overlay> );

		function aboutPollUsers(usrs = []) {
			let usr = usrs && (usrs.length > 0 || usrs.size > 0);
			return (<Typography color={ usr ? 'primary' : 'secondary'} >
						{L('Total polling users: {n}', {n: usrs.size || usrs.length || 0})}
					</Typography>);
		}
	}
}
QuizFormComp.contextType = AnContext;

const QuizForm = withStyles(styles)(QuizFormComp);
export { QuizForm, QuizFormComp };
