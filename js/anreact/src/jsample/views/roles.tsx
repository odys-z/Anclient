import React from 'react';
import { Theme } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {
	AnsonResp, Semantier, CRUD, AnlistColAttrs, PageInf, Tierec,
	QueryConditions, OnLoadOk, UIComponent, AnsonMsg, DbRelations
} from '@anclient/semantier';

import { L } from '../../utils/langstr';
import { AnConst } from '../../utils/consts';
import { Comprops, CrudCompW } from '../../react/crud';
import { AnContext, AnContextType } from '../../react/reactext';
import { ConfirmDialog } from '../../react/widgets/messagebox'
import { AnTablist } from '../../react/widgets/table-list';

import { JsampleIcons } from '../styles';
import { RoleDetails } from './role-details';
import { ClassNames, CompOpts } from '../../react/anreact';
import { AnQueryst } from '../../react/widgets/query-form';

const styles = (theme: Theme) => ( {
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
		condName: { type: 'text', field: 'roleName', val: '', label: L('Role Name')},
		condOrg : { type: 'cbb',  field: 'orgId',    val: AnConst.cbbAllItem,
					sk: 'org.all', nv: {n: 'text', v: 'value'},
					options: [ AnConst.cbbAllItem ],
					label: L('Organization') },

		// active buttons
		buttons: { add: true, edit: false, del: false},

		total: 0,
		rows: [] as Tierec[],
		pageInf: { page: 0, size: 25, total: 0 } as PageInf,
		selected: {ids: new Set<string>()},
	};

	tier: RoleTier;
	q?: QueryConditions;
	confirm: JSX.Element;
	roleForm: JSX.Element;
	props: { classes: ClassNames; };

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

	toSearch(q?: QueryConditions, pageInf?: PageInf) {
		let that = this;
		this.q = q || this.q || {};
		this.q.pageInf = pageInf;
		this.tier.records( this.q,
			(_cols, rows) => {
				that.state.selected.ids.clear();
				that.setState({rows});
			} );
	}

	onPageInf(page: number, size?: number) {
		this.state.pageInf.size = size || 0;
		this.state.pageInf.page = page;

		// let query = this.q;
		// if (query) {
		// 	const ctx = this.context as unknown as AnContextType;
		// 	query.Body().Page(size, page);
		// 	this.state.pageInf = {page, size, total: this.state.pageInf.total};
		// 	ctx.anReact.bindTablist(query, this, ctx.error);
		// }
		this.toSearch(this.q, this.state.pageInf);
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

	toDel(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let txt = L('Totally {count} role records will be deleted. Are you sure?',
				{count: this.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
						that.tier.del({ids: Array.from(that.state.selected.ids)}, (_resp) => {
						});
				 	}
				}
				onClose={ () => {that.confirm === undefined} }
			/>);
	}

	toAdd(_e: React.MouseEvent<HTMLElement>) {
		this.tier.resetFormSession();
		this.roleForm = (<RoleDetails crud={CRUD.c} uri={this.uri}
			tier={this.tier}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	toEdit(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		this.tier.pkval.v = this.getByIx(this.state.selected.ids, 0);

		this.roleForm = (<RoleDetails crud={CRUD.u} uri={this.uri}
			tier={this.tier}
			onOk={(_r) => that.toSearch(that.q)}
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
				fields={[ this.state.condName, this.state.condOrg ]}
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
				rows={this.state.rows} pk={this.tier.pkval.pk}
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

class RoleTier extends Semantier {
	checkbox = true;

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
	 * @param comp
	 * @param {string} comp.uri the client function uri.
	 * @constructor
	 */
	constructor(comp: UIComponent) {
		super(comp);

		this.pkval.tabl = 'a_roles';
		this.pkval.pk = 'roleId';
		// this.reltabl = 'a_role_func';

		/**sk: role-funcs
		 * Hard coded here since it's a business string for jsample app.
		 */
		this.relMeta = {'a_role_func':
			{ stree: {
				tabl: 'a_role_func',
				pk: 'roleId',	 // fk to main table
				fk: 'roleId',	 // fk to main table
				col: 'funcId', // checking col
				relcolumn: 'nodeId',
				sk: 'trees.role_funcs'
			},
			} as DbRelations
		};
	}

	records(conds = {} as {roleId?: string; orgId?: string; roleName?: string; pageInf?: PageInf}, onLoad: OnLoadOk<Tierec>) {
		let { orgId, roleName, pageInf } = conds;
		let queryReq = this.client.query(this.uri, this.pkval.tabl, 'r', pageInf)
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

	record(conds: QueryConditions, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		// temp id avoiding update my pk status
		let roleId = conds[this.pkval.pk] as string;

		// NOTE
		// Is this senario an illustration of general query is also necessity?
		let req = client.query(this.uri, 'a_roles', 'r')
		req.Body()
			.col('roleId').col('roleName').col('remarks')
			.whereEq(this.pkval.pk, roleId);

		client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				// Design Memo:
				// because of using general query, extra hanling is needed: onLoad(cols, rows)
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				that.pkval.v = that.rec && that.rec[that.pkval.pk];
				onLoad(cols, rows);
			},
			this.errCtx);
	}
}

export { Roles, RolesComp, RoleTier }
