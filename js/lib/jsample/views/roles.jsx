import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { TextField, Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { L } from '../../../lib/utils/langstr';
	import { Protocol } from '../../../lib/protocol';
	import { AnConst } from '../../../lib/utils/consts';
	import { CrudCompW } from '../../../lib/react/crud';
	import { AnContext, AnError } from '../../../lib/react/reactext';
	import { ConfirmDialog } from '../../../lib/react/widgets/messagebox.jsx'
	import { AnTablist } from '../../../lib/react/widgets/table-list';
	import { AnQueryForm } from '../../../lib/react/widgets/query-form';
	import { AnsonResp } from '../../../lib/protocol';

import { JsampleIcons } from '../styles';
import { RoleDetails } from './role-details';

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
		let queryReq = this.context.anClient.query(this.uri, 'a_roles', 'r', pageInf)
		let req = queryReq.Body()
			.expr('orgName').expr('roleName').expr('roleId').expr('remarks')
			.j('a_orgs', 'o', 'o.orgId=r.orgId');

		if (query && query.orgId && query.orgId !== 0)
			req.whereEq('r.orgId', `${query.orgId}`);
		if (query && query.rName)
			req.whereCond('%', 'roleName', `'${query.rName}'`);

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
			{this.confirm}

			<Card>
				<Typography variant="h6" gutterBottom>
					AnClient Notes:
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					The details form also shows how to collect relation records
					with help of AnClient.
				</Typography>
				<Card>
					see <Link href='https://github.com/odys-z/Anclient/blob/b3497e4a1bd10dc594953efb4641531d9bb34dc5/js/test/react/views/role-details.jsx'>
					Jsample source: role-details.jsx</Link>
					and <Link href='https://github.com/odys-z/Anclient/blob/master/js/test/jsunit/02-anreact.mocha.js'>
					Unit Test: 02 anreact / checkTree -> relation records</Link>
				</Card>
				<Typography variant="h6" gutterBottom>
					Semantic Checking:
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					When deleting a role, jsample (the service) checked configured semantics:<pre>
  					id  :	sys.03
			  		smtc:	ck-cnt-del
			  		tabl:	a_roles
			  		pk  :	roleId
			  		args:	roleId a_role_func roleId</pre>
					See <Link href='https://github.com/odys-z/semantic-jserv/blob/master/jserv-sample/src/main/webapp/WEB-INF/semantics-sys.xml'>
					jsample/semantics-sys.xml</Link>
				</Typography>
				<Typography variant="h6" gutterBottom>
					Style Tips:
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					This page also shows how to response to media size by jsx component.
					(TextFields are showing according to width)
				</Typography>
				<Card>
					<Link href='https://codesandbox.io/s/class-with-width-e5pu4?file=/index.js'
					> Sandbox Test 1: configure theme to change breakpoints </Link>
				</Card>
				<Card>
					<Link href='https://codesandbox.io/s/textfield-dynamic-label-979gc?file=/demo.js'
					> Sandbox Test 2: using width </Link>
				</Card>
				<Card>
					<Link href='https://codesandbox.io/s/modal-form-text-label-basics-v6okl'
					> Sandbox Test 3: vertial middle align example </Link>
				</Card>
			</Card>
		</>);
	}
}
RolesComp.contextType = AnContext;

const Roles = withWidth()(withStyles(styles)(RolesComp));
export { Roles, RolesComp }
