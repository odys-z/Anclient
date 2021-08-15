
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography, Grid, Button } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt, AnQueryForm, AnTablist, jsample
} from 'anclient';

const { JsampleIcons } = jsample;

import { QuizForm } from './quiz-form';

const styles = (theme) => ( {
	root: {
		margin: theme.spacing(1),
	}
} );

class QuizzesComp extends CrudCompW {
	state = {
		quizzes: [],
		pageInf: {page: 0, size: 25},
		queryReq : undefined,
		buttons: { add: true, edit: false, del: false},

		condTitl: { type: 'text', val: '', label: L('Title')},
		condTags: { type: 'text', val: '', label: L('Tags')},
		condDate: { type: 'date', val: '', label: L('Create Date')},

		selectedRecIds: []
	};

	constructor(props) {
		super(props);

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
	}

	componentDidMount() {
		console.log(this.uri);
	}

	/** Deprecation jquiz.list() ?
	 */
	toSearch(e, query) {
		let pageInf = this.state.pageInf;
		let queryReq = this.context.anClient.query(this.uri, 'quizzes', 'q', pageInf)
		let req = queryReq.Body()
			.expr('q.qid').expr('title').expr('tags').expr('dcreate').expr('sum(pId)', 'polls')
			.j('polls', 'p', 'p.quizId=q.qId')
			.groupby('q.qId');

		if (query && query.qTitl)
			req.whereCond('%', 'q.title', `'${query.qTitl}'`);
		if (query && query.qTags)
			req.whereCond('%', 'tags', `'${query.qTags}'`);
		if (query && query.qdate)
			req.whereCond('>=', 'q.dcreate', `'${query.qdate}'`);

		this.state.queryReq = queryReq;

		this.context.anReact.bindTablist(queryReq, this, this.context.error);

		this.state.selectedRecIds.splice(0);
	}

	onPageInf(page, size) {
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;
		let query = this.state.queryReq;
		if (query) {
			query.Body().Page(size, page);
			this.state.pageInf = {page, size, total: this.state.pageInf.total};
			this.context.anReact.bindTablist(query, this, this.context.error);
		}
	}

	onTableSelect(rowIds) {
		this.setState( {
			buttons: {
				add: this.state.buttons.add,
				edit: rowIds && rowIds.length === 1,
				del: rowIds &&  rowIds.length >= 1,
			},
			selectedRecIds: rowIds
		} );
	}

	toDel(e, v) {
		let that = this;
		let txt = L('Totally {count} records will be deleted. Are you sure?',
				{count: that.state.selectedRecIds.length});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
						del(that.state.selectedRecIds);
				 	}
				}
				onClose={ () => {that.confirm === undefined} }
			/>);

		function del(ids) {
			let req = that.context.anClient
				.usrAct('n/quizzes', Protocol.CRUD.d, 'delete')
				.deleteMulti(this.uri, 'quizzes', 'qId', ids);

			that.context.anClient.commit(req, (resp) => {
				that.toSearch();
			}, that.context.error);
		}
	}

	toAdd(e, v) {
		let that = this;

		this.quizForm = (
			<QuizForm crud={Protocol.CRUD.c} uri={this.uri}
				quizId={undefined}
				onOk={ () => {
					that.closeDetails();
					that.toSearch()
				}} />);
	}

	toEdit(e, v) {
		let that = this;
		this.quizForm = (<QuizForm uri={this.uri}
			quizId={this.state.selectedRecIds[0]}
			onOk={ () => {
				that.closeDetails();
				that.toSearch()
			}} />);
	}

	closeDetails() {
		this.quizForm = undefined;
		this.setState({});
	}

	render () {
		let args = {};
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			<AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ this.state.condTitl, this.state.condTags, this.state.condDate ]}
				query={ (q) => { return {
					qTitl: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					qTags: q.state.conds[1].val ? q.state.conds[1].val : undefined,
					qdate: q.state.conds[2].val ? q.state.conds[2].val : undefined,
				}} }
			/>

			<Grid container alignContent="flex-end" >
				<Button variant="contained" disabled={!btn.add}
					className={classes.button} onClick={this.toAdd}
					startIcon={<JsampleIcons.Add />}
				>{L('Add')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDel}
					startIcon={<JsampleIcons.Delete />}
				>{L('Delete')}</Button>
				<Button variant="contained" disabled={!btn.edit}
					className={classes.button} onClick={this.toEdit}
					startIcon={<JsampleIcons.Edit />}
				>{L('Edit')}</Button>
			</Grid>

			<AnTablist
				className={classes.root} checkbox= {true} pk= "qId"
				columns={[
					{ text: L('qId'), hide: 1, field:"qId" },
					{ text: L('Titel'),        field: "title", color: 'primary', className: 'bold'},
					{ text: L('Tags'),         field: "tags", color: 'primary' },
					{ text: L('Subject'),      field: "subject", color: 'primary' },
					{ text: L('Date Created'), field: "dcreate", color: 'primary', hide: 1 },
					{ text: L('Polls'),        field: "polls", color: 'primary', hide: 1 }
				]}
				rows={this.state.rows} pk='qId'
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
