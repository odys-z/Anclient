
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

class UsersComp extends CrudComp {
	state = {

	};

	constructor(props) {
		super(props);
	}

	render() {
		const { classes } = this.props;
		return (<div className={classes.root}>Users of Jsample</div>);
	}
}
UsersComp.contextType = AnContext;

const Users = withStyles(styles)(UsersComp);
export { Users, UsersComp }
