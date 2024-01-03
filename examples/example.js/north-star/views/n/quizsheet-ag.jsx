import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { CRUD, Semantier, isEmpty } from '@anclient/semantier';
import { L,
	AnContext, ConfirmDialog, TRecordForm,
	jsample, Overlay, AnGridsheet, anMultiRowRenderer
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { JQuiz, QuizRec } from '../../common/an-quiz';
import { QuizResp, QuizProtocol } from '../../common/protocol.quiz.js';

import { QuizUserForm } from './quiz-users';

const styles = (theme) => ({
	formWrapper: {
		backgroundColor: '#fafafaee',
		width: "92%",
		margin: "auto",
	},
	usersButton: {
		marginRight: 80,
	}
});

/**
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 */
class QuizsheetComp extends React.Component {
	state = {
		crud: typeof CRUD,
		creating: false, // creating a new record before saved (no id allocated)
		quizId: undefined,

		dirty: false,

		// ag initializing
		questions: [ {indId: '', indName: '', sort: '', weight: '', qtype: '', descrpt: '', expectings: '', remarks: '' } ]
	};

	constructor (props) {
		super(props);

		this.uri = props.uri;

		this.tier = new QuizTier(this);

		this.quizHook = {collect: undefined};

		this.state.crud = props.c ? CRUD.c
						: props.u ? CRUD.u
						: CRUD.r;

		this.state.quizId = props.quizId
		if (props.u && !props.quizId) throw new Error("Semantics Error!");

		this.bindQuiz = this.bindQuiz.bind(this);

		this.toSave = this.toSave.bind(this);
		this.onCancel = this.onCancel.bind(this);

		this.toSave = this.toSave.bind(this);
		this.toSetPollUsers = this.toSetPollUsers.bind(this);
		this.alert = this.alert.bind(this);
	}

	columns = [
		{ field: 'title', label: 'Title', wrapText: true, width: 180,
		  cellEditor: 'agLargeTextCellEditor',
		  cellEditorParams: {cols: 40, rows: 5},
		  cellRenderer: anMultiRowRenderer,
		},
		{ field: 'qtype', label: 'Type', width: 150,
		  // cellEditor: QuizProtocol.Qtype.agSelector,
		  cellEditor: 'agSelectCellEditor',
		  cellEditorParams: {cols: 40, rows: 5},
		  cellEditorParams: (p) => {
				return { values: QuizProtocol.Qtype.options().map( v => v.n ) };
			},
		  cellRenderer: QuizProtocol.Qtype.agRenderer,
		  anEditStop: e => {
			let qtype = QuizProtocol.Qtype.encode(e.value);
			e.data.qtype = qtype;
			if (qtype === 'n')
			 	if (isEmpty(e.data.answers))
					e.data.answers = '10';
				else if (!/^10\,?/.test(e.data.answers))
					e.data.answers = '10,\n' + e.data.answers;
		  }
		},
		{ field: 'qid', label: 'Type', hide: true },
		{ field: 'answers', label: 'Options', width: 200, autoHeight: true,
		  wrapText: true,
		  cellEditor: 'agLargeTextCellEditor',
		  cellEditorParams: {cols: 40, rows: 5},
		  cellRenderer: anMultiRowRenderer,
		},
		{ field: 'weight', label: 'Weight', width: 80, editable: false },
		{ field: 'expectings', label: 'Max Value', width: 120 },
		{ field: 'question', label: 'Question', width: 500, autoHeight: true,
		  wrapText: true,
		  cellEditor: 'agLargeTextCellEditor',
		  cellEditorParams: {cols: 40, rows: 5},
		  cellRenderer: anMultiRowRenderer },
	];

	componentDidMount() {
		this.tier.setContext(this.context);

		console.log(this.props.uri);
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

		let rec = this.tier.rec;
		rec.questions = questions;
		rec.quizUsers = quizUsers,
		this.tier.rec = Object.assign(rec, quiz);

		this.setState( {
			currentqx: -1,
			dirty:   false
		} );
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
				ok={L('OK')} cancel={false} open
				onClose={() => {
					that.confirm = undefined;
					that.setState({});
				} }
				msg={msg} />);
		this.setState({});
	}

	toSetPollUsers(e) {
		if (e && e.stopPropagation) e.stopPropagation();

		let that = this;

		this.quizUserForm = (
			<QuizUserForm uri={this.props.uri} crud={this.state.crud}
				jquiz={this.jquiz}
				onSave={ ids => {
					that.quizUserForm = undefined;
					that.tier.rec.quizUsers = ids;
					that.setState({});
				} }
				onClose={e => {
					that.quizUserForm = undefined;
					that.setState({});
				}}
			/> );
		this.setState({});
	}

	toSave(e) {
		e.stopPropagation();
		let that = this;

		this.quizHook.collect && this.quizHook.collect(this.state);

		if ( that.state.crud === CRUD.c ) {
			this.jquiz.insertQuiz(this.props.uri, this.tier.rec,
				(resp) => {
					let {quizId, title} = JQuiz.parseResp(resp);
					if (isEmpty(quizId))
						console.error ("Something Wrong - quizId is null!");
					that.tier.rec.qid = quizId; 
					that.state.crud = CRUD.u;
					that.alert(L("New quiz created!\n\nQuiz Title: {title}", {title}));
				});
		}
		else {
			this.jquiz.update(this.props.uri, this.tier.rec,
				(resp) => {
					let {questions} = JQuiz.parseResp(resp);
					that.alert(L("Quiz saved!\n\nQuestions number: {questions}", {questions}));
				});
		}
	}

	render () {
		let props = this.props;
		let {classes} = props;

		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : L('Close');
		let txtSave = L('Publish');


		let usrs = this.tier.rec.quizUsers;
		usrs = usrs && (usrs.length > 0 || usrs.size > 0);

		return (
		  <Overlay open={true} style={{
					background: 'rgba(0, 0, 0, 0.3)',
					alignItems: 'center', marginTop: 60,
					justifyContent: 'center'}}>

			<Box className={classes.formWrapper} >
				{/*FIXME let's deprecate RecordForm */}
				<TRecordForm uri={this.props.uri} pk='qid' mtabl='quiz'
					tier={this.tier}
					stateHook={this.quizHook}
					fields={this.tier.fields()}
					record={{qid: this.state.quizId, ... this.state.quiz }} dense />
			</Box>

			<div className="ag-theme-alpine" style={{height: "74%", width: "92%", margin: "auto"}}>
				{this.tier.rec.questions && <AnGridsheet
					rows={this.tier.rec.questions}
					columns={this.columns}
					contextMenu={{'Format Answers': {
						qtype: {
							name: L('Question Type'),
							subMenu: QuizProtocol.Qtype.agridContextMenu()
						}
					} }} /> }

				<div style={{textAlign: 'center', background: '#f8f8f8'}}>
					{aboutPollUsers(this.tier.rec.quizUsers)}
					<Button variant="outlined"
						className={classes.usersButton}
						color={ usrs ? 'primary' : 'secondary'}
						onClick={this.toSetPollUsers}
						endIcon={<JsampleIcons.Edit />}
					>{L('Change')}
					</Button>
					<Button onClick={this.toSave} color="primary">
						{txtSave}
					</Button>
					<Button display={displayCancel} onClick={this.onCancel} color="primary" autoFocus>
						{txtCancel}
					</Button>
				</div>
			</div>
			{this.confirm}
			{this.quizUserForm}
		  </Overlay> );

		function aboutPollUsers(usrs = [], btn) {
			let usr = usrs && (usrs.length > 0 || usrs.size > 0);
			return (
				<Typography color={ usr ? 'primary' : 'secondary'} >
					{L('Users: {n}', {n: usrs.size || usrs.length || 0})}
				</Typography>);
		}
	}
}
QuizsheetComp.contextType = AnContext;

const Quizsheet = withStyles(styles)(QuizsheetComp);
export { Quizsheet, QuizsheetComp };

class QuizTier extends Semantier {
	port = 'quiz';
	mtabl = 'quizzes';

	_cols = [ ];

	_fields = [
		{ field: 'qid', label: '', visible: false },
		{ field: 'title', label: L('Title'), grid: {sm: 6, md: 3} },
		{ field: 'tags', label: L('#Hashtag'), grid: {sm: 5, md: 3} },
		{ field: 'quizinfo', label: L('Description'), grid: {sm: 11, md: 6} }
	];

	/**type: QuizRec */
	rec = {qid: undefined};

	constructor(comp) {
		super(comp);
	}
}
