
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { Protocol, AnsonResp } from '../../../lib/protocol.js'
	import { CrudComp } from '../../../lib/frames/react/crud'
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'
	import { Indicatrees } from '../../../lib/frames/react/widgets/treegrid.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class Indicard extends CrudComp {

}

class IndicatreesComp extends CrudComp {
	state = {
		indicators: [
			{ id: '01', node: {text: 'AA'}, level: 0, sort: 0,
			  children: [
				{ id: '01.1', node: {text: 'AA.001', value: '1.1 B'}, level: 1, sort: 1},
			  ]
			},
			{ id: '02', node: {text: 'CC', value: 'C'}, level: 0, sort: 1},
		]
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		let that = this;
	}

	toSearch(e, query) {
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
			<Indicatrees className={classes.root}
				columns={[
					{ text: L('Indicator Id'), hide:true, field:"indid" },
					// { icons: ['edit', 'preview', 'collapse', 'add-child', 'up', 'down', 'delete'] }
					// { text: L('Indicator Name'), color: 'primary', field:"roleName", className: 'bold'},
					// { text: L('Options'), color: 'primary', field: 'details' },
					{ subComponent: indicator, field:'', },
				]}
				rows = {this.state.rows}
			/>
			<Card>
				<Typography variant="h6" gutterBottom>
				</Typography>
			</Card>
		</>);
	}
}
IndicatreesComp .contextType = AnContext;

const Indicatrees = withStyles(styles)(IndicatreesComp );
export { Indicatrees, IndicatreesComp  }
