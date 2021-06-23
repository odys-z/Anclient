import React from 'react';
	import ReactDOM from 'react-dom';
	import { makeStyles } from '@material-ui/core/styles';
	import ListSubheader from '@material-ui/core/ListSubheader';
	import List from '@material-ui/core/List';
	import ListItem from '@material-ui/core/ListItem';
	import ListItemIcon from '@material-ui/core/ListItemIcon';
	import ListItemText from '@material-ui/core/ListItemText';
	import Collapse from '@material-ui/core/Collapse';
	import Box from '@material-ui/core/Box';
	import Add from '@material-ui/icons/Add';
	import DraftsIcon from '@material-ui/icons/Drafts';
	import InboxIcon from '@material-ui/icons/MoveToInbox';
	import SendIcon from '@material-ui/icons/Send';
	import Sms from '@material-ui/icons/Sms';
	import TextareaAutosize from '@material-ui/core/TextareaAutosize';
	import FormControlLabel from '@material-ui/core/FormControlLabel';
	import Checkbox from '@material-ui/core/Checkbox';
	import TextField from '@material-ui/core/TextField';
	import ShareIcon from '@material-ui/icons/Share';

import {L} from '../../../lib/utils/langstr';
	import {AnContext, AnError} from '../../../lib/an-react';
	import {JQuiz} from '../../../lib/an-quiz';
	import {QuizResp} from '../../../lib/protocol.quiz.js';
	import {Jvector} from '../../../lib/jvector';
	import {Login} from './Login.cmp.js';
	import {QuizForm} from './Quiz.form.js';
	import {QrSharing} from '../../../lib/widgets/Messagebox'

class Quizlist extends React.Component {
	static getQx() { return ++quid; }

	classes = makeStyles({
		root: {
			width: '100%',
			maxWidth: 360,
		},
		nested: {
			minWidth: 24,
			'background-color': 'azure'
		},
	});

    state = {
		userid: '',
		pswd: '',
		username: '',
        quizzes: [],      // id, questions, answers, type, correct index
        currentqx: -1,    // currently expaneded
		openx: -1,        // currently editing
		creating: false,  // creating a new quiz

		pollPath: 'plain-quiz',
		pollPage: 'poll-anson.html',
		pollJson: 'serv.private.json',
		pollServ: 'localhost',

		// see https://reactjs.org/docs/context.html#caveats
		anClient: undefined,

		hasError: false,
		errors: { },
    };

	constructor(props = {}) {
		super(props);
		this.state.quizzes = props.quizzes || [];

		this.onSelect = this.onSelect.bind(this);
		this.onFind = this.onFind.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onLogout = this.onLogout.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.reload = this.reload.bind(this);

		this.onEdit = this.onEdit.bind(this);
		this.onQrCode = this.onQrCode.bind(this);
		this.onFormOk = this.onFormOk.bind(this);

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
	}

	onError(has) {
		that.setState( {hasError: has} );
	}

	onErrorClose() {
		this.setState( {hasError: false} );
	}

	onSelect(e) {
		e.stopPropagation();
		let qx = e.currentTarget.getAttribute('qx');
		qx = parseInt(qx);
		this.setState({
			currentqx: qx,
			openx: undefined,
		 	});
	};

	onFind(e) {
		let quizzes = [{id: "todo 2"}];
		this.setState({quizzes});
	}

	onAdd(e) {
		e.stopPropagation();
		this.setState({
			currentqx: -1,
			openx: -1,
			creating: true,
		 	});
	}

	onEdit(e) {
		e.stopPropagation();
		let qx = e.currentTarget.getAttribute('qx');
		qx = parseInt(qx);
		this.setState({
			currentqx: qx,
			openx: qx,
			creating: false,
		});
	}

	onQrCode(e) {
		this.setState({showqr: !this.state.showqr});
	}

	onFormOk(quizId) {
		this.state.openx = -1;
		this.reload();
	}

	onLogin(client) {
		this.jquiz = new JQuiz(client);

		this.setState({anClient: client});
		this.reload();
	}

	reload () {
		let that = this;
		this.jquiz.list({}, onQuery);

		/**bind simple bars
		 * @param {jprotocol.AnsonResp} resp
		 */
		function onQuery(resp) {
			if (resp) {
				let anquiz = new QuizResp(resp.body);
				that.setState({
					quizzes: anquiz.quizzes(),
				});
			}
		}
	}

	onLogout(e) { this.setState({userid: ''}); }

	items() {
		if (!this.state.quizzes)
			return;

		return this.state.quizzes.map( (q, x) => (
		  <div key={`${this.state.userid}.${this.state.quizzes[x].qid}`}>
			<ListItem button qx={x} onClick={this.onSelect} color='secondary'>
				<ListItemIcon><Sms /></ListItemIcon>
				<ListItemText primary={this.state.quizzes[x].title} />
				<ListItemText primary={this.state.quizzes[x].optime}/>
				<ListItemIcon onClick={this.onEdit} qx={x}>
					<DraftsIcon />
					<ListItemText primary={L("Edit")} />
				</ListItemIcon>
				<ListItemIcon onClick={this.onQrCode} qx={x}>
					<ShareIcon />
					<ListItemText primary={L("Share")} />
				</ListItemIcon>
			</ListItem>
			<Collapse in={this.state.showqr} name="qr" timeout="auto" >
				<QrSharing open={this.state.showqr} qr={
					{	origin: window.location.origin,
						path: this.state.pollPath,
						page: this.state.pollPage,
						json: this.state.pollJson,
						serv: this.state.servId,
						quiz: this.state.quizzes[x].qid
					}	} />
			</Collapse>
			<Collapse in={this.state.currentqx == x} timeout="auto" >
				<TextField id="qtitle" label="Remarks"
				  variant="outlined" color="primary"
				  multiline fullWidth={true} value={this.state.quizzes[x].remarks}
				 />
			</Collapse>
		  </div>)
		);
	}

	render() {
		let quizId = this.state.currentqx >= 0
			? this.state.quizzes[this.state.currentqx].qid : undefined;
		let creating = this.state.creating;
		this.state.creating = false;

		// TODO ody: usually App should be the error handler
		let errHandler = this.state.errors;
		errHandler.onError = function() {
			let that = this;
			return (has) => { that.setState({hasError: has}); };
		}.bind(this)();

		return (
		<AnContext.Provider value={{
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				// TODO ody: usually App should be the error handler
				errHandler,
				quizId }} >
		  <Login onLoginOk={this.onLogin}
		  		 onLogout={() => {this.setState({anClient: undefined})} } />
		  <Box display={this.state.anClient ? "block" : "none"} >
			<List component="nav"
				aria-labelledby="nested-list-subheader"
				subheader={
					<ListSubheader component="div" id="quizzes-subheader">
					  { `User: ${this.state.anClient ? this.state.anClient.ssInf.uid : ''}` }
					</ListSubheader>
				}
				className={ this.classes.root } >

				{this.items()}
			</List>
			<div>
				<ListItemIcon onClick={this.onAdd} ><Add />
				<ListItemText primary={L("Add")} /></ListItemIcon>
			</div>
		  </Box>
		  <QuizForm open={this.state.openx >= 0 || creating}
					creating={creating} quizId={quizId}
					onOk={this.onFormOk} />
		  {this.state.hasError && <AnError error={this.state.errors} onClose={this.onErrorClose} />}
		</AnContext.Provider>);
	}

	bindQuizzes(elem) {
	    ReactDOM.render(<Quizlist />, document.getElementById(elem));
	}
}

export {Quizlist};
