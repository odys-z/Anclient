import $ from 'jquery';
import React from 'react';
	import ReactDOM from 'react-dom';
	import { withStyles } from "@material-ui/core/styles";
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
	import {QrSharing} from '../../lib/widgets/Messagebox'


const styles = theme => ({
	root: {
		width: '100%',
	},
	nested: {
		minWidth: 24,
		backgroundColor: 'azure'
	},
});

class QuizlistComp extends React.Component {
	static getQx() { return ++quid; }

	state = {
		userid: '',
		pswd: '',
		username: '',
        quizzes: [],      // id, questions, answers, type, correct index
        currentqx: -1,    // currently expaneded
		openx: -1,        // currently editing
		creating: false,  // creating a new quiz

		// TODO have this configured by user
		pollPath: 'plain-quiz',
		pollPage: 'poll-anson.html',
		pollJson: 'private.json', // you should use github.json
		pollServ: 'host',

		servId: 'host',
		// see https://reactjs.org/docs/context.html#caveats
		anClient: undefined,

		hasError: false,
		errHandler: { },
    };

	constructor(props = {}) {
		super(props);
		this.state.quizzes = props.quizzes || [];

		// initialize target poll using what jserv this page use, let use change it later
		this.state.pollServ = props.servId || 'host';

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

		// TODO ody: usually App should be the error handler
		this.state.errHandler.onError = function() {
			let that = this;
			return (has) => {
				that.setState({hasError: has});
			};
		}.bind(this)();
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
		e.stopPropagation();
		let qx = e.currentTarget.getAttribute('qx');
		qx = parseInt(qx);
		if (this.state.showqr === qx)
			this.setState({showqr: -1});
		else
			this.setState({showqr: qx});
	}

	onFormOk(quizId) {
		this.state.openx = -1;
		this.reload();
	}

	onLogin(client) {
		this.jquiz = new JQuiz(client, this.state.errHandler);

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
			<Collapse in={this.state.showqr === x} name="qr" timeout="auto" >
				<QrSharing open={this.state.showqr} imgId={q.qid}
					qr={ {origin: window.location.origin,
							path: this.state.pollPath,
							page: this.state.pollPage,
							json: this.state.pollJson,
							serv: this.state.pollServ,
							quiz: this.state.quizzes[x].qid
					}} />
			</Collapse>
			<Collapse in={this.state.currentqx === x} timeout="auto" >
				<TextField  id={'qz-' + x} label="Remarks"
							variant="outlined" color="primary"
							multiline fullWidth={true} value={this.state.quizzes[x].quizinfo}
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

    	const { classes } = this.props;

		return (
		<AnContext.Provider value={{
				pageOrigin: window.origin,
				servId: this.props.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				// TODO ody: usually App should be the error handler
				errHandler: this.state.errHandler,
				quizId }} >
		  <Login onLoginOk={this.onLogin}
				 servJsons={['plain-quiz/private.json', 'plain-quiz/github.json']}
				 onLogout={() => {this.setState({anClient: undefined})} } />
		  <Box display={this.state.anClient ? "block" : "none"} >
			<List component="nav"
				aria-labelledby="nested-list-subheader"
				subheader={
					<ListSubheader component="div" id="quizzes-subheader">
					  { `User: ${this.state.anClient ? this.state.anClient.ssInf.uid : ''}` }
					</ListSubheader>
				}
				className={ classes.root } >

				{this.items()}
			</List>
			<ListItemIcon onClick={this.onAdd} >
				<Add /><ListItemText primary={L("Add")} />
			</ListItemIcon>
		  </Box>
		  <QuizForm open={this.state.openx >= 0 || creating}
					creating={creating} quizId={quizId}
					onOk={this.onFormOk} />
		  {this.state.hasError && <AnError onClose={this.onErrorClose} />}
		</AnContext.Provider>);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id
	 * @param {string} serv serv id
	 */
	static bindQuizzes(elem, serv) {
		if (!serv) serv = 'host';

		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: 'private.json',
			})
			.done(onJsonServ)
			.fail(
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done(onJsonServ)
				.fail( (e) => { $(e.responseText).appendTo($('#' + elem)) } )
			)
		}

		function onJsonServ(json) {
			let dom = document.getElementById(elem);
		   	ReactDOM.render(<Quizlist servs={json} servId={serv}/>, dom);
		}
	}
}

const Quizlist = withStyles(styles)(QuizlistComp);
export { Quizlist, QuizlistComp };
