
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

import { Histogram } from '../../d3charts/histogram'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
} );

class DashboardComp extends CrudCompW {
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
			<Histogram vectors = {this.state.charts[0]}
			/>
		</>);
	}
}
DashboardComp.contextType = AnContext;

const Dashboard = withWidth()(withStyles(styles)(DashboardComp));
export { Dashboard, DashboardComp  }
