
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

class DomainComp extends CrudComp {
	state = {

	};

	constructor(props) {
		super(props);
	}

	render() {
    	const { classes } = this.props;
		return (<div className={classes.root}>Domain of Jsample</div>);
	}
}
DomainComp.contextType = AnContext;

const Domain = withStyles(styles)(DomainComp);
export { Domain, DomainComp }
