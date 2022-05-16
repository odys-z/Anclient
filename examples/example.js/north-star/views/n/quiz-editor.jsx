import React from 'react';
	import { withStyles } from '@material-ui/core/styles';
	import withWidth from "@material-ui/core/withWidth";
	import PropTypes from "prop-types";

	import ListSubheader from '@material-ui/core/ListSubheader';
	import List from '@material-ui/core/List';
	import ListItem from '@material-ui/core/ListItem';
	import ListItemIcon from '@material-ui/core/ListItemIcon';
	import ListItemText from '@material-ui/core/ListItemText';
	import Collapse from '@material-ui/core/Collapse';
	import Button from '@material-ui/core/Button';
	import Box from '@material-ui/core/Box';

import { CRUD } from '@anclient/semantier';
import { L, AnContext, DetailFormW, DatasetCombo } from '@anclient/anreact';
import { QuizResp, QuizProtocol } from '../../common/protocol.quiz.js';
import { JQuiz } from '../../common/an-quiz';
import { QuizUserForm } from './quiz-users';

var quid = -1;

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  quizText: {
	  margin: theme.spacing(1)
  },
  qtype: {
  	width: 420,
	minWidth: 360,
  }
});

class QuizEditorComp extends DetailFormW {
	static getQx() {
		return ++quid;
	}

	state = {
		dirty: false,
		creating: false,

		openHead: true,
		quizId: undefined,
		quiz: { title: 'New Quiz',
				quizinfo: '',
				tags: '',
				subject: '' },
		questions: [], // qid(seq), question text, answers, type, correct index
		currentqx: -1,
	};

	quizHook = { collect: undefined };

	constructor(props) {
		super(props);

		this.state.crud = props.c ? CRUD.c
						: props.u ? CRUD.u
						: CRUD.r;

		// We use this class wrapped with function. Can be changed if there is a better way like forwardRef.
		props.stateHook.collect = function (me) {
			let that = me;
			return function(hookObj) {
				/*
				hookObj.questions = that.state.questions; // also supposed to change to using hook once each question been broken down
				hookObj.quizUsers = that.state.quizUsers;
				that.quizHook.collect && that.quizHook.collect(hookObj);
				// FIXME Desgin Note: This is a special problem of our state hook.
				// If RecordFormComp collected state to upper level, e.g. quiz been hooked to upper,
				// what we should use to update broken down component, i.e. the RecordForm?
				that.state.quiz = hookObj.quiz;
				*/
				that.quizHook.collect && that.quizHook.collect(that.state);
				hookObj.questions = that.state.questions; // also supposed to change to using hook once each question been broken down
				hookObj.quizUsers = that.state.quizUsers;
				hookObj.quiz = that.state.quiz;
			}; }(this);

		this.state.quizId = props.quizId;

		this.handleClickQs = this.handleClickQs.bind(this);
		this.toSetPollUsers = this.toSetPollUsers.bind(this);
		this.editQuestion = this.editQuestion.bind(this);
		this.editAnswer = this.editAnswer.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onCheckSingle = this.onCheckSingle.bind(this);

		this.bindQuiz = this.bindQuiz.bind(this);

		this.setStateHooked = this.setStateHooked.bind(this);
	}

	componentDidMount() {
		let ctx = this.context;
		this.jquiz = new JQuiz(ctx.anClient, ctx.error);
		if (this.state.crud !== CRUD.c)
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

	toSetPollUsers(e) {
		if (e && e.stopPropagation) e.stopPropagation();

		let that = this;

		// collect children's state - will be used in callback to update this component.
		that.quizHook.collect && that.quizHook.collect(that.state);

		this.quizUserForm = (
			<QuizUserForm uri={this.props.uri} crud={this.state.crud}
				jquiz={this.jquiz}
				onSave={ ids => {
					that.quizUserForm = undefined;
					that.setState({quizUsers: ids});
				} }
				onClose={e => {
					that.quizUserForm = undefined;
					that.setState({});
				}}
			/>
			);
		this.setState({});
	}

	/**on click question
	 * param {Event} e
	 */
	handleClickQs(e) {
	  // use currentTarget instead of target, see https://stackoverflow.com/a/10086501/7362888
	  let qx = e.currentTarget.getAttribute('qx');
	  this.setStateHooked({currentqx: parseInt(qx)});
	};

	editQuestion(e) {
		let qx = this.state.currentqx;

		this.state.questions[qx].question = e.target.value;
		this.setStateHooked({dirty: true});
		if (this.props.onDirty)
			this.props.onDirty(true);
	}

	setStateHooked(obj) {
		this.quizHook.collect && this.quizHook.collect(this.state);
		Object.assign(this.state, obj);
		this.setState({});
	}

	editAnswer(e) {
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		let {qtype, correct} = JQuiz.figureAnswers(e.target.value);
		questions[qx].qtype = qtype;
		questions[qx].answer = correct;
		questions[qx].answers = e.currentTarget.value;
		this.setStateHooked({questions, dirty: true});
		if (this.props.onDirty)
			this.props.onDirty(true);
	}

	onAdd(e) {
		let qx = QuizEditor.getQx();
		let questions = this.state.questions.splice(0);
		questions.push({
			qid: qx, // drop by server semantics
			question: 'Question ' + qx,
			answers: '*A. \nB. \nC. \nD. ',
			qtype: QuizProtocol.Qtype.single,
			answer: "0"
		});

		this.setState({
			dirty: true,
			questions,
			currentqx: qx,
			open: qx });

		if (this.props.onDirty)
			this.props.onDirty(true);
	}

	onCheckSingle(e) {
		let qx = this.state.currentqx;
		let qtype = this.state.questions[qx].qtype === QuizProtocol.Qtype.single ? QuizProtocol.Qtype.multiple : QuizProtocol.Qtype.single;
		this.state.questions[qx].qtype = qtype;
		this.setState({autosave: !this.state.autosave});
	}

	items(classes) {
		if (!this.state.questions)
			return;

		let that = this;
		return this.state.questions.map( (q, x) => (
		  <div key={x}>
			<ListItem button key={x} qx={x} onClick={this.handleClickQs} color='secondary'>
				<ListItemIcon><Sms /></ListItemIcon>
				<ListItemText primary={q.question} />
			</ListItem>
			<Collapse in={this.state.currentqx == x} timeout="auto" >
				<List component="div">
				  <ListItem button className={ classes.nested }>
					<ListItemIcon><StarBorder /></ListItemIcon>
					<ListItemText primary={L('Question Type')} />
					<Box className={classes.qtype} >
					<DatasetCombo uri={this.props.uri}
						val={this.state.questions[x].qtype || 's'}
						options={QuizProtocol.Qtype.options()}
						label={L('Question Type')}
						onSelect={ (v) => {
							that.state.questions[x].qtype = v.v;
							if ( ( v.v === QuizProtocol.Qtype.single || v.v === QuizProtocol.Qtype.multiple )
								&& !that.state.questions[x].answers )
								that.state.questions[x].answers = "*A. \nB. \nC. \nD.";
							that.setStateHooked({dirty: true});
						}}
					/>
					</Box>
				  </ListItem>
				</List>

				<TextField id="qtext" label="Question"
				  variant="outlined" color="primary"
				  multiline fullWidth={true} value={q.question || q.title}
				  onChange={this.editQuestion} />

				<TextField id="answers" label="Answers (* correct)"
				  variant="outlined" color="secondary"
				  multiline fullWidth={true} value={q.answers}
				  onChange={this.editAnswer} />
			</Collapse>
		  </div>
		));
	}

	render() {
		let ctx = this.context;
		let title = this.state.quiz.title;
		let { classes } = this.props;

		let that = this;

		return ( <>
			<List component="nav"
				aria-labelledby="nested-list-subheader"
				subheader={
					<ListSubheader component="div" id="nested-list-subheader">
					  {L('Quiz: ') + title}
					</ListSubheader>
				}
				className={ classes.root } >
				<ListItem key='qzA' button onClick={e => this.setState({openHead: !this.state.openHead})}>
					<ListItemIcon><SendIcon /></ListItemIcon>
					<ListItemText primary={L('Editing Quiz')} />
					<ListItemText >
						{aboutPollUsers(this.state.quizUsers)}
					</ListItemText>
					<Button variant="contained"
						className={classes.button} onClick={this.toSetPollUsers}
						endIcon={<Edit />}
					>{L('Change Target Users')}</Button>
				</ListItem>
				<Collapse in={this.state.openHead} timeout="auto" >
					{/*FIXME let's deprecate RecordForm */}
					<RecordForm uri={this.props.uri} pk='qid' mtabl='quiz'
						stateHook={this.quizHook}
						fields={[ { field: 'qid', label: '', hide: true },
								  { field: 'title', label: L('Title'), grid: {sm: 12, lg: 12} },
								  { field: 'subject', label: L('Subject') },
							      { field: 'tags', label: L('#Hashtag') },
							      { field: 'quizinfo', label: L('Description'), grid: {sm: 12, lg: 12} }
							]}
						record={{qid: this.state.quizId, ... this.state.quiz }} />
				</Collapse>
				{this.items(classes)}
			</List>
			{this.quizUserForm}
		  </>
	    );

		function aboutPollUsers(usrs = []) {
			let usr = usrs && (usrs.length > 0 || usrs.size > 0);
			return (<Typography color={ usr ? 'primary' : 'secondary'} >
						{L('Total polling users: {n}', {n: usrs.size || usrs.length || 0})}
					</Typography>);
		}
	}
}
QuizEditorComp.contextType = AnContext;

QuizEditorComp.propTypes = {
	uri: PropTypes.string.isRequired,
	stateHook: PropTypes.object
}

const QuizEditor = withWidth()(withStyles(styles)(QuizEditorComp));
export { QuizEditor, QuizEditorComp }
