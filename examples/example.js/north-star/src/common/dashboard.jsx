
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import {
	Protocol, AnsonResp, L,
	AnConst, CrudComp, AnContext, AnError,
	AnQueryForm } from 'anclient';

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

/**
 * https://react-d3-library.github.io/
 */
class Chart extends CrudComp {
	state = {
		vectors: []
	};

	return () {
		return (<>Chart</>);
	}
}

class DashboardComp extends CrudComp {
	state = {
		charts: [
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
			<Chart className={classes.chart}
				vectors = {this.state.charts[0]}
			/>
		</>);
	}
}
DashboardComp .contextType = AnContext;

const Dashboard = withStyles(styles)(DashboardComp);
export { Dashboard, DashboardComp  }
