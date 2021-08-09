
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class MyStatusComp extends CrudCompW {
	state = {
		my: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<>My Status</>);
	}
}
MyStatusComp.contextType = AnContext;

const MyStatus = withWidth()(withStyles(styles)(MyStatusComp));
export { MyStatus, MyStatusComp }
