import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { TextField, Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { Protocol, UpdateReq, InsertReq, DeleteReq, AnsonResp, Semantier, stree_t
} from '@anclient/semantier';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { toBool } from '../../utils/helpers';
	import { CrudCompW } from '../../react/crud';
	import { AnContext, AnError } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox'
	import { AnTablist } from '../../react/widgets/table-list';
	import { AnQueryForm } from '../../react/widgets/query-form';

import { JsampleIcons } from '../styles';
import { RoleDetails } from './role-details';

const { CRUD } = Protocol;

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
	container: {
		display: 'flex',
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	buttons: {
		display: 'flex',
		justifyContent: "flex-end",
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	button: {
		height: '2.4em',
		verticalAlign: 'middle',
		margin: theme.spacing(1),
	}
} );

class RolesComp extends CrudCompW {

	state = {
		condName: { type: 'text', val: '', label: L('Role Name')},
		condOrg : { type: 'cbb',
					sk: 'org.all', nv: {n: 'text', v: 'value'},
					val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem ],
					label: L('Organization') },

		// active buttons
		buttons: { add: true, edit: false, del: false},

		total: 0,
		pageInf: { page: 0, size: 25, total: 0 },
		selected: {Ids: new Set()},
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
		if (!this.tier) {
			this.tier = new RoleTier(this);
			this.tier.setContext(this.context);
		}

		this.toSearch();
	}

	toSearch(e, q) {
		let that = this;
		this.q = q || this.q;
		this.tier.records( this.q,
			(cols, rows) => {
				that.state.selected.Ids.clear();
				that.setState({rows});
			} );
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
		} );
	}

	toDel(e, v) {
		let that = this;
		let txt = L('Totally {count} role records will be deleted. Are you sure?',
				{count: this.state.selected.Ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
						that.tier.del({ids: that.state.selected.Ids});
				 	}
				}
				onClose={ () => {that.confirm === undefined} }
			/>);

		// function delRole(roleIds) {
		// 	let req = that.context.anClient
		// 		.usrAct('roles', CRUD.d, 'delete')
		// 		.deleteMulti(this.uri, 'a_roles', 'roleId', [...roleIds]);
		//
		// 	that.context.anClient.commit(req, (resp) => {
		// 		that.toSearch();
		// 	}, that.context.error);
		// }
	}

	toAdd(e, v) {
		this.tier.resetFormSession();
		this.roleForm = (<RoleDetails c uri={this.uri}
			tier={this.tier}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	toEdit(e, v) {
		this.tier.pkval = [...this.state.selected.Ids][0];

		this.roleForm = (<RoleDetails u uri={this.uri}
			tier={this.tier}
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
				conds={[ this.state.condName, this.state.condOrg ]}
				query={ (q) => { return {
					rName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					orgId: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
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

			{this.tier && <AnTablist
				className={classes.root} checkbox={true}
				columns={this.tier.columns()}
				rows={this.state.rows} pk='roleId'
				selectedIds={this.state.selected}
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>}
			{this.roleForm}
			{this.confirm}
		</>);
	}
}
RolesComp.contextType = AnContext;

const Roles = withWidth()(withStyles(styles)(RolesComp));
export { Roles, RolesComp }

class RoleTier extends Semantier {
	mtabl = 'a_roles';
	pk = 'roleId';
	reltabl = 'a_role_func';
	rel = {'a_role_func': {
		fk: 'roleId', // fk to main table
		col: 'funcId',// checking col
		sk: 'trees.role_funcs' }};

	client = undefined;
	// uri = undefined;
	pkval = undefined;
	rows = [];
	rec = {}; // for leveling up record form, also called record

	checkbox = true;
	rels = [];

	_cols = [
		{ text: L('roleId'),  field: "roleId", hide: true },
		{ text: L('Role'),    field: "roleName",color: 'primary', className: 'bold'},
		{ text: L('Remarks'), field: "remarks", color: 'primary' } ]

	_fields = [
		{ type: 'text', validator: {len: 12},  field: 'roleId',   label: 'Role ID',
		  validator: {notNull: true} },
		{ type: 'text', validator: {len: 200}, field: 'roleName', label: 'Role Name',
		  validator: {notNull: true} },
		{ type: 'text', validator: {len: 500}, field: 'remarks',  label: 'Remarks',
		  validator: {notNull: true} }
	];

	constructor(comp) {
		super(comp);
		// this.uri = comp.uri || comp.props.uri;
	}

	records(conds = {}, onLoad) {
		let { orgId, roleName, pageInf } = conds;
		let queryReq = this.client.query(this.uri, this.mtabl, 'r', pageInf)
		let req = queryReq.Body()
			.expr('r.roleId').expr('roleName').expr('r.remarks').expr('orgName')
			.l('a_orgs', 'o', 'o.orgId = r.orgId');

		if (orgId && orgId !== 0)
			req.whereEq('r.orgId', orgId);
		if (roleName)
			req.whereCond('%', 'roleName', `'${roleName}'`);

		this.client.commit(queryReq,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	record(conds, onLoad) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		// let { roleId } = conds;
		let pkval = conds[this.pk];

		// NOTE
		// Is this senario an illustration of general query is also necessity?
		let req = client.query(this.uri, 'a_roles', 'r')
		req.Body()
			.col('roleId').col('roleName').col('remarks')
			.whereEq(this.pk, pkval);

		client.commit(req,
			(resp) => {
				// NOTE because of using general query, extra hanling is needed
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				that.pkval = that.rec && that.rec[that.pk];
				onLoad(cols, rows && rows[0]);
			},
			this.errCtx);
	}

	/** Save role form with relationships
	 * */
	saveRec(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { crud } = opts;
		let uri = this.uri;

		if (crud === CRUD.u && !this.pkval)
			throw Error("Can't update with null ID.");

		let req;
		if ( crud === CRUD.c )
			req = this.client.userReq(uri, 'insert',
						new InsertReq( uri, this.mtabl )
						.columns(this._fields)
						.record(this.rec) );
		else
			req = this.client.userReq(uri, 'update',
						new UpdateReq( uri, this.mtabl, {pk: this.pk, v: this.pkval} )
						.record(this.rec, this.pk) );

		let rel = this.rel[this.reltabl];
		// collect relationships
		let columnMap = {};
		columnMap[rel.col] = 'nodeId';

		// semantics handler will resulve fk when inserting only when master pk is auto-pk
		columnMap[rel.fk] = this.pkval
						? this.pkval			// when updating
						: this.rec[this.pk];	// when creating

		let insRels = this.anReact
			.inserTreeChecked(
				this.rels,
				{ table: this.reltabl,
				  columnMap,
				  check: 'checked',
				  // middle nodes been corrected according to children
				  reshape: true }
			);

		if (!this.pkval) {
			req.Body().post(insRels);
		}
		else {
			// e.g. delete from a_role_func where roleId = '003'
			let del_rf = new DeleteReq(null, this.reltabl, rel.fk)
							.whereEq(rel.fk, this.pkval);

			req.Body().post(del_rf.post(insRels));
		}

		client.commit(req,
			(resp) => {
				let bd = resp.Body();
				if (crud === CRUD.c)
					// NOTE:
					// resulving auto-k is a typicall semantic processing, don't expose this to caller
					that.pkval = bd.resulve(that.mtabl, that.pk, that.rec);
				onOk(resp);
			},
			this.errCtx);
	}

	/**
	 * @param {object} opts
	 * @param {string} [opts.uri] overriding local uri
	 * @param {set} opts.ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids } = opts;

		if (ids && ids.size > 0) {
			let req = client
				.usrAct('roles', CRUD.d, 'delete')
				.deleteMulti(this.uri, 'a_roles', 'roleId', [...ids]);
			client.commit(req, onOk, this.errCtx);
		}
	}

	relations(opts, onOk) {
		if (!this.anReact)
			this.anReact = new AnReact();

		let that = this;

		// typically relationships are tree data
		let { uri, reltabl, sqlArgs, sqlArg } = opts;
		let { sk, relfk, relcol } = this.rel[reltabl];

		sqlArgs = sqlArgs || [sqlArg];

		if (!sk)
			throw Error('TODO ...');

		let t = stree_t.sqltree;

		let ds = {uri, sk, t, sqlArgs};

		this.anReact.stree({ uri, sk, t, sqlArgs,
			onOk: (resp) => {
				that.rels = resp.Body().forest;
				onOk(resp);
			}
		}, this.errCtx);
	}
}
