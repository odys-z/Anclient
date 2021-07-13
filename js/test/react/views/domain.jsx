
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField } from '@material-ui/core';

import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'
import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'

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
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm >
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root}
				t={'query'}
			/>
		</>);
	}
}
DomainComp.contextType = AnContext;

const Domain = withStyles(styles)(DomainComp);
export { Domain, DomainComp }
