
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField } from '@material-ui/core';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { QueryReq } from '../../../lib/protocol';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { CrudComp } from '../../../lib/frames/react/crud'
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
	import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'

const styles = (theme) => ( {
	root: {
		// "& :hover": {
		// 	backgroundColor: '#ecf'
		// }
	}
} );

class UsersComp extends CrudComp {
	state = {
		condName: {type: 'text', val: '', text: 'No', label: 'User Name'},
		condRole: {type: 'cbb', val: AnConst.cbbAllItem,
				sk: 'roles', nv: {n: 'text', v: 'value'},
				options: [ AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
				label: 'Role'},

		th: [{	text: L('User Name'), field: 'userName', checked: true, color: 'primary', className: 'bold' },
			 {	text: L('uid'), field: 'userId', hide: true, color: 'primary' },
			 {	text: L('Role'), field: 'roleName', color: 'primary' }],

		pageInf : { page: 0, size: 25, total: 0 },
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	toSearch(e, q) {
		let pageInf = this.state.pageInf;
		let qr = this.context.anClient.query(null, 'a_users', 'u', pageInf);
		qr.Body().j('a_roles', 'r', 'r.roleId = u.roleId')

		if (q.roleId && q.roleId.v)
			// = where('=', 'r.roleId', `'${q.roleId}'`);
			qr.Body().whereEq('u.roleId', `${q.roleId.v}`); // don't user "''" with whereEq()
		if (q.name)
			qr.Body().whereCond('%', 'u.userName', `'${q.name}'`);

		this.context.anReact.bindTablist(qr, this, this.context.error);
	}

	toDel(e, v) {
	}

	toAdd(e, v) {
		this.roleForm = (<UserDetails c
			onOk={(r) => console.log(r)}
			onClose={this.closeRoleForm} />);
	}

	toEdit(e, v) {
		this.roleForm = (<UserDetails u
			roleId={this.state.selectedRoleIds[0]}
			onOk={(r) => console.log(r)}
			onClose={this.closeRoleForm} />);
	}

	render() {
		const { classes } = this.props;
		return (<div className={classes.root}>Users of Jsample

			<AnQueryForm onSearch={this.toSearch} onClear={this.toClearForm}
				conds={[ this.state.condName, this.state.condRole, this.state.condOrg]}
				query={ (q) => { return {
					name: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					roleId: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
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

			<AnTablist className={classes.root}
				columns={ this.state.th }
				rows={ this.state.rows }
				pageInf={ this.state.pageInf }
			/>
		</div>);
	}
}
UsersComp.contextType = AnContext;

const Users = withStyles(styles)(UsersComp);
export { Users, UsersComp }
