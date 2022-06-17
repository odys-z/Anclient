import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Typography, Grid, Button } from '@material-ui/core';

import dateFormat from 'dateformat';
import { AnsonResp, PageInf, QueryConditions, UserReq } from '@anclient/semantier';
import {
    L,
    AnConst, AnContext, CrudCompW, AnQueryst,
	AnTablist, DatasetCombo, ConfirmDialog, jsample, Comprops
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { QuizProtocol } from '../../common/protocol.quiz.js';
import { Quizsheet } from '../n/quizsheet-ag';
import { QuizForm } from '../n/quiz-form';
import { QuizRec } from '../../common/an-quiz.js';

const styles = (theme) => ( {
	root: {
		margin: theme.spacing(1),
	},
	// tip: {
	// 	margin: theme.spacing(1)
	// },
	button: {
		height: '2.4em',
		verticalAlign: 'middle',
		margin: theme.spacing(1),
	}
} );

class QuizzesComp extends CrudCompW<Comprops> {
	state = {
		rows: [] as Array<QuizRec>, // quizzes set by Anreact
		pageInf: {page: 0, size: 25} as PageInf,
		queryReq : undefined,

		selected: {ids: new Set<string>()},
	};

	/** buttons enable / disable */
	buttons = { add: false, edit: false, del: false, stop: false};

	funcName = L('North - Quizzes');
	confirm: JSX.Element;
	quizForm: JSX.Element;
	/** Quiz template Id */
	templ: string;

	// conditions
	condTitl = { type: 'text', field: '', val: '', label: L('Title')};
	condTags = { type: 'text', field: '', val: '', label: L('Tags')};
	condDate = { type: 'date', field: '', val: '', label: L('Create Date')};


	constructor(props) {
		super(props);

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.refresh = this.refresh.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);

		this.toAddB = this.toAddB.bind(this);
		this.toAddA = this.toAddA.bind(this);

		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
		this.del = this.del.bind(this);
	}

	componentDidMount() {
		console.log(this.uri);
		this.toSearch(undefined);
	}

	toSearch(query?: QueryConditions) {

		let pageInf = this.state.pageInf;

		let queryReq = QuizzesComp.buildReq(this.context.anClient, this.uri, query, pageInf);
		this.state.queryReq = queryReq;

		this.context.anReact.bindTablist(queryReq, this, this.context.error);

		this.state.selected.ids.clear();
	}

	refresh() {
		if (this.state.queryReq)
			this.context.anReact.bindTablist(this.state.queryReq, this, this.context.error);

		this.state.selected.ids.clear();
	}

	/** Both this & QuizUserStartComp use this function - let's change to server side later.
	 */
	static buildReq(client, uri, query, pageInf) {
		let queryReq = client.query(uri, 'quizzes', 'q', pageInf)
		let req = queryReq.Body()
			.expr('q.qid').expr('q.title').expr('tags').expr('q.subject').expr('dcreate')
			.expr('count(ifnull(pId, 0))', 'polls')
			.expr('qsNum', 'questions')
			.l('polls', 'p', 'p.quizId=q.qid')
			.j('v_qscount', 'qc', 'qc.qid=q.qid')
			.groupby('q.qid')
			.orderby('dcreate', 'desc');

		if (query && query.qTitl)
			req.whereCond('%', 'q.title', `'${query.qTitl}'`);
		if (query && query.qTags)
			req.whereCond('%', 'tags', `'${query.qTags}'`);
		if (query && query.qdate)
			req.whereCond('>=', 'q.dcreate', `'${query.qdate}'`);

		return queryReq;
	}

	onPageInf(page: number, size: number) {
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;
		let query = this.state.queryReq;
		if (query) {
			query.Body().Page(size, page);
			this.state.pageInf = new PageInf(page, size, this.state.pageInf.total); // {page, size, total: this.state.pageInf.total};
			this.context.anReact.bindTablist(query, this, this.context.error);
		}
	}

	onTableSelect(rowIds: Array<string>) {
		this.setState( {
			buttons: {
				add : this.buttons.add,
				stop: rowIds && rowIds.length === 1,
				del : rowIds &&  rowIds.length >= 1,
			},
		} );
	}

	toDel(e: React.UIEvent) {
		let that = this;
		let txt = L('Totally {count} records will be deleted. Are you sure?',
				{count: that.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => { this.del(that.state.selected.ids); } }
				onClose={ () => {that.confirm === undefined} }
			/>);
	}

	del(qids: Set<string>) {
		let client = this.context.anClient;
		let req = client.userReq( this.uri, 'quiz',
					new UserReq( this.uri, "quiz" )
					.A(QuizProtocol.A.deleteq) );

		let reqBd = req.Body();
		reqBd.set(QuizProtocol.quizId, Array.from(qids));

		let that = this;
		client.commit(req,
			(resp : AnsonResp) => {
				that.state.selected.ids.clear();
				that.confirm =
					(<ConfirmDialog open={true}
						ok={L('OK')} cancel={false}
						title={L('Info')} msg={L('Quiz Deleted.')}
						onOk={ () => {
							that.confirm = undefined;
							that.state.selected.ids.clear();
							that.refresh();
						} }
					/>);
				this.refresh();
			},
			this.context.error);
	}

	// worksheet
	toAddB() {
		this.quizForm = (
			<Quizsheet c uri={this.uri} templ={this.templ}
				quizId={undefined}
				onCancel={ this.closeDetails }
				onOk={ this.closeDetails } />);
	}

	// item collapse - deprecated
	toAddA() {
		this.quizForm = (
			<QuizForm c uri={this.uri} templ={this.templ}
				quizId={undefined}
				onCancel={ this.closeDetails }
				onOk={ this.closeDetails } />);
	}

	toEdit(e: React.UIEvent) {
		let that = this;
		let qid = this.state.selected.ids;
		if (qid.size === 0)
			console.error("Something wrong!");
		else {
			this.quizForm = (<Quizsheet u uri={this.uri}
				quizId={[... Array.from(qid)][0]}
				onCancel={this.closeDetails}
				onOk={ () => {
					that.closeDetails();
				}} />);
		}
	}

	closeDetails() {
		this.quizForm = undefined;
		this.refresh();
	}

	render () {
		let that = this;
		const { classes } = this.props;
		let btn = this.buttons;
		return ( <>{this.funcName}
			<AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				// conds={[ this.state.condTitl, this.state.condTags, this.state.condDate ]}
				fields={[ this.condTitl, this.condTags, this.condDate ]}
				// query={ (q) => { return {
				// 	qTitl: q.state.conds[0].val ? q.state.conds[0].val : undefined,
				// 	qTags: q.state.conds[1].val ? q.state.conds[1].val : undefined,
				// 	qdate: q.state.conds[2].val ? q.state.conds[2].val : undefined,
				// }} }
			/>

			<Typography className={classes.tip} color='primary' >
				Tip: A quiz is initialized from indicators configuraton.
			</Typography>
			<Grid container alignContent="flex-end" >

				<DatasetCombo uri={this.uri}
					sk='north.ind_cate'
					label={L('Quiz Types')}
					options={[AnConst.cbbAllItem]} style={{width: 300}}
					onSelect={ (v) => {
						that.templ = v.v as string;
						let buttons = that.buttons;
						buttons.add = true;
						that.setState({buttons});
					} }
				/>

				<Button variant="contained" disabled={!btn.add}
					className={classes.button} onClick={this.toAddB}
					startIcon={<JsampleIcons.Worksheet />}
				>{L('Start')}</Button>
				<Button variant="contained" disabled={!btn.stop}
					className={classes.button} onClick={this.toEdit}
					startIcon={<JsampleIcons.Edit />}
				>{L('Edit')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDel}
					startIcon={<JsampleIcons.Delete />}
				>{L('Delete')}</Button>
			</Grid>

			<AnTablist selected={this.state.selected}
				className={classes.root} checkbox= {true} pk= "qid"
				columns={[
					{ text: L('qid'), hide: true, field: "qid" },
					{ text: L('Title'),       field: "title",    color: 'primary', className: 'bold' },
					{ text: L('Tags'),        field: "tags",     color: 'primary' },
					{ text: L('Date Created'),field: "dcreate",  color: 'primary',
					  formatter: d => d && dateFormat(d as any, 'yyyy-mm-dd') as any },
					{ text: L('Total Q'),     field: "questions",color: 'primary' },
					{ text: L('Polls'),       field: "polls",    color: 'primary' }
				]}
				rows={this.state.rows}
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>
			{this.quizForm}
			{this.confirm}
		</>);
	}
}
QuizzesComp.contextType = AnContext;

const Quizzes = withWidth()(withStyles(styles)(QuizzesComp));
export { Quizzes, QuizzesComp  }
