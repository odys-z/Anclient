
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { Protocol, CRUD } from '@anclient/semantier';
import { L,
	AnContext, AnTablist, AnQueryst, jsample
} from '@anclient/anreact';

const { JsampleIcons, UsersTier, UserstComp } = jsample;

import { KidDetailst } from './mykid-details';

const styles = (theme) => ( {
	root: {
	},
	crudButton: {
		margin: theme.spacing(1)
	}
} );

class MyStudentsComp extends UserstComp {
	state = {
		rows: [],
		query: undefined,

		selected: {ids: new Set()},
		buttons: {add: true, edit: false, del: false},

	};

	tier = undefined;

	constructor(props) {
		super(props);

		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
	}

	// override works
	// getTier = () => { }

	componentDidMount() {
		console.log(this.uri);
		this.tier = new MyKidsTier(this);
		this.tier.setContext(this.context);
	}

	toAdd() {
		let that = this;
		this.tier.pkval.v = undefined;
		this.tier.rec = {};

		this.recForm = (<KidDetailst crud={CRUD.c}
			uri={this.uri}
			tier={this.tier}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
	}

	toEdit() {
		let that = this;
		let pkv = [...this.state.selected.ids][0];
		this.tier.pkval = pkv;
		this.recForm = (<KidDetailst crud={CRUD.u}
			uri={this.uri}
			tier={this.tier}
			recId={pkv}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
	}

	render() {
		let tier = this.tier;
		const { classes } = this.props;
		let btn = this.state.buttons;
		return (
		  <Box className={classes.root}>
			{this.props.funcName || this.props.title || 'My Kids'}
			<MyStudentsQuery uri={this.uri} onQuery={this.toSearch} />

			<Box>
				<Button variant="contained" disabled={!btn.add}
					className={classes.crudButton} onClick={this.toAdd}
					startIcon={<JsampleIcons.Add />}
				>{L('Add')}</Button>
				<Button variant="contained" disabled={!btn.edit}
					className={classes.crudButton} onClick={this.toEdit}
					startIcon={<JsampleIcons.Edit />}
				>{L('Edit')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.crudButton} onClick={this.toDel}
					startIcon={<JsampleIcons.Delete />}
				>{L('Delete')}</Button>
			</Box>

			{tier && <AnTablist pk={tier.pkval.pk} selected={this.state.selected}
				className={classes.root} checkbox={true}
				columns={tier.columns()}
				rows={tier.rows}
				pageInf={this.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>}
			{this.recForm}
			{this.confirm}
		  </Box>);
	}
}
MyStudentsComp.contextType = AnContext;

const MyStudents = withWidth()(withStyles(styles)(MyStudentsComp));
export { MyStudents, MyStudentsComp  }

class MyStudentsQuery extends React.Component {
	conds = [
		{ name: 'classId', type: 'cbb',  val: '', label: L('Class'),
		  sk: Protocol.sk.cbbMyClass, nv: {n: 'text', v: 'nid'}, validate: {notNull: true}},
		{ name: 'studentName', type: 'text', val: '', label: L('Student') },
		{ name: 'hasTasks', type: 'switch',  val: false, label: L('with polls to do') },
	];

	constructor(props) {
		super(props);
		this.collect = this.collect.bind(this);
	}

	collect() {
		return { query: {
			orgId    : this.conds[0].val ? this.conds[0].val.v : undefined,
			userName : this.conds[1].val ? this.conds[1].val : undefined,
			hasTodos : this.conds[2].val ? this.conds[2].val : false } };
	}

	/** Design Note:
	 * Problem: This way bound the query form, so no way to expose visual effects modification?
	 */
	render () {
		let that = this;
		return (
		<AnQueryst {...this.props}
			fields={this.conds}
			onSearch={() => that.props.onQuery(that.collect()) }
			onLoaded={() => that.props.onQuery(that.collect()) }
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
	pkval = {pk: 'userId', v: undefined};

	_cols = [
		{ text: L('Log ID'), field: 'userId', checked: true },
		{ text: L('User Name'), field: 'userName' },
		{ text: L('Class'), field: 'nebula' },
		{ text: L('Todos'), field: 'todos' } ];

	_fields = [
		{ type: 'text', field: 'userId', label: L('Log ID'),
		  validator: {len: 12, notNull: true} },
		{ type: 'text', field: 'userName', label: L('User Name'),
		  validator: {len: 32, notNull: true} },
		{ type: 'password', field: 'pswd', label: L('Password'),
		  validator: {minlen: 6, notNull: true} },
		{ type: 'cbb', field: 'orgId', label: L('Class'),
		  grid: {md: 5}, style: {marginTop: "8px", width: 220 },
		  sk: Protocol.sk.cbbMyClass, nv: {n: 'text', v: 'nid'},
		  validator: {notNull: true} },
	];

	constructor(comp) {
		super(comp);
	}

}
