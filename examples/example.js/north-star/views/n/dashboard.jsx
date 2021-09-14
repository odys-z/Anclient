
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Grid from '@material-ui/core/Grid';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

import { Histogram } from '../../d3charts/histogram'
import { Heatgrid } from '../../d3charts/heat-grid'
import { CorreloGPA } from '../../d3charts/correlo-gpa'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
} );

class DashboardComp extends CrudCompW {
	state = {
	};

	constructor(props) {
		super(props);

		this.gpaTier = new GPAChartTier();

		this.toSearch = this.toSearch.bind(this);
	}

	histogramHook = {};

	componentDidMount() {
		console.log(this.uri);

		this.gpaTier.setContext(this);
	}

	toSearch(e, query) {
	}

	render() {
		let args = {};
		const { classes } = this.props;
		return (
		  <Grid container>
			<Grid item md={6} >
				<Histogram uri={this.uri}
					size={{width: 460, height: 400}}
					tier={this.emotionTier}
				/>
			</Grid>
			{/* <Grid item md={6} >
				<Heatgrid uri={this.uri}
					size={{width: 460, height: 400}}
					tier={this.eventsTier}
				/>
			</Grid> */}
			<Grid item md={6} >
				<CorreloGPA uri={this.uri}
					size={{width: 460, height: 400}}
					tier={this.gpaTier}
				/>
			</Grid>
		</Grid>);
	}
}
DashboardComp.contextType = AnContext;

const Dashboard = withWidth()(withStyles(styles)(DashboardComp));
export { Dashboard, DashboardComp  }
