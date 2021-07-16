
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { Protocol, AnsonResp } from '../../../lib/protocol.js'
	import { CrudComp } from '../../../lib/frames/react/crud'
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
	import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class DomainComp extends CrudComp {
	state = {
		condTxt : { type: 'text', val: '', text: 'No', label: 'text'},
		condCbb : { type: 'autocbb', val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
					label: 'cbb'},
		condAuto: { type: 'cbb', val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem ],
					label: 'autocbb'},
		pageInf : { page: 0, size: 20 },
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		let that = this;

		this.context.anReact.ds2cbbOptions({
				sk: 'lvl1.domain.jsample',
				nv: {n: 'domainName', v: 'domainId'}
			},
			this,
			this.context.error);
	}

	toSearch(e, query) {
		console.log(query);

		let pageInf = this.state.pageInf;
		let queryReq = this.context.anClient.query(null, 'a_domain', 'd', pageInf)
		if (query.parent && query.parent !== 0)
			queryReq.Body().whereCond('=', 'parentId', `'${query.parent}'`);
		if (query.domain)
			queryReq.Body().whereCond('%', 'domainName', `'${query.domain}'`);
		if (query.ignored)
			queryReq.Body().whereCond('<>', 'parentId', `'${query.ignored}'`);

		this.context.anReact.bindTablist(queryReq, this, this.context.error);
	}

	render() {
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm onSearch={this.toSearch}
				conds={[ this.state.condTxt, this.state.condCbb, this.state.condAuto ]}
				query={(q) => { return {
					domain: q.state.conds[0].val ? q.state.conds[0].val.v : undefined,
					parent: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
					ignored: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				}} }
			>
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root}
				columns={[
					{ text: L('Domain ID'), field:"domainId", color: 'primary', className: 'bold' },
					{ text: L('Domain Name'), color: 'primary', field:"domainName"},
					{ text: L('parent'), color: 'primary',field:"parentId" }
				]}
				rows = {this.state.rows}
			/>
			<Card>
				<Typography variant="h6" gutterBottom>
					This page shows:
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					1. Combobox binding:
				</Typography>
				<Typography gutterBottom>
					Query form uses dataset, sk='lvl1.domain.jsample' to mount Combobox;
				</Typography>
				<Typography gutterBottom>
					Query form are configured with configuration data. Condition fields
					are generated according to this.state.conds;
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					2. AnQueryForm usage
				</Typography>
				<Typography gutterBottom>
					Query condition is controlled by &lt;AnQueryForm [query]&gt;. Provide
					a callback for iterating through user's interaction results.
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					3. Use AnReactExt for list binding
				</Typography>
				<Typography gutterBottom>
					DomainComp.toSearch() uses the query form results as conditions,
					load list from port query.serv through API of AnContext.anClient,
					which is an instance of SessionClient, then mount the list to the
					main table.
				</Typography>
			</Card>
		</>);
	}
}
DomainComp.contextType = AnContext;

const Domain = withStyles(styles)(DomainComp);
export { Domain, DomainComp }
