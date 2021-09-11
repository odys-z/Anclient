
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
const { JsampleIcons, UsersTier, UserstReq } = jsample;

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
		this.tier = new MyKidsTier(this);

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
		this.tier.mykids( this.state.query,
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
		{ name: 'classId', type: 'cbb',  val: '', label: L('Class'),
		  sk: Protocol.sk.cbbTeaching, nv: {n: 'text', v: 'value'} },
		{ name: 'studentName', type: 'text', val: '', label: L('Student') },
		{ name: 'hasTasks', type: 'switch',  val: false, label: L('Undone Tasks:') },
	];

	constructor(props) {
		super(props);
		this.collect = this.collect.bind(this);
	}

	collect() {
		return {
			studentname: this.conds[0].val ? that.conds[0].val : undefined,
			classId    : this.conds[1].val ? that.conds[1].val.v: undefined,
			hasTasks   : this.conds[2].val ? that.conds[2].val : false };
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

class MyKidsTier extends UsersTier {

	port = 'mykidstier';
	mtabl = 'n_mykids';
	// pk = 'userId';
	// client = undefined;
	// uri = undefined;
	// rows = [];
	// pkval = undefined;
	// rec = {}; // for leveling up record form, also called record

	mykids(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new UserstReq( this.uri, conds )
					.A(UserstReq.A.mykids) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				onLoad(cols, rows);
			},
			this.errCtx);
	}
}
