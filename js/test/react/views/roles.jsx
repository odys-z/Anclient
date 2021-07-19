import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField, Button, Grid } from '@material-ui/core';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { JsampleIcons } from '../styles'
	import { CrudComp } from '../../../lib/frames/react/crud'
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
	import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'
	import { AnsonResp } from '../../../lib/protocol';

	import { RoleDetails } from './role-details'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
	container: {
		display: 'flex',
		// width: '100%',
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

class RolesComp extends CrudComp {

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
		selectedRoleIds: [],
	};

	constructor(props) {
		super(props);
		// this.state.forms = super.forms; // js problem

		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
		this.closeRoleForm = this.closeRoleForm.bind(this);
	}

	componentDidMount() {

		this.toSearch();
	}

	toSearch(e, query) {
		let pageInf = this.state.pageInf;
		let queryReq = this.context.anClient.query(null, 'a_roles', 'r', pageInf)
		let req = queryReq.Body()
			.expr('orgName').expr('roleName').expr('roleId').expr('remarks')
			.j('a_orgs', 'o', 'o.orgId=r.orgId')

		if (query && query.orgId && query.orgId !== 0)
			req.whereEq('r.orgId', `${query.orgId}`);
		if (query && query.rName)
			req.whereCond('%', 'roleName', `'${query.rName}'`);

		this.state.queryReq = queryReq;

		this.context.anReact.bindTablist(queryReq, this, this.context.error);
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
			selectedRoleIds: rowIds
		} );
	}

	toDel(e, v) {
	}

	toAdd(e, v) {
		this.roleForm = (<RoleDetails c
			roleId={this.state.selectedRoleIds[0]}
			onOk={(c, r) => console.log(r)}
			onClose={this.closeRoleForm} />);
	}

	toEdit(e, v) {
		this.roleForm = (<RoleDetails u 
			roleId={this.state.selectedRoleIds[0]}
			onOk={(c, r) => console.log(r)}
			onClose={this.closeRoleForm} />);
	}

	closeRoleForm() {
		this.roleForm = undefined;
		this.setState({});
	}

	render() {
		let args = {};
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			<AnQueryForm onSearch={this.toSearch}
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

			<AnTablist
				className={classes.root} checkbox= {true} pk= "vid"
				columns={[
					{ text: L('roleId'), hide:true, field:"roleId" },
					{ text: L('roleName'), color: 'primary', field:"roleName", className: 'bold'},
					{ text: L('orgName'), color: 'primary',field:"orgName" },
					{ text: L('remarks'), color: 'primary',field:"remarks" }
				]}
				rows={this.state.rows} pk='roleId'
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>
			{this.roleForm}
		</>);
	}
}
RolesComp.contextType = AnContext;

const Roles = withStyles(styles)(RolesComp);
export { Roles, RolesComp }
