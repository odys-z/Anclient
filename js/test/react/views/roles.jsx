
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { CrudComp } from '../../../lib/frames/react/crud';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { AnContext, AnError } from '../../../lib/frames/react/reactext';
	import { AnTablist } from '../../../lib/frames/react/widgets/table-list';

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
		return (<AnTablist th={
			[ { text: L('person'), checked: true, color: 'primary', className: 'bold' },
			  { text: L('vid'), hide: true, color: 'primary' },
			  { text: L('year'), color: 'primary' },
			] }
		/>);
	}
}
RolesComp.contextType = AnContext;

const Roles = withStyles(styles)(RolesComp);
export { Roles, RolesComp }
