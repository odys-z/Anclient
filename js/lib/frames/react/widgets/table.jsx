import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Collapse, Box, Switch, Paper } from '@material-ui/core';

import {L} from '../utils/langstr';
	import {AnContext} from '../reactext.jsx';

const styles = (theme) => ( {
	root: {
		height: 180,
		"& :hover": {
			backgroundColor: '#777'
		}
	},
	container: {
		display: 'flex',
	},
	paper: {
		margin: theme.spacing(1),
	},
	svg: {
		width: 100,
		height: 100,
	},
	polygon: {
		fill: theme.palette.common.white,
		stroke: theme.palette.divider,
		strokeWidth: 1,
	},
} );

class AnTableComp extends CrudComp {
	state = {
		checked: true
	};

	constructor(props) {
		super(props);
	}

	render() {
		let {checked} = this.state;
		let {classes} = this.props;
		return (
		<div className={classes.root}>
		</div>
		);
	}
}
AnTableComp.contextType = AnContext;

const AnTable = withStyles(styles)(AnTableComp);
export { AnTable, AnTableComp }
