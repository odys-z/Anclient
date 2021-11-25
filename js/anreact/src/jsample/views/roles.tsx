import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Button, Grid } from '@material-ui/core';

import { AnsonResp, Semantier, CRUD, AnlistColAttrs, PageInf, Tierec, QueryConditions, Semantics, OnLoadOk
} from '@anclient/semantier-st';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { Comprops, CrudCompW } from '../../react/crud';
	import { AnContext, AnContextType } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox'
	import { AnTablist } from '../../react/widgets/table-list';

import { JsampleIcons } from '../styles';
import { RoleDetails } from './role-details';
import { CompOpts } from '../../react/anreact';
import { AnQueryst } from '../../react/widgets/query-form-st';

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

class RolesComp extends CrudCompW<Comprops> {

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
		rows: [] as Tierec[],
		pageInf: { page: 0, size: 25, total: 0 },
		selected: {ids: new Set<string>()},
	};
	tier: RoleTier;
	q?: QueryConditions;
	confirm: JSX.Element;
	roleForm: JSX.Element;
	props: { classes: any; };

	constructor(props: Comprops) {
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
			this.tier.setContext(this.context as unknown as AnContextType);
		}

		this.toSearch(undefined);
	}

	toSearch(q?: QueryConditions) {
		let that = this;
		this.q = q || this.q;
		this.tier.records( this.q,
			(cols, rows) => {
				that.state.selected.ids.clear();
				that.setState({rows});
			} );
	}

	onPageInf(page: number, size: number) {
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;

		let query = this.q;
		if (query) {
			const ctx = this.context as unknown as AnContextType;
			query.Body().Page(size, page);
			this.state.pageInf = {page, size, total: this.state.pageInf.total};
			ctx.anReact.bindTablist(query, this, ctx.error);
		}
	}

	onTableSelect(rowIds: Array<string>) {
		this.setState( {
			buttons: {
				add: this.state.buttons.add,
				edit: rowIds && rowIds.length === 1,
				del: rowIds &&  rowIds.length >= 1,
			},
		} );
	}

	toDel(e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let txt = L('Totally {count} role records will be deleted. Are you sure?',
				{count: this.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
						that.tier.del({ids: Array.from(that.state.selected.ids)}, (resp) => {
						});
				 	}
				}
				onClose={ () => {that.confirm === undefined} }
			/>);
	}

	toAdd(e: React.MouseEvent<HTMLElement>) {
		this.tier.resetFormSession();
		this.roleForm = (<RoleDetails crud={CRUD.c} uri={this.uri}
			tier={this.tier}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	toEdit(e: React.MouseEvent<HTMLElement>) {
		let that = this;
		this.tier.pkval = this.getByIx(this.state.selected.ids, 0);

		this.roleForm = (<RoleDetails crud={CRUD.u} uri={this.uri}
			tier={this.tier}
			onOk={(r) => that.toSearch(that.q)}
			onClose={this.closeDetails} />);
	}

	closeDetails() {
		this.roleForm = undefined;
		this.tier.resetFormSession();
		this.setState({});
		this.onTableSelect([]);
	}

	render() {
		let args = {};
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			<AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				onLoaded={this.toSearch}
				conds={[ this.state.condName, this.state.condOrg ]}
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
				rows={this.state.rows} pk={this.tier.pk}
				selected={this.state.selected}
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

const Roles = withStyles<any, any, Comprops>(styles)(withWidth()(RolesComp));
export { Roles, RolesComp }

class RoleTier extends Semantier {
	mtabl = 'a_roles';
	pk = 'roleId';
	reltabl = 'a_role_func';
	rel = {'a_role_func':
		{ fk: {
			pk: 'roleId',	 // fk to main table
			col: 'funcId' }, // checking col
		  sk: 'trees.role_func'
		} as Semantics
	};

	client = undefined;
	pkval = undefined;
	rows = [];
	rec = {}; // for leveling up record form, also called record

	checkbox = true;
	rels = [];

	_cols = [
		{ text: L('Role Id'),  field: "roleId", hide: true },
		{ text: L('Role'),    field: "roleName",color: 'primary', className: 'bold'},
		{ text: L('Remarks'), field: "remarks", color: 'primary' } ]

	_fields = [
		{ type: 'text', field: 'roleId',   label: 'Role ID',
		  validator: {notNull: true, len: 12} },
		{ type: 'text', field: 'roleName', label: 'Role Name',
		  validator: {notNull: true, len: 200} },
		{ type: 'text', field: 'remarks',  label: 'Remarks',
		  validator: {notNull: true, len: 500} }
	] as Array<AnlistColAttrs<JSX.Element, CompOpts>>;

	/**
	 * @param {React.Component} comp
	 * @param {string} comp.uri the client function uri.
	 * @constructor
	 */
	constructor(comp) {
		super(comp);
	}

	records(conds = {} as {orgId?: string; roleName?: string; pageInf?: PageInf}, onLoad: OnLoadOk) {
		let { orgId, roleName, pageInf } = conds;
		let queryReq = this.client.query(this.uri, this.mtabl, 'r', pageInf)
		let req = queryReq.Body()
			.expr('r.roleId').expr('roleName').expr('r.remarks').expr('orgName')
			.l('a_orgs', 'o', 'o.orgId = r.orgId');

		if (orgId)
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
}
