
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import { L } from '../../../lib/utils/langstr';
	import { AnConst } from '../../../lib/utils/consts';
	import { Protocol, AnsonResp } from '../../../lib/protocol.js'
	import { CrudComp } from '../../../lib/react/crud'
	import { AnContext, AnError } from '../../../lib/react/reactext'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class Indicard extends CrudComp {

}

class HandsonComp extends CrudComp {
	state = {
		indicators: [
			{ id: '01', node: {text: 'AA'}, level: 0, sort: 0,
			  children: [
				{ id: '01.1', node: {text: 'AA.001', value: '1.1 B'}, level: 1, sort: 1 },
			  ]
			},
			{ id: '02', node: {text: 'CC', value: 'C'}, level: 0, sort: 1 },
		]
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.indicators = this.indicators.bind(this);
	}

	componentDidMount() {
		let that = this;
	}

	toSearch(e, query) {
	}

	indicators(nodes) {
		return ();
	}

	render() {
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm onSearch={this.toSearch}
				conds={[ this.state.condName, this.state.condTypes ]}
				query={ (q) => { return {
					qName: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					qType: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
				}} }
			/>
			{this.indicators(this.state.indicators)
			// 	columns={[
			// 		{ text: L('Indicator Id'), hide:true, field:"indid" },
			// 		// { icons: ['edit', 'preview', 'collapse', 'add-child', 'up', 'down', 'delete'] }
			// 		// { text: L('Indicator Name'), color: 'primary', field:"roleName", className: 'bold'},
			// 		// { text: L('Options'), color: 'primary', field: 'details' },
			// 		// { component: indicator, field: '', },
			// 	]}
			// 	rows = {this.state.rows}
			// />
			// <Card>
			// 	<Typography variant="h6" gutterBottom>
			// 	</Typography>
			// </Card>
			}
		</>);
	}
}
HandsonComp.contextType = AnContext;

const Handson = withStyles(styles)(HandsonComp);
export { Handson, HandsonComp  }
