
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudComp, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class PollsComp extends CrudComp {
	state = {
		students: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<>Polls List</>);
	}
}
PollsComp.contextType = AnContext;

const Polls = withStyles(styles)(PollsComp);
export { Polls, PollsComp  }
