
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Grid, Button, Card, TextField, Typography } from '@material-ui/core';

import {
	L, Langstrs, AnConst,
    AnClient, SessionClient, Protocol,
    AnContext, AnError, CrudCompW, AnReactExt, AnQueryForm, AnTablist, jsample
} from 'anclient';

const { JsampleIcons } = jsample;

const styles = (theme) => ( {
	root: {
	}
} );

class PollsComp extends CrudCompW {
	state = {
		students: [],
		condQzName: { type: 'text', val: '', label: L('Role Name')},
		condTag:  { type: 'text', val: '', label: L('Role Name')},
		condOrg:  { type: 'cbb',
					sk: 'my.students', nv: {n: 'text', v: 'value'},
					sqlArg: [this.context.ssInf.userId],
					val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem ],
					label: L('Organization') },

		// active buttons
		buttons: { add: true, edit: false, del: false},

		total: 0,
		pageInf: { page: 0, size: 25, total: 0 },
		selectedRecIds: [],
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
		this.toSearch();
	}

	toSearch(e, query) {
		let pageInf = this.state.pageInf;
		let queryReq = this.context.anClient.query(this.uri, 'polls', 'q', pageInf)
		let req = queryReq.Body()
			.expr('pid').expr('pollName').expr('progress').expr('status').expr('pubTime')
			.j('quizzes', 'qz', 'qz.qid=p.quizId');

		if (query && query.tag)
			req.whereCond('%s', 'q.tags', `'${query.tag}'`);
		if (query && query.qzName)
			req.whereCond('%', 'quizName', `'${query.qzName}'`);
		if (query && query.userId)
			req.whereEq('userId', query.userId);

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
		let txt = L('Totally {count} role records will be deleted. Are you sure?',
				{count: that.state.selectedRecIds.length});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
						delRole(that.state.selectedRecIds);
				 	}
				}
				onClose={ () => {that.confirm === undefined} }
			/>);

		function delRole(roleIds) {
			let req = that.context.anClient
				.usrAct('roles', Protocol.CRUD.d, 'delete')
				.deleteMulti(this.uri, 'a_roles', 'roleId', roleIds);

			that.context.anClient.commit(req, (resp) => {
				that.toSearch();
			}, that.context.error);
		}
	}

	toAdd(e, v) {
		this.roleForm = (<RoleDetails c uri={this.uri}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	toEdit(e, v) {
		this.roleForm = (<RoleDetails u uri={this.uri}
			roleId={this.state.selectedRecIds[0]}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	closeDetails() {
		this.roleForm = undefined;
		this.setState({});
	}

	render() {
		let args = {};
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			<AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ this.state.condQzName, this.state.condTag, this.state.condUser ]}
				query={ (q) => { return {
					qzName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					tag:   q.state.conds[1].val ? q.state.conds[1].val : undefined,
					orgId: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				} } }
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
				className={classes.root} checkbox= {true} pk= "vid"
				columns={[
					{ text: L('pid'), hide:true, field: "pid" },
					{ text: L('Poll Name'), field: "pollName", color: 'primary', className: 'bold'},
					{ text: L('Progress'), field: "progress", color: 'primary' },
					{ text: L('Status'), field: "status", color: 'primary' },
					{ text: L('Start'), field: "start", color: 'primary' }
				]}
				rows={this.state.rows} pk='pid'
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>
			{this.roleForm}
			{this.confirm}
		</>);
	}
}
PollsComp.contextType = AnContext;

const Polls = withWidth()(withStyles(styles)(PollsComp));
export { Polls, PollsComp }
