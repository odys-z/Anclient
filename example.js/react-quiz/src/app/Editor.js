import React from 'react';
import ReactDOM from 'react-dom';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';


class Editor extends React.Component {

	classes = makeStyles({
		root: {
			width: '100%',
			maxWidth: 360,
		},
		nested: {
		},
	});

    state = {
        questions: [['id0', 'q0', 'a b c d'], ['id1', 'q1', '1 2 3 4'], ['id2', 'q2', 'I II III IV']],
        currentqx: -1,
    };

	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.editQuestion = this.editQuestion.bind(this);
		this.editAnswer = this.editAnswer.bind(this);
		this.onAdd = this.onAdd.bind(this);
	}

	handleClick(e) {
	  // use currentTarget instead of target, see https://stackoverflow.com/a/10086501/7362888
	  let qx = e.currentTarget.getAttribute('qx');
	  console.log(qx);
	  this.setState({currentqx: parseInt(qx)});
	};

	editQuestion(e) {
		console.log(e.target.value);
		let qx = this.state.questions.currentqx;
		let questions = this.state.questions.slice();
		let answers = questions[qx] && questions[qx].length > 1 ? questions[qx][1] : "";
		questions[qx] = [e.target.value, answers];
		this.setState({questions});
	}

	editAnswer(e) {
		console.log(e.target.value);
		let qx = this.state.questions.currentqx;
		let questions = this.state.questions.slice();
		let qtext = questions[qx] && questions[qx].length > 0 ? questions[qx][0] : "";
		questions[qx] = [qtext, e.target.value];
		this.setState({questions});
	}

	onAdd(e) {
		this.state.questions.push('');
		this.setState({currentqx: ++this.state.currentqx});
	}

	items(start, end = -1) {
		if (!this.state.questions)
			return;
		if (end < 0)
			end = this.state.questions.length - (end + 1);

		return this.state.questions.map((q, x) => (
			  <div key={this.state.questions[x][0]}>
				<ListItem button qx={x} onClick={this.handleClick}>
					<ListItemIcon><DraftsIcon /></ListItemIcon>
					<ListItemText primary={this.state.questions[x][1]} />
				</ListItem>
				<Collapse in={this.state.currentqx == x} timeout="auto" >
					<List component="div" disablePadding>
					  <ListItem button className={ this.classes.nested }>
					    <ListItemIcon><StarBorder /></ListItemIcon>
					    <ListItemText primary="Option A" />
					    <ListItemText primary="Option B" />
					    <ListItemText primary="Option C" />
					    <FormControlLabel
					        control={<Checkbox checked={this.state.check0}
					                           name="chk0" color="primary" />}
					        label="Primary"/>
					  </ListItem>
					</List>

					<TextField id="qtext" label="Question"
					  variant="outlined" color="primary"
					  multiline fullWidth={true}
					  onChange={this.editQuestion} />

					<TextField id="answers" label="Answers"
					  variant="outlined" color="secondary"
					  multiline fullWidth={true}
					  onChange={this.editAnswer} />
				</Collapse>
			  </div>
			));
	}

	editem(qx) {
		return
		(<>
			<ListItem button onClick={this.handleClick}>
				<ListItemIcon><InboxIcon /></ListItemIcon>
				<ListItemText primary="Inbox" />
					{open ? <ExpandLess /> : <ExpandMore />}
			</ListItem>
			<Collapse in={this.state.open} timeout="auto" >
				<List component="div" disablePadding>
				  <ListItem button className={ this.classes.nested }>
				    <ListItemIcon><StarBorder /></ListItemIcon>
				    <ListItemText primary="Option A" />
				    <ListItemText primary="Option B" />
				    <ListItemText primary="Option C" />
				    <FormControlLabel
				        control={<Checkbox checked={this.state.check0}
				                           name="chk0" color="primary" />}
				        label="Primary"/>
				  </ListItem>
				</List>

				<TextField id="qtext" label="Question"
				  variant="outlined" color="primary"
				  multiline fullWidth={true}
				  onChange={this.editQuestion} />

				<TextField id="answers" label="Answers"
				  variant="outlined" color="secondary"
				  multiline fullWidth={true}
				  onChange={this.editAnswer} />
			</Collapse>
		</>);
	}

	render() {
		return (
		  <List
			component="nav"
			aria-labelledby="nested-list-subheader"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
				  Nested List Items
				</ListSubheader>
			}
			className={ this.classes.root } >
			<ListItem button>
				<ListItemIcon><SendIcon /></ListItemIcon>
				<ListItemText primary="Add New" onClick={this.onAdd} />
			</ListItem>
			<ListItem button>
				<ListItemIcon><DraftsIcon /></ListItemIcon>
				<ListItemText primary="Drafts" />
			</ListItem>
			{this.items(0, this.state.currentqx)}
		  </List>);
	}
			// {this.editem(this.state.currentqx)}
			// {this.state.currentqx >= 0 ? this.items(this.state.currentqx + 1) : ''}
}

ReactDOM.render(<Editor />, document.querySelector('#editor'));
