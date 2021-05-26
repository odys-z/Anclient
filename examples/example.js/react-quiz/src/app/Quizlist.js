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

class Quizlist extends React.Component {
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
		logid: '',
		pswd: '',
		username: '',
        quizzes: [], // id, questions, answers, type, correct index
        currentqx: -1,
    };

	constructor(props) {
		super(props);
		this.state.quizzes = props.quizzes || [];

		this.onSelect = this.onSelect.bind(this);
		this.onDetails = this.onDetails.bind(this);
		this.onFind = this.onFind.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onLogout = this.onLogout.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onSelect(e) {
	  let qx = e.currentTarget.getAttribute('qx');
	  this.setState({currentqx: parseInt(qx)});
	};

	onDetails(e) {
	}

	onFind(e) {
		let quizzes = [{id: "todo 2"}];
		this.setState({quizzes});
	}

	onAdd(e) {
		let qx = Editor.getQx();
		let quizzes = this.state.quizzes.splice(0);
		let quiz = {id: 'TODO'};
		questions.push(quiz);
		this.setState({
			quizzes,
			currentqx: qx,
			open: qx});
	}

	onLogin(e) {
	}

	onLogout(e) {
		// an.logout();
		this.setState({logid: ''});
	}

	items() {
		if (!this.state.questions)
			return;

		return this.state.quezzes.map((q, x) => (
		  <div key={`{this.state.logid}.{this.state.quezzes[x][0]}`}>
			<ListItem button qx={x} onClick={this.onSelect} color='secondary'>
				<ListItemIcon><Sms /></ListItemIcon>
				<ListItemText primary={this.state.quezzes[x].title} />
				<ListItemText primary={ this.state.quizzes[x].createdate}/>
			</ListItem>
			<Collapse in={this.state.currentqx == x} timeout="auto" >
				<TextField id="qtitle" label="Remarks"
				  variant="outlined" color="primary"
				  multiline fullWidth={true} value={this.state.quizzes[x].remarks}
				  onChange={this.onDetails} />
			</Collapse>
		  </div>)
		);
	}

	render() {
		return (
		  <List component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="quizzes-subheader">
				  { `User: {this.username}` }
				</ListSubheader>
			}
			className={ this.classes.root } >

			{this.items()}
		  </List>);
	}
}

export {Quizlist};
