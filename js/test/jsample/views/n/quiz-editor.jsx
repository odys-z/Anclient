import React from 'react';
	import ReactDOM from 'react-dom';
	import { withStyles } from '@material-ui/core/styles';
	import withWidth from "@material-ui/core/withWidth";
	import PropTypes from "prop-types";

	import ListSubheader from '@material-ui/core/ListSubheader';
	import List from '@material-ui/core/List';
	import ListItem from '@material-ui/core/ListItem';
	import ListItemIcon from '@material-ui/core/ListItemIcon';
	import ListItemText from '@material-ui/core/ListItemText';
	import Collapse from '@material-ui/core/Collapse';
	import Grid from '@material-ui/core/Grid';
	import Add from '@material-ui/icons/Add';
	import Edit from '@material-ui/icons/Edit';
	import DraftsIcon from '@material-ui/icons/Drafts';
	import InboxIcon from '@material-ui/icons/MoveToInbox';
	import SendIcon from '@material-ui/icons/Send';
	import ExpandLess from '@material-ui/icons/ExpandLess';
	import ExpandMore from '@material-ui/icons/ExpandMore';
	import StarBorder from '@material-ui/icons/StarBorder';
	import Sms from '@material-ui/icons/Sms';
	import TextareaAutosize from '@material-ui/core/TextareaAutosize';
	import FormControlLabel from '@material-ui/core/FormControlLabel';
	import Checkbox from '@material-ui/core/Checkbox';
	import TextField from '@material-ui/core/TextField';
	import Button from '@material-ui/core/Button';
	import Box from '@material-ui/core/Box';

import { L, Protocol, AnsonMsg, AnsonResp,
	AnContext, DetailFormW, ConfirmDialog, DatasetCombo
} from 'anclient';
import { QuizResp, QuizProtocol } from '../../common/protocol.quiz.js';
import { JQuiz } from '../../common/an-quiz.js';
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
		qtitle: 'New Quiz',
		quizinfo: '',
		questions: [], // qid(seq), question text, answers, type, correct index
		currentqx: -1,
		autosave: true,

		showAlert: false,
		alert: '',
    };

	constructor(props) {
		super(props);

		this.state.crud = props.c ? Protocol.CRUD.c
						: props.u ? Protocol.CRUD.u
						: Protocol.CRUD.r;

		props.stateHook.state = this.state;
		this.setStateWithook = this.setStateWithook.bind(this);

		this.state.quizId = props.quizId;

		this.handleClickQs = this.handleClickQs.bind(this);
		this.toSetPollUsers = this.toSetPollUsers.bind(this);
		this.editQuestion = this.editQuestion.bind(this);
		this.editAnswer = this.editAnswer.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onCheckSingle = this.onCheckSingle.bind(this);

		this.bindQuiz = this.bindQuiz.bind(this);
	}

	componentDidMount() {
		let ctx = this.context;
		this.jquiz = new JQuiz(ctx.anClient, ctx.error);
		if (this.state.crud !== Protocol.CRUD.c)
			this.jquiz.quiz(this.props.uri, this.state.quizId, this.bindQuiz, ctx.error);
		else
			this.jquiz.startQuizA(this.props.uri, this.bindQuiz, ctx.error);
	}

	setStateWithook(obj) {
		this.setState(obj);
		this.props.stateHook.state = this.state;
	}

	bindQuiz(ansonResp) {
		let qresp = new QuizResp(ansonResp.body);
		let {title, quizId, quizinfo, questions} = qresp.questions();
		let quizUsers = qresp.quizUserIds();
		console.log(quizUsers);
		this.setStateWithook( {
			questions: questions,
			qtitle:    title || L('Emotion Poll (Type A)'),
			quizinfo,
			quizUsers,
			currentqx: -1,
			dirty:     this.state.crud === Protocol.CRUD.c
		} );

		if (this.props.onDirty)
			this.props.onDirty(true);
	}

	toSetPollUsers(e) {
		if (e && e.stopPropagation) e.stopPropagation();

		let that = this;
		this.quizUserForm = (
			<QuizUserForm uri={this.props.uri} crud={this.state.crud}
				jquiz={this.jquiz}
				onSave={ ids => {
					that.quizUserForm = undefined;
					that.setStateWithook({quizUsers: ids});
				} }
				onClose={e => {
					that.quizUserForm = undefined;
					that.setStateWithook({});
				}}
			/>
			);
		this.setStateWithook({});
	}

	// alert(msg) {
	// 	this.setState({
	// 		alert: msg,
	// 		showAlert: true,
	// 	});
	// }

	/**on click question
	 * param {Event} e
	 */
	handleClickQs(e) {
	  // use currentTarget instead of target, see https://stackoverflow.com/a/10086501/7362888
	  let qx = e.currentTarget.getAttribute('qx');
	  this.setStateWithook({currentqx: parseInt(qx)});
	};

	editQuestion(e) {
		let qx = this.state.currentqx;
		// let questions = this.state.questions.slice();
		// questions[qx].question = e.target.value;
		// this.setState({questions, dirty: true});

		// if (this.props.onDirty)
		// 	this.props.onDirty(true);

		this.state.questions[qx].question = e.target.value;
	}

	editAnswer(e) {
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		let {qtype, correct} = JQuiz.figureAnswers(e.target.value);
		questions[qx].qtype = qtype;
		questions[qx].answer = correct;
		questions[qx].answers = e.currentTarget.value;
		this.setStateWithook({questions, dirty: true});
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

		this.setStateWithook({
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
		this.setStateWithook({autosave: !this.state.autosave});
	}

	// onSave(e) {
	// 	e.stopPropagation();
	// 	// this.props.onSave( this.state )
	// 	let that = this;
	//
	// 	if (!this.state.quizId) {
	// 		this.jquiz.insert(this.props.uri, this.state, (resp) => {
	// 			let {quizId, title} = JQuiz.parseResp(resp);
	// 			that.state.quizId = quizId;
	// 			that.alert("New quiz created!\nQuiz Title: " + title);
	//
	// 			if (that.props.onDirty)
	// 				that.props.onDirty(true);
	// 		},
	// 		this.context.error);
	// 	}
	// 	else {
	// 		this.jquiz.update(this.props.uri, this.state, (resp) => {
	// 			let {questions} = JQuiz.parseResp(resp);
	// 			that.alert("Quiz saved! Questions: " + questions);
	//
	// 			if (that.props.onDirty)
	// 				that.props.onDirty(true);
	// 		},
	// 		this.context.error);
	// 	}
	// }

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
							that.setStateWithook({dirty: true});
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
		let title = this.state.qtitle;
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
				<ListItem key='qzA' button onClick={e => this.setStateWithook({openHead: !this.state.openHead})}>
					<ListItemIcon><SendIcon /></ListItemIcon>
					<ListItemText primary={L('Editing Quiz')} />
					<ListItemText primary={aboutPollUsers(this.state.quizUsers)} />
					<Button variant="contained"
						className={classes.button} onClick={this.toSetPollUsers}
						endIcon={<Edit />}
					>{L('Change Target Users')}</Button>
				</ListItem>
				<Collapse in={this.state.openHead} timeout="auto" >

				  <Grid container>
					{/*FIXME performance issue: https://stackoverflow.com/a/66934465
					  * Should break down into quiz simple for & question items.
					  */}
					<Grid item md={6} sm={12} className={classes.quizText} >
					<TextField id="qtitle" label={L("Title")}
					  variant="outlined" color="primary" fullWidth size="small"
					  multiline
					  onChange={e => this.setStateWithook({title: e.currentTarget.value})}
					  value={title} />
					</Grid>

					<Grid item md={3} sm={6} className={classes.quizText} >
					<TextField id="qsubj" label={L("Subject")}
					  variant="outlined" color="primary" fullWidth size="small"
					  onChange={e => this.setStateWithook({subject: e.currentTarget.value})}
					  value={this.state.subject} />
					</Grid>

					<Grid item md={3} sm={5} className={classes.quizText} >
					<TextField id="qtag" label={L("Tags")}
					  variant="outlined" color="primary" fullWidth size="small"
					  onChange={e => this.setStateWithook({tags: e.currentTarget.value})}
					  value={this.state.tags} />
					</Grid>

					<Grid item xs={12} xl={12} className={classes.quizText} >
					<TextField id="quizinfo" label={L("Quiz Description")}
					  variant="outlined" color="secondary"
					  multiline fullWidth={true} size="small"
					  onChange={e => this.setStateWithook({quizinfo: e.currentTarget.value})}
					  value={this.state.quizinfo} />
					</Grid>
				  </Grid>
				</Collapse>

				{this.items(classes)}

				<ListItem key="b" button>
					<ListItemIcon onClick={this.onAdd} ><Add /></ListItemIcon>
					<ListItemText primary="New Question" onClick={this.onAdd} />
					{/*<ListItemText primary="Save" onClick={this.onSave} color="secondary" />*/}
				</ListItem>
			</List>
			{/*<ConfirmDialog ok={L('Ok')} title={L('Info: Server Response')} cancel={false}
					open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
					msg={this.state.alert} /> */}
			{this.quizUserForm}
		  </>
	    );

		function aboutPollUsers(usrs = []) {
			return L('Total polling users: {n}', {n: usrs.size || usrs.length || 0});
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
