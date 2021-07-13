
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class RolesComp extends CrudComp {
	state = {

	};

	constructor(props) {
		super(props);
	}

	render() {
		const { classes } = this.props;
		return (<div className={classes.root}>Roles of Jsample</div>);
	}
}
RolesComp.contextType = AnContext;

const Roles = withStyles(styles)(RolesComp);
export { Roles, RolesComp }
