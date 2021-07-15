
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import { Protocol, AnsonResp } from '../../../lib/protocol.js'
import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'
import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
import { AnQueryForm, AnQueryFormComp } from '../../../lib/frames/react/widgets/query-form.jsx'

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
		condCbb : { type: 'autocbb', val: AnQueryFormComp.cbbAllItem,
					options: [ AnQueryFormComp.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
					label: 'cbb'},
		condAuto: { type: 'cbb', val: AnQueryFormComp.cbbAllItem,
					options: [ AnQueryFormComp.cbbAllItem ],
					label: 'autocbb'},
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		let that = this;
		this.context.anReact.dataset( {
				ssinf: this.context.anClient.ssInf,
				sk: 'lvl1.domain.jsample' },
			(dsResp) => {
				let {rows} = AnsonResp.rs2nvs( dsResp.Body().Rs(), {n: 'domainName', v: 'domainId'} );
				rows.unshift(AnQueryFormComp.cbbAllItem);
				that.state.condCbb.options = rows;
				that.setState({});
			}, this.context.error );
	}

	toSearch(e, query) {
		console.log(query);

	}

	render() {
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm onSearch={this.toSearch}
				conds={[ this.state.condTxt, this.state.condCbb, this.state.condAuto ]}
				query={(q) => { return {
					domain: q.state.conds[0].val,
					parent: q.state.conds[1].val,
					ignroed: q.state.conds[2].val,
				}} }
				>
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root}
				t={'query'}
			/>
			<Card>
				<Typography variant="h6" gutterBottom>
					Remarks:
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					Query form uses dataset, sk='lvl1.domain.jsample' to mount Combobox;
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					Query form are configured with configuration data. Condition fields
					are generated according to this.state.conds;
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					Query condition is controlled by &lt;AnQueryForm [query]&gt;. Provide
					a callback for iterating through user's interaction results.
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
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
