
import React from 'react';
import { withStyles } from "@material-ui/core/styles";

import { AnConst } from '../../../lib/frames/react/utils/consts';
import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'
import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#ecf'
		}
	}
} );

class UsersComp extends CrudComp {
	state = {
		qName: {type: 'text', val: '', text: 'No', label: 'User Name'},
		qRole: {type: 'cbb', val: AnConst.cbbAllItem,
				options: [ {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
				label: 'Role'},

		th: [{	text: L('User Name'), checked: true, color: 'primary', className: 'bold' },
			 {	text: L('uid'), hide: true, color: 'primary' },
			 {	text: L('Role'), color: 'primary' }]
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		this.context.anReact.ds2cbbOptions(
			{ ssInf: this.context.anClient.ssInf,
			  sk: 'roles',
			  comp: this,
			  error: this.context.error
			});
	}

	toSearch(e, q) {
		let qr = new QueryReq(null, 'a_users', 'u')
			.A('query')
			.expr("userName").expr("orgName", "nation").expr("roleName")
			.j("a_roles", "r", "r.roleId=u.roleId").j("a_orgs", "o", "o.orgId=r.orgId")

		if (q.roleId)
			qr.where('=', 'r.roleId', `'${q.roleId}'`);
		if (q.name)
			qr.where('%', 'r.roleId', `'${q.name}'`);

		this.context.anReact.query2table(
			{	ssInf: this.context.anClient.ssInf,
				query: qr,
				comp: this,
				error: this.context.error
		});
	}

	render() {
		const { classes } = this.props;
		return (<div className={classes.root}>Users of Jsample
			<AnQueryForm onSearch={this.toSearch} onClear={this.toClearForm}
				conds={[ this.state.qName, this.state.qRole ]}
				query={(q) => { return {name: q.state.conds[0].val, roleId: q.state.conds[1].val }} }
			>
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root}
				th={ this.state.th }
			/>
		</div>);
	}
}
UsersComp.contextType = AnContext;

const Users = withStyles(styles)(UsersComp);
export { Users, UsersComp }
