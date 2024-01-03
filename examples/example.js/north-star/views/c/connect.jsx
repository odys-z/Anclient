
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";

import { AnContext, CrudCompW} from '@anclient/anreact';

const styles = (theme) => ( {
	root: {
	}
} );

class MyConnectComp extends CrudCompW {
	state = {
		my: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<>My Connections</>);
	}
}
MyConnectComp.contextType = AnContext;

const MyConnect = withWidth()(withStyles(styles)(MyConnectComp));
export { MyConnect, MyConnectComp }
