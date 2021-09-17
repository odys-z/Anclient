import React from 'react';
	import ReactDOM from 'react-dom';
	import { makeStyles } from '@material-ui/core/styles';
	import ListSubheader from '@material-ui/core/ListSubheader';
	import List from '@material-ui/core/List';
	import ListItem from '@material-ui/core/ListItem';
	import ListItemIcon from '@material-ui/core/ListItemIcon';
	import ListItemText from '@material-ui/core/ListItemText';
	import Collapse from '@material-ui/core/Collapse';
	import Add from '@material-ui/icons/Add';
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

import {AnsonMsg} from 'anclient';
	import {L} from '../../../lib/utils/langstr';
	import {QuizResp} from '../../../lib/protocol.quiz.js';
	import {QuestionType, JQuiz} from '../../../lib/an-quiz';
	import {AnContext} from '../../../lib/an-react';
	import {ConfirmDialog} from '../../../lib/widgets/Messagebox'

var quid = -1;

export class Editor extends React.Component {
	static getQx() {
		return ++quid;
	}

	classes = makeStyles({
		root: {
			width: '100%',
			maxWidth: 360,
		},
		nested: {
			'background-color': 'red'
		},
	});

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

		this.state.quizId = props.quizId;
		this.handleClick = this.handleClick.bind(this);
		this.editQuestion = this.editQuestion.bind(this);
		this.editAnswer = this.editAnswer.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onCheckSingle = this.onCheckSingle.bind(this);

		// this.onChangeVal = this.onChangeVal.bind(this);
	}

	alert(msg) {
		this.setState({
			alert: msg,
			showAlert: true,
		});
	}

	handleClick(e) {
	  // use currentTarget instead of target, see https://stackoverflow.com/a/10086501/7362888
	  let qx = e.currentTarget.getAttribute('qx');
	  this.setState({currentqx: parseInt(qx)});
	};

	editQuestion(e) {
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		questions[qx].question = e.target.value;
		this.setState({questions, dirty: true});
	}

	editAnswer(e) {
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		let {qtype, correct} = JQuiz.figureAnswers(e.target.value);
		questions[qx].qtype = qtype;
		questions[qx].answer = correct;
		questions[qx].answers = e.currentTarget.value;
		this.setState({questions, dirty: true});
	}

	// onChangeVal(comp, value) {
	// 	this.setValue({value:value});
	// }

	onAdd(e) {
		let qx = Editor.getQx();
		let questions = this.state.questions.splice(0);
		questions.push({
			qid: qx, // drop by server semantics
			question: 'Question ' + qx,
			answers: 'A. \nB. \nC. \nD. ',
			qtype: QuestionType.single,
			answer: "0"
		});

		this.setState({
			dirty: true,
			questions,
			currentqx: qx,
			open: qx });
	}

	onCheckSingle(e) {
		let qx = this.state.currentqx;
		let qtype = this.state.questions[qx].qtype === QuestionType.single ? QuestionType.multiple : QuestionType.single;
		this.state.questions[qx].qtype = qtype;
		this.setState({autosave: !this.state.autosave});
	}

	onSave(e) {
		e.stopPropagation();
		let that = this;

		if (!this.jquiz) {
			let ctx = this.context;
			if (ctx && ctx.anClient)
				this.jquiz = new JQuiz(ctx.anClient, ctx.errHandler);
		}

		if (!this.state.quizId) {
			this.jquiz.insert(this.state, (resp) => {
				let {quizId, title} = JQuiz.parseResp(resp);
				that.state.quizId = quizId;
				that.alert("New quiz created!\nQuiz: " + title);
			});
		}
		else {
			this.jquiz.update(this.state, (resp) => {
				let {questions} = JQuiz.parseResp(resp);
				that.alert("Quiz saved! Questions: " + questions);
			});
		}
	}

	items() {
		if (!this.state.questions)
			return;

		return this.state.questions.map( (q, x) => (
		  <div key={this.state.questions[x].qid}>
			<ListItem button qx={x} onClick={this.handleClick} color='secondary'>
				<ListItemIcon><Sms /></ListItemIcon>
				<ListItemText primary={this.state.questions[x].question} />
			</ListItem>
			<Collapse in={this.state.currentqx == x} timeout="auto" >
				<List component="div">
				  <ListItem button className={ this.classes.nested }>
				    <ListItemIcon><StarBorder /></ListItemIcon>
				    <ListItemText primary="Option..." />
				    <FormControlLabel
				        control={<Checkbox checked={this.state.questions[x].qtype === QuestionType.single}
										   onClick={this.onCheckSingle}
				                           name="chk0" color="primary" />}
				        label="Single Answer"/>
				  </ListItem>
				</List>

				<TextField id="qtext" label="Question"
				  variant="outlined" color="primary"
				  multiline fullWidth={true} value={this.state.questions[x].questions}
				  onChange={this.editQuestion} />

				<TextField id="answers" label="Answers (* correct)"
				  variant="outlined" color="secondary"
				  multiline fullWidth={true} value={this.state.questions[x].answers}
				  onChange={this.editAnswer} />
			</Collapse>
		  </div>
		));
	}

	render() {
		let ctx = this.context;
		let title = this.state.qtitle;
		if (ctx.quizId && !this.state.dirty) {
			title = L('loading...');

			if (!this.jquiz
				&& ctx && ctx.anClient) // This happends when cancel and loggout. We need understand react more deeply.
				this.jquiz = new JQuiz(ctx.anClient, ctx.errHandler);
			if (!this.jquiz)
					return ( <>Quiz Quited!</> ); // something wrong!
			this.jquiz.quiz(this.state.quizId, loadQuiz, ctx);
		}
		// else title = title ? title : L('New Quiz');

		let that = this;

		return (
		  <>
			<List
			component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
				  {L('Quiz: ') + title}
				</ListSubheader>
			}
			className={ this.classes.root } >
			<ListItem button onClick={e => this.setState({openHead: !this.state.openHead})}>
				<ListItemIcon><SendIcon /></ListItemIcon>
				<ListItemText primary={L('Editing Quiz')} />
			</ListItem>
			<Collapse in={this.state.openHead} timeout="auto" >
				<TextField id="qtitle" label={L("Title")}
				  variant="outlined" color="primary"
				  multiline fullWidth={true}
				  onChange={e => this.setState({qtitle: e.currentTarget.value})}
				  value={title} />

				<TextField id="quizinfo" label={L("Quiz Description")}
				  variant="outlined" color="secondary"
				  multiline fullWidth={true}
				  onChange={e => this.setState({quizinfo: e.currentTarget.value})}
				  value={this.state.quizinfo} />
			</Collapse>

			{this.items()}

			<ListItem button>
				<ListItemIcon onClick={this.onAdd} ><Add /></ListItemIcon>
				<ListItemText primary="New Question" onClick={this.onAdd} />
				<ListItemText primary="Save" onClick={this.onSave} color="secondary" />
			</ListItem>
			</List>
			<ConfirmDialog ok={L('はい')} title={L('Info')} cancel={false}
					open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
					msg={this.state.alert} />
		  </>
	    );

		function loadQuiz(ansonResp) {
			let qresp = new QuizResp(ansonResp.body);
			let {title, quizId, quizinfo, questions} = qresp.questions();
			that.setState( {
				questions: questions, // ?  questions.join('\n') : '';
				qtitle: title,
				quizinfo: quizinfo,
				currentqx: -1,
				dirty: true, // stop reloading
			} );
		}
	}
}

Editor.contextType = AnContext;
