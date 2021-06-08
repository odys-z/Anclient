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

var quid = -1;

const Question = {
	single: 0,
	multiple: 1
}

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
		creating: false,

		openHead: true,
		quizId: undefined,
		qtitle: '',
		quizinfo: '',
        questions: [], // id(seq), question text, answers, type, correct index
        currentqx: -1,
		autosave: true,
    };

	alert(msg) {
		this.setState({
			alert: msg,
			showAlert: true,
		});
	}

	constructor(props) {
		super(props);
		this.state.questions = props.questions;
		this.state.quizId = props.quizId;
		this.state.qtitle = props.title;
		this.state.quizinfo = props.quizinfo;
		this.state.creating = props.creating;

		this.handleClick = this.handleClick.bind(this);
		this.editQuestion = this.editQuestion.bind(this);
		this.editAnswer = this.editAnswer.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onCheckSingle = this.onCheckSingle.bind(this);
	}

	handleClick(e) {
	  // use currentTarget instead of target, see https://stackoverflow.com/a/10086501/7362888
	  let qx = e.currentTarget.getAttribute('qx');
	  console.log(qx);
	  this.setState({currentqx: parseInt(qx)});
	};

	editQuestion(e) {
		console.log(e.target.value);
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		questions[qx][1] = e.target.value;
		this.setState({questions});
	}

	editAnswer(e) {
		console.log(e.target.value);
		let qx = this.state.currentqx;
		let questions = this.state.questions.slice();
		questions[qx][2] = e.target.value;
		this.setState({questions});
	}

	onAdd(e) {
		let qx = Editor.getQx();
		let questions = this.state.questions.splice(0);
		// let tp = e.currentTarget.children.filter((e, x) => e.name === 'qtype');
		questions.push(['id'+ qx, 'Question ' + qx, 'A. \nB. \nC. \nD. ', Question.single]);
		this.setState({
			questions,
			currentqx: qx,
			open: qx });
	}

	onCheckSingle(e) {
		let questions = this.state.questions;
		questions[this.state.currentqx][3] = e.target.checked ? Question.single : Question.multiple;
		this.setState({questions});
	}

	onSave(e) {
		e.stopPropagation();
		let that = this;

		if (this.state.creating) {
			JQuiz.insert(this.state, (resp) => {
				that.state.creating = false;
				that.alert("New quiz created!");
			});
		}
		else {
			JQuiz.update(this.state, (resp) => {
				that.alert("Quiz saved!");
			});
		}
	}

	items() {
		if (!this.state.questions)
			return;
		// if (end < 0)
		// 	end = this.state.questions.length - (end + 1);

		return this.state.questions.map( (q, x) => (
		  <div key={this.state.questions[x][0]}>
			<ListItem button qx={x} onClick={this.handleClick} color='secondary'>
				<ListItemIcon><Sms /></ListItemIcon>
				<ListItemText primary={this.state.questions[x][1]} />
			</ListItem>
			<Collapse in={this.state.currentqx == x} timeout="auto" >
				<List component="div">
				  <ListItem button className={ this.classes.nested }>
				    <ListItemIcon><StarBorder /></ListItemIcon>
				    <ListItemText primary="Option..." />
				    <FormControlLabel
				        control={<Checkbox checked={this.state.questions[x][3] === Question.single}
										   onClick={this.onCheckSingle}
				                           name="chk0" color="primary" />}
				        label="Single Answer"/>
				  </ListItem>
				</List>

				<TextField id="qtext" label="Question"
				  variant="outlined" color="primary"
				  multiline fullWidth={true} value={this.state.questions[x][1]}
				  onChange={this.editQuestion} />

				<TextField id="answers" label="Answers (* correct)"
				  variant="outlined" color="secondary"
				  multiline fullWidth={true} value={this.state.questions[x][2]}
				  onChange={this.editAnswer} />
			</Collapse>
		  </div>
		));
	}

	render() {
		if (!this.state.creating) {
			this.state.title = 'loading...';
			let jquiz = new JQuiz(client);
			jquiz.quiz(this.state.quizId, loadQuiz);
		}
		else this.state.title = 'new question';

		return (
		  <>
			<List
			component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
				  Nested List Items
				</ListSubheader>
			}
			className={ this.classes.root } >
			<ListItem button onClick={e => this.setState({openHead: !this.state.openHead})}>
				<ListItemIcon><SendIcon /></ListItemIcon>
				<ListItemText primary="Quiz Head" />
			</ListItem>
			<Collapse in={this.state.openHead} timeout="auto" >
				<List component="div">
				  <ListItem button className={ this.classes.nested }>
				    <ListItemIcon><StarBorder /></ListItemIcon>
				    <ListItemText primary="TODO Options ..." />
				    <FormControlLabel
				        control={<Checkbox checked={this.state.check0}
				                           name="qtype" color="primary" />}
				        label="Check Each Answer"/>
				  </ListItem>
				</List>

				<TextField id="qtitle" label="Title"
				  variant="outlined" color="primary"
				  multiline fullWidth={true}
				  value={this.state.qtitle} />

				<TextField id="quizinfo" label="Remarks"
				  variant="outlined" color="secondary"
				  multiline fullWidth={true}
				  value={this.state.quizinfo} />
			</Collapse>

			{this.items()}

			<ListItem button>
				<ListItemIcon onClick={this.onAdd} ><Add /></ListItemIcon>
				<ListItemText primary="New Question" onClick={this.onAdd} />

			    // <FormControlLabel
			    //     control={<Checkbox checked={this.state.autosave}
				// 					   onClick={e => {this.setState({autosave:!this.state.autosave});} }
				// 					   name="autosave" color="secondary" />}
			    //     label="Auto Save"/>

				<ListItemText primary="Save" onClick={this.onSave} color="secondary" />
			</ListItem>
			</List>
			<ConfirmDialog ok='はい' title='Info' cancel={false}
					open={this.state.showAlert} onClose={() => {this.state.showAlert = false;} }
					msg={this.state.alert} />
		  </>
	    );

		function loadQuiz(ansonResp) {
			setState( {questions: JQuiz.toQuestions(ansonResp)} );
		}
	}
}

// ReactDOM.render(<Editor />, document.querySelector('#editor'));
