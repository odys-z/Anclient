
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import {
	L, toBool,
    AnClient, SessionClient, Protocol, UserReq, AnsonResp,
    AnContext, AnError, CrudCompW, AnTablistLevelUp, AnQueryForm,
	jsample
} from 'anclient';
const { JsampleIcons } = jsample;

const styles = (theme) => ( {
	root: {
	}
} );

class MyStudentsComp extends CrudCompW {
	state = {
		rows: [],
		query: undefined,

		selected: {Ids: new Set()},
		buttons: {add: true, edit: false, del: false},
	};

	tier = undefined;

	constructor(props) {
		super(props);
		this.tier = new MyStudentsTier(this);

		this.toSearch = this.toSearch.bind(this);
		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
	}

	componentDidMount() {
		console.log(this.uri);
		this.tier.setContext(this.context);
	}

	toSearch(e, query) {
		this.tier.records( this.state.query,
			(cols, rows) => {
				this.setState(rows);
			} );
	}

	onTableSelect(rowIds) {
		this.setState( {
			pkval: [...rowIds][0],
			buttons: {
				add: this.state.buttons.add,
				stop: rowIds && rowIds.size === 1,
				del: rowIds &&  rowIds.size >= 1,
			},
		} );
	}

	toAdd(e) { }

	toEdit(e) {
		let that = this;
		let tier = this.tier;
		this.recForm =
			// Design Note: or just have data handled by RecordForm directly?
			// But is this a good example to solve the css separating problem of query form?
			<RecordForm
				tier
				pk={tier.pk} pkval={that.state.pkval}
				record={tier.record()}
				onSave={tier.saveRec}
				onClose={ e => that.recForm = undefined}
			/>
	}

	toDel(e) { }

	render() {
		let args = {};
		let tier = this.tier;
		const { classes } = this.props;
		let btn = this.state.buttons;
		return (
		  <>
			{/* <AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ tier.condText, tier.condCbb, tier.condSwitch ]}
				query={ (q) => { return {
					studentName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					classId    : q.state.conds[1].val ? q.state.conds[1].val : undefined,
					hasTasks   : q.state.conds[2].val ? q.state.conds[2].val : false,
				} } }
				onDone={(query) => { this.toSearch(undefined, query); } }
			/> */}
			<MyStudentsQuery uri={this.uri} onQuery={this.toSearch} />

			<Box>
				<Button variant="contained" disabled={!btn.add}
					className={classes.crudButton} onClick={this.toAdd}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Add')}</Button>
				<Button variant="contained" disabled={!btn.edit}
					className={classes.crudButton} onClick={this.toEdit}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Edit')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.crudButton} onClick={this.toDel}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Delete')}</Button>
			</Box>

			<AnTablistLevelUp pk={tier.pk}
				className={classes.root} checkbox={true}
				columns={tier.columns()}
				rows={tier.rows}
				selectedIds={this.state.selected}
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

class MyStudentsQuery extends React.Component {
	conds = [
		{ name: 'teacher', type: 'text', val: '', label: L('Teacher') },
		{ name: 'classId', type: 'cbb',  val: '', label: L('Class'),
		  sk: Protocol.sk.cbbOrg, nv: {n: 'text', v: 'value'} },
		{ name: 'studentName', type: 'text', val: '', label: L('Student') },
		{ name: 'hasTasks', type: 'switch',  val: false, label: L('Undone Tasks:') },
	];

	constructor(props) {
		super(props);
		this.collect = this.collect.bind(this);
	}

	collect() {
		return {
			studentname: that.conds[0].val ? that.conds[0].val : undefined,
			classId    : that.conds[1].val ? that.conds[1].val.v : undefined,
			hasTasks   : that.conds[2].val ? that.conds[2].val : false };
	}

	/** Design Note:
	 * Problem: This way bound the query form, so no way to expose visual effects modification?
	 */
	render () {
		let that = this;
		return (
		<AnQueryForm {...this.props}
			conds={this.conds}
			query={ (q) => that.props.onQuery(that.collect()) }
			onSearch={this.props.onQuery}
			onDone={() => { that.props.onQuery(that.collect()); } }
		/> );
	}
}
MyStudentsQuery.propTypes = {
	uri: PropTypes.string.isRequired,
	onQuery: PropTypes.func.isRequired
}

// class MyStudentsTier {
// 	port = 'center';
// 	pk = 'kid';
// 	client = undefined;
// 	errCtx = undefined;
//
// 	constructor(comp) {
// 		this.comp = comp;
// 	}
//
// 	setContext(context) {
// 		this.client = context.anClient;
// 		this.errCtx = context.error;
// 	}
//
// 	columns() {
// 		return [
// 			{ text: L('id'), field: "kid", hide: true },
// 			{ text: L('Name'), field: "title" },
// 			{ text: L('Class'), field: "users" },
// 			{ text: L('Emotion'), field: "emotion" },
// 			{ text: L('Polls'),  field: "polls" } ];
// 	}
//
// 	records(conds, onLoad) {
// 		let client = this.client;
// 		let that = this;
//
// 		let req = client.userReq(uri, 'center',
// 					new MyStudentsReq( uri, conds )
// 					.A(MyStudentsReq.A.records) );
//
// 		let reqBd = req.Body();
// 		this.state.req = req;
//
// 		client.commit(req,
// 			(resp) => {
// 				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
// 				onLoad(cols, rows);
// 			},
// 			this.error);
// 	}
//
// 	record() {
// 		let bd = client.userReq();
//
// 		let req = this.client.userReq(uri, 'center',
// 			new MyStudentsReq( uri, props ).A(MyStudentsReq.A.record) );
// 	}
//
// 	saveRec(recHook) {
// 		let rec = {};
// 		recHook.collect(rec); // rec: {pk, userName, orgId, ...}
//
// 		let req = this.client.userReq(uri, 'center',
// 			new MyStudentsReq( uri, props )
// 			.A(rec[this.pk] ? MyStudentsReq.A.update : MyStudentsReq.A.insert) );
// 	}
// }
//
// class MyStudentsReq extends UserReq {
// 	static type = 'io.oz.ever.conn.n.MyStudentsReq';
// 	static __init__ = function () {
// 		Protocol.registerBody(MyStudentsReq.type, (jsonBd) => {
// 			return new MyStudentsReq(jsonBd);
// 		});
// 		return undefined;
// 	}();
//
// 	static A = {
// 		records: 'kids',
// 		record: 'kid-rec',
// 		update: 'kid-u',
// 		insert: 'kid-c',
// 	}
//
// 	constructor (uri, opts) {
// 		this.uri = uri;
// 		this.teacher = opts.teacher;
// 		this.classId = opts.classId;
// 		this.studentName = opts.studentName;
// 		this.hasTasks = opts.hasTasks;
// 	}
// }
