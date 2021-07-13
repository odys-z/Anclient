import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Collapse, Box, TextField, Switch, Paper } from '@material-ui/core';

import { L } from '../utils/langstr';
	import { AnContext } from '../reactext.jsx';
	import { CrudComp } from '../crud'

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

class AnQueryFormComp extends CrudComp {
	state = {
		checked: true
	};

	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
	}

	render() {
		let { checked } = this.state;
		let { classes } = this.props;
		return (
		<div className={classes.root}>
			<Switch checked={checked} onChange={this.handleChange} />
			<Collapse in={checked}>
				<Paper elevation={4} className={classes.paper}>
					<svg className={classes.svg}>
					<polygon points="0,100 50,00, 100,100" className={classes.polygon} />
					</svg>
				</Paper>
			</Collapse>
		</div>);
	}
}
AnQueryFormComp.contextType = AnContext;

const AnQueryForm = withStyles(styles)(AnQueryFormComp);
export {AnQueryForm, AnQueryFormComp }
