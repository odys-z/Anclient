
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    L, Langstrs,
    AnClient, SessionClient, Protocol,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class MyStudentsComp extends CrudCompW {
	state = {
		rows: [];
		query: undefined,
		buttons: {add: true, edit: false, del: false}
	};

	constructor(props) {
		super(props);
		this.mystudentsTier = new MyStudentsTier(this);

		this.toSearch = this.toSearch.bind(this);
		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
	}

	componentDidMount() {
		this.mystudentsTier.records(
			this.state.query,
			(rows) => {
				this.setState(rows);
			} );
	}

	toAdd(e) { }

	toEdit(e) {
		let that = this;
		let tier = this.mystudentsTier;
		this.recForm = <RecordForm
			record={tier.record()}
			onSave={tier.saveRecord}
			onClose={ e => that.recForm = undefined}
		/>
	}

	toDel(e) { }

	render() {
		let args = {};
		let tier = this.mystudentsTier;
		const { classes } = this.props;
		let btn = this.state.buttons;
		this.state.condUser.sqlArgs = [this.context.anClient.userInfo.uid];
		return (
		  <>
			<AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ tier.condText, tier.condCbb, tier.condSwitch ]}
				query={ (q) => { return {
					qKName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					qClass: q.state.conds[1].val ? q.state.conds[1].val : undefined,
					qTasks: q.state.conds[2].val ? q.state.conds[2].val : false,
				} } }
				onDone={(query) => { this.toSearch(undefined, query); } }
			/>

			<Grid container >
				<Button item variant="contained" disabled={!btn.add}
					className={classes.crudButton} onClick={this.toAdd}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Add')}</Button>
				<Button item variant="contained" disabled={!btn.edit}
					className={classes.crudButton} onClick={this.toEdit}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Edit')}</Button>
				<Button item variant="contained" disabled={!btn.del}
					className={classes.crudButton} onClick={this.toDel}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Delete')}</Button>
			</Grid>

			<AnTablist pk={tier.pk}
				className={classes.root} checkbox={true}
				columns={tier.columns()}
				rows={tier.rows}
				pageInf={this.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>
			{this.recForm}
			{this.confirm}
		  </>);
	}
}
MyStudentsComp.contextType = AnContext;

const MyStudents = withWidth()(withStyles(styles)(MyStudentsComp));
export { MyStudents, MyStudentsComp  }

class MyStudentsTier {
	port = 'center';
	pk = 'kid';

	columns() {
		return [
			{ text: L('id'), field: "kid", hide: true },
			{ text: L('Name'), field: "title" },
			{ text: L('Class'), field: "users" },
			{ text: L('Emotion'), field: "emotion" },
			{ text: L('Polls'),  field: "polls" } ];
	}

	records(conds, onLoad) {
		let bd = client.userReq();

		let req = this.client.userReq(uri, 'center',
			new MyStudentsReq( uri, props ).A(MyStudentsReq.A.records) );
	}

	record() {
		let bd = client.userReq();

		let req = this.client.userReq(uri, 'center',
			new MyStudentsReq( uri, props ).A(MyStudentsReq.A.record) );
	}

	saveRecord(recHook) {
		let rec = {};
		recHook.collect(rec); // rec: {pk, userName, orgId, ...}

		let req = this.client.userReq(uri, 'center',
			new MyStudentsReq( uri, props )
			.A(rec[this.pk] ? MyStudentsReq.A.update : MyStudentsReq.A.insert) );
	}
}

class MyStudentsReq {

	const A = {
		records: 'kids',
		record: 'kid-rec',
		update: 'kid-u',
		insert: 'kid-c',
	}
}
