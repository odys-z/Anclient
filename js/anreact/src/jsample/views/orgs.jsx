
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import { Protocol, Ansonresp } from '@anclient/semantier';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	// import { Protocol, AnsonResp } from '../../../semantier/protocol';
	import { CrudCompW } from '../../react/crud'
	import { AnContext, AnError } from '../../react/reactext'
	import { AnTreegrid } from '../../react/widgets/treegrid.jsx'
	import { AnQueryForm } from '../../react/widgets/query-form.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class OrgsComp extends CrudCompW {
	state = {
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
			<AnTreegrid uri={this.uri}
				className={classes.root}
				columns={[
					{ text: L('Domain ID'), field:"domainId", color: 'primary', className: 'bold' },
					{ text: L('Domain Name'), color: 'primary', field:"domainName"},
					{ text: L('parent'), color: 'primary',field:"parentId" }
				]}
				rows = {this.state.rows}
			/>
			<Card>
				<Typography variant="h6" gutterBottom>
					This page shows tree data to table binding
				</Typography>
			</Card>
		</>);
	}
}
OrgsComp.contextType = AnContext;

const Orgs = withWidth()(withStyles(styles)(OrgsComp));
export { Orgs, OrgsComp }