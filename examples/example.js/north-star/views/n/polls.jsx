
// import React from 'react';
// import { withStyles } from "@material-ui/core/styles";
// import withWidth from "@material-ui/core/withWidth";
// import { Grid, Button, Card, TextField, Typography } from '@material-ui/core';

// import { AnClient, SessionClient, Protocol } from '@anclient/semantier';
// import {
// 	L, Langstrs, AnConst,
//     AnContext, AnError, CrudCompW, AnReactExt,
// 	ConfirmDialog, AnQueryForm, AnTablist, jsample
// } from '@anclient/anreact';
// const { JsampleIcons } = jsample;

// import { QuizProtocol } from '../../common/protocol.quiz.js';
// import { JQuiz } from '../../common/an-quiz.js';

// const styles = (theme) => ( {
// 	root: {
// 	},
// 	crudButton: {
// 		margin: 4,
// 	},
// } );

// /**
//  * @deprecated
//  */
// class PollsComp extends CrudCompW {
// 	state = {
// 		students: [],
// 		condQzName: { type: 'text', val: '', label: L('Quiz Name') },
// 		condTag:  { type: 'text', val: '', label: L('Quiz Tag') },
// 		condUser: { type: 'cbb',
// 					sk: 'users.org-arg', nv: {n: 'text', v: 'value'},
// 					sqlArgs: [],
// 					val: AnConst.cbbAllItem,
// 					options: [ AnConst.cbbAllItem ],
// 					label: L('My Students') },

// 		pageInf: { page: 0, size: 25, total: 0 },
// 		buttons: { start: true, stop: false, edit: false},
// 		selected: {ids: new Set()},
// 	};

// 	jquiz = undefined;

// 	constructor(props) {
// 		super(props);

// 		this.closeDetails = this.closeDetails.bind(this);
// 		this.toSearch = this.toSearch.bind(this);
// 		this.onPageInf = this.onPageInf.bind(this);
// 		this.onTableSelect = this.onTableSelect.bind(this);

// 		this.toStop = this.toStop.bind(this);
// 	}

// 	componentDidMount() {
// 		console.log(this.uri);
// 		this.jquiz = new JQuiz(this.context.anClient, this.context.error);
// 	}

// 	toSearch(e, query) {
// 		let pageInf = this.state.pageInf;
// 		let queryReq = this.context.anClient.query(this.uri, 'polls', 'p', pageInf)
// 		let req = queryReq.Body()
// 			.expr('max(pid)', 'pid')
// 			.expr('qz.qid', 'qid').expr('title')
// 			.expr('count(userId)', 'users')
// 			.expr('state').expr('subject', 'subject')
// 			.j('quizzes', 'qz', 'qz.qid=p.quizId')
// 			.groupby('qz.qid').groupby('p.state')
// 			.orderby('qz.qid', 'desc');

// 		if (query && query.tag)
// 			req.whereCond('%s', 'q.tags', `'${query.tag}'`);
// 		if (query && query.qzName)
// 			req.whereCond('%', 'quizName', `'${query.qzName}'`);
// 		if (query && query.userId)
// 			req.whereEq('userId', query.userId);

// 		this.state.queryReq = queryReq;

// 		this.context.anReact.bindTablist(queryReq, this, this.context.error);

// 		this.state.selected.Ids.clear();
// 	}

// 	onPageInf(page, size) {
// 		this.state.pageInf.size = size;
// 		this.state.pageInf.page = page;
// 		let query = this.state.queryReq;
// 		if (query) {
// 			query.Body().Page(size, page);
// 			this.state.pageInf = {page, size, total: this.state.pageInf.total};
// 			this.context.anReact.bindTablist(query, this, this.context.error);
// 		}
// 	}

// 	onTableSelect(rowIds) {
// 		this.setState( {
// 			buttons: {
// 				start: this.state.buttons.start,
// 				stop: rowIds &&  rowIds.length >= 1,
// 				edit: rowIds && rowIds.length === 1,
// 			},
// 		} );
// 	}

// 	toStop(e, v) {
// 		let that = this;
// 		this.jquiz.pollsUsers(this.uri,
// 			{pollIds: this.state.selectedRecIds},
// 			( (users) => {
// 				console.log(users);
// 				let txt = L('Totally {count} polls, {users} users will be updated. Are you sure?',
// 							{ count: that.state.selectedRecIds.length,
// 							  users: users.Body().msg() });
// 				that.confirm =
// 					(<ConfirmDialog open={true}
// 						ok={L('OK')} cancel={true}
// 						title={L('Info')} msg={txt}
// 						onOk={ () => {
// 								that.jquiz.stopolls(this.uri, [...that.state.selectedRecIds],
// 									( rsp => { that.confirm = undefined; } )); // make sure it's an array
// 						 	}
// 						}
// 						onClose={ () => {that.confirm === undefined} }
// 					/>);
// 				that.setState( {} );
// 			}) );
// 	}

// 	closeDetails() {
// 		this.roleForm = undefined;
// 		this.setState({});
// 	}

// 	render() {
// 		let args = {};
// 		const { classes } = this.props;
// 		let btn = this.state.buttons;
// 		this.state.condUser.sqlArgs = [this.context.anClient.userInfo.uid];
// 		return ( <>
// 			<AnQueryForm uri={this.uri}
// 				onSearch={this.toSearch}
// 				conds={[ this.state.condQzName, this.state.condTag, this.state.condUser ]}
// 				query={ (q) => { return {
// 					qzName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
// 					tag:   q.state.conds[1].val ? q.state.conds[1].val : undefined,
// 					orgId: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
// 				} } }
// 				onDone={(query) => { this.toSearch(undefined, query); } }
// 			/>

// 			<Grid container alignContent="flex-end" >
// 				<Button variant="contained" disabled={!btn.stop}
// 					className={classes.crudButton} onClick={this.toStop}
// 					startIcon={<JsampleIcons.DetailPanel />}
// 				>{L('Stop Poll')}</Button>
// 				{/*
// 				<Button variant="contained" disabled={!btn.start}
// 					className={classes.crudButton} onClick={this.toStart}
// 					startIcon={<JsampleIcons.Add />}
// 				>{L('Start Poll')}</Button>
// 				<Button variant="contained" disabled={!btn.edit}
// 					className={classes.crudButton} onClick={this.toEdit}
// 					startIcon={<JsampleIcons.Delete />}
// 				>{L('Setup Users')}</Button>*/}
// 			</Grid>

// 			<AnTablist selected={this.state.selected}
// 				className={classes.root} checkbox={true} pk="pid"
// 				columns={[
// 					{ text: L('quiz event'),field: "pid",    hide:true },
// 					{ text: L('Quiz Name'), field: "title",  color: 'primary', className: 'bold'},
// 					{ text: L('Users' ),    field: "users",  color: 'primary' },
// 					{ text: L('Status'),    field: "state",  color: 'primary' },
// 					{ text: L('Subject'),   field: "subject",color: 'primary' }
// 				]}
// 				rows={this.state.rows}
// 				pageInf={this.state.pageInf}
// 				onPageInf={this.onPageInf}
// 				onSelectChange={this.onTableSelect}
// 			/>
// 			{this.roleForm}
// 			{this.confirm}
// 		</>);
// 	}
// }
// PollsComp.contextType = AnContext;

// const Polls = withWidth()(withStyles(styles)(PollsComp));
// export { Polls, PollsComp }
