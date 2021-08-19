
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

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
